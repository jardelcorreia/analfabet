const { dbHelpers } = require('./lib/database-server.cjs');

exports.handler = async function(event, context) {
  const { leagueId, round } = event.queryStringParameters;

  if (!leagueId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'leagueId is required' }),
    };
  }

  try {
    const bets = await dbHelpers.getLeagueBetsWithMatches(leagueId, round ? parseInt(round, 10) : undefined);
    return {
      statusCode: 200,
      body: JSON.stringify(bets),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch league bets' }),
    };
  }
};
