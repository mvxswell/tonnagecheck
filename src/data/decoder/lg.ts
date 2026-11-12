import type { DecoderBrand, ModelField } from './types';

// Every position below is transcribed from the "Unit nomenclature" pages of LG Electronics U.S.A.'s current R32
// engineering manuals (single-zone wall-mounted, multi-position air handler, LGRED°, CV, mid-static duct, A-coil,
// Multi F outdoor and indoor units) and, for older R-410A equipment, the Art Cool™ Mirror and Multi F manuals.
// The serial rule is LG's own note on the PQSH1200 drain pan heater sheet. Codes a chart does not print are left out.
const CAP: Record<string, [number, string]> = {
  '07': [0.58, '7,000 Btu/h nominal (about ½ ton)'],
  '09': [0.75, '9,000 Btu/h nominal (¾ ton)'],
  '12': [1, '12,000 Btu/h nominal (1 ton)'],
  '15': [1.25, '15,000 Btu/h nominal (1¼ tons)'],
  '18': [1.5, '18,000 Btu/h nominal (1½ tons)'],
  '24': [2, '24,000 Btu/h nominal (2 tons)'],
  '30': [2.5, '30,000 Btu/h nominal (2½ tons)'],
  '36': [3, '36,000 Btu/h nominal (3 tons)'],
  '42': [3.5, '42,000 Btu/h nominal (3½ tons)'],
  '48': [4, '48,000 Btu/h nominal (4 tons)'],
  '54': [4.5, '54,000 Btu/h nominal (4½ tons)'],
  '60': [5, '60,000 Btu/h nominal (5 tons)'],
};
const capacity = (group: number, keys: string[], label = 'Nominal capacity (Btu/h)'): ModelField => ({
  group,
  label,
  tons: Object.fromEntries(keys.map((k) => [k, CAP[k][0]])),
  codes: Object.fromEntries(keys.map((k) => [k, CAP[k][1]])),
});
const R32 = { K: 'R32 refrigerant' };
const COMPONENT = { N: 'Indoor unit', S: 'System (indoor + outdoor sold as a set)', U: 'Outdoor unit' };
const CATEGORY = { S: 'Single (single-zone)', U: 'Universal' };
const GENERATION = (group: number): ModelField => ({ group, label: 'Generation', describe: 'Generation number (LG prints 1 to 9)' });

