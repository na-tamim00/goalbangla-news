import { Fixture, LeagueTable } from './types';

export const mockFixtures: Fixture[] = [
  {
    id: 'm-live-1',
    competition: 'Premier League',
    leagueId: 'pl',
    homeTeam: {
      id: 'mci',
      name: 'Manchester City',
      shortName: 'MCI',
      logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=120&q=80',
    },
    awayTeam: {
      id: 'ars',
      name: 'Arsenal',
      shortName: 'ARS',
      logo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=120&q=80',
    },
    kickoffTime: new Date(Date.now() - 72 * 60 * 1000).toISOString(),
    status: 'LIVE',
    minute: 74,
    homeScore: 2,
    awayScore: 1,
    stats: {
      possession: [58, 42],
      shots: [15, 9],
      shotsOnTarget: [6, 4],
      fouls: [8, 11],
      corners: [7, 3],
      yellowCards: [2, 3],
      redCards: [0, 0],
    },
    events: [
      { minute: 18, type: 'GOAL', player: 'Erling Haaland', team: 'home', detail: 'Assist: De Bruyne' },
      { minute: 34, type: 'GOAL', player: 'Bukayo Saka', team: 'away', detail: 'Penalty' },
      { minute: 61, type: 'GOAL', player: 'Phil Foden', team: 'home', detail: 'Curler from outside the box' },
      { minute: 68, type: 'YELLOW_CARD', player: 'William Saliba', team: 'away' },
    ],
    lineup: {
      home: {
        formation: '4-3-3',
        startingXI: [
          { number: 31, name: 'Ederson', position: 'GK' },
          { number: 2, name: 'Kyle Walker', position: 'DF' },
          { number: 3, name: 'Rúben Dias', position: 'DF' },
          { number: 25, name: 'Manuel Akanji', position: 'DF' },
          { number: 24, name: 'Josko Gvardiol', position: 'DF' },
          { number: 16, name: 'Rodri', position: 'MF' },
          { number: 17, name: 'Kevin De Bruyne', position: 'MF' },
          { number: 20, name: 'Bernardo Silva', position: 'MF' },
          { number: 47, name: 'Phil Foden', position: 'FW' },
          { number: 9, name: 'Erling Haaland', position: 'FW' },
          { number: 11, name: 'Jérémy Doku', position: 'FW' },
        ],
        substitutes: [
          { number: 18, name: 'Stefan Ortega', position: 'GK' },
          { number: 10, name: 'Jack Grealish', position: 'FW' },
          { number: 8, name: 'Mateo Kovacic', position: 'MF' },
        ]
      },
      away: {
        formation: '4-3-3',
        startingXI: [
          { number: 22, name: 'David Raya', position: 'GK' },
          { number: 4, name: 'Ben White', position: 'DF' },
          { number: 2, name: 'William Saliba', position: 'DF' },
          { number: 6, name: 'Gabriel Magalhães', position: 'DF' },
          { number: 12, name: 'Jurrien Timber', position: 'DF' },
          { number: 41, name: 'Declan Rice', position: 'MF' },
          { number: 5, name: 'Thomas Partey', position: 'MF' },
          { number: 8, name: 'Martin Ødegaard', position: 'MF' },
          { number: 7, name: 'Bukayo Saka', position: 'FW' },
          { number: 29, name: 'Kai Havertz', position: 'FW' },
          { number: 11, name: 'Gabriel Martinelli', position: 'FW' },
        ],
        substitutes: [
          { number: 32, name: 'Neto', position: 'GK' },
          { number: 19, name: 'Leandro Trossard', position: 'FW' },
          { number: 9, name: 'Gabriel Jesus', position: 'FW' },
        ]
      }
    }
  },
  {
    id: 'm-live-2',
    competition: 'Bangladesh Premier League',
    leagueId: 'bpl',
    homeTeam: {
      id: 'bk',
      name: 'Bashundhara Kings',
      shortName: 'KINGS',
      logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=120&q=80',
    },
    awayTeam: {
      id: 'aba',
      name: 'Abahani Limited Dhaka',
      shortName: 'ABAHANI',
      logo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=120&q=80',
    },
    kickoffTime: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    status: 'LIVE',
    minute: 68,
    homeScore: 1,
    awayScore: 0,
    stats: {
      possession: [54, 46],
      shots: [11, 7],
      shotsOnTarget: [5, 2],
      fouls: [12, 14],
      corners: [5, 4],
      yellowCards: [1, 2],
      redCards: [0, 0],
    },
    events: [
      { minute: 42, type: 'GOAL', player: 'Rakib Hossain', team: 'home', detail: 'Stunning header at the near post' },
      { minute: 56, type: 'YELLOW_CARD', player: 'Sohel Rana', team: 'away' },
    ],
    lineup: {
      home: {
        formation: '4-2-3-1',
        startingXI: [
          { number: 1, name: 'Anisur Rahman Zico', position: 'GK' },
          { number: 4, name: 'Topu Barman', position: 'DF' },
          { number: 22, name: 'Bishwanath Ghosh', position: 'DF' },
          { number: 12, name: 'Tariq Kazi', position: 'DF' },
          { number: 19, name: 'Mohammad Ridoy', position: 'DF' },
          { number: 6, name: 'Jamal Bhuyan', position: 'MF' },
          { number: 10, name: 'Robinho', position: 'MF' },
          { number: 7, name: 'Shekh Morsalin', position: 'MF' },
          { number: 11, name: 'Rakib Hossain', position: 'FW' },
          { number: 9, name: 'Dorielton', position: 'FW' },
          { number: 17, name: 'Sohel Rana', position: 'MF' },
        ],
        substitutes: [
          { number: 25, name: 'Mehdi Hasan Srabon', position: 'GK' },
          { number: 14, name: 'Foysal Ahmed Fahim', position: 'FW' },
        ]
      },
      away: {
        formation: '4-3-3',
        startingXI: [
          { number: 1, name: 'Shahidul Alam Sohel', position: 'GK' },
          { number: 3, name: 'Rahmat Mia', position: 'DF' },
          { number: 5, name: 'Riyadul Hasan', position: 'DF' },
          { number: 2, name: 'Sushanto Tripura', position: 'DF' },
          { number: 14, name: 'Mamun Miah', position: 'DF' },
          { number: 8, name: 'Mohammad Hridoy', position: 'MF' },
          { number: 16, name: 'Masuk Mia Zoni', position: 'MF' },
          { number: 21, name: 'Enamul Gazi', position: 'MF' },
          { number: 9, name: 'Cornelius Stewart', position: 'FW' },
          { number: 11, name: 'Nabib Newaj Jibon', position: 'FW' },
          { number: 7, name: 'Jewel Rana', position: 'FW' },
        ],
        substitutes: [
          { number: 22, name: 'Mitul Marma', position: 'GK' },
          { number: 17, name: 'Mehedi Hasan Royal', position: 'FW' },
        ]
      }
    }
  },
  {
    id: 'm-fin-1',
    competition: 'La Liga',
    leagueId: 'laliga',
    homeTeam: {
      id: 'rma',
      name: 'Real Madrid',
      shortName: 'RMA',
      logo: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=120&q=80',
    },
    awayTeam: {
      id: 'bar',
      name: 'Barcelona',
      shortName: 'BAR',
      logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=120&q=80',
    },
    kickoffTime: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    status: 'FINISHED',
    homeScore: 3,
    awayScore: 2,
    stats: {
      possession: [51, 49],
      shots: [18, 14],
      shotsOnTarget: [8, 6],
      fouls: [14, 15],
      corners: [8, 6],
      yellowCards: [3, 4],
      redCards: [0, 0],
    },
    events: [
      { minute: 12, type: 'GOAL', player: 'Vinícius Júnior', team: 'home', detail: 'Solo sprint and finish' },
      { minute: 28, type: 'GOAL', player: 'Robert Lewandowski', team: 'away', detail: 'Header' },
      { minute: 55, type: 'GOAL', player: 'Lamine Yamal', team: 'away', detail: 'Wonder strike' },
      { minute: 73, type: 'GOAL', player: 'Jude Bellingham', team: 'home', detail: 'Tap-in after rebound' },
      { minute: 90, type: 'GOAL', player: 'Kylian Mbappé', team: 'home', detail: 'Stoppage-time match winner' },
    ]
  },
  {
    id: 'm-fin-2',
    competition: 'UEFA Champions League',
    leagueId: 'ucl',
    homeTeam: {
      id: 'bay',
      name: 'Bayern Munich',
      shortName: 'BAY',
      logo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=120&q=80',
    },
    awayTeam: {
      id: 'psg',
      name: 'Paris Saint-Germain',
      shortName: 'PSG',
      logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=120&q=80',
    },
    kickoffTime: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    status: 'FINISHED',
    homeScore: 2,
    awayScore: 0,
    stats: {
      possession: [60, 40],
      shots: [16, 7],
      shotsOnTarget: [7, 2],
      fouls: [9, 13],
      corners: [9, 2],
      yellowCards: [1, 2],
      redCards: [0, 0],
    },
    events: [
      { minute: 31, type: 'GOAL', player: 'Harry Kane', team: 'home' },
      { minute: 78, type: 'GOAL', player: 'Jamal Musiala', team: 'home' },
    ]
  },
  {
    id: 'm-sch-1',
    competition: 'Premier League',
    leagueId: 'pl',
    homeTeam: {
      id: 'liv',
      name: 'Liverpool',
      shortName: 'LIV',
      logo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=120&q=80',
    },
    awayTeam: {
      id: 'che',
      name: 'Chelsea',
      shortName: 'CHE',
      logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=120&q=80',
    },
    kickoffTime: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    status: 'SCHEDULED',
  },
  {
    id: 'm-sch-2',
    competition: 'International Friendly',
    leagueId: 'international',
    homeTeam: {
      id: 'bd',
      name: 'Bangladesh',
      shortName: 'BAN',
      logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=120&q=80',
    },
    awayTeam: {
      id: 'ind',
      name: 'India',
      shortName: 'IND',
      logo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=120&q=80',
    },
    kickoffTime: new Date(Date.now() + 42 * 3600 * 1000).toISOString(),
    status: 'SCHEDULED',
  }
];

