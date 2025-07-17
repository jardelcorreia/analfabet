const { dbHelpers } = require('./lib/database-server.cjs');

exports.handler = async function(event, context) {
  const { leagueId, userId, round } = event.queryStringParameters;

  if (!leagueId || !userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'leagueId and userId are required' }),
    };
  }

  try {
    const bets = await dbHelpers.getUserBetsWithMatches(userId, leagueId, round ? parseInt(round, 10) : undefined);
    return {
      statusCode: 200,
      body: JSON.stringify(bets),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch bets' }),
    };
  }
};
