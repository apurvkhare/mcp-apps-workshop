/**
 * The Expensify domain: shapes, validation, and an in-memory store.
 * This is the "app before MCP" part. It is shared by every step of the workshop and never changes,
 * so the step diffs only show MCP code. A real app would put a database behind the same methods.
 */
import * as z from 'zod';

export const CATEGORIES = ['food', 'transport', 'groceries', 'shopping', 'bills', 'entertainment', 'health', 'travel'] as const;
export type Category = (typeof CATEGORIES)[number];

export const GROUP_BY = ['category', 'merchant', 'month'] as const;
export type GroupBy = (typeof GROUP_BY)[number];

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

export const ExpenseInput = z.object({
  date: isoDate.describe('YYYY-MM-DD'),
  category: z.enum(CATEGORIES),
  merchant: z.string().trim().min(1).max(80).describe('Who was paid'),
  amount: z.number().positive().max(10_000_000).describe('Amount in INR'),
  note: z.string().max(200).optional()
});
export type ExpenseInput = z.infer<typeof ExpenseInput>;

export interface Expense extends ExpenseInput {
  id: string;
}

export interface ListFilter {
  from?: string;
  to?: string;
  category?: Category;
  merchant?: string;
  limit?: number;
}

export interface Group {
  key: string;
  total: number;
  count: number;
}

export interface Summary {
  currency: 'INR';
  from?: string;
  to?: string;
  total: number;
  count: number;
  groupBy: GroupBy;
  groups: Group[];
}

/** Today in India, as YYYY-MM-DD. The demo data is relative to it, so "this month" always has rows. */
export function todayIST(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(now);
}

function shiftDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** A random number generator (mulberry32) seeded from a date: each day always gets the same expenses. */
function random(date: string) {
  let a = [...date].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Three years of believable spending for one person in Bengaluru, ending today: daily food and
 * commutes, weekly groceries, monthly bills on fixed days, a few trips a year, and festive-season
 * shopping. Each date is seeded on its own, so a new day adds rows and changes nothing before it.
 * Oldest first, so ids follow time and an added expense continues the count.
 */
function demoExpenses(today: string): ExpenseInput[] {
  let rand: () => number; // reseeded for each date below
  const chance = (p: number) => rand() < p;
  const pick = <T>(xs: readonly T[]): T => xs[Math.floor(rand() * xs.length)]!;
  const between = (min: number, max: number, step = 1) => Math.round((min + rand() * (max - min)) / step) * step;

  const rows: ExpenseInput[] = [];
  const add = (date: string, category: Category, merchant: string, amount: number, note?: string) =>
    rows.push({ date, category, merchant, amount, ...(note ? { note } : {}) });

  const days = 3 * 365;
  for (let ago = days; ago >= 0; ago--) {
    const date = shiftDays(today, -ago);
    rand = random(date);
    const d = new Date(`${date}T00:00:00Z`);
    const [day, month, weekday] = [d.getUTCDate(), d.getUTCMonth() + 1, d.getUTCDay()];
    const weekend = weekday === 0 || weekday === 6;
    // Tariffs go up over time: years before 2026 cost a little less.
    const year = Math.min(3, Math.max(0, 2026 - d.getUTCFullYear()));
    const festive = month === 10 || month === 11;

    // Bills, on the same day each month
    if (day === 1) add(date, 'health', 'Cult.fit', 1999 - year * 200, 'Monthly pass');
    if (day === 3) add(date, 'bills', 'ACT Fibernet', 1180 - year * 80);
    if (day === 5) add(date, 'bills', 'Airtel', [799, 799, 699, 599][year]!, 'Postpaid');
    if (day === 8) add(date, 'entertainment', 'Spotify', 119);
    if (day === 12) add(date, 'bills', 'BESCOM', between(month >= 3 && month <= 5 ? 2100 : 1250, month >= 3 && month <= 5 ? 2900 : 1900, 10), 'Electricity');
    if (day === 15 && month % 2 === 0) add(date, 'bills', 'Indane', 905 - year * 50, 'LPG cylinder');
    if (day === 21) add(date, 'entertainment', 'Netflix', 649);
    if (day === 18 && month === 6) add(date, 'health', 'Star Health', 18_400 - year * 900, 'Health insurance, yearly');
    if (day === 2 && month === 9) add(date, 'shopping', 'Amazon', 1499, 'Prime, yearly');

    // Food: delivery most days, coffee, and eating out at weekends
    if (chance(weekend ? 0.55 : 0.4)) add(date, 'food', pick(['Swiggy', 'Swiggy', 'Zomato', 'Zomato', 'EatSure']), between(220, 920));
    if (chance(0.22)) add(date, 'food', pick(['Third Wave Coffee', 'Starbucks', 'Blue Tokai', 'Chai Point']), between(150, 520, 10));
    if (weekend && chance(0.35)) add(date, 'food', pick(['Meghana Foods', 'Truffles', 'Toit', 'MTR', 'Empire', 'Nagarjuna']), between(600, 2800, 10));
    if (!weekend && chance(0.04)) add(date, 'food', pick(['Meghana Foods', 'Nagarjuna', 'Truffles']), between(1800, 4200, 10), 'Team lunch');

    // Getting around on workdays
    if (!weekend && chance(0.55)) add(date, 'transport', pick(['Uber', 'Uber', 'Ola', 'Rapido', 'Namma Metro']), between(60, 620));
    if (weekend && chance(0.3)) add(date, 'transport', pick(['Uber', 'Rapido']), between(90, 480));
    if (chance(0.05)) add(date, 'transport', 'HP Petrol', between(1000, 2500, 100), 'Fuel');

    // Groceries: a big Sunday shop, and quick top-ups
    if (weekday === 0 && chance(0.8)) add(date, 'groceries', 'BigBasket', between(1400, 3600, 10));
    if (chance(0.22)) add(date, 'groceries', pick(['Zepto', 'Blinkit', 'Swiggy Instamart']), between(180, 1400));

    // Now and then
    if (chance(festive ? 0.14 : 0.05)) {
      add(date, 'shopping', pick(['Amazon', 'Flipkart', 'Myntra', 'Decathlon', 'IKEA', 'Croma', 'Nykaa']), between(399, festive ? 14_000 : 6000, 10), festive && chance(0.4) ? 'Diwali sale' : undefined);
    }
    if (chance(weekend ? 0.1 : 0.03)) add(date, 'entertainment', pick(['BookMyShow', 'BookMyShow', 'PVR INOX', 'Smaaash']), between(350, 1600, 10));
    if (chance(0.035)) add(date, 'health', pick(['Apollo Pharmacy', 'Apollo Pharmacy', 'PharmEasy', 'Practo']), between(150, 1500, 10));

    // A trip every couple of months: getting there, then somewhere to stay
    if (chance(1 / 60) || (festive && day === 28 && month === 10)) {
      const [place, merchant, fare] = pick([
        ['Mumbai', 'IndiGo', [4200, 9500]],
        ['Delhi', 'Air India', [5200, 11_000]],
        ['Goa', 'IndiGo', [3500, 8000]],
        ['Chennai', 'IRCTC', [700, 1900]],
        ['Mysuru', 'IRCTC', [300, 900]],
        ['Hyderabad', 'Akasa Air', [3200, 7000]]
      ] as const);
      add(date, 'travel', merchant, between(fare[0], fare[1], 10), `BLR to ${place}`);
      if (chance(0.8)) add(date, 'travel', pick(['MakeMyTrip', 'Booking.com', 'OYO', 'Airbnb']), between(2800, 16_000, 100), `Hotel, ${place}`);
    }
  }
  return rows;
}

export class ExpenseStore {
  private rows: Expense[];
  private nextId: number;

  constructor(today = todayIST()) {
    this.rows = demoExpenses(today).map((e, i) => ({ id: `e${i + 1}`, ...e }));
    this.nextId = this.rows.length + 1;
  }

  private match(f: ListFilter): Expense[] {
    const merchant = f.merchant?.toLowerCase();
    return this.rows
      .filter((e) => (!f.from || e.date >= f.from) && (!f.to || e.date <= f.to))
      .filter((e) => !f.category || e.category === f.category)
      .filter((e) => !merchant || e.merchant.toLowerCase().includes(merchant))
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }

  list(f: ListFilter = {}): Expense[] {
    return this.match(f).slice(0, f.limit ?? 20);
  }

  summary(f: Omit<ListFilter, 'limit'> & { groupBy?: GroupBy } = {}): Summary {
    const groupBy = f.groupBy ?? 'category';
    const rows = this.match(f);
    const groups = new Map<string, Group>();
    for (const e of rows) {
      const key = groupBy === 'month' ? e.date.slice(0, 7) : e[groupBy];
      const g = groups.get(key) ?? { key, total: 0, count: 0 };
      g.total += e.amount;
      g.count += 1;
      groups.set(key, g);
    }
    return {
      currency: 'INR',
      ...(f.from ? { from: f.from } : {}),
      ...(f.to ? { to: f.to } : {}),
      total: rows.reduce((sum, e) => sum + e.amount, 0),
      count: rows.length,
      groupBy,
      groups: [...groups.values()].sort((a, b) => (groupBy === 'month' ? b.key.localeCompare(a.key) : b.total - a.total))
    };
  }

  get(id: string): Expense | undefined {
    return this.rows.find((e) => e.id === id);
  }

  add(input: ExpenseInput): Expense {
    const expense: Expense = { id: `e${this.nextId++}`, ...ExpenseInput.parse(input) };
    this.rows.push(expense);
    return expense;
  }

  remove(id: string): Expense | undefined {
    const i = this.rows.findIndex((e) => e.id === id);
    return i === -1 ? undefined : this.rows.splice(i, 1)[0];
  }
}

export const formatINR = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

/** One expense as a line of text: what the model reads. */
export const expenseLine = (e: Expense) =>
  `${e.id}  ${e.date}  ${e.category.padEnd(13)}  ${formatINR(e.amount).padStart(10)}  ${e.merchant}${e.note ? `  (${e.note})` : ''}`;

/** First and last day of a month relative to today: 0 is this month, -1 last month. */
export function monthRange(offset = 0, today = todayIST()): { from: string; to: string } {
  const [y, m] = today.split('-').map(Number) as [number, number];
  const first = new Date(Date.UTC(y, m - 1 + offset, 1));
  const last = new Date(Date.UTC(y, m + offset, 0));
  const from = first.toISOString().slice(0, 10);
  const to = offset === 0 ? today : last.toISOString().slice(0, 10);
  return { from, to };
}
