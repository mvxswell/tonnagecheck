import type { DecoderBrand, ModelField } from './types';

// SEER2 class digit. Full table from the DC3SE sheet; the DH4SE/DH6VS/DH7TC/DH9VS sheets print the same
// digit-to-band pairs for their own class.
const SEER2_BAND: Record<string, string> = {
  '3': '13.4–13.7 SEER2 (nominal band)',
  '4': '13.8–14.5 SEER2 (nominal band)',
  '5': '14.6–15.9 SEER2 (nominal band)',
  '6': '16.0–16.9 SEER2 (nominal band)',
  '7': '17.0–17.9 SEER2 (nominal band)',
  '8': '18.0–18.9 SEER2 (nominal band)',
  '9': '19.0+ SEER2 (nominal band)',
};
const DUCTED_TONS = { '18': 1.5, '24': 2, '30': 2.5, '36': 3, '42': 3.5, '48': 4, '60': 5 };
const OTERRA_TONS = { '09': 0.75, '12': 1, '18': 1.5, '24': 2 };
const OTERRA_CAPACITY: Record<string, string> = {
  '09': '9,000 Btu/h class (¾ ton). Rated 9,000 Btu/h cooling in the spec table',
  '12': '12,000 Btu/h class (1 ton). Rated 12,000 Btu/h cooling in the spec table',
  '18': '18,000 Btu/h class (1½ tons). Rated 18,100 Btu/h cooling in the spec table',
  '24': '24,000 Btu/h class (2 tons). Rated 22,400 Btu/h cooling in the spec table',
};
const OTERRA_FIELDS_TAIL = (start: number): ModelField[] => [
  { group: start, label: 'Major design category', codes: { A: 'A series' } },
  { group: start + 1, label: 'Factory origin', codes: { X: 'Malaysia' } },
  { group: start + 2, label: 'Power supply', codes: { VJ: '208/230 V, 1-phase, 60 Hz' } },
  { group: start + 3, label: 'Country', codes: { U: 'United States' } },
];

