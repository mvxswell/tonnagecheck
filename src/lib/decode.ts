// Pure model/serial decoding, shared by the build (static examples on pages) and the browser (the interactive
// ModelSerialDecoder). No guessing: a code missing from a family's table is reported as unknown, and a serial
// that does not fit a documented rule is rejected rather than forced into a date.
import type { ModelFamily, SerialRule } from '../data/decoder/types';

export const clean = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');

export interface DecodedField { label: string; code: string; meaning: string; known: boolean }
export interface ModelResult {
  family: ModelFamily;
  matched: string;
  rest: string;
  fields: DecodedField[];
  tons: number | null;
  unknownCount: number;
}

export function decodeModel(input: string, families: ModelFamily[]): ModelResult[] {
  const s = clean(input);
  if (s.length < 4) return [];
  const out: ModelResult[] = [];
  for (const family of families) {
    const m = new RegExp(family.pattern, 'i').exec(s);
    if (!m) continue;
    let tons: number | null = null;
    const fields: DecodedField[] = [];
    for (const f of family.fields) {
      const code = m[f.group];
      if (code === undefined || code === '') continue;
      let meaning = '';
      let known = false;
      if (f.tons && f.tons[code] !== undefined) {
        tons = f.tons[code];
        known = true;
        meaning = f.codes?.[code] ?? `${tons} ton${tons === 1 ? '' : 's'} nominal (${fmtBtu(tons)})`;
      } else if (f.codes && f.codes[code] !== undefined) {
        meaning = f.codes[code];
        known = true;
      } else if (f.describe && !f.codes && !f.tons) {
        meaning = f.describe;
        known = true;
      } else {
        meaning = f.describe ? `${f.describe}: code "${code}" is not in the source table` : `Code "${code}" is not in the source table`;
      }
      fields.push({ label: f.label, code, meaning, known });
    }
    out.push({ family, matched: m[0], rest: s.slice(m[0].length), fields, tons, unknownCount: fields.filter((f) => !f.known).length });
  }
  // Best match first: fewest unknown codes, then longest match.
  return out.sort((a, b) => a.unknownCount - b.unknownCount || b.matched.length - a.matched.length);
}

const fmtBtu = (tons: number) => `${Math.round(tons * 12000).toLocaleString('en-US')} BTU/h`;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Two-digit year -> four-digit year, never in the future. */
function century(yy: number, now: Date) {
  const cur = now.getFullYear() % 100;
  return yy <= cur ? 2000 + yy : 1900 + yy;
}
/** Approximate calendar month for week N of a year. */
function monthOfWeek(year: number, week: number) {
  const d = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7 + 3));
  return MONTHS[d.getUTCMonth()];
}

// Trane ACIN-3 letter year codes, 1980–2001 (O and A both = 1980).
const TRANE_LETTER_YEAR: Record<string, number> = {
  O: 1980, A: 1980, T: 1981, U: 1982, W: 1983, X: 1984, Y: 1985, S: 1986, B: 1987, C: 1988, D: 1989, E: 1990, F: 1991,
  G: 1992, H: 1993, J: 1994, K: 1995, L: 1996, M: 1997, N: 1998, P: 1999, R: 2000, Z: 2001,
};

export interface SerialResult {
  ok: boolean;
  year?: number;
  month?: string;
  approxMonth?: boolean;
  rows: { label: string; value: string }[];
  warnings: string[];
  error?: string;
}

