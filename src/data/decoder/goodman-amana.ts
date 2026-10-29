import type { DecoderBrand } from './types';

const SEER2_BAND: Record<string, string> = {
  '3': '13.4–13.7 SEER2 (nominal band)',
  '4': '13.8–14.5 SEER2 (nominal band)',
  '5': '14.6–15.9 SEER2 (nominal band)',
  '6': '16.0–16.9 SEER2 (nominal band)',
  '7': '17.0–17.9 SEER2 (nominal band)',
  '8': '18.0–18.9 SEER2 (nominal band)',
  '9': '19.0+ SEER2 (nominal band)',
};
const R32_TONS = { '18': 1.5, '24': 2, '30': 2.5, '36': 3, '42': 3.5, '48': 4, '60': 5 };

export const goodmanAmana: DecoderBrand = {
  slug: 'goodman-amana',
  name: 'Goodman & Amana',
  brands: ['Goodman', 'Amana'],
  seedBrands: ['Goodman'],
  title: 'Goodman & Amana Model and Serial Number Decoder',
  description:
    'Decode a Goodman or Amana model number (GLZS, GLXS, GSZ, AMST) into tons, stage and SEER2, and read the YYMM serial date. Sourced from Goodman spec sheets.',
  h1: 'Goodman & Amana model and serial number decoder',
  lead:
    'Amana-brand central air is made under license by Goodman Company, L.P. of Houston, and the two brands share one naming system. The model number tells you size, refrigerant and staging; the first four digits of the serial number are the year and month it was built.',
  intro: [
    'Goodman prints two numbers on the rating plate, and both matter when you are checking a quote or a warranty. The model number is a code: every letter and digit means something specific, and the two digits after the region letter are the cooling capacity in thousands of BTU per hour. A GLZS4BA3610 is a 3-ton (36,000 BTU/h) unit. The serial number is a date: Goodman\'s own warranty certificate says the first four digits are YYMM, so a serial beginning 2610 was built in October 2026.',
    'The current Goodman line uses R-32 refrigerant, and you can see it in the second letter: L means "R-32 split system". Older R-410A Goodman condensers and heat pumps start GSX or GSZ instead and put the SEER rating in the model number itself (GSZ14 = 14 SEER). If a contractor quotes you a "new" Goodman with a GS-prefix model, ask why. It may be leftover R-410A stock.',
    'Amana-brand outdoor units (ALZS, ALXS, ALZT and so on) use the same letter logic with an A in front. Treat Amana as a separate warranty, though. It has its own certificate and its own registration site, and the terms are not always the same as Goodman\'s.',
  ],
  labelLocation: {
    text: 'The model and serial number are printed on the rating plate attached to the unit. Goodman\'s warranty certificate refers to "the serial number on the unit", and you need both numbers to register or look up coverage.',
    sourceIds: ['gdmWarrantyR32'],
  },
  families: [
    {
      id: 'goodman-r32-outdoor',
      brand: 'Goodman',
      name: 'Goodman R-32 air conditioners & heat pumps (GLXS, GLZS, GLZT)',
      kind: 'Outdoor condenser or heat pump, R-32',
      pattern: '^(G)(L)([A-Z])([A-Z])(\\d)([A-Z])([A-Z])(\\d{2})(\\d)(\\d)?([A-Z])?([A-Z])?',
      example: 'GLZS4BA3610AA',
      layout: 'G L Z S 4 B A 36 1 0 A A',
      fields: [
        { group: 1, label: 'Brand', codes: { G: 'Goodman' } },
        { group: 2, label: 'Product category', codes: { L: 'R-32 split system' } },
        { group: 3, label: 'Unit type', codes: { X: 'Air conditioner (condenser)', Z: 'Heat pump' } },
        { group: 4, label: 'Compressor', codes: { S: 'Single-stage', T: 'Two-stage' } },
        { group: 5, label: 'SEER2 class', codes: SEER2_BAND },
        { group: 6, label: 'Feature', codes: { B: 'Standard', M: 'Multi-family', C: 'Communicating (top flow)' } },
        { group: 7, label: 'Sales region', codes: { N: 'North', S: 'Southeast & North', A: 'All regions' } },
        { group: 8, label: 'Nominal capacity', tons: R32_TONS },
        { group: 9, label: 'Electrical', codes: { '1': '208/230 V, 1-phase, 60 Hz' } },
        { group: 10, label: 'Variation', describe: 'Variation digit' },
        { group: 11, label: 'Major revision', describe: 'Engineering major revision (A = initial release)' },
        { group: 12, label: 'Minor revision', describe: 'Engineering minor revision (A = initial release)' },
      ],
      sourceIds: ['gdmGlzs4b', 'gdmGlzs5b', 'gdmGlzt7c', 'gdmGlxs4b', 'gdmGlxs5b'],
      notes: [
        'The SEER2 digit is a nominal band, not the rating of your exact system. The rating depends on the indoor coil or air handler it is paired with, so check the AHRI certificate for the pairing.',
      ],
    },
    {
      id: 'amana-r32-outdoor',
      brand: 'Amana',
      name: 'Amana R-32 air conditioners & heat pumps (ALXS, ALZS)',
      kind: 'Outdoor condenser or heat pump, R-32',
      pattern: '^(A)(L)([A-Z])([A-Z])(\\d)([A-Z])A?(\\d{2})(\\d)?',
      example: 'ALZS5BA3610',
      layout: 'A L Z S 5 B (A) 36 1 0 AA',
      fields: [
        { group: 1, label: 'Brand', codes: { A: 'Amana' } },
        { group: 2, label: 'Product category', codes: { L: 'R-32 split system' } },
        { group: 3, label: 'Unit type', codes: { X: 'Air conditioner (condenser)', Z: 'Heat pump' } },
        { group: 4, label: 'Feature', codes: { S: 'Single-stage' } },
        { group: 5, label: 'SEER2 class', codes: { '3': '13.4–13.7 SEER2', '4': '13.8–14.5 SEER2', '5': '14.6–15.9 SEER2', '6': '16.0–16.9 SEER2', '7': '17.0–17.9 SEER2' } },
        { group: 6, label: 'Sales region / feature', codes: { B: 'Standard' } },
        { group: 7, label: 'Nominal capacity', tons: R32_TONS },
        { group: 8, label: 'Electrical', codes: { '1': '208/230 V, 1-phase, 60 Hz' } },
      ],
      sourceIds: ['amanaAlzs5b'],
      notes: [
        'Amana\'s ALZS5B sheet prints the diagram without the "A" that appears in its own catalog numbers (ALZS5BA3610A*). We decode only the letters the sheet defines plus the capacity digits, which the spec table confirms (ALZS5BA3610 = 36,000 BTU/h).',
      ],
    },
    {
      id: 'goodman-r410a-outdoor',
      brand: 'Goodman',
      name: 'Goodman R-410A air conditioners & heat pumps (GSX, GSZ)',
      kind: 'Outdoor condenser or heat pump, R-410A (older models)',
      pattern: '^(G)(S)([XZ])(\\d{2})(\\d{3})(\\d)([A-Z]{0,2})',
      example: 'GSZ140361AA',
      layout: 'G S Z 14 036 1 AA',
      fields: [
        { group: 1, label: 'Brand', codes: { G: 'Goodman' } },
        { group: 2, label: 'Product category', codes: { S: 'Split system' } },
        { group: 3, label: 'Unit type', codes: { X: 'Air conditioner (condenser), R-410A', Z: 'Heat pump, R-410A' } },
        { group: 4, label: 'Nominal SEER', codes: { '13': '13 SEER', '14': '14 SEER', '16': '16 SEER', '18': '18 SEER' } },
        { group: 5, label: 'Nominal capacity', tons: { '018': 1.5, '019': 1.5, '024': 2, '025': 2, '030': 2.5, '031': 2.5, '036': 3, '037': 3, '042': 3.5, '043': 3.5, '048': 4, '060': 5 } },
        { group: 6, label: 'Electrical', codes: { '1': '208/230 V, 1-phase, 60 Hz' } },
        { group: 7, label: 'Engineering revision', describe: 'Engineering revisions' },
      ],
      sourceIds: ['gdmGsz14'],
      notes: ['The SEER in these model numbers is the older SEER scale, not SEER2.'],
    },
    {
      id: 'goodman-am-airhandler',
      brand: 'Goodman / Daikin',
      name: 'Goodman R-32 air handlers (AMST, AMVT, AMVE, AMSE)',
      kind: 'Indoor air handler, R-32',
      pattern: '^([AD])([CMWH])([SV])([EFT])(\\d{2})([BCD])([NPU])(\\d)(\\d)(\\d{2})([A-Z])?([A-Z])?',
      example: 'AMST36BU1300AA',
      layout: 'A M S T 36 B U 1 3 00 A A',
      fields: [
        { group: 1, label: 'Brand', codes: { A: 'Corporate air handler', D: 'Daikin air handler' } },
        { group: 2, label: 'Configuration', codes: { C: 'Ceiling', M: 'Multi-positional', W: 'Wall', H: 'Horizontal-discharge compatible' } },
        { group: 3, label: 'Blower motor', codes: { S: 'Multi-speed ECM', V: 'Variable-speed ECM, communicating' } },
        { group: 4, label: 'Expansion device', codes: { E: 'Electronic expansion valve (EEV)', F: 'Flowrator (fixed orifice)', T: 'TXV' } },
        { group: 5, label: 'Nominal capacity', tons: { '12': 1, '18': 1.5, '24': 2, '30': 2.5, '36': 3, '42': 3.5, '48': 4, '60': 5 } },
        { group: 6, label: 'Cabinet width', codes: { B: '17.5 in', C: '21.0 in', D: '24.5 in' } },
        { group: 7, label: 'Cabinet finish', codes: { N: 'Uncased', P: 'Painted', U: 'Unpainted' } },
        { group: 8, label: 'Electrical', codes: { '1': '208/230 V, 1-phase, 60 Hz' } },
        { group: 9, label: 'Refrigerant', codes: { '3': 'R-32' } },
        { group: 10, label: 'Factory electric heat', codes: { '00': 'None installed' }, describe: 'Factory heat kit in kW' },
        { group: 11, label: 'Major revision', describe: 'Major revision' },
        { group: 12, label: 'Minor revision', describe: 'Minor revision' },
      ],
      sourceIds: ['gdmAmst'],
      notes: [
        'An air handler\'s size code is the largest system it is built for, not the system\'s size. Several matched systems in our data pair a 3-ton GLZS5BA3610 or a 2½-ton GLZS4BA3010 with an AMST42CU1300 (3½-ton). Size the system from the outdoor unit.',
      ],
    },
  ],
  serials: [
    {
      id: 'goodman-yymm',
      appliesTo: ['Goodman', 'Amana'],
      kind: 'goodman-yymm',
      title: 'Goodman & Amana serial numbers: YYMM',
      rule: 'The first four digits are the year and month of manufacture (YYMM). The rest is a production sequence.',
      example: { serial: '2610123456', reads: 'Built October 2026' },
      sourceIds: ['gdmWarrantyR32', 'amanaWarrantyLzA', 'gdmQrp08'],
      caveats: [
        'If you cannot prove the install date, the Goodman and Amana certificates use three months after this manufacture date as the install date (California residents excepted), so the serial date can move your warranty start.',
      ],
    },
  ],
  warranty: [
    {
      label: 'Goodman R-32 AC & heat pumps, unregistered',
      detail: '5 years on all parts (GLZS4B, GLZS5B, GLZS4M, GLXS3B, GLXS4B, GLXS5B, GLXS4M certificate).',
      sourceIds: ['gdmWarrantyR32'],
    },
    {
      label: 'Goodman R-32 AC & heat pumps, registered online within 60 days',
      detail: 'Up to 10 years on parts (the "Registered Additional Term Warranty"). Register at goodmanmfg.com/product-registration.',
      sourceIds: ['gdmWarrantyR32', 'gdmRegistration'],
    },
    {
      label: 'Goodman GLZT7C two-stage heat pump',
      detail: 'The spec sheet lists a 10-year unit replacement limited warranty plus 10-year parts with registration within 60 days. Compressor coverage for years 11–99 is a paid ASURE Extend service plan, not part of the warranty.',
      sourceIds: ['gdmGlzt7c'],
    },
    {
      label: 'States where registration cannot be required',
      detail: 'Goodman lists California (installs on/after Jan 1, 2004), Florida (Jul 1, 2024), Georgia (Jan 1, 2026) and Québec (Apr 30, 1980). Florida, Georgia and Texas also require the warranty to transfer to a new owner, effective on dates Goodman lists.',
      sourceIds: ['gdmWarrantyInfo'],
    },
    {
      label: 'Amana R-32 AC & heat pumps (certificate dated 10/2026)',
      detail: '5 years unregistered, 10 years on parts if registered online within 60 days. If the compressor fails in a registered unit during the first 10 years, Amana replaces the whole unit once, provided it was installed with a new matching coil or air handler.',
      sourceIds: ['amanaWarrantyLzA', 'amanaRegistration'],
    },
    {
      label: 'Amana ALZS5B spec sheet (dated 11/2024)',
      detail: 'This older sheet advertises a "Lifetime Unit Replacement Limited Warranty". The newer 10/2026 certificate above says 10 years. The certificate for your install date is the one that applies, so check your coverage with Goodman\'s warranty lookup.',
      sourceIds: ['amanaAlzs5b', 'gdmWarrantyLookup'],
    },
  ],
  gotchas: [
    {
      title: 'Capacity is the two digits after the region letter, not the SEER digit',
      text: 'In GLZS4BA3610 the "4" is the efficiency band and "36" is the size. Reading "4" as 4 tons is the most common mistake people make with these models.',
      sourceIds: ['gdmGlzs4b'],
    },
    {
      title: 'GS-prefix models are R-410A',
      text: 'GSX and GSZ units use R-410A and the old SEER scale. The current R-32 line starts GL. Make sure the refrigerant on the quote matches the model.',
      sourceIds: ['gdmGsz14', 'gdmGlzs4b'],
    },
    {
      title: 'Register within 60 days, or you keep half the warranty',
      text: 'Goodman\'s R-32 certificate is 5 years on parts unregistered and up to 10 years registered. Ask the installer to register the unit, or do it yourself with the model and serial number.',
      sourceIds: ['gdmWarrantyR32', 'gdmRegistration'],
    },
  ],
  faqs: [
    {
      q: 'How do I tell how old my Goodman AC or heat pump is?',
      a: 'Read the first four digits of the serial number as YYMM. Goodman\'s warranty certificate gives "2610" as October 2026. A serial starting 1905 was built in May 2019.',
    },
    {
      q: 'What size is my Goodman unit?',
      a: 'On current R-32 models (GLXS, GLZS, GLZT) the two digits after the region letter are the capacity in thousands of BTU/h. 24 is 2 tons, 36 is 3 tons, 48 is 4 tons, 60 is 5 tons. On older GSX/GSZ models it is the three digits after the SEER, e.g. GSZ140361 is 3 tons.',
    },
    {
      q: 'Is my Goodman R-32 or R-410A?',
      a: 'An L in the second position (GLXS, GLZS, GLZT, ALZS) means an R-32 split system per Goodman\'s and Amana\'s spec sheets. GSX and GSZ models are R-410A.',
    },
    {
      q: 'What does the 4 in GLZS4B mean?',
      a: 'It is the SEER2 class. On Goodman\'s R-32 spec sheets, 4 means a nominal 13.8–14.5 SEER2, 5 means 14.6–15.9, and 7 means 17.0–17.9. The exact rating depends on the indoor unit it is paired with.',
    },
    {
      q: 'Does Goodman\'s 10-year warranty need registration?',
      a: 'Yes, in most states. You must register online within 60 days of installation to get up to 10 years on parts. Otherwise it is 5 years. Goodman lists California, Florida, Georgia and Québec as places where registration cannot be required.',
    },
    {
      q: 'Can an air handler be bigger than the system?',
      a: 'Yes. Goodman\'s air handler size code is a nominal capacity, and matched systems often pair a smaller outdoor unit with a larger air handler (for example a 3-ton GLZS5BA3610 with a 3½-ton AMST42CU1300). The outdoor unit sets the system size.',
    },
  ],
  serialOptions: [
    { label: 'Goodman', rule: 'goodman-yymm' },
    { label: 'Amana', rule: 'goodman-yymm' },
  ],
  notCovered: [
    'Goodman furnace (GR9, GM9, GD9) and coil (CAPTA, CHPTA) model positions. Their nomenclature charts are not part of the documents above, so they are not decoded here.',
    'Amana two-stage and variable-speed (ALZT, AVZC, ASZV) position tables, and Amana air handlers.',
    'Pre-2000 Goodman/Janitrol serial formats.',
  ],
  updated: '2026-10-29',
};
