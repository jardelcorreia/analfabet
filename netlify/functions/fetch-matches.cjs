const { dbHelpers } = require('./lib/database-server.cjs');

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

const determineDefaultRound = (allMatches, today = new Date()) => {
  const roundsData = {};

  allMatches.forEach(match => {
    if (!roundsData[match.round]) {
      roundsData[match.round] = {
        games: [],
        allFinished: true,
        startDate: new Date(match.match_date)
      };
    }
    roundsData[match.round].games.push(match);
    if (new Date(match.match_date) < roundsData[match.round].startDate) {
      roundsData[match.round].startDate = new Date(match.match_date);
    }
    if (match.status !== 'finished') {
      roundsData[match.round].allFinished = false;
    }
  });

  const roundNumbers = Object.keys(roundsData).map(Number).sort((a, b) => a - b);
  if (roundNumbers.length === 0) return 1;

  today.setHours(0, 0, 0, 0);

  let activeRounds = [];
  let futureIncompleteRounds = [];

  for (const roundNum of roundNumbers) {
    const round = roundsData[roundNum];
    const roundStartDate = new Date(round.startDate);
    roundStartDate.setHours(0, 0, 0, 0);

    if (roundStartDate <= today && !round.allFinished) {
      activeRounds.push(roundNum);
    } else if (roundStartDate > today && !round.allFinished) {
      futureIncompleteRounds.push(roundNum);
    }
  }

  let defaultRound;
  if (activeRounds.length > 0) {
    defaultRound = Math.max(...activeRounds);
  } else if (futureIncompleteRounds.length > 0) {
    defaultRound = Math.min(...futureIncompleteRounds);
  } else {
    defaultRound = Math.max(...roundNumbers);
  }

  const nextRound = defaultRound + 1;
  if (roundsData[nextRound]) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextRoundStartDate = new Date(roundsData[nextRound].startDate);
    nextRoundStartDate.setHours(0, 0, 0, 0);

    if (nextRoundStartDate.getTime() === tomorrow.getTime()) {
      defaultRound = nextRound;
    }
  }

  return defaultRound;
};

exports.handler = async function(event, context) {
  console.log('[fetch-matches] Function started');

  const { round } = event.queryStringParameters || {};
  const today = new Date();

  try {
    let allMatches = await dbHelpers.getMatches();
    if (!allMatches || allMatches.length === 0) {
      console.log('[fetch-matches] No matches in DB, attempting to populate for all rounds...');
      const { handler: populateMatches } = require('./populate-matches.cjs');
      await populateMatches({ queryStringParameters: {} }); // Populate all rounds
      allMatches = await dbHelpers.getMatches();
    }

    let targetRound;
    let matches;

    if (round === 'all') {
      matches = allMatches;
      targetRound = 'all';
    } else if (round) {
      targetRound = parseInt(round, 10);
      if (isNaN(targetRound) || targetRound < 1 || targetRound > 38) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid round number.' }) };
      }
      console.log(`[fetch-matches] Updating and fetching matches for specific round: ${targetRound}`);
      const { handler: populateMatches } = require('./populate-matches.cjs');
      await populateMatches({ queryStringParameters: { round: targetRound } });
      matches = allMatches.filter(m => m.round === targetRound);
    } else {
      targetRound = determineDefaultRound(allMatches, today);
      console.log(`[fetch-matches] No round specified, determined default round: ${targetRound}`);
      matches = allMatches.filter(m => m.round === targetRound);
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
