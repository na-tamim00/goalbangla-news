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

        const isFreeApi = this.rapidApiHost.includes('free-api-live-football-data');
        const endpoint = isFreeApi
          ? `https://${this.rapidApiHost}/football-current-live`
          : `https://${this.rapidApiHost}/v3/fixtures?live=all`;

        const res = await fetch(endpoint, {
          headers: {
            'x-rapidapi-key': this.rapidApiKey,
            'x-rapidapi-host': this.rapidApiHost,
          },
          next: { revalidate: 30 },
        });

        if (res.ok) {
          const json = await res.json();
          const items = json.response || json.data || (Array.isArray(json) ? json : null);
          if (Array.isArray(items)) {
            const mapped: Fixture[] = items.map((item: any, idx: number) => {
              const home = item.teams?.home || item.homeTeam || item.home || {};
              const away = item.teams?.away || item.awayTeam || item.away || {};
              const fixture = item.fixture || item;
              const goals = item.goals || item.score || {};

              return {
                id: String(fixture.id || idx + 1),
                competition: item.league?.name || item.competition || 'Live Match',
                leagueId: String(item.league?.id || 'live'),
                homeTeam: {
                  id: String(home.id || 'home'),
                  name: home.name || 'Home Team',
                  shortName: (home.name || 'HOM').substring(0, 3).toUpperCase(),
                  logo: home.logo || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=120&q=80',
                },
                awayTeam: {
                  id: String(away.id || 'away'),
                  name: away.name || 'Away Team',
                  shortName: (away.name || 'AWY').substring(0, 3).toUpperCase(),
                  logo: away.logo || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=120&q=80',
                },
                kickoffTime: fixture.date || new Date().toISOString(),
                status: 'LIVE',
                minute: fixture.status?.elapsed || item.minute || 45,
                homeScore: goals.home ?? item.homeScore ?? 0,
                awayScore: goals.away ?? item.awayScore ?? 0,
              };
            });
            this.setCache('live_scores', mapped);
            return mapped;
          }
        }
      } catch (err) {
        console.warn('API fetch failed, falling back to mock provider:', err);
      }
    }

    // Demo fixtures are useful locally, but must never be presented as real live scores.
    return process.env.NODE_ENV === 'production'
      ? []
      : mockFixtures.filter((f) => f.status === 'LIVE');
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
