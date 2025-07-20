// Netlify Function: /.netlify/functions/update-match-scores
// Updates match scores in real-time and recalculates bet points immediately

const { dbHelpers } = require('./lib/database-server.cjs');

exports.handler = async function(event, context) {
  console.log('[update-match-scores] Function started');
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  let requestBody;
  try {
    requestBody = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON in request body' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  const { matchId, homeScore, awayScore, status } = requestBody;

  // Validate required fields
  if (!matchId || homeScore === undefined || awayScore === undefined || !status) {
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        error: 'Missing required fields: matchId, homeScore, awayScore, status' 
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  // Validate score values
  if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore) || 
      homeScore < 0 || awayScore < 0 || homeScore > 20 || awayScore > 20) {
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        error: 'Invalid scores. Must be integers between 0 and 20' 
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  // Validate status
  const validStatuses = ['scheduled', 'live', 'finished', 'postponed'];
  if (!validStatuses.includes(status)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  try {
    // Check if match exists
    const match = await dbHelpers.getMatchById(matchId);
    if (!match) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Match not found' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    console.log(`[update-match-scores] Updating match ${matchId}: ${homeScore}-${awayScore} (${status})`);
    
    // Update match scores and recalculate bet points in real-time
    const updatedMatch = await dbHelpers.updateMatchScores(matchId, homeScore, awayScore, status);
    
    if (!updatedMatch) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to update match scores' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    console.log(`[update-match-scores] Successfully updated match ${matchId} and recalculated bet points`);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Match scores updated and bet points recalculated in real-time',
        match: updatedMatch
      }),
      headers: { 'Content-Type': 'application/json' },
    };

  } catch (error) {
    console.error('[update-match-scores] Error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'An internal server error occurred while updating match scores',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};