export const lg: DecoderBrand = {
  slug: 'lg',
  name: 'LG',
  brands: ['LG'],
  // Empty on purpose. The KUSXA422A/KUSXA361A size swap on the retailer listings is now corrected in the seed
  // (sizeCorrection), but the seed table's "Listed as" column describes the retailer listing, and two LG Multi F
  // SEER2 values (KUMXB481A, KUMXB241A) are still awaiting AHRI verification, so this page still does not repeat
  // LG sizes or prices.
  seedBrands: [],
  title: 'LG Heat Pump & Mini-Split Model and Serial Decoder',
  description:
    'Decode an LG heat pump or mini-split model number (KUSX, KNSL, KUSA, KUMX, LSU, LMU) into size and grade, plus LG\'s serial date rule and 10-year warranty.',
  h1: 'LG heat pump and mini-split model number decoder',
  lead:
    'Current LG model numbers are nine characters and read left to right: refrigerant, indoor or outdoor, single-zone or multi, unit type, grade, size, generation and voltage. So a KUSXA361A is an R32 single-zone outdoor unit, LGRED° grade, 36,000 Btu/h nominal. Older R-410A units start with L instead, like LSU090HSV5.',
  intro: [
    'Start with the first letter. K means R32, the refrigerant LG says its split systems now use. Units that start with L are the older R-410A models. On a K model the second letter is the component: U for the outdoor unit, N for an indoor unit, and S for a system model number that names both halves. The third letter is the category: S for single-zone, U for universal, and M for multi-zone (Multi F). The fourth is the unit type, for example A for wall-mounted, L for a multi-position air handler and J for a mid-static duct. LG prints X on the single-zone outdoor units (KUSX) and the Multi F outdoor units (KUMX) and calls it "Null".',
    'The fifth letter is the grade. On ducted systems A is LGRED°, LG\'s cold-climate line, B is High Efficiency (Deluxe) and E is CV. On single-zone wall units C is Mega and E is the Contractor Inverter. Next come two digits for the size in thousands of Btu/h, then the generation and the power supply (A for 208–230 V, B for 115–120 V). A KNSLE362A is a CV air handler, 36,000 Btu/h nominal, second generation, 208–230 V.',
    'Two things are worth checking on an LG quote. First, the size code is a nominal class, not the rating. LG rates the KSSLA361A LGRED° air-handler system at 33,000 Btu/h of cooling, and the KUMXB361A Multi F outdoor unit at 32,800. Second, the date is in the serial: LG says the first digit is the year and the next two are the month, so 503… is March. Only the last digit of the year is printed, so that could be 2015 or 2025. LG\'s warranty counts from the install date, and from the manufacture date if you cannot prove when it was installed.',
  ],
  labelLocation: {
    text: 'LG\'s support page says to check the right side of both the indoor unit and the outdoor unit for the model and serial number label. Write down the outdoor unit\'s serial: LG\'s date rule is published for outdoor units. Keep the label intact, too. LG\'s residential warranty is void if "any serial number of any System or any Part(s) thereof is altered, defaced or removed".',
    sourceIds: ['lgSupportLabel', 'lgPqsh1200', 'lgWarrantyR32'],
  },
  families: [
    {
      id: 'lg-r32-single-zone-ducted',
      brand: 'LG',
      name: 'R32 single-zone ducted systems: outdoor units (KUSX), air handlers (KNSL) and ducted units (KNUJ, KNSJ)',
      kind: 'Ducted heat pump outdoor unit, air handler, duct unit or system, R32',
      pattern: '^(K)([NSU])([SU])([LJHKX])([ABE])(\\d{2})([1-9])(A)',
      example: 'KUSXA361A',
      layout: 'K U S X A 36 1 A',
      fields: [
        { group: 1, label: 'Refrigerant', codes: R32 },
        { group: 2, label: 'Component', codes: COMPONENT },
        { group: 3, label: 'Product category', codes: CATEGORY },
        {
          group: 4, label: 'Product type', codes: {
            L: 'Multi-position air handling unit', J: 'Mid-static duct', H: 'High-static duct', K: 'Low-static duct', X: 'Null (printed on outdoor units such as KUSXB)',
          },
        },
        { group: 5, label: 'Product grade', codes: { A: 'LGRED°', B: 'High Efficiency (Deluxe)', E: 'CV' } },
        capacity(6, ['09', '12', '18', '24', '30', '36', '42', '48', '60']),
        GENERATION(7),
        { group: 8, label: 'Function (power supply)', codes: { A: '208–230 V' } },
      ],
      sourceIds: ['lgEmAhuRed', 'lgEmAhu', 'lgEmAhuCv', 'lgEmMidStatic', 'lgEmACoil'],
      notes: [
        'The grade letter on the indoor unit does not always match the system. In LG\'s LGRED° air-handler table the KSSLA421A system pairs a KUSXA422A outdoor unit with a KNSLB421A air handler (B grade), and KSSLA121A uses a KNSLB121A. Check the pairing table, not just the letters.',
        'The trailing 2 on KUSXA422A, KUSXA482A and the CV air handlers (KNSLE362A) is the generation, not part of the size.',
      ],
    },
    {
      id: 'lg-r32-single-zone-wall',
      brand: 'LG',
      name: 'R32 single-zone wall-mounted systems (KUSA, KNSA, KNUA, KSSA, KSUA)',
      kind: 'Ductless wall-mounted mini-split outdoor unit, indoor unit or system, R32',
      pattern: '^(K)([NSU])([SU])(A)([A-Z])(\\d{2})([1-9])([AB])',
      example: 'KSSAC241A',
      layout: 'K S S A C 24 1 A',
      fields: [
        { group: 1, label: 'Refrigerant', codes: R32 },
        { group: 2, label: 'Component', codes: COMPONENT },
        { group: 3, label: 'Product category', codes: CATEGORY },
        { group: 4, label: 'Product type', codes: { A: 'Wall-mounted' } },
        { group: 5, label: 'Product grade', codes: { B: 'High Efficiency (Deluxe)', C: 'Standard Efficiency (Mega 19)', E: 'Contractor Inverter (Mega 17)' } },
        capacity(6, ['09', '12', '18', '24']),
        GENERATION(7),
        { group: 8, label: 'Function (power supply)', codes: { A: '208–230 V', B: '115–120 V' } },
      ],
      sourceIds: ['lgEmSzMega', 'lgEmSzHighEff'],
      notes: [
        'LG\'s current charts do not print the L grade (Art Cool™ Deluxe/Premier, KUSAL) or the P grade (Extended Piping, KUSAP), so the decoder shows those letters as not in the source table.',
      ],
    },
    {
      id: 'lg-r32-multi-f-outdoor',
      brand: 'LG',
      name: 'R32 Multi F and Multi F MAX outdoor units (KUMXB, KUMXA)',
      kind: 'Multi-zone heat pump outdoor unit, R32',
      pattern: '^(K)(U)(M)(X)([AB])(\\d{2})([1-9])(A)',
      example: 'KUMXB301A',
      layout: 'K U M X B 30 1 A',
      fields: [
        { group: 1, label: 'Refrigerant', codes: R32 },
        { group: 2, label: 'Component', codes: { U: 'Outdoor unit' } },
        { group: 3, label: 'Product category', codes: { M: 'Multi (multi-zone)' } },
        { group: 4, label: 'Product type', codes: { X: 'Null' } },
        { group: 5, label: 'Product grade', codes: { B: 'High Efficiency (Deluxe)', A: 'LGRED° (LG\'s R-32 model list files KUMXA units under "Multi F with LGRED°"; the Multi F chart itself prints only B)' } },
        capacity(6, ['18', '24', '30', '36', '48', '54', '60']),
        GENERATION(7),
        { group: 8, label: 'Function (power supply)', codes: { A: '208–230 V' } },
      ],
      sourceIds: ['lgEmMultiFOdu', 'lgR32ModelMap'],
      notes: [
        'The size code is the outdoor unit\'s class. LG rates the KUMXB361A at 32,800 Btu/h and the KUMXB601A at 56,000 Btu/h of cooling, and what a multi-zone system delivers also depends on the indoor units connected to it.',
        'The 42 size (KUMXA421A, Multi F MAX with LGRED°) is in LG\'s model list but not in the Multi F nomenclature chart, so the decoder leaves it as not in the source table.',
      ],
    },
    {
      id: 'lg-r32-multi-f-indoor',
      brand: 'LG',
      name: 'R32 Multi F indoor units (KNMA, KNUA, KNMQ, KNMK, KNUJ, KNUD, KNUF, KNML…)',
      kind: 'Multi-zone indoor unit (wall, console, duct, cassette or air handler), R32',
      pattern: '^(K)(N)([UM])([AQKJDFL])([BK])(\\d{2})([1-9])(A)',
      example: 'KNMAB151A',
      layout: 'K N M A B 15 1 A',
      fields: [
        { group: 1, label: 'Refrigerant', codes: R32 },
        { group: 2, label: 'Component', codes: { N: 'Indoor unit' } },
        { group: 3, label: 'Product category', codes: { U: 'Multi compatible', M: 'Multi F indoor unit' } },
        {
          group: 4, label: 'Product type', codes: {
            A: 'Wall-mounted', Q: 'Console', K: 'Low-static ducted', J: 'Mid-static ducted', D: '4-way cassette', F: '1-way cassette', L: 'Multi-position air handling unit',
          },
        },
        { group: 5, label: 'Product grade', codes: { B: 'High Efficiency', K: 'ART COOL™ Mirror' } },
        capacity(6, ['07', '09', '12', '15', '18', '24', '30', '36']),
        GENERATION(7),
        { group: 8, label: 'Function (power supply)', codes: { A: '208–230 V' } },
      ],
      sourceIds: ['lgEmMultiFIdu'],
      notes: [
        'U units ("multi compatible", such as KNUAB) also appear in LG\'s single-zone tables, paired with a KUSAB or KUSXB outdoor unit, so the same indoor model can be part of either kind of system.',
      ],
    },
    {
      id: 'lg-r410a-single-zone',
      brand: 'LG',
      name: 'Older R-410A single-zone units (LSU, LSN, LAN, LCN, LHN, LV…)',
      kind: 'Single-zone mini-split or ducted unit, R-410A',
      pattern: '^(L)([ASCDHV])([NU])?(\\d{2})(\\d)(H)(SV|VP|YV|EV|LV|[A-Z]V|V|T)([1-9])?',
      example: 'LSU090HSV5',
      layout: 'L S U 09 0 H SV 5',
      fields: [
        { group: 1, label: 'Brand', codes: { L: 'LG' } },
        {
          group: 2, label: 'Frame type', codes: {
            A: 'Art Cool™', S: 'Standard', C: 'Four-way ceiling cassette', D: 'Ceiling-concealed duct (low static)', H: 'Ceiling-concealed duct (high static)', V: 'Vertical-horizontal air handling',
          },
        },
        { group: 3, label: 'Component', codes: { N: 'Indoor unit', U: 'Outdoor unit' } },
        capacity(4, ['09', '12', '18', '24', '36', '42', '48'], 'Cooling capacity (first two digits, Btu/h)'),
        { group: 5, label: 'Third capacity digit', describe: 'Last digit of LG\'s three-digit capacity field (for example the 0 in 090). The chart gives it no separate meaning.' },
        { group: 6, label: 'System type', codes: { H: 'Heat pump' } },
        {
          group: 7, label: 'Style', codes: {
            SV: 'High Efficiency Inverter', VP: 'Gallery', YV: 'Premier', EV: 'Mega', V: 'Standard Inverter', T: 'Thermostat compatible', LV: 'Extended Piping',
          },
        },
        { group: 8, label: 'Generation or revision', codes: { '1': 'First', '2': 'Second', '3': 'Third', '4': 'Fourth', '5': 'Fifth' } },
      ],
      sourceIds: ['lgEmArtCoolMirror410', 'lgR32ModelMap'],
      notes: [
        'No N or U after the frame letter means a system model number (indoor and outdoor together), for example LS090HSV5.',
        'Styles the chart does not list, such as HXV (Mega 115V), HFV (Standard Efficiency) and the LGRED° HHV units, show as not in the source table. LG\'s universal outdoor units (LUU…) are not in this chart, so they are not decoded.',
      ],
    },
    {
      id: 'lg-r410a-multi-f',
      brand: 'LG',
      name: 'Older R-410A Multi F and Multi F MAX units (LMU, LMAN, LMCN, LMHN…)',
      kind: 'Multi-zone outdoor or indoor unit, R-410A',
      pattern: '^(L)(M)(AN|CN|DN|HN|QN|VN|N|U)(\\d{2})(\\d)(H)(V)(T|P)?',
      example: 'LMU303HV',
      layout: 'L M U 30 3 H V',
      fields: [
        { group: 1, label: 'Brand', codes: { L: 'LG' } },
        { group: 2, label: 'Type', codes: { M: 'Multi-zone' } },
        {
          group: 3, label: 'Component', codes: {
            AN: 'Art Cool™ wall-mounted indoor unit', N: 'Standard wall-mounted indoor unit', CN: 'Four-way ceiling-cassette indoor unit', DN: 'Ceiling-concealed duct (low static) indoor unit', HN: 'Ceiling-concealed duct (high static) or convertible (mid static) duct indoor unit', QN: 'Low-wall console indoor unit', VN: 'Vertical-horizontal air handling indoor unit', U: 'Outdoor unit',
          },
        },
        capacity(4, ['07', '09', '12', '15', '18', '24', '30', '36', '42', '48', '54', '60']),
        { group: 5, label: 'Generation', describe: 'Generation digit' },
        { group: 6, label: 'Feature', codes: { H: 'Heat pump' } },
        { group: 7, label: 'Feature', codes: { V: 'Inverter' } },
        { group: 8, label: 'Feature', codes: { T: 'High wall-mounted indoor unit', P: 'Art Cool™ Gallery indoor unit' } },
      ],
      sourceIds: ['lgEmMultiF410', 'lgR32ModelMap'],
      notes: [
        'Multi F with LGRED° outdoor units (LMU180HHV, LMU240HHV and so on) carry an extra H that this chart does not define, so they are not decoded here.',
      ],
    },
  ],
  serials: [
    {
      id: 'lg-outdoor-ymm',
      appliesTo: ['LG outdoor units (single-zone and Multi F)'],
      kind: 'lg-ymm',
      title: 'LG outdoor units: first three digits = year digit + month',
      rule: 'The first digit of the serial is the year of manufacture and the second and third digits are the month (01–12). LG prints only the last digit of the year, so a 5 means 2015 or 2025. The decoder shows the most recent year that is not in the future, plus the one ten years earlier.',
      example: { serial: '503XXXXXX', reads: 'March, year ending in 5. LG\'s own sheet reads its example as March 2015' },
      sourceIds: ['lgPqsh1200'],
      caveats: [
        'LG states this rule for outdoor units, in a note on its PQSH1200 drain pan heater specification sheet. We found no LG chart for the rest of the serial or for factory codes, so those are not decoded.',
        'The decade is not encoded. Settle it with the install paperwork or the model: K-prefix models are LG\'s R32 line, which is covered by a warranty card for systems installed from September 1, 2024.',
      ],
    },
  ],
  warranty: [
    {
      label: 'Standard (qualified system, not registered)',
      detail: '5 years on parts, including the compressor, from the original installation date, plus 2 more years on the compressor (7 years in total). Parts only: labor, refrigerant and other costs are not covered.',
      sourceIds: ['lgWarrantyR32'],
    },
    {
      label: 'Registered within 60 days of startup',
      detail: 'Parts and compressor are extended to 10 years in total if the system was installed by someone who has completed LG\'s training, installed to LG\'s instructions, and registered at lghvac.com within 60 days of startup. In California, not registering does not reduce rights under the limited warranty, and the same applies to certain Florida installations.',
      sourceIds: ['lgWarrantyR32', 'lgRegister', 'lgWarrantyPage'],
    },
    {
      label: 'Who has to install it',
      detail: 'Even the standard warranty only covers a "qualified" system: one installed by a person or company that has completed LG residential/light commercial training at an LG or LG partner academy and holds any HVAC license the state requires.',
      sourceIds: ['lgWarrantyR32'],
    },
    {
      label: 'No proof of install date',
      detail: 'The parts warranty ends 5 years after the date of manufacture and the compressor warranty 7 years after it. That date comes from the serial, so read it before you buy a used or "new old stock" unit.',
      sourceIds: ['lgWarrantyR32', 'lgPqsh1200'],
    },
    {
      label: 'Selling the house, moving it, buying online',
      detail: 'The warranty covers only the original end-use purchaser at the original install location. It is void if the system is moved, sold "as is", or "purchased online from a source not expressly authorized by LG".',
      sourceIds: ['lgWarrantyR32'],
    },
    {
      label: 'Older R-410A systems',
      detail: 'LG\'s R-410A residential warranty card (valid for systems installed from April 1, 2017) has the same structure: 5 years on parts, 2 more on the compressor, and 10 years in total when an LG-trained installer installs it and it is registered within 60 days of startup.',
      sourceIds: ['lgWarranty410'],
    },
  ],
  gotchas: [
    {
      title: 'A "36" is not always 36,000 Btu/h',
      text: 'The two size digits are a nominal class. LG\'s own tables rate the KSSLA361A (KNSLA361A + KUSXA361A) at 33,000 Btu/h of cooling and the KSSLA421A at 42,000. A quote calling a 36 system "3.5 tons", or a 42 "3 tons", has the size wrong.',
      sourceIds: ['lgEmAhuRed'],
    },
    {
      title: 'A B-grade air handler in an LGRED° system is normal',
      text: 'LG pairs the KUSXA422A LGRED° outdoor unit with a KNSLB421A air handler, and the KUSXA121A with a KNSLB121A. The system model (KSSLA…) carries the LGRED° A, so a B on the air handler is not a downgrade on its own.',
      sourceIds: ['lgEmAhuRed'],
    },
    {
      title: 'DIY or online purchase can cost you the warranty',
      text: 'LG\'s warranty requires an installer who has completed LG training, and it is void for systems bought online from a source LG has not authorized. The 10-year term also needs registration within 60 days of startup.',
      sourceIds: ['lgWarrantyR32'],
    },
    {
      title: 'Old model number, new refrigerant',
      text: 'LG renamed its lines when it moved to R32. The LV420HV1 system (LVN420HV air handler + LUU420HV outdoor unit) maps to the KSSLB421A (KNSLB421A + KUSXB421A), and an LMU303HV Multi F outdoor unit to the KUMXB301A. A replacement quote should name the K model.',
      sourceIds: ['lgR32ModelMap'],
    },
  ],
  faqs: [
    {
      q: 'What size is my LG heat pump or mini-split?',
      a: 'On a current K model, read the two digits after the fifth letter. They are the nominal capacity in thousands of Btu/h, so KUSXA361A is a 36 (3-ton class) and KNMAB151A is a 15. On older L models, it is the first two digits of the number, so LSU090HSV5 is a 9,000 Btu/h unit. LG\'s rated capacity can differ from the class: the KSSLA361A system is rated at 33,000 Btu/h of cooling.',
    },
    {
      q: 'How do I tell how old my LG unit is?',
      a: 'Look at the outdoor unit\'s serial number. LG says the first digit is the year and the second and third digits are the month, so 503… means March of a year ending in 5. LG does not print the decade, so check the install paperwork or the model generation to choose between, say, 2015 and 2025.',
    },
    {
      q: 'What does the K at the start of an LG model number mean?',
      a: 'K means R32 refrigerant in LG\'s current nomenclature. LG\'s older R-410A models start with L (LSU, LSN, LMU, LV and so on), and LG publishes a cross-reference that maps each old model to its R32 replacement.',
    },
    {
      q: 'What is the difference between KUSXA, KUSXB and KUSXE?',
      a: 'All three are R32 single-zone outdoor units for ducted systems. The fifth letter is the grade: A is LGRED°, B is High Efficiency (Deluxe) and E is CV. Each is paired with its own air handlers in LG\'s tables, for example KUSXE361A with the KNSLE362A.',
    },
    {
      q: 'Is the LG warranty 5, 7 or 10 years?',
      a: 'All three, depending on the part and registration. Under LG\'s R32 residential card, parts are covered for 5 years and the compressor for 7. If an LG-trained installer installs the system to LG\'s instructions and it is registered at lghvac.com within 60 days of startup, both go to 10 years. Labor is not covered.',
    },
  ],
  serialOptions: [{ label: 'LG (outdoor unit)', rule: 'lg-outdoor-ymm' }],
  notCovered: [
    'Everything in the serial after the first three digits, including any factory or country code. LG\'s published note covers only the year and month digits, and only for outdoor units. We did not find an LG rule for indoor-unit serials.',
    'The decade of the year digit. LG prints one digit, so the decoder offers both readings.',
    'R32 grades and types that no current LG chart prints: the L (Art Cool™) and P (Extended Piping) wall-mounted grades, the single-zone 4-way cassette type C (KNSCB/KSSCA), and the Multi F 42 size (KUMXA421A).',
    'LGRED° R-410A models (…HHV), R-410A universal outdoor units (LUU…), and R-410A styles the chart does not list (HXV, HFV, HCV).',
    'A-coil systems (KSSMB…) and LKMMA coils. LG\'s A-coil chart prints generation 1 in position 7, but the system models it lists (KSSMB18AA, KSSMB36BA, KSSMB49CA) carry a letter there that the chart does not define, so we do not decode them.',
    'Multi V VRF, air-to-water heat pumps, gas furnaces (LNAEA/LNAVE), heat pump water heaters and ERVs.',
    'Older LG warranty terms such as the 2017 "LG Excellence Contractor" 12-year program. The current cards do not include it, so it is not on this page.',
  ],
  updated: '2026-11-12',
};
