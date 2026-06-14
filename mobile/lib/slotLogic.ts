export interface SlotSymbol {
  id: string;
  label: string;
  color: string;
  payout: number;
  weight: number;
}

export const SYMBOLS: SlotSymbol[] = [
  { id: 'seven', label: '7', color: '#ff2d78', payout: 100, weight: 1 },
  { id: 'bar', label: 'BAR', color: '#ffd700', payout: 50, weight: 2 },
  { id: 'diamond', label: '♦', color: '#00d4ff', payout: 30, weight: 3 },
  { id: 'star', label: '★', color: '#ffd700', payout: 20, weight: 5 },
  { id: 'heart', label: '♥', color: '#ff6b6b', payout: 10, weight: 7 },
  { id: 'club', label: '♣', color: '#00ff88', payout: 8, weight: 8 },
  { id: 'spade', label: '♠', color: '#b347ff', payout: 6, weight: 9 },
  { id: 'circle', label: '●', color: '#ff8c00', payout: 4, weight: 10 },
];

const TOTAL_WEIGHT = SYMBOLS.reduce((s, sym) => s + sym.weight, 0);

export function weightedRandom(): SlotSymbol {
  let rand = Math.random() * TOTAL_WEIGHT;
  for (const sym of SYMBOLS) {
    rand -= sym.weight;
    if (rand <= 0) return sym;
  }
  return SYMBOLS[SYMBOLS.length - 1];
}

export function spinReels(): SlotSymbol[] {
  return [weightedRandom(), weightedRandom(), weightedRandom()];
}

export function calculateWin(reels: SlotSymbol[], bet: number): number {
  const [r1, r2, r3] = reels;
  if (r1.id === r2.id && r2.id === r3.id) {
    return bet * r1.payout;
  }
  if (r1.id === r2.id || r2.id === r3.id || r1.id === r3.id) {
    return bet * 2;
  }
  return 0;
}

export function getWinType(reels: SlotSymbol[], winAmount: number): 'jackpot' | 'triple' | 'pair' | 'none' {
  const [r1, r2, r3] = reels;
  if (r1.id === r2.id && r2.id === r3.id) {
    return r1.id === 'seven' ? 'jackpot' : 'triple';
  }
  if (winAmount > 0) return 'pair';
  return 'none';
}

export function getWinMessage(reels: SlotSymbol[], winAmount: number): string {
  const [r1, r2, r3] = reels;
  if (r1.id === r2.id && r2.id === r3.id) {
    if (r1.id === 'seven') return 'TRIPLE 7s - JACKPOT!';
    return `TRIPLE ${r1.label} - BIG WIN!`;
  }
  if (winAmount > 0) return 'PAIR WINS!';
  return '';
}

export const MOCK_LEADERBOARD = [
  { id: 'lb1', name: 'Casino_King', balance: 125000, biggestWin: 50000, avatar: 'C' },
  { id: 'lb2', name: 'LuckyAce', balance: 89500, biggestWin: 35000, avatar: 'L' },
  { id: 'lb3', name: 'GoldRush99', balance: 67200, biggestWin: 28000, avatar: 'G' },
  { id: 'lb4', name: 'NeonViper', balance: 54100, biggestWin: 22500, avatar: 'N' },
  { id: 'lb5', name: 'DiamondHands', balance: 43800, biggestWin: 18000, avatar: 'D' },
  { id: 'lb6', name: 'HighRoller_X', balance: 38200, biggestWin: 14500, avatar: 'H' },
  { id: 'lb7', name: 'SlotMaster', balance: 31000, biggestWin: 12000, avatar: 'S' },
  { id: 'lb8', name: 'HotlineVIP', balance: 25400, biggestWin: 9800, avatar: 'H' },
  { id: 'lb9', name: 'JackpotJoe', balance: 18600, biggestWin: 7500, avatar: 'J' },
  { id: 'lb10', name: 'SpinQueen', balance: 12300, biggestWin: 5200, avatar: 'S' },
];

export const MOCK_ROOMS = [
  { id: 'r1', name: 'High Rollers Lounge', players: 6, maxPlayers: 8, minBet: 50, pot: 12500 },
  { id: 'r2', name: 'Neon Nights', players: 3, maxPlayers: 6, minBet: 10, pot: 3200 },
  { id: 'r3', name: 'Lucky Sevens Club', players: 4, maxPlayers: 5, minBet: 25, pot: 8800 },
  { id: 'r4', name: 'Jackpot Hunters', players: 2, maxPlayers: 8, minBet: 5, pot: 650 },
  { id: 'r5', name: 'Diamond VIP', players: 1, maxPlayers: 4, minBet: 100, pot: 4400 },
];

export const MOCK_CHAT_USERS = ['Casino_King', 'LuckyAce', 'NeonViper', 'SlotMaster', 'GoldRush99'];
export const MOCK_CHAT_MESSAGES = [
  'Just hit triple 7s! Unreal!',
  'Anyone else on a hot streak?',
  'Come on big win!',
  'This room is on fire',
  'Spin to win!',
  'Lucky night for me',
  'GG everyone',
  'Huge pot building up',
  'What are you betting?',
  'Just joined, let\'s go!',
];
