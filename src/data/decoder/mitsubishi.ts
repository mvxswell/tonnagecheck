import type { DecoderBrand, ModelField } from './types';

// Every position below is transcribed from the "Model number reference guides" pages (pp. 146–147) of Mitsubishi
// Electric Trane HVAC US's 09/2025 M- and P-Series catalog, which covers the current R-454B ("L") equipment.
// Capacity is printed "in kBTU/H"; tons are that figure divided by 12, so a 09 is a ¾-ton class unit.
const CAP_TONS: Record<string, number> = {
  '06': 0.5, '09': 0.75, '12': 1, '15': 1.25, '18': 1.5, '20': 1.67, '24': 2, '30': 2.5, '36': 3, '42': 3.5, '48': 4, '60': 5,
};
const CAP_TEXT: Record<string, string> = {
  '06': '6,000 Btu/h nominal (½ ton)',
  '09': '9,000 Btu/h nominal (¾ ton)',
  '12': '12,000 Btu/h nominal (1 ton)',
  '15': '15,000 Btu/h nominal (1¼ tons)',
  '18': '18,000 Btu/h nominal (1½ tons)',
  '20': '20,000 Btu/h nominal (about 1⅔ tons)',
  '24': '24,000 Btu/h nominal (2 tons)',
  '30': '30,000 Btu/h nominal (2½ tons)',
  '36': '36,000 Btu/h nominal (3 tons)',
  '42': '42,000 Btu/h nominal (3½ tons)',
  '48': '48,000 Btu/h nominal (4 tons)',
  '60': '60,000 Btu/h nominal (5 tons)',
};
const capacity = (group: number): ModelField => ({ group, label: 'Capacity (nominal, kBTU/h)', tons: CAP_TONS, codes: CAP_TEXT });
const APPLICATION = { Y: 'Cooling only', Z: 'Heat pump' };
const REFRIGERANT = { L: 'R-454B' };
const OUTDOOR_TAIL = (start: number): ModelField[] => [
  { group: start, label: 'Refrigerant', codes: REFRIGERANT },
  { group: start + 1, label: 'Additional feature', codes: { H: 'Base pan heater' } },
  { group: start + 2, label: 'Additional feature', codes: { Z: 'H2i® Hyper-Heating' } },
  { group: start + 3, label: 'Generation', describe: 'Generation number (blank, 2, 3, etc.)' },
];
const series = (group: number, label: string, list: string[]): ModelField => ({
  group, label, codes: Object.fromEntries(list.map((c) => [c, `${c} series (Mitsubishi lists the code without spelling it out)`])),
});
const GENERATION = (group: number): ModelField => ({ group, label: 'Generation', describe: 'Generation number (blank, 2, 3, etc.)' });

