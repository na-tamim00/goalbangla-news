import { Fixture, LeagueTable } from './types';
import { mockFixtures, mockLeagueTables } from './mock-data';

export interface FootballService {
  getLiveScores(): Promise<Fixture[]>;
  getLeagueFixtures(leagueId?: string): Promise<Fixture[]>;
  getLeagueStandings(leagueId: string): Promise<LeagueTable | null>;
  getMatchById(matchId: string): Promise<Fixture | null>;
}

class FootballDataProvider implements FootballService {
  private rapidApiKey: string | null;
  private rapidApiHost: string;
  private cache: Map<string, { timestamp: number; data: any }>;
  private cacheTTL = 60 * 1000; // 60 seconds

  constructor() {
    this.rapidApiKey = process.env.RAPIDAPI_KEY || null;
    this.rapidApiHost = process.env.RAPIDAPI_HOST || 'api-football-v1.p.rapidapi.com';
    this.cache = new Map();
  }

  async getLiveScores(): Promise<Fixture[]> {
    // If API key is provided, we can fetch live fixtures from API-Football
    if (this.rapidApiKey) {
      try {
        const cached = this.getFromCache<Fixture[]>('live_scores');
        if (cached) return cached;

        const res = await fetch(`https://${this.rapidApiHost}/v3/fixtures?live=all`, {
          headers: {
            'x-rapidapi-key': this.rapidApiKey,
            'x-rapidapi-host': this.rapidApiHost,
          },
          next: { revalidate: 30 },
        });

        if (res.ok) {
          const json = await res.json();
          if (json.response && json.response.length > 0) {
            const mapped: Fixture[] = json.response.map((item: any) => ({
              id: String(item.fixture.id),
              competition: item.league.name,
              leagueId: String(item.league.id),
              homeTeam: {
                id: String(item.teams.home.id),
                name: item.teams.home.name,
                shortName: item.teams.home.name.substring(0, 3).toUpperCase(),
                logo: item.teams.home.logo,
              },
              awayTeam: {
                id: String(item.teams.away.id),
                name: item.teams.away.name,
                shortName: item.teams.away.name.substring(0, 3).toUpperCase(),
                logo: item.teams.away.logo,
              },
              kickoffTime: item.fixture.date,
              status: item.fixture.status.short === '1H' || item.fixture.status.short === '2H' ? 'LIVE' : 'FINISHED',
              minute: item.fixture.status.elapsed || 45,
              homeScore: item.goals.home ?? 0,
              awayScore: item.goals.away ?? 0,
            }));
            this.setCache('live_scores', mapped);
            return mapped;
          }
        }
      } catch (err) {
        console.warn('API-Football fetch failed, falling back to mock provider:', err);
      }
    }

    // Default authentic live simulated matches
    return mockFixtures.filter((f) => f.status === 'LIVE');
  }

  async getLeagueFixtures(leagueId?: string): Promise<Fixture[]> {
    if (!leagueId) return mockFixtures;
    return mockFixtures.filter((f) => f.leagueId.toLowerCase() === leagueId.toLowerCase());
  }

  async getLeagueStandings(leagueId: string): Promise<LeagueTable | null> {
    const key = leagueId.toLowerCase();
    if (mockLeagueTables[key]) {
      return mockLeagueTables[key];
    }
    // Return empty table if unknown
    return {
      leagueId,
      leagueName: leagueId.toUpperCase(),
      season: '2025/26',
      standings: [],
    };
  }

  async getMatchById(matchId: string): Promise<Fixture | null> {
    const match = mockFixtures.find((f) => f.id === matchId);
    return match || null;
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setCache(key: string, data: any) {
    this.cache.set(key, { timestamp: Date.now(), data });
  }
}

export const footballService = new FootballDataProvider();