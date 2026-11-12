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

// Lennox month letters, January–December (I is skipped).
const LENNOX_MONTHS = 'ABCDEFGHJKLM';

// Bosch Home Comfort three-character date codes, transcribed from Table 1 of the Serial Number Reference Guide
// (BTC 310004101 K, 07.2026). The code sits in characters 5–7 of the serial. Every code in the table is unique.
const BOSCH_DATE_CODES: Record<string, [number, number]> = (() => {
  const out: Record<string, [number, number]> = {};
  const months = (y: number, codes: string[]) => codes.forEach((c, i) => { out[c] = [y, i]; });
  const pad = (n: number) => String(n).padStart(2, '0');
  for (let y = 2010; y <= 2013; y++) months(y, Array.from({ length: 12 }, (_, i) => `${y % 10}${pad(i + 1)}`));
  for (let y = 2014; y <= 2019; y++) months(y, [17, 18, 19, 20, 53, 54, 55, 56, 57, 58, 59, 60].map((n) => `${y % 10}${n}`));
  for (let y = 2020; y <= 2029; y++) months(y, [37, 38, 39, 40, 73, 74, 75, 76, 77, 78, 79, 80].map((n) => `${y % 10}${n}`));
  months(2030, ['0A1', '0A2', '0A3', '0A4', '0A5', '0A6', '0A7', '0A8', '0A9', '0AA', '0AB', '0AC']);
  return out;
})();

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
  if (rule.kind === 'lennox-plant-yy-month') {
    const m = /^(\d{2})(\d{2})([A-Z])([0-9A-Z]{5,6})$/.exec(s);
    if (!m) return fail('Lennox documents serials as two plant digits, two year digits, a month letter and a 5- or 6-digit number (for example 5921C05716). This one does not fit, so it may be another Lennox format whose layout Lennox does not publish.');
    const mi = LENNOX_MONTHS.indexOf(m[3]);
    if (mi < 0) return fail(`Character 5 is "${m[3]}", which is not a Lennox month letter (A–M, with no I).`);
    const year = century(+m[2], now);
    rows.push(
      { label: 'Plant (digits 1–2)', value: rule.plants?.[m[1]] ? `${m[1]} → ${rule.plants[m[1]]}` : `${m[1]} (not listed in Lennox's charts we found)` },
      { label: 'Year (digits 3–4)', value: `${m[2]} → ${year}` },
      { label: 'Month (character 5)', value: `${m[3]} → ${MONTHS[mi]}` },
      { label: 'Unique number', value: m[4] },
    );
    if (year < 2000) warnings.push('Lennox\'s current charts list year codes from 2019 on. For a unit built before 2000, confirm the date with a Lennox dealer before relying on it.');
    return { ok: true, year, month: MONTHS[mi], approxMonth: false, rows, warnings };
  }
  if (rule.kind === 'rheem-letter-wwyy') {
    // Rheem: "The first two numbers after the letter in the middle or beginning of the serial number are the week
    // of manufacture, and the third and fourth numbers are the year." Take the first letter followed by a valid week.
    let hit: RegExpExecArray | null = null;
    const re = /[A-Z](\d{2})(\d{2})/g;
    for (let x = re.exec(s); x; x = re.exec(s)) {
      const wk = +x[1];
      if (wk >= 1 && wk <= 53) { hit = x; break; }
      re.lastIndex = x.index + 1;
    }
    if (!hit) return fail('Rheem and Ruud HVAC serials have a letter (at the start or in the middle) followed by the week and year, for example W08139999. No letter here is followed by a week 01–53 and a year.');
    const at = hit.index;
    const letter = s[at];
    const week = +hit[1];
    const year = century(+hit[2], now);
    const month = monthOfWeek(year, week);
    if (at > 0) rows.push({ label: 'Before the letter', value: `${s.slice(0, at)} (on older units Rheem prints a compressor identification number here)` });
    rows.push(
      { label: 'Plant letter', value: rule.plants?.[letter] ? `${letter} → ${rule.plants[letter]}` : `${letter} (not in the Rheem plant lists we found)` },
      { label: 'Week (2 digits after the letter)', value: hit[1] },
      { label: 'Year (next 2 digits)', value: `${hit[2]} → ${year}` },
    );
    const restNum = s.slice(at + 5);
    if (restNum) rows.push({ label: 'Production number', value: restNum });
    warnings.push(`Rheem dates by week of the year, so "around ${month}" is approximate.`);
    if (at > 0) warnings.push(`The date was read after the letter "${letter}" in the middle of the serial, as Rheem describes for its older long serials.`);
    return { ok: true, year, month, approxMonth: true, rows, warnings };
  }
  if (rule.kind === 'bosch-date-table') {
    if (s.length < 7) return fail('Bosch serials carry a three-character date code right after the first four characters, so enter the full serial from the rating plate.');
    const code = s.slice(4, 7);
    const hit = BOSCH_DATE_CODES[code];
    if (!hit) return fail(`Characters 5–7 are "${code}", which is not in Bosch's date-code table (2010–2030). This may be an older or different Bosch serial layout.`);
    const [year, mi] = hit;
    if (year > now.getFullYear() || (year === now.getFullYear() && mi > now.getMonth())) {
      return fail(`Characters 5–7 are "${code}", which Bosch's table assigns to ${MONTHS[mi]} ${year}. That is in the future, so this serial probably uses a different layout.`);
    }
    rows.push(
      { label: 'First four characters', value: `${s.slice(0, 4)} (Bosch does not publish what these mean)` },
      { label: 'Date code (characters 5–7)', value: `${code} → ${MONTHS[mi]} ${year}` },
    );
    if (s.length > 7) rows.push({ label: 'Rest of the serial', value: s.slice(7) });
    warnings.push('Bosch says the date code is "typically" the three characters after the first four. If your label is laid out differently, confirm the date with Bosch before relying on it.');
    return { ok: true, year, month: MONTHS[mi], approxMonth: false, rows, warnings };
  }
  if (rule.kind === 'lg-ymm') {
    // LG: "First digit represents the year; second and third digits represent the month" (outdoor units).
    const m = /^(\d)(\d{2})/.exec(s);
    if (!m) return fail('LG dates its outdoor units by the first three digits of the serial: one year digit, then a two-digit month (for example 503…). This serial does not start with three digits, so it does not fit LG\'s rule.');
    const mm = +m[2];
    if (mm < 1 || mm > 12) return fail(`Digits 2–3 are "${m[2]}", which is not a month (01–12), so this does not fit LG's rule.`);
    // Only the last digit of the year is printed: take the most recent year ending in it that is not in the future.
    const cur = now.getFullYear();
    let year = cur - (((cur - +m[1]) % 10) + 10) % 10;
    if (year === cur && mm > now.getMonth() + 1) year -= 10;
    const month = MONTHS[mm - 1];
    rows.push(
      { label: 'Year (digit 1)', value: `${m[1]} → ${year} (or ${year - 10})` },
      { label: 'Month (digits 2–3)', value: `${m[2]} → ${month}` },
    );
    if (s.length > 3) rows.push({ label: 'Rest of the serial', value: `${s.slice(3)} (LG does not publish what these characters mean)` });
    warnings.push(`LG prints only the last digit of the year, so ${month} ${year} could also be ${month} ${year - 10}. Settle the decade with the install paperwork or the model: K-prefix models are LG's R32 line.`);
    return { ok: true, year, month, approxMonth: false, rows, warnings };
  }
  return fail('No rule for this brand yet.');
}

export const ageText = (year: number, now = new Date()) => {
  const a = now.getFullYear() - year;
  return a <= 0 ? 'built this year' : `about ${a} year${a === 1 ? '' : 's'} old`;
};