export const daikin: DecoderBrand = {
  slug: 'daikin',
  name: 'Daikin',
  brands: ['Daikin'],
  seedBrands: ['Daikin'],
  title: 'Daikin Model and Serial Number Decoder (R-32)',
  description:
    'Decode a Daikin model number (DH, DC, DMVT, DFVE, OTERRA RXF/FTXF) into tons, staging and SEER2 class, and read the YYMM serial date. Sourced from Daikin.',
  h1: 'Daikin model and serial number decoder',
  lead:
    'Daikin sells two very different kinds of equipment in the US: ducted central systems warranted by Daikin Comfort Technologies Manufacturing of Waller, Texas, and ductless mini-splits. They use different naming systems, and only the ducted units carry a serial number Daikin tells you how to read.',
  intro: [
    'Daikin\'s ducted R-32 condensers and heat pumps use a 12-position model number. The second letter tells you what it is (C is an air conditioner, H is a heat pump), the digit after it is the SEER2 class, and the next letter is the compressor: S single-stage, T two-stage, V variable-speed. The two digits after the sales-region letter are the size in thousands of BTU per hour, so a DH7TCA3610 is a 3-ton two-stage heat pump. Do not read the SEER2 digit as the size. The "4" in DH4SE is the efficiency class, not 4 tons.',
    'For the date, Daikin\'s own warranty certificates say the first four digits of the serial number on a ducted unit are the year and month of manufacture (YYMM). A serial beginning 2610 was built in October 2026. That date matters: if you cannot prove when the unit was installed, Daikin treats the install date as three months after it (California residents excepted).',
    'Daikin mini-splits use a separate naming system. On the OTERRA line, the first letter is F for the indoor unit and R for the outdoor unit, X means a heat pump and K means cooling only, and the two digits are the capacity class: RXF18AXVJU is the 18,000 Btu/h (1½-ton) heat pump outdoor unit. Daikin\'s ductless warranty does not explain the serial number. It refers to "the manufacture date noted on the unit", so read the date printed on the label rather than guessing from the serial.',
  ],
  labelLocation: {
    text: 'Both numbers are on the unit\'s label. Daikin\'s ducted warranty certificates refer to "the serial number (YYMM) on the unit", and its ductless certificate to "the manufacture date noted on the unit". You need the model and serial number to register the unit or look up coverage.',
    sourceIds: ['daikinWarrantyBeob', 'daikinWarrantyDms', 'daikinRegistration'],
  },
  families: [
    {
      id: 'daikin-r32-outdoor',
      brand: 'Daikin',
      name: 'Daikin R-32 air conditioners & heat pumps (DC…, DH…)',
      kind: 'Ducted outdoor condenser or heat pump, R-32',
      pattern: '^(D)([CH])(\\d)([STV])([A-Z])([A-Z])(\\d{2})(\\d)([0-9A-Z])([A-Z])?([A-Z])?',
      example: 'DH7TCA3610AA',
      layout: 'D H 7 T C A 36 1 0 A A',
      fields: [
        { group: 1, label: 'Brand', codes: { D: 'Daikin' } },
        { group: 2, label: 'Type', codes: { C: 'Condenser (air conditioner), R-32', H: 'Heat pump, R-32' } },
        { group: 3, label: 'SEER2 class', codes: SEER2_BAND },
        { group: 4, label: 'Compressor', codes: { S: 'Single-stage', T: 'Two-stage', V: 'Variable-speed' } },
        { group: 5, label: 'Feature', codes: { Q: 'Introductory', E: 'Enhanced', C: 'Communicating (top flow)', S: 'Side-discharge communicating' } },
        { group: 6, label: 'Sales region', codes: { N: 'North', S: 'Southeast & North', A: 'All regions' } },
        { group: 7, label: 'Nominal capacity', tons: DUCTED_TONS },
        { group: 8, label: 'Electrical', codes: { '1': '208/230 V, 1-phase, 60 Hz' } },
        { group: 9, label: 'Variation', describe: 'Variation character (the DH9VS sheet defines C = capacity-extended)' },
        { group: 10, label: 'Major revision', describe: 'Engineering major revision (A = initial release, B = 1st revision)' },
        { group: 11, label: 'Minor revision', describe: 'Engineering minor revision (A = initial release, B = 1st revision)' },
      ],
      sourceIds: ['daikinDc3se', 'daikinDh4se', 'daikinDh4sq', 'daikinDh6vs', 'daikinDh7tc', 'daikinDh9vs', 'daikinDc6vs'],
      notes: [
        'The SEER2 digit is a nominal band. The rating of your system depends on the indoor coil or air handler it is matched with, so check the AHRI certificate for the exact pairing.',
        'Daikin\'s DC6VS sheet (07/25) prints a different band table from the other sheets (for example 5 = 14.6–15.5 and 0 = 19.0+). We use the table the DC3SE, DH4SE, DH6VS, DH7TC and DH9VS sheets agree on.',
        'Some variable-speed sizes carry a letter in the variation position. DH9VSA241CA and DH9VSA361CA are the capacity-extended 2- and 3-ton DH9VS models.',
      ],
    },
    {
      id: 'daikin-r32-airhandler',
      brand: 'Daikin',
      name: 'Daikin R-32 air handlers (DMVT, DFVE)',
      kind: 'Indoor air handler, R-32',
      pattern: '^(D)([CMWFH])([SV])([EFT])(\\d{2})([BCD])([NPU])(\\d)(\\d)(\\d{2})([A-Z])?([A-Z])?',
      example: 'DFVE36CP1300AA',
      layout: 'D F V E 36 C P 1 3 00 A A',
      fields: [
        { group: 1, label: 'Brand', codes: { D: 'Daikin air handler' } },
        { group: 2, label: 'Application', codes: { C: 'Ceiling-mounted', M: 'Multi-positional', W: 'Wall-mounted', F: 'FIT-compatible multi-positional', H: 'Horizontal-discharge compatible multi-positional' } },
        { group: 3, label: 'Blower motor', codes: { S: 'Multi-speed ECM', V: 'Variable-speed ECM, communicating' } },
        { group: 4, label: 'Expansion device', codes: { E: 'Electronic expansion valve (EEV)', F: 'Flowrator (fixed orifice)', T: 'Thermal expansion valve (TXV)' } },
        { group: 5, label: 'Nominal capacity', tons: { '12': 1, '18': 1.5, '24': 2, '30': 2.5, '36': 3, '42': 3.5, '48': 4, '60': 5 } },
        { group: 6, label: 'Cabinet width', codes: { B: '17.5 in', C: '21.0 in', D: '24.5 in' } },
        { group: 7, label: 'Cabinet', codes: { N: 'Uncased', P: 'Painted', U: 'Unpainted' } },
        { group: 8, label: 'Electrical', codes: { '1': '208/230 V, 1-phase, 60 Hz' } },
        { group: 9, label: 'Refrigerant', codes: { '3': 'R-32' } },
        { group: 10, label: 'Factory-installed electric heat', codes: { '00': 'No electric heat' } },
        { group: 11, label: 'Major revision', describe: 'Major revision' },
        { group: 12, label: 'Minor revision', describe: 'Minor revision' },
      ],
      sourceIds: ['daikinDmvt', 'daikinDfve'],
      notes: [
        'The cabinet widths are the ones the sheets list for multi-position cabinets (B, C, D). Every DMVT and DFVE model in the sheets ends 1300 (no factory heat). Electric heat is a field-installed 3–25 kW HKTS kit.',
      ],
    },
    {
      id: 'daikin-oterra-outdoor',
      brand: 'Daikin',
      name: 'Daikin OTERRA R-32 mini-split outdoor units (RXF, RKF)',
      kind: 'Ductless outdoor unit, R-32',
      pattern: '^(R)([KX])(F)(\\d{2})([A-Z])([A-Z])(VJ)(U)',
      example: 'RXF18AXVJU',
      layout: 'R X F 18 A X VJ U',
      fields: [
        { group: 1, label: 'Unit category', codes: { R: 'Air-cooled split outdoor unit' } },
        { group: 2, label: 'System', codes: { K: 'Inverter, cooling only', X: 'Inverter, heat pump' } },
        { group: 3, label: 'Classification', codes: { F: 'R-32, standard' } },
        { group: 4, label: 'Capacity class', tons: OTERRA_TONS, codes: OTERRA_CAPACITY },
        ...OTERRA_FIELDS_TAIL(5),
      ],
      sourceIds: ['daikinOterraSm'],
      notes: ['Daikin calls the two digits a "capacity indication" and points to the spec table for the exact figure. The 24 size is rated at 22,400 Btu/h cooling.'],
    },
    {
      id: 'daikin-oterra-indoor',
      brand: 'Daikin',
      name: 'Daikin OTERRA R-32 wall-mounted indoor units (FTXF, FTKF)',
      kind: 'Ductless wall-mounted indoor unit, R-32',
      pattern: '^(F)(T)([KX])(F)(\\d{2})([A-Z])([A-Z])(VJ)(U)',
      example: 'FTXF24AXVJU',
      layout: 'F T X F 24 A X VJ U',
      fields: [
        { group: 1, label: 'Unit category', codes: { F: 'Air-cooled split indoor unit' } },
        { group: 2, label: 'Product type', codes: { T: 'Wall-mounted' } },
        { group: 3, label: 'System', codes: { K: 'Inverter, cooling only', X: 'Inverter, heat pump' } },
        { group: 4, label: 'Classification', codes: { F: 'R-32, standard' } },
        { group: 5, label: 'Capacity class', tons: OTERRA_TONS, codes: OTERRA_CAPACITY },
        ...OTERRA_FIELDS_TAIL(6),
      ],
      sourceIds: ['daikinOterraSm'],
    },
  ],
  serials: [
    {
      id: 'daikin-yymm',
      appliesTo: ['Daikin'],
      kind: 'goodman-yymm',
      title: 'Daikin ducted serial numbers: YYMM',
      rule: 'On Daikin ducted air conditioners and heat pumps, the first four digits of the serial number are the year and month of manufacture (YYMM).',
      example: { serial: '2610123456', reads: 'Built October 2026' },
      sourceIds: ['daikinWarrantyBeob', 'daikinWarrantyBeo'],
      caveats: [
        'This rule is stated on Daikin\'s ducted AC and heat pump certificates. Daikin\'s ductless (mini-split) certificate does not define the serial, so do not use YYMM on a mini-split. Use the manufacture date printed on its label.',
        'If you cannot prove the install date, Daikin uses three months after this manufacture date as the install date (California residents excepted).',
      ],
    },
  ],
  warranty: [
    {
      label: 'Daikin ducted R-32 AC & heat pumps, unregistered',
      detail: 'Up to 5 years on all parts (the "Initial Term Warranty").',
      sourceIds: ['daikinWarrantyBeo', 'daikinWarrantyBeob'],
    },
    {
      label: 'Daikin ducted R-32 AC & heat pumps, registered online within 60 days',
      detail: 'Up to 12 years on all parts for the original registered owner (or spouse) while they live in the home, plus a once-only unit replacement if the compressor fails in the first 6 years. Unit replacement also requires naming a licensed contractor for annual maintenance at registration, a properly matched new indoor coil or air handler, and written maintenance records.',
      sourceIds: ['daikinWarrantyBeo', 'daikinWarrantyBeob', 'daikinRegistration'],
    },
    {
      label: 'DH7TC and DH9VS spec sheets vs. the 10/2026 certificate',
      detail: 'The DH7TC and DH9VS spec sheets advertise a "12-Year Unit Replacement Limited Warranty". The 10/2026 certificate that lists those models (PWDACHPR3BEOB) says unit replacement covers the first 6 years. The certificate in force for your install date is what applies, so check your unit with Daikin\'s warranty lookup.',
      sourceIds: ['daikinDh7tc', 'daikinDh9vs', 'daikinWarrantyBeob', 'daikinWarrantyLookup'],
    },
    {
      label: 'Daikin ductless mini-splits (OTERRA, AURORA, ATMOSPHERA, MXM and more)',
      detail: 'Up to 5 years on all parts unregistered, up to 12 years on parts if registered online within 60 days. The certificate (07/2026) covers parts only and has no unit-replacement remedy.',
      sourceIds: ['daikinWarrantyDms', 'daikinRegistration'],
    },
    {
      label: 'States where registration cannot be required',
      detail: 'Daikin lists California (installs on/after Jan 1, 2004), Florida (Jul 1, 2024), Georgia (Jan 1, 2026) and Québec (Apr 30, 1980). Florida, Georgia and Texas also require the warranty to transfer to a new owner, from dates Daikin lists.',
      sourceIds: ['daikinWarrantyInfo'],
    },
  ],
  gotchas: [
    {
      title: 'The digit after DC or DH is efficiency, not size',
      text: 'In DH4SEA3610 the "4" is the SEER2 class (13.8–14.5) and "36" is the size (3 tons). On mini-splits the size is the two digits after the letters: RXF18 is 18,000 Btu/h.',
      sourceIds: ['daikinDh4se', 'daikinOterraSm'],
    },
    {
      title: 'Unit replacement needs annual maintenance records',
      text: 'Registering gets you 12 years on parts, but the once-only unit replacement also requires that you named a licensed contractor for annual maintenance at registration, had the unit serviced every year, and kept written records. Daikin may ask you to certify both.',
      sourceIds: ['daikinWarrantyBeob'],
    },
    {
      title: 'Mini-splits are parts-only and their serial is not a date code',
      text: 'Daikin\'s ductless certificate covers replacement parts only and dates the unit by "the manufacture date noted on the unit". Read the label date rather than decoding the serial.',
      sourceIds: ['daikinWarrantyDms'],
    },
  ],
  faqs: [
    {
      q: 'How do I tell how old my Daikin AC or heat pump is?',
      a: 'On a ducted Daikin condenser or heat pump, read the first four digits of the serial number as YYMM. Daikin\'s warranty certificate gives "2610" as October 2026. On a Daikin mini-split, use the manufacture date printed on the label. Daikin\'s ductless warranty does not define the serial number.',
    },
    {
      q: 'What size is my Daikin unit?',
      a: 'On ducted DC and DH models, the two digits after the sales-region letter are the capacity in thousands of BTU/h: 24 is 2 tons, 36 is 3 tons, 60 is 5 tons (DH7TCA3610 is 3 tons). On OTERRA mini-splits the two digits after RXF or FTXF are the capacity class: 09, 12, 18 or 24 thousand Btu/h.',
    },
    {
      q: 'What do the letters in DH7TC or DC6VS mean?',
      a: 'D is Daikin, C is an R-32 air conditioner and H an R-32 heat pump, the digit is the SEER2 class, then the compressor (S single-stage, T two-stage, V variable-speed) and the feature set (Q introductory, E enhanced, C communicating top flow, S side-discharge communicating).',
    },
    {
      q: 'Does the Daikin 12-year warranty need registration?',
      a: 'Yes, in most states. Register online within 60 days of installation to get up to 12 years on parts. Otherwise it is 5 years. Daikin lists California, Florida, Georgia and Québec as places where registration cannot be required.',
    },
    {
      q: 'Is Daikin\'s compressor unit-replacement warranty 6 or 12 years?',
      a: 'The 10/2026 certificates say 6 years for registered units that meet the annual-maintenance conditions. Some spec sheets (DH7TC, DH9VS) advertise 12 years. Go by the certificate for your install date and confirm with Daikin\'s warranty lookup.',
    },
  ],
  serialOptions: [{ label: 'Daikin (ducted AC / heat pump)', rule: 'daikin-yymm' }],
  notCovered: [
    'Daikin mini-split serial numbers. The ductless warranty refers to the manufacture date on the label and no Daikin document we found defines the serial layout.',
    'AURORA (RXT/FTXV), ATMOSPHERA (RXM/FTXM), ENTRA, MXM and other multi-zone model positions. The Daikin service and engineering manuals we checked list these models but print no nomenclature chart, so they are not decoded here.',
    'Daikin furnaces (DR/DD), coils (CAPEA, CHPEA, CAHEA), packaged units (DP…) and R-410A models (DX, DZ).',
    'Daikin plant codes. The certificates define only the YYMM date, not a factory position.',
  ],
  updated: '2026-10-30',
};
