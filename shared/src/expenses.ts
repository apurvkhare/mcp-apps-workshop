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

/** [daysAgo, category, merchant, amount, note?] */
const SEED: [number, Category, string, number, string?][] = [
  [0, 'food', 'Swiggy', 486],
  [1, 'transport', 'Uber', 312],
  [1, 'groceries', 'BigBasket', 2140],
  [2, 'food', 'Third Wave Coffee', 380],
  [3, 'bills', 'Airtel', 799, 'Postpaid'],
  [4, 'entertainment', 'BookMyShow', 920, 'Two tickets'],
  [5, 'food', 'Zomato', 642],
  [6, 'shopping', 'Myntra', 2499],
  [7, 'health', 'Apollo Pharmacy', 640],
  [8, 'transport', 'Namma Metro', 120],
  [9, 'groceries', 'Zepto', 865],
  [11, 'food', 'Meghana Foods', 1150, 'Team lunch'],
  [12, 'bills', 'BESCOM', 1830, 'Electricity'],
  [14, 'travel', 'IndiGo', 6420, 'BLR to BOM'],
  [15, 'transport', 'Rapido', 95],
  [17, 'food', 'Swiggy', 530],
  [19, 'shopping', 'Amazon', 1299],
  [21, 'entertainment', 'Netflix', 649],
  [23, 'groceries', 'BigBasket', 1960],
  [26, 'food', 'Starbucks', 410],
  [29, 'health', 'Cult.fit', 1999, 'Monthly pass'],
  [33, 'bills', 'ACT Fibernet', 1180],
  [36, 'travel', 'MakeMyTrip', 8900, 'Hotel, Mumbai'],
  [38, 'food', 'Zomato', 720],
  [41, 'transport', 'Uber', 540],
  [44, 'shopping', 'Decathlon', 3150],
  [47, 'groceries', 'Zepto', 1240],
  [52, 'entertainment', 'Spotify', 119],
  [55, 'food', 'Truffles', 860],
  [60, 'bills', 'Airtel', 799, 'Postpaid']
];

export class ExpenseStore {
  private rows: Expense[];
  private nextId: number;

  constructor(today = todayIST()) {
    this.rows = SEED.map(([daysAgo, category, merchant, amount, note], i) => ({
      id: `e${i + 1}`,
      date: shiftDays(today, -daysAgo),
      category,
      merchant,
      amount,
      ...(note ? { note } : {})
    }));
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