export const mitsubishi: DecoderBrand = {
  slug: 'mitsubishi',
  name: 'Mitsubishi Electric',
  brands: ['Mitsubishi Electric'],
  seedBrands: ['Mitsubishi'],
  title: 'Mitsubishi Mini-Split Model Number Decoder (R-454B)',
  description:
    'Decode a Mitsubishi Electric model number (MSZ, MUZ, SUZ, PUZ, MXZ, SVZ, PVA) into size, Hyper-Heat and R-454B codes, plus 10- and 12-year warranty rules.',
  h1: 'Mitsubishi Electric model number decoder',
  lead:
    'Mitsubishi Electric model numbers read left to right like a sentence: series, where the unit sits, heat pump or cooling only, product line, size, voltage, refrigerant, then options. Once you know the order, an MUZ-GX09NLHZ tells you most of what is on the spec sheet.',
  intro: [
    'Start with the first three letters. The first is the family: M for M-Series, S for S-Series, P for P-Series. The second is the type, which tells you where the unit goes: U is a single-zone outdoor unit, X a multi-zone outdoor unit, S a wall-mounted head, E horizontal ducted, F floor-mounted, L a ceiling cassette and V a multi-position air handler. The third is Z for a heat pump or Y for cooling only. So MSZ is an M-Series wall-mounted heat pump head and SUZ is an S-Series single-zone outdoor heat pump.',
    'After the dash come two letters for the product line (GX, FX, HX, AK, AP and so on), then the size in thousands of Btu/h. 09 is a ¾-ton class unit, 12 is one ton, 36 is three tons. The next letter is the voltage (N for 230 V single-phase, W for 115 V), and on current equipment an L follows. Mitsubishi\'s 2025 catalog defines that L as R-454B, the refrigerant that replaced R-410A.',
    'The letters after the L matter on an outdoor unit. H means a base pan heater and Z means H2i® Hyper-Heating, Mitsubishi\'s cold-climate design. An SUZ-AK36NLHZ has both, while a PUZ-AK42NL has neither, so check those two letters before comparing quotes for a cold-climate install. Mitsubishi does not tell homeowners how to read a date from the serial number. Its warranty uses "the date of manufacture stamped on the Product", so read the date printed on the unit\'s label instead.',
  ],
  labelLocation: {
    text: 'Each indoor and outdoor unit has its own spec name plate showing the model and serial number, and the outdoor and indoor serials differ. On MSZ-FX wall units the service manual shows the spec name plate at the bottom front of the unit by the air outlet. The serial also matters for warranty: Mitsubishi\'s limited warranty excludes products whose serial number has been "altered, defaced or removed", and you give the model and serial number when you make a claim.',
    sourceIds: ['mitsuMszFx', 'mitsuWarranty'],
  },
  families: [
    {
      id: 'mitsubishi-single-zone-outdoor',
      brand: 'Mitsubishi Electric',
      name: 'M-Series & S-Series single-zone outdoor units (MUZ, MUY, SUZ)',
      kind: 'Ductless / ducted mini-split outdoor unit, R-454B',
      pattern: '^([MS])(U)([YZ])([A-Z]{2})(\\d{2})([WN])(L)(H)?(Z)?([2-9])?',
      example: 'SUZ-AK36NLHZ',
      layout: 'S U Z - AK 36 N L H Z',
      fields: [
        { group: 1, label: 'Family', codes: { M: 'M-Series mini-split', S: 'S-Series mini-split' } },
        { group: 2, label: 'Type', codes: { U: 'Outdoor unit' } },
        { group: 3, label: 'Application', codes: APPLICATION },
        series(4, 'System series', ['FX', 'GX', 'JX', 'HX', 'WX', 'AA', 'AK']),
        capacity(5),
        { group: 6, label: 'Input voltage', codes: { W: '115 V, 1-phase', N: '230 V, 1-phase' } },
        ...OUTDOOR_TAIL(7),
      ],
      sourceIds: ['mitsuCatalog'],
      notes: [
        'The series letters are printed in the guide without meanings, so we show the code only. SUZ-KA… outdoor units are sold in the 2025 catalog, but KA is not in the guide\'s series list, so the decoder flags it as not in the source table.',
      ],
    },
    {
      id: 'mitsubishi-indoor',
      brand: 'Mitsubishi Electric',
      name: 'M-Series & S-Series indoor units (MSZ, MSY, MLZ, MFZ, SEZ, SLZ, SVZ)',
      kind: 'Mini-split indoor unit (wall, ducted, floor, cassette or air handler), R-454B',
      pattern: '^([MS])([SEFLV])([YZ])([A-Z]{2})(\\d{2})([WN])(L)([BSW])?([2-9])?',
      example: 'MSZ-GX09NL',
      layout: 'M S Z - GX 09 N L',
      fields: [
        { group: 1, label: 'Family', codes: { M: 'M-Series mini-split', S: 'S-Series mini-split' } },
        { group: 2, label: 'Type', codes: { S: 'Wall-mounted', E: 'Horizontal ducted', F: 'Floor-mounted', L: 'Ceiling cassette', V: 'Multi-position air handler' } },
        { group: 3, label: 'Application', codes: APPLICATION },
        series(4, 'System series', ['FX', 'GX', 'EX', 'JX', 'HX', 'WX', 'KX', 'AD', 'AF', 'AP']),
        capacity(5),
        { group: 6, label: 'Input voltage', codes: { W: '115 V, 1-phase', N: '230 V, 1-phase' } },
        { group: 7, label: 'Refrigerant', codes: REFRIGERANT },
        { group: 8, label: 'Additional feature (color)', codes: { B: 'Black', S: 'Silver', W: 'White' } },
        GENERATION(9),
      ],
      sourceIds: ['mitsuCatalog'],
      notes: [
        'An indoor head\'s size is its own capacity class, not the system\'s. A multi-zone system often has heads that add up to more than the outdoor unit.',
      ],
    },
    {
      id: 'mitsubishi-p-outdoor',
      brand: 'Mitsubishi Electric',
      name: 'P-Series single-zone outdoor units (PUZ, PUY)',
      kind: 'P-Series outdoor unit, R-454B',
      pattern: '^(P)(U)([YZ])([A-Z]{2})(\\d{2})(N)(L)(H)?(Z)?([2-9])?',
      example: 'PUZ-AK36NLHZ',
      layout: 'P U Z - AK 36 N L H Z',
      fields: [
        { group: 1, label: 'Family', codes: { P: 'P-Series mini-split' } },
        { group: 2, label: 'Type', codes: { U: 'Outdoor unit' } },
        { group: 3, label: 'Application', codes: APPLICATION },
        series(4, 'Chassis generation', ['AH', 'AK']),
        capacity(5),
        { group: 6, label: 'Input voltage', codes: { N: '230 V, 1-phase' } },
        ...OUTDOOR_TAIL(7),
      ],
      sourceIds: ['mitsuCatalog', 'mitsuPuzAk'],
    },
    {
      id: 'mitsubishi-p-indoor',
      brand: 'Mitsubishi Electric',
      name: 'P-Series indoor units (PVA, PEAD, PKA, PLA, PCA, PAA)',
      kind: 'P-Series indoor unit or air handler, R-454B',
      pattern: '^(P)([KECLVA])(AD|A)([A-Z]{2})(\\d{2})(N)(L)([2-9])?',
      example: 'PVA-AA30NL',
      layout: 'P V A - AA 30 N L',
      fields: [
        { group: 1, label: 'Family', codes: { P: 'P-Series mini-split' } },
        { group: 2, label: 'Type', codes: { K: 'Wall-mounted', E: 'Horizontal ducted', C: 'Ceiling-suspended (PCA; see note)', L: 'Ceiling cassette', V: 'Multi-position air handler', A: 'intelli-HEAT® (dual fuel)' } },
        { group: 3, label: 'Application', codes: { A: 'Indoor unit', AD: 'Horizontal-ducted indoor unit (PEAD)' } },
        series(4, 'System series', ['AA', 'AE', 'AK', 'AL', 'BA', 'CA']),
        capacity(5),
        { group: 6, label: 'Input voltage', codes: { N: '230 V, 1-phase' } },
        { group: 7, label: 'Refrigerant', codes: REFRIGERANT },
        GENERATION(8),
      ],
      sourceIds: ['mitsuCatalog', 'mitsuModelGuide'],
      notes: [
        'The catalog\'s P-Series indoor chart prints "C= Floor-mounted", but the same catalog sells the PCA as a "Ceiling-suspended Indoor Unit" and Mitsubishi\'s 2020 guide also lists C as ceiling-suspended, so we follow the product pages.',
      ],
    },
    {
      id: 'mitsubishi-mxz-ported',
      brand: 'Mitsubishi Electric',
      name: 'MXZ multi-zone (ported) outdoor units (MXZ-2D…5D)',
      kind: 'Multi-zone outdoor unit, R-454B',
      pattern: '^(M)(X)(Z)([2-5])(D)(\\d{2})(N)(L)(H)?(Z)?([2-9])?',
      example: 'MXZ-3D30NLHZ',
      layout: 'M X Z - 3 D 30 N L H Z',
      fields: [
        { group: 1, label: 'Family', codes: { M: 'M-Series mini-split' } },
        { group: 2, label: 'Type', codes: { X: 'Multi-zone outdoor unit' } },
        { group: 3, label: 'Application', codes: { Z: 'Heat pump' } },
        { group: 4, label: 'Number of ports', codes: { '2': '2 ports', '3': '3 ports', '4': '4 ports', '5': '5 ports' } },
        { group: 5, label: 'Model generation', codes: { D: 'Model generation D' } },
        capacity(6),
        { group: 7, label: 'Input voltage', codes: { N: '230 V, 1-phase' } },
        ...OUTDOOR_TAIL(8),
      ],
      sourceIds: ['mitsuCatalog'],
    },
    {
      id: 'mitsubishi-smart-multi',
      brand: 'Mitsubishi Electric',
      name: 'SMART MULTI® outdoor units (MXZ-SM…)',
      kind: 'Multi-zone outdoor unit, R-454B',
      pattern: '^(M)(X)([YZ])(SM)(\\d{2})([NT])(L)(H)?(Z)?([2-9])?',
      example: 'MXZ-SM60NL',
      layout: 'M X Z - SM 60 N L',
      fields: [
        { group: 1, label: 'Family', codes: { M: 'M-Series mini-split' } },
        { group: 2, label: 'Type', codes: { X: 'Multi-zone outdoor unit' } },
        { group: 3, label: 'Application', codes: APPLICATION },
        { group: 4, label: 'System series', codes: { SM: 'SMART MULTI®' } },
        capacity(5),
        { group: 6, label: 'Input voltage', codes: { N: '230 V, 1-phase', T: '230 V, 3-phase' } },
        ...OUTDOOR_TAIL(7),
      ],
      sourceIds: ['mitsuCatalog'],
    },
  ],
  serials: [],
  serialNote: {
    text: 'Mitsubishi Electric Trane HVAC US does not publish a serial-number date code for its residential M-, S- or P-Series equipment in any document we found. Its limited warranty instead refers to "the date of manufacture stamped on the Product": if you cannot prove when the system was installed, Mitsubishi deems the install date to be 120 days after that manufacture date. Read the date on the unit\'s label rather than guessing from the serial number.',
    sourceIds: ['mitsuWarranty'],
  },
  warranty: [
    {
      label: 'Standard (any licensed installer, not registered)',
      detail: '5 years on parts and 7 years on the compressor from the installation date, on systems purchased on or after October 15, 2026. Parts only: labor is not covered.',
      sourceIds: ['mitsuWarranty'],
    },
    {
      label: 'Registered within 90 days',
      detail: '10 years on parts and compressor while the original purchaser lives in the home, if the system is in an owner-occupied residence and registered within 90 days of installation. California, Connecticut, Florida and Georgia residents get the benefit without registering.',
      sourceIds: ['mitsuWarranty', 'mitsuRegister'],
    },
    {
      label: 'Diamond Contractor® install, registered within 90 days',
      detail: '12 years on parts and compressor while the original purchaser lives in the home, if a Diamond Contractor® installs it in an owner-occupied residence and that contractor registers it within 90 days.',
      sourceIds: ['mitsuWarranty', 'mitsuRegister'],
    },
    {
      label: 'No proof of install date',
      detail: 'Coverage is counted from 120 days after the date of manufacture stamped on the unit.',
      sourceIds: ['mitsuWarranty'],
    },
    {
      label: 'Selling the house',
      detail: 'The warranty does not transfer, except for Florida, Georgia and Texas residents when the system passes to the buyer with the sale of the whole home.',
      sourceIds: ['mitsuWarranty'],
    },
    {
      label: 'Older installs',
      detail: 'Terms depend on the purchase date. Mitsubishi posts every statement with its effective-date range (for example June 1 to October 14, 2026), so use the one in force when your system was bought.',
      sourceIds: ['mitsuWarranties'],
    },
  ],
  gotchas: [
    {
      title: 'The size code is not always a whole ton',
      text: 'Mitsubishi prints capacity in thousands of Btu/h, and ductless sizes like 06, 09, 15 and 20 are fractions of a ton. An MXZ-2D20NL is a 20,000 Btu/h outdoor unit, about 1⅔ tons, not a 2-ton.',
      sourceIds: ['mitsuCatalog'],
    },
    {
      title: '"HZ" is the cold-climate part',
      text: 'An outdoor model ending in H has a base pan heater, and Z is H2i® Hyper-Heating. Two quotes for "the same" 3-ton unit can differ here: SUZ-AK36NLHZ has both, while PUZ-AK36NL has neither.',
      sourceIds: ['mitsuCatalog'],
    },
    {
      title: 'The -U1 on the label is not part of the model',
      text: 'Labels and service manuals often add a suffix like -U1 (PUZ-AK36NL-U1). Mitsubishi calls it the service reference. It points to the right manual and parts list but does not change the model, so the decoder shows it as trailing characters.',
      sourceIds: ['mitsuPuzAk', 'mitsuModelGuide'],
    },
    {
      title: 'The 12-year warranty needs the contractor, not you',
      text: 'Registering the system yourself within 90 days gets 10 years on parts and compressor. The 12-year term applies only when a Diamond Contractor® installs the system and registers it.',
      sourceIds: ['mitsuWarranty'],
    },
  ],
  faqs: [
    {
      q: 'What size is my Mitsubishi mini-split?',
      a: 'Read the two digits after the product-line letters. They are the capacity in thousands of Btu/h, so 09 is 9,000 Btu/h (¾ ton), 12 is 1 ton, 24 is 2 tons and 36 is 3 tons. On an indoor head that is the head\'s own size. For the system, use the outdoor unit (MUZ, SUZ, PUZ or MXZ).',
    },
    {
      q: 'What do the letters NLHZ at the end of a Mitsubishi model mean?',
      a: 'In Mitsubishi\'s 2025 reference guide, N is 230 V single-phase power, L is R-454B refrigerant, H is a base pan heater and Z is H2i® Hyper-Heating. A W instead of N means 115 V, and a trailing number (2, 3…) is the generation.',
    },
    {
      q: 'What is the difference between MSZ, MUZ, SUZ and MXZ?',
      a: 'The middle letter is the type. MSZ is a wall-mounted indoor heat pump head, MUZ is an M-Series single-zone outdoor unit, SUZ is an S-Series single-zone outdoor unit, and MXZ is a multi-zone outdoor unit. A Y in place of Z means cooling only.',
    },
    {
      q: 'How do I tell how old my Mitsubishi heat pump is?',
      a: 'Use the manufacture date printed on the unit\'s label. Mitsubishi Electric Trane HVAC US does not publish a serial-number date code for residential mini-splits. Its warranty dates units by "the date of manufacture stamped on the Product", so we do not decode Mitsubishi serial numbers.',
    },
    {
      q: 'Is the Mitsubishi warranty 10 or 12 years?',
      a: 'Both, depending on who installs and registers it. On systems bought from October 15, 2026, a registered system in an owner-occupied home gets 10 years on parts and compressor. A Diamond Contractor® install that the contractor registers within 90 days gets 12. Unregistered, it is 5 years on parts and 7 on the compressor.',
    },
  ],
  serialOptions: [],
  notCovered: [
    'Mitsubishi serial numbers. No Mitsubishi Electric Trane HVAC US document we found defines a date code in the serial of residential M-, S- or P-Series units (date codes in Mitsubishi\'s European and factory-automation manuals use other formats and are not applied here). The warranty relies on the manufacture date stamped on the unit.',
    'What the product-line letters (GX, FX, HX, AK, AP and so on) stand for. The guide lists them without meanings.',
    'R-410A and older models (…NA, …NA2, …NHA, …NKA, and MXZ-…C multi-zone units). The 2025 chart covers R-454B equipment only, and Mitsubishi\'s 2020 guide covers the older layouts only in outline (it does not explain the K in NKA, for example), so they are not decoded here.',
    'SUZ-KA outdoor units, the 3-phase "T" voltage code on MXZ ported units (for example MXZ-5D36NLT), and PAA generation suffixes like NL4, beyond "generation".',
    'CITY MULTI® VRF and Ecodan/air-to-water (HM, WR, HX, WX hydronic) equipment.',
    'Plant or factory codes. Mitsubishi does not publish them for these products.',
  ],
  updated: '2026-11-02',
};
