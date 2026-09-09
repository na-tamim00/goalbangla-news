export interface TeamInfo {
  id: string;
  name: string;
  shortName: string;
  logo: string;
}

export interface MatchEvent {
  minute: number;
  type: 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION' | 'VAR';
  player: string;
  team: 'home' | 'away';
  detail?: string;
}

export interface MatchLineup {
  formation: string;
  startingXI: Array<{ number: number; name: string; position: string }>;
  substitutes: Array<{ number: number; name: string; position: string }>;
}

export interface MatchStats {
  possession: [number, number]; // [home, away] %
  shots: [number, number];
  shotsOnTarget: [number, number];
  fouls: [number, number];
  corners: [number, number];
  yellowCards: [number, number];
  redCards: [number, number];
}

export interface Fixture {
  id: string;
  competition: string;
  leagueId: string;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  kickoffTime: string;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  minute?: number;
  homeScore?: number;
  awayScore?: number;
  stats?: MatchStats;
  lineup?: { home: MatchLineup; away: MatchLineup };
  events?: MatchEvent[];
}

export interface StandingRow {
  rank: number;
  team: TeamInfo;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string[]; // ['W', 'W', 'D', 'L', 'W']
}

export interface LeagueTable {
  leagueId: string;
  leagueName: string;
  season: string;
  standings: StandingRow[];
}