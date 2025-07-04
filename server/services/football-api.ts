const FOOTBALL_API_URL = 'https://api.football-data.org/v4/competitions/BSA';
const API_KEY = process.env.FOOTBALL_API_KEY;

export interface FootballMatch {
  id: number;
  homeTeam: {
    name: string;
  };
  awayTeam: {
    name: string;
  };
  utcDate: string;
  status: string;
  score: {
    fullTime: {
      home: number | null;
      away: number | null;
    };
  };
  matchday: number;
}

export async function fetchCurrentMatches(): Promise<FootballMatch[]> {
  try {
    console.log('Fetching matches from Football API...');
    
    const response = await fetch(`${FOOTBALL_API_URL}/matches`, {
      headers: {
        'X-Auth-Token': API_KEY || '',
      },
    });

    if (!response.ok) {
      console.error('Football API response not ok:', response.status, response.statusText);
      throw new Error(`Football API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Fetched ${data.matches?.length || 0} matches from API`);
    
    return data.matches || [];
  } catch (error) {
    console.error('Error fetching matches:', error);
    throw error;
  }
}

export function mapFootballMatchStatus(status: string): 'SCHEDULED' | 'LIVE' | 'FINISHED' {
  switch (status) {
    case 'SCHEDULED':
    case 'TIMED':
      return 'SCHEDULED';
    case 'IN_PLAY':
    case 'PAUSED':
      return 'LIVE';
    case 'FINISHED':
      return 'FINISHED';
    default:
      return 'SCHEDULED';
  }
}
