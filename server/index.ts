import express from 'express';
import dotenv from 'dotenv';
import { setupStaticServing } from './static-serve.js';
import { db } from './database/connection.js';
import { fetchCurrentMatches, mapFootballMatchStatus } from './services/football-api.js';
import { updateBetPoints, getUserStats } from './services/betting-service.js';

dotenv.config();

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Users endpoints
app.get('/api/users', async (req, res) => {
  try {
    console.log('Fetching users...');
    const users = await db.selectFrom('users').selectAll().execute();
    console.log(`Found ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    console.log('Creating user:', { name, email });
    
    const result = await db
      .insertInto('users')
      .values({ name, email })
      .returning(['id', 'name', 'email'])
      .executeTakeFirst();
    
    console.log('User created:', result);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Matches endpoints
app.get('/api/matches', async (req, res) => {
  try {
    console.log('Fetching matches...');
    const matches = await db
      .selectFrom('matches')
      .selectAll()
      .orderBy('match_date', 'asc')
      .execute();
    
    console.log(`Found ${matches.length} matches`);
    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

app.post('/api/matches/sync', async (req, res) => {
  try {
    console.log('Syncing matches with Football API...');
    const apiMatches = await fetchCurrentMatches();
    
    for (const match of apiMatches) {
      const existingMatch = await db
        .selectFrom('matches')
        .selectAll()
        .where('id', '=', match.id)
        .executeTakeFirst();

      const matchData = {
        home_team: match.homeTeam.name,
        away_team: match.awayTeam.name,
        match_date: match.utcDate,
        home_score: match.score.fullTime.home,
        away_score: match.score.fullTime.away,
        status: mapFootballMatchStatus(match.status),
        round_number: match.matchday,
      };

      if (!existingMatch) {
        await db
          .insertInto('matches')
          .values({
            id: match.id,
            ...matchData,
          })
          .execute();
        console.log(`Inserted new match: ${match.homeTeam.name} vs ${match.awayTeam.name}`);
      } else {
        await db
          .updateTable('matches')
          .set(matchData)
          .where('id', '=', match.id)
          .execute();
        
        // Update bet points if match is finished
        if (match.status === 'FINISHED' && match.score.fullTime.home !== null && match.score.fullTime.away !== null) {
          await updateBetPoints(match.id, match.score.fullTime.home, match.score.fullTime.away);
        }
        
        console.log(`Updated match: ${match.homeTeam.name} vs ${match.awayTeam.name}`);
      }
    }
    
    res.json({ message: 'Matches synced successfully', count: apiMatches.length });
  } catch (error) {
    console.error('Error syncing matches:', error);
    res.status(500).json({ error: 'Failed to sync matches' });
  }
});

// Bets endpoints
app.get('/api/bets', async (req, res) => {
  try {
    const { userId } = req.query;
    console.log('Fetching bets for user:', userId);
    
    let query = db
      .selectFrom('bets')
      .innerJoin('matches', 'bets.match_id', 'matches.id')
      .innerJoin('users', 'bets.user_id', 'users.id')
      .selectAll();
    
    if (userId) {
      query = query.where('bets.user_id', '=', Number(userId));
    }
    
    const bets = await query.execute();
    console.log(`Found ${bets.length} bets`);
    res.json(bets);
  } catch (error) {
    console.error('Error fetching bets:', error);
    res.status(500).json({ error: 'Failed to fetch bets' });
  }
});

app.post('/api/bets', async (req, res) => {
  try {
    const { userId, matchId, homeScoreBet, awayScoreBet } = req.body;
    console.log('Creating bet:', { userId, matchId, homeScoreBet, awayScoreBet });
    
    const result = await db
      .insertInto('bets')
      .values({
        user_id: userId,
        match_id: matchId,
        home_score_bet: homeScoreBet,
        away_score_bet: awayScoreBet,
      })
      .returning(['id', 'user_id', 'match_id', 'home_score_bet', 'away_score_bet'])
      .executeTakeFirst();
    
    console.log('Bet created:', result);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating bet:', error);
    res.status(500).json({ error: 'Failed to create bet' });
  }
});

app.put('/api/bets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { homeScoreBet, awayScoreBet } = req.body;
    console.log('Updating bet:', { id, homeScoreBet, awayScoreBet });
    
    const result = await db
      .updateTable('bets')
      .set({
        home_score_bet: homeScoreBet,
        away_score_bet: awayScoreBet,
      })
      .where('id', '=', Number(id))
      .returning(['id', 'user_id', 'match_id', 'home_score_bet', 'away_score_bet'])
      .executeTakeFirst();
    
    console.log('Bet updated:', result);
    res.json(result);
  } catch (error) {
    console.error('Error updating bet:', error);
    res.status(500).json({ error: 'Failed to update bet' });
  }
});

// Rankings endpoint
app.get('/api/rankings', async (req, res) => {
  try {
    console.log('Fetching user rankings...');
    const rankings = await getUserStats();
    console.log(`Found ${rankings.length} users in rankings`);
    res.json(rankings);
  } catch (error) {
    console.error('Error fetching rankings:', error);
    res.status(500).json({ error: 'Failed to fetch rankings' });
  }
});

// Export a function to start the server
export async function startServer(port) {
  try {
    if (process.env.NODE_ENV === 'production') {
      setupStaticServing(app);
    }
    app.listen(port, () => {
      console.log(`AnalfaBet API Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Start the server directly if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Starting AnalfaBet server...');
  startServer(process.env.PORT || 3001);
}
