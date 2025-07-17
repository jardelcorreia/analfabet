const { dbHelpers } = require('./lib/database-server.cjs');
const { fetchLiveMatches } = require('./lib/api-client.cjs');

const teamMapping = {
  "Palmeiras": "Palmeiras",
  "Botafogo": "Botafogo",
  "Flamengo": "Flamengo",
  "Fluminense": "Fluminense",
  "Grêmio": "Grêmio",
  "São Paulo": "São Paulo",
  "Atlético-MG": "Atlético-MG",
  "Sport": "Sport",
  "Internacional": "Internacional",
  "Cruzeiro": "Cruzeiro",
  "Corinthians": "Corinthians",
  "Santos": "Santos",
  "Bahia": "Bahia",
  "Vasco": "Vasco",
  "Mirassol": "Mirassol",
  "Juventude": "Juventude",
  "Ceará": "Ceará",
  "Fortaleza": "Fortaleza",
  "Bragantino": "Bragantino",
  "Vitória": "Vitória",
};

const normalizeTeamName = (teamName) => {
  return teamMapping[teamName] || teamName;
};

// Function to determine current round based on date
const getCurrentRound = () => {
  const now = new Date();
  const seasonStart = new Date('2025-04-12'); // Start of 2025 season
  const weeksSinceStart = Math.floor((now - seasonStart) / (7 * 24 * 60 * 60 * 1000));

  // Each round typically lasts about a week, with 38 rounds total
  let currentRound = Math.min(Math.max(1, weeksSinceStart + 1), 38);

  // If we're before the season starts, return round 1
  if (now < seasonStart) {
    currentRound = 1;
  }

  return currentRound;
};

exports.handler = async function(event, context) {
  console.log('[fetch-matches] Function started');

  try {
    const liveMatches = await fetchLiveMatches();
    if (liveMatches && liveMatches.length > 0) {
      console.log(`[fetch-matches] Found ${liveMatches.length} live matches. Updating database...`);
      await dbHelpers.updateMatchesFromApi(liveMatches);
    }
  } catch (error) {
    console.error('[fetch-matches] Error fetching or updating live matches:', error);
    // Non-fatal, so we don't return. The function can proceed with existing data.
  }

  const { round } = event.queryStringParameters || {};

  try {
    // Determine which round to fetch
    let targetRound;
    if (round) {
      targetRound = parseInt(round, 10);
      if (isNaN(targetRound) || targetRound < 1 || targetRound > 38) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid round number. Must be between 1 and 38.' }),
          headers: { 'Content-Type': 'application/json' }
        };
      }
    } else {
      // If no round specified, use current round
      targetRound = getCurrentRound();
    }

    console.log(`[fetch-matches] Fetching matches for round: ${targetRound}`);

    // Fetch matches from database
    let matches = await dbHelpers.getMatches(targetRound);

    console.log(`[fetch-matches] Found ${matches.length} matches in database`);

    if (matches.length === 0) {
      console.log(`[fetch-matches] No matches found in database for round ${targetRound}. Fetching from API...`);
      const { handler: populateMatches } = require('./populate-matches.cjs');
      await populateMatches();
      matches = await dbHelpers.getMatches(targetRound);
      console.log(`[fetch-matches] Found ${matches.length} matches in database after fetching from API`);
      console.log(`[fetch-matches] No matches found in database for round ${targetRound}.`);
    }

    // Transform matches to match frontend expectations
    const transformedMatches = matches.map(match => ({
      id: match.id,
      api_id: match.api_id,
      home_team: normalizeTeamName(match.home_team),
      away_team: normalizeTeamName(match.away_team),
      home_score: match.home_score,
      away_score: match.away_score,
      match_date: match.match_date,
      status: match.status,
      round: match.round,
      season: match.season || '2024'
    }));

    // Sort matches by date
    transformedMatches.sort((a, b) => new Date(a.match_date) - new Date(b.match_date));

    console.log(`[fetch-matches] Returning ${transformedMatches.length} matches for round ${targetRound}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        matches: transformedMatches,
        determinedRound: targetRound
      }),
      headers: { 'Content-Type': 'application/json' }
    };

  } catch (error) {
    console.error('[fetch-matches] Error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to fetch matches',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
