import { db } from '../database/connection.js';

export interface UserStats {
  user_id: number;
  name: string;
  total_points: number;
  exact_scores: number;
  total_bets: number;
}

export async function calculateBetPoints(
  homeScoreBet: number,
  awayScoreBet: number,
  homeScoreActual: number,
  awayScoreActual: number
): Promise<{ points: number; isExactScore: boolean }> {
  // Exact score match
  if (homeScoreBet === homeScoreActual && awayScoreBet === awayScoreActual) {
    return { points: 3, isExactScore: true };
  }

  // Correct result prediction
  const betResult = homeScoreBet > awayScoreBet ? 'HOME' : 
                   homeScoreBet < awayScoreBet ? 'AWAY' : 'DRAW';
  const actualResult = homeScoreActual > awayScoreActual ? 'HOME' : 
                      homeScoreActual < awayScoreActual ? 'AWAY' : 'DRAW';

  if (betResult === actualResult) {
    return { points: 1, isExactScore: false };
  }

  return { points: 0, isExactScore: false };
}

export async function updateBetPoints(matchId: number, homeScore: number, awayScore: number): Promise<void> {
  console.log(`Updating bet points for match ${matchId}...`);
  
  const bets = await db
    .selectFrom('bets')
    .selectAll()
    .where('match_id', '=', matchId)
    .execute();

  console.log(`Found ${bets.length} bets for match ${matchId}`);

  for (const bet of bets) {
    const { points, isExactScore } = await calculateBetPoints(
      bet.home_score_bet,
      bet.away_score_bet,
      homeScore,
      awayScore
    );

    await db
      .updateTable('bets')
      .set({
        points,
        is_exact_score: isExactScore,
      })
      .where('id', '=', bet.id)
      .execute();

    console.log(`Updated bet ${bet.id}: ${points} points, exact: ${isExactScore}`);
  }
}

export async function getUserStats(): Promise<UserStats[]> {
  const stats = await db
    .selectFrom('users')
    .leftJoin('bets', 'users.id', 'bets.user_id')
    .select([
      'users.id as user_id',
      'users.name',
      db.fn.coalesce(db.fn.sum('bets.points'), 0).as('total_points'),
      db.fn.coalesce(db.fn.sum(db.case().when('bets.is_exact_score', '=', true).then(1).else(0).end()), 0).as('exact_scores'),
      db.fn.coalesce(db.fn.count('bets.id'), 0).as('total_bets')
    ])
    .groupBy('users.id')
    .orderBy('total_points', 'desc')
    .orderBy('exact_scores', 'desc')
    .execute();

  return stats.map(stat => ({
    user_id: stat.user_id,
    name: stat.name,
    total_points: Number(stat.total_points),
    exact_scores: Number(stat.exact_scores),
    total_bets: Number(stat.total_bets)
  }));
}
