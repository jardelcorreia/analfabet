const { dbHelpers } = require('./lib/database-server.cjs');
const { calculatePoints } = require('./lib/calculate-points.cjs');

exports.handler = async function(event, context) {
  try {
    const { round } = event.queryStringParameters;

    if (!round) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'round is required' }),
      };
    }

    const matches = await dbHelpers.getMatches(round);

    for (const match of matches) {
      const bets = await dbHelpers.getBetsByMatchId(match.id);

      for (const bet of bets) {
        const points = calculatePoints(bet, match);
        await dbHelpers.updateBetPoints(bet.id, points);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Bets updated successfully' }),
    };
  } catch (error) {
    console.error('Error updating bets:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to update bets' }),
    };
  }
};