export function decodeSerial(input: string, rule: SerialRule, now = new Date()): SerialResult {
  const s = clean(input);
  const rows: { label: string; value: string }[] = [];
  const warnings: string[] = [];
  const fail = (error: string): SerialResult => ({ ok: false, rows, warnings, error });
  if (s.length < 4) return fail('Enter the full serial number from the rating plate.');

  if (rule.kind === 'goodman-yymm') {
    const m = /^(\d{2})(\d{2})/.exec(s);
    if (!m) return fail(`${rule.appliesTo.join(' and ')} serials start with four digits (YYMM). This one does not, so it may be an older format we do not decode.`);
    const mm = +m[2];
    if (mm < 1 || mm > 12) return fail(`Digits 3–4 are "${m[2]}", which is not a month (01–12), so this is not a YYMM serial.`);
    const year = century(+m[1], now);
    rows.push({ label: 'Year (digits 1–2)', value: `${m[1]} → ${year}` }, { label: 'Month (digits 3–4)', value: `${m[2]} → ${MONTHS[mm - 1]}` });
    if (year < 2000) warnings.push(`${rule.appliesTo[0]} documents YYMM on current warranty certificates. For a pre-2000 unit, confirm the date with ${rule.appliesTo[0]} before relying on it.`);
    return { ok: true, year, month: MONTHS[mm - 1], approxMonth: false, rows, warnings };
  }

  if (rule.kind === 'carrier-wwyy' || rule.kind === 'payne-style1') {
    const m = /^(\d{2})(\d{2})([A-Z])(\d{5})$/.exec(s);
    if (!m) return fail('Expected 10 characters: 4 digits, 1 letter, 5 digits (for example 1218E00001).');
    const year = century(+m[2], now);
    if (rule.kind === 'payne-style1') {
      rows.push({ label: 'Year (digits 3–4)', value: `${m[2]} → ${year}` });
      return { ok: true, year, rows, warnings };
    }
    const wk = +m[1];
    if (wk < 1 || wk > 53) return fail(`Digits 1–2 are "${m[1]}", which is not a week (01–53).`);
    const month = monthOfWeek(year, wk);
    rows.push(
      { label: 'Week (digits 1–2)', value: `${m[1]} → week ${wk} (around ${month})` },
      { label: 'Year (digits 3–4)', value: `${m[2]} → ${year}` },
      { label: 'Site (character 5)', value: rule.plants?.[m[3]] ? `${m[3]} → ${rule.plants[m[3]]}` : `${m[3]} (not listed in our sources)` },
      { label: 'Sequence (6–10)', value: m[4] },
    );
    return { ok: true, year, month, approxMonth: true, rows, warnings };
  }

  if (rule.kind === 'trane-acin3') {
    let year: number | undefined;
    let week: number | undefined;
    let day: string | undefined;
    let plant: string | undefined;
    if (/^[A-Z]\d{3}/.test(s)) {
      year = TRANE_LETTER_YEAR[s[0]];
      if (!year) return fail(`"${s[0]}" is not a year letter in Trane's ACIN-3 table (1980–2001).`);
      rows.push({ label: 'Year (character 1)', value: `${s[0]} → ${year}` });
      week = +s.slice(1, 3);
      day = s[3];
      rows.push({ label: 'Fiscal week (2–3)', value: s.slice(1, 3) }, { label: 'Day of week (4)', value: day });
    } else if (s.length >= 10 && /^\d{4}[1-7]/.test(s)) {
      const yy = +s.slice(0, 2);
      if (yy < 9 || yy > 29) return fail(`A ten-character Trane serial starting "${s.slice(0, 2)}" is outside the ACIN-3 table (2009–2029).`);
      year = 2000 + yy;
      week = +s.slice(2, 4);
      day = s[4];
      rows.push({ label: 'Year (1–2)', value: `${s.slice(0, 2)} → ${year}` }, { label: 'Fiscal week (3–4)', value: s.slice(2, 4) }, { label: 'Day of week (5)', value: day });
      if (s.length === 10 && /[A-Z]/.test(s[9])) {
        plant = s[9];
        rows.push({ label: 'Plant (10)', value: rule.plants?.[plant] ? `${plant} → ${rule.plants[plant]}` : `${plant} (not in the ACIN-3 plant list)` });
      }
    } else if (s.length === 9 && /^[2-9]\d{2}[1-7]/.test(s)) {
      year = 2000 + +s[0];
      week = +s.slice(1, 3);
      day = s[3];
      rows.push({ label: 'Year (1)', value: `${s[0]} → ${year}` }, { label: 'Fiscal week (2–3)', value: s.slice(1, 3) }, { label: 'Day of week (4)', value: day });
    } else {
      return fail('This does not fit the ACIN-3 layouts (a year letter plus digits for 1980–2001, nine digits for 2002–2009, or ten characters for 2004 onward).');
    }
    if (week < 1 || week > 53) return fail(`The fiscal week "${String(week).padStart(2, '0')}" is not 01–53, so this does not decode under ACIN-3.`);
    const month = monthOfWeek(year, week);
    warnings.push(`Trane uses a fiscal week, so "around ${month}" is approximate.`);
    return { ok: true, year, month, approxMonth: true, rows, warnings };
  }
  return fail('No rule for this brand yet.');
}

export const ageText = (year: number, now = new Date()) => {
  const a = now.getFullYear() - year;
  return a <= 0 ? 'built this year' : `about ${a} year${a === 1 ? '' : 's'} old`;
};