export const mockLeagueTables: Record<string, LeagueTable> = {
  pl: {
    leagueId: 'pl',
    leagueName: 'Premier League',
    season: '2025/26',
    standings: [
      { rank: 1, team: { id: 'mci', name: 'Manchester City', shortName: 'MCI', logo: '' }, played: 28, won: 21, drawn: 4, lost: 3, goalsFor: 68, goalsAgainst: 22, goalDifference: 46, points: 67, form: ['W', 'W', 'W', 'D', 'W'] },
      { rank: 2, team: { id: 'ars', name: 'Arsenal', shortName: 'ARS', logo: '' }, played: 28, won: 20, drawn: 5, lost: 3, goalsFor: 64, goalsAgainst: 24, goalDifference: 40, points: 65, form: ['W', 'W', 'D', 'W', 'L'] },
      { rank: 3, team: { id: 'liv', name: 'Liverpool', shortName: 'LIV', logo: '' }, played: 28, won: 19, drawn: 6, lost: 3, goalsFor: 62, goalsAgainst: 26, goalDifference: 36, points: 63, form: ['W', 'D', 'W', 'W', 'W'] },
      { rank: 4, team: { id: 'che', name: 'Chelsea', shortName: 'CHE', logo: '' }, played: 28, won: 15, drawn: 6, lost: 7, goalsFor: 50, goalsAgainst: 34, goalDifference: 16, points: 51, form: ['L', 'W', 'W', 'D', 'W'] },
      { rank: 5, team: { id: 'ast', name: 'Aston Villa', shortName: 'AVL', logo: '' }, played: 28, won: 14, drawn: 6, lost: 8, goalsFor: 48, goalsAgainst: 38, goalDifference: 10, points: 48, form: ['W', 'L', 'D', 'W', 'L'] },
      { rank: 6, team: { id: 'tot', name: 'Tottenham Hotspur', shortName: 'TOT', logo: '' }, played: 28, won: 14, drawn: 4, lost: 10, goalsFor: 52, goalsAgainst: 44, goalDifference: 8, points: 46, form: ['D', 'W', 'L', 'L', 'W'] },
      { rank: 7, team: { id: 'mun', name: 'Manchester United', shortName: 'MUN', logo: '' }, played: 28, won: 13, drawn: 5, lost: 10, goalsFor: 41, goalsAgainst: 40, goalDifference: 1, points: 44, form: ['W', 'L', 'W', 'D', 'L'] },
    ]
  },
  bpl: {
    leagueId: 'bpl',
    leagueName: 'Bangladesh Premier League',
    season: '2025/26',
    standings: [
      { rank: 1, team: { id: 'bk', name: 'Bashundhara Kings', shortName: 'KINGS', logo: '' }, played: 18, won: 15, drawn: 2, lost: 1, goalsFor: 44, goalsAgainst: 11, goalDifference: 33, points: 47, form: ['W', 'W', 'W', 'W', 'W'] },
      { rank: 2, team: { id: 'aba', name: 'Abahani Limited Dhaka', shortName: 'ABAHANI', logo: '' }, played: 18, won: 12, drawn: 4, lost: 2, goalsFor: 36, goalsAgainst: 15, goalDifference: 21, points: 40, form: ['W', 'D', 'W', 'W', 'L'] },
      { rank: 3, team: { id: 'moh', name: 'Mohammedan SC', shortName: 'MSC', logo: '' }, played: 18, won: 10, drawn: 5, lost: 3, goalsFor: 31, goalsAgainst: 18, goalDifference: 13, points: 35, form: ['D', 'W', 'W', 'D', 'W'] },
      { rank: 4, team: { id: 'she', name: 'Sheikh Russel KC', shortName: 'SRKC', logo: '' }, played: 18, won: 8, drawn: 4, lost: 6, goalsFor: 25, goalsAgainst: 22, goalDifference: 3, points: 28, form: ['L', 'W', 'L', 'W', 'D'] },
      { rank: 5, team: { id: 'chi', name: 'Chittagong Abahani', shortName: 'CTA', logo: '' }, played: 18, won: 6, drawn: 5, lost: 7, goalsFor: 21, goalsAgainst: 25, goalDifference: -4, points: 23, form: ['D', 'L', 'W', 'L', 'D'] },
      { rank: 6, team: { id: 'rah', name: 'Rahmatganj MFS', shortName: 'RMFS', logo: '' }, played: 18, won: 5, drawn: 4, lost: 9, goalsFor: 18, goalsAgainst: 29, goalDifference: -11, points: 19, form: ['L', 'D', 'L', 'W', 'L'] },
    ]
  },
  laliga: {
    leagueId: 'laliga',
    leagueName: 'La Liga EA Sports',
    season: '2025/26',
    standings: [
      { rank: 1, team: { id: 'rma', name: 'Real Madrid', shortName: 'RMA', logo: '' }, played: 27, won: 20, drawn: 5, lost: 2, goalsFor: 61, goalsAgainst: 20, goalDifference: 41, points: 65, form: ['W', 'W', 'D', 'W', 'W'] },
      { rank: 2, team: { id: 'bar', name: 'Barcelona', shortName: 'BAR', logo: '' }, played: 27, won: 19, drawn: 4, lost: 4, goalsFor: 68, goalsAgainst: 29, goalDifference: 39, points: 61, form: ['W', 'W', 'W', 'W', 'L'] },
      { rank: 3, team: { id: 'atm', name: 'Atlético Madrid', shortName: 'ATM', logo: '' }, played: 27, won: 16, drawn: 6, lost: 5, goalsFor: 46, goalsAgainst: 21, goalDifference: 25, points: 54, form: ['D', 'W', 'L', 'W', 'W'] },
      { rank: 4, team: { id: 'gir', name: 'Girona', shortName: 'GIR', logo: '' }, played: 27, won: 15, drawn: 5, lost: 7, goalsFor: 45, goalsAgainst: 33, goalDifference: 12, points: 50, form: ['L', 'W', 'D', 'L', 'W'] },
      { rank: 5, team: { id: 'ath', name: 'Athletic Club', shortName: 'ATH', logo: '' }, played: 27, won: 14, drawn: 7, lost: 6, goalsFor: 42, goalsAgainst: 26, goalDifference: 16, points: 49, form: ['W', 'D', 'W', 'W', 'D'] },
    ]
  }
};