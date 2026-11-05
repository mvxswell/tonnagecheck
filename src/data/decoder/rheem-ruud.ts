import type { DecoderBrand } from './types';

// Rheem and Ruud are sister brands built by Rheem Manufacturing, and their spec sheets share one model key. Every
// code below is transcribed from the "Model Number Identification" block of a current Rheem or Ruud spec sheet
// (files.myrheem.com), and the serial rule from Rheem's own article plus Rheem parts lists. Codes those sheets do not
// list stay unknown.
const OUT_TONS = { '18': 1.5, '24': 2, '30': 2.5, '36': 3, '42': 3.5, '48': 4, '60': 5 };
const AH_TONS = { '24': 2, '36': 3, '48': 4, '60': 5 };
const OUT_VOLTAGE: Record<string, string> = { J: '208/230 V, 1-phase, 60 Hz', C: '208/230 V, 3-phase, 60 Hz', D: '460 V, 3-phase, 60 Hz' };
const WIDTH: Record<string, string> = { '14': '14-inch cabinet', '17': '17.5-inch cabinet', '21': '21-inch cabinet', '24': '24.5-inch cabinet' };
const LEGACY_SEER: Record<string, string> = Object.fromEntries(
  ['13', '14', '15', '17', '20'].map((c) => [c, `Nominal ${c} SEER (old SEER scale, before SEER2)`]),
);
const ENDEAVOR_INPUT: Record<string, string> = Object.fromEntries(
  [['040', '40,000'], ['050', '50,000'], ['060', '60,000'], ['070', '70,000'], ['075', '75,000'], ['085', '85,000'], ['100', '100,000'], ['115', '115,000'], ['125', '125,000'], ['150', '150,000']]
    .map(([c, b]) => [c, `${b} Btu/h heating input`]),
);
const OLD_INPUT: Record<string, string> = Object.fromEntries(
  [['040', '42,000'], ['060', '56,000'], ['070', '70,000'], ['085', '84,000'], ['100', '98,000'], ['115', '112,000']]
    .map(([c, b]) => [c, `${b} Btu/h heating input`]),
);

export const rheemRuud: DecoderBrand = {
  slug: 'rheem-ruud',
  name: 'Rheem & Ruud',
  brands: ['Rheem', 'Ruud'],
  seedBrands: [],
  title: 'Rheem & Ruud Model and Serial Number Decoder',
  description:
    'Decode a Rheem or Ruud model number (RA, RP, UP, R962V, RH2TY) into tons, stages and refrigerant, and read the serial number\'s week and year of manufacture.',
  h1: 'Rheem and Ruud model and serial number decoder',
  lead:
    'Rheem and Ruud are sister brands made by Rheem Manufacturing, and they share one model numbering system. Rheem\'s own spec sheets for both brands use the same codes, so one decoder reads both. The serial number gives the week and year the unit was built.',
  intro: [
    'Read a current Rheem or Ruud outdoor model number left to right. The first letter is the brand (R on most Rheem and Ruud units, U on Ruud\'s Ultra series), the second is the product (A for an air conditioner, P for a heat pump), then two digits for the SEER2 class, a region letter (A = all regions) and the refrigerant letter: Y means R-454B and Z means R-410A. The next two digits are the size in thousands of Btu/h, so RP15AY36AJ2NA is a Rheem Classic Plus 3-ton (36) R-454B heat pump with a two-stage compressor (2) on 208/230 V single-phase (J).',
    'The SEER2 digits are a series class, not a promise for your system. Rheem\'s RP15AY sheet calls the series "15 - 15.2 SEER2" but rates it "up to 16 SEER2", and the matched indoor coil or air handler changes the number. Compare quotes on the AHRI certificate for the exact outdoor and indoor pair.',
    'Many models carry the same model number under both brands. Rheem\'s Classic RP14AY and Ruud\'s Achiever RP14AY spec sheets list the same RP14AY model numbers and specifications, and the Endeavor Line R921T furnace is a Rheem Classic in one sheet and a Ruud Achiever in the other. Rheem\'s Prestige RP19AY and Ruud\'s Ultra UP19AY use the same model key apart from the first letter.',
    'For the date, Rheem says the first two numbers after the letter at the beginning or in the middle of the serial are the week of manufacture, and the next two are the year. W08139999 was built in week 8 of 2013, and Rheem\'s RA13 parts list names plant W as West Nuevo Laredo. On older long serials, the digits before the letter are a compressor identification number.',
  ],
  labelLocation: {
    text: 'Rheem and Ruud both say a split system has two model and serial tags: one on the outdoor air conditioner or heat pump, and one on the indoor furnace or air handler. Rheem\'s label diagram shows the indoor tag inside the front top cover. A packaged unit has one tag. Rheem asks for the model and serial number of each piece of equipment, plus the installation date, when you contact them.',
    sourceIds: ['rheemLabel', 'ruudLabel'],
  },
  families: [
    {
      id: 'rheem-seer2-outdoor',
      brand: 'Rheem / Ruud',
      name: 'Rheem & Ruud SEER2 air conditioners & heat pumps (RA…AY, RP…AY, UP…AY, RA…AZ)',
      kind: 'Outdoor air conditioner or heat pump, R-454B (Y) or R-410A (Z)',
      pattern: '^([RU])([AP])(\\d{2})([A-Z])([YZ])(\\d{2})([A-Z])([A-Z])([123V])([NC])(A)?(LHP)?',
      example: 'RP15AY36AJ2NA',
      layout: 'R P 15 A Y 36 A J 2 N A',
      fields: [
        { group: 1, label: 'Brand', codes: { R: 'Rheem or Ruud (both brands use R on most models)', U: 'Ruud (Ultra series, for example UP19AY)' } },
        { group: 2, label: 'Product', codes: { A: 'Air conditioner', P: 'Heat pump' } },
        { group: 3, label: 'SEER2 class', codes: { '14': '13.8–14.3 SEER2 class', '15': '15.2 SEER2 class', '16': '16 SEER2 class', '19': '19 SEER2 class' } },
        { group: 4, label: 'Region', codes: { A: 'All regions' } },
        { group: 5, label: 'Refrigerant', codes: { Y: 'R-454B', Z: 'R-410A' } },
        { group: 6, label: 'Nominal cooling capacity', tons: OUT_TONS },
        { group: 7, label: 'Major series', codes: { A: '1st design', B: '2nd design' } },
        { group: 8, label: 'Voltage', codes: OUT_VOLTAGE },
        { group: 9, label: 'Compressor type', codes: { '1': 'Single-stage', '2': 'Two-stage (Rheem\'s RP15AY sheet says "2+ Stage")', '3': '3+ stage', V: 'Fully variable' } },
        { group: 10, label: 'Controls', codes: { N: 'Non-communicating', C: 'Communicating (EcoNet)' } },
        { group: 11, label: 'Minor series', codes: { A: '1st design' } },
        { group: 12, label: 'Option code', codes: { LHP: 'With high and low pressure controls' } },
      ],
      sourceIds: ['rheemRp15ay', 'rheemRp14ay', 'ruudRp14ay', 'ruudRa14ay', 'ruudRa15ay', 'rheemRa19ay', 'rheemRp19ay', 'ruudUp19ay', 'rheemRa16az'],
      notes: [
        'The SEER2 digits name the series. Ruud\'s RA14AY sheet codes "14 - 13.8/14.3 SEER2" and rates the series up to 15.2 SEER2, and the RP15AY is coded 15.2 but rated up to 16. Your matched system\'s AHRI rating is the number to compare.',
        'On the RP14AY heat pump, the 1.5-ton (18) model is single-stage and the 2- to 5-ton models are two-stage, per the model lists in both the Rheem and Ruud spec sheets.',
        'Ruud\'s RA14AY and RA15AY sheets note that the LHP pressure switches are standard on 3-phase models.',
      ],
    },
    {
      id: 'rheem-endeavor-furnace',
      brand: 'Rheem / Ruud',
      name: 'Rheem & Ruud Endeavor Line gas furnaces (R801T, R921T, R962V, R972V)',
      kind: 'Gas furnace',
      pattern: '^(R)(\\d{2})([12])([TV])(\\d{3})([345])([A-Z])(14|17|21|24)(UH|DZ|M4|UP)([SNL])([NC])([A-Z])([SP])?',
      example: 'R962V0403A17M4SCAP',
      layout: 'R 96 2 V 040 3 A 17 M4 S C A P',
      fields: [
        { group: 1, label: 'Brand', codes: { R: 'Rheem or Ruud (both brands print R on Endeavor Line furnaces)' } },
        { group: 2, label: 'Furnace efficiency', codes: { '80': '80% AFUE', '92': '92% AFUE', '96': '96% AFUE', '97': '97% AFUE' } },
        { group: 3, label: 'Stages of heating', codes: { '1': 'Single-stage', '2': 'Two-stage' } },
        { group: 4, label: 'Blower motor', codes: { T: 'Constant torque', V: 'ECM variable speed' } },
        { group: 5, label: 'Heating input', codes: ENDEAVOR_INPUT },
        { group: 6, label: 'Maximum air conditioning it can drive', codes: { '3': 'Blower sized for up to a 3-ton AC', '4': 'Blower sized for up to a 4-ton AC', '5': 'Blower sized for up to a 5-ton AC' } },
        { group: 7, label: 'Major series', codes: { A: '1st design' } },
        { group: 8, label: 'Cabinet width', codes: WIDTH },
        { group: 9, label: 'Position', codes: { UH: 'Upflow / horizontal', DZ: 'Downflow, zero clearance', M4: 'Multi-position, 4-way', UP: 'Upflow' } },
        { group: 10, label: 'NOx', codes: { S: 'Standard', N: 'Low NOx (upflow/horizontal R801T sheet)', L: 'Low NOx (downflow R801T sheet)' } },
        { group: 11, label: 'Controls', codes: { N: 'Non-communicating', C: 'Communicating, EcoNet and Bluetooth' } },
        { group: 12, label: 'Minor series', codes: { A: '1st series' } },
        { group: 13, label: 'Option code', codes: { S: 'Standard grade', P: 'Premium grade' } },
      ],
      sourceIds: ['rheemR962v', 'rheemR972v', 'rheemR921t', 'ruudR921t', 'rheemR801tUh', 'rheemR801tDz'],
      notes: [
        'The three input digits are the heating input in thousands of Btu/h, not the output. The single digit after them is the largest air conditioner the blower can serve, not the furnace\'s heating size.',
        'Spec-sheet model lists print an asterisk in the NOx position (for example R801T0503A14UH*NAS). Replace it with S (standard) or the low-NOx letter before decoding.',
      ],
    },
    {
      id: 'rheem-endeavor-air-handler',
      brand: 'Rheem / Ruud',
      name: 'Rheem & Ruud Endeavor Line R-454B air handlers (RH2TY, RHMVY)',
      kind: 'Indoor air handler, R-454B',
      pattern: '^(R)(H)([2M])([TV])(Y)(24|36|48|60)(17|21|24)([SM])([TE])([A-Z])([NC])([AN])([AJD])?(L)?',
      example: 'RH2TY2417STANNJ',
      layout: 'R H 2 T Y 24 17 S T A N N J',
      fields: [
        { group: 1, label: 'Brand', codes: { R: 'Rheem or Ruud (both brands use R)' } },
        { group: 2, label: 'Product', codes: { H: 'Multipoise air handler' } },
        { group: 3, label: 'Stages of airflow', codes: { '2': 'Two-stage', M: 'Modulating' } },
        { group: 4, label: 'Blower motor', codes: { T: 'Constant torque', V: 'Constant CFM' } },
        { group: 5, label: 'Refrigerant', codes: { Y: 'R-454B' } },
        { group: 6, label: 'Capacity', tons: AH_TONS },
        { group: 7, label: 'Cabinet width', codes: WIDTH },
        { group: 8, label: 'Coil efficiency', codes: { S: 'Standard', M: 'Mid' } },
        { group: 9, label: 'Metering device', codes: { T: 'TXV', E: 'EEV (electronic expansion valve)' } },
        { group: 10, label: 'Major series', codes: { A: '1st design' } },
        { group: 11, label: 'Controls', codes: { N: 'Non-communicating', C: 'Communicating' } },
        { group: 12, label: 'Coil series', codes: { A: 'A coil', N: 'N coil' } },
        { group: 13, label: 'Voltage', codes: { A: '115 V, 1-phase, 60 Hz', J: '208–240 V, 1-phase, 60 Hz', D: '480 V, 3-phase, 60 Hz' } },
        { group: 14, label: 'Refrigerant sensor', codes: { L: 'Less A2L sensor (no factory-installed refrigerant sensor)' } },
      ],
      sourceIds: ['rheemRh2ty', 'ruudRhmvy'],
      notes: [
        'No letter at the end means the A2L refrigerant sensor is installed at the factory. A trailing L means it ships without one.',
        'An air handler\'s capacity code is the largest system it is built for. Size the system from the outdoor unit\'s model number.',
      ],
    },
    {
      id: 'rheem-legacy-r410a-outdoor',
      brand: 'Rheem',
      name: 'Rheem R-410A air conditioners & heat pumps, old SEER layout (RA17, RP14…)',
      kind: 'Outdoor air conditioner or heat pump, R-410A (before SEER2)',
      pattern: '^(R)([AP])(\\d{2})(18|24|30|36|42|48|60)([AB])([JCD])([12VP])(N)?([AB])?',
      example: 'RA1724AJ2NB',
      layout: 'R A 17 24 A J 2 N B',
      fields: [
        { group: 1, label: 'Brand', codes: { R: 'Rheem' } },
        { group: 2, label: 'Product', codes: { A: 'Air conditioner', P: 'Heat pump' } },
        { group: 3, label: 'Efficiency', codes: LEGACY_SEER },
        { group: 4, label: 'Nominal cooling capacity', tons: OUT_TONS },
        { group: 5, label: 'Major series', codes: { A: '1st design', B: '2nd design' } },
        { group: 6, label: 'Voltage', codes: OUT_VOLTAGE },
        { group: 7, label: 'Compressor type', codes: { '1': 'Single-stage', '2': 'Two-stage', V: 'Inverter', P: 'Piston' } },
        { group: 8, label: 'Controls', codes: { N: 'Non-communicating' } },
        { group: 9, label: 'Minor series', codes: { A: '1st design', B: 'Version with high and low pressure controls' } },
      ],
      sourceIds: ['rheemRa17'],
      notes: [
        'Before the 2023 SEER2 change, Rheem put the size straight after the SEER digits, with no region or refrigerant letter. These are R-410A units on the old SEER scale.',
      ],
    },
    {
      id: 'rheem-2019-variable-furnace',
      brand: 'Rheem / Ruud',
      name: 'Rheem Prestige & Ruud Ultra variable-speed furnaces, 2019 layout (R96V, U96V, R98V, U98V)',
      kind: 'Gas furnace',
      pattern: '^([RU])(96|98)(V)([AB])(\\d{3})([2M])([35])(17|21|24)([MU])([SN])([AB])',
      example: 'R96VA0702317MSA',
      layout: 'R 96 V A 070 2 3 17 M S A',
      fields: [
        { group: 1, label: 'Brand', codes: { R: 'Rheem', U: 'Ruud' } },
        { group: 2, label: 'Efficiency', codes: { '96': '96% AFUE', '98': '98% AFUE' } },
        { group: 3, label: 'Blower motor', codes: { V: 'ECM' } },
        { group: 4, label: 'Design series', codes: { A: '1st design', B: '2nd design' } },
        { group: 5, label: 'Heating input', codes: OLD_INPUT },
        { group: 6, label: 'Heating stages', codes: { '2': 'Two-stage', M: 'Modulating' } },
        { group: 7, label: 'Airflow', codes: { '3': 'Up to 3 tons of cooling', '5': 'Up to 5 tons of cooling' } },
        { group: 8, label: 'Cabinet width', codes: WIDTH },
        { group: 9, label: 'Configuration', codes: { M: 'Multi-position', U: 'Upflow' } },
        { group: 10, label: 'NOx', codes: { S: 'Standard', N: 'NOx version (the R98V/U98V sheets print "N = NOx")' } },
        { group: 11, label: 'Revision', codes: { A: 'First release', B: 'First revision' } },
      ],
      sourceIds: ['rheemR96v', 'ruudU96v', 'rheemR98v', 'ruudU98v'],
      notes: ['In this older layout, input codes are rounded: 040 is 42,000 Btu/h, 060 is 56,000 and 100 is 98,000.'],
    },
  ],
  serials: [
    {
      id: 'rheem-letter-wwyy',
      appliesTo: ['Rheem', 'Ruud'],
      kind: 'rheem-letter-wwyy',
      title: 'Rheem and Ruud serial numbers: letter, week, year',
      rule: 'Find the letter at the beginning or in the middle of the serial. The two digits after it are the week of manufacture and the next two are the year. Rheem\'s parts lists show the letter is the plant, followed by a production number, with a compressor identification number before the letter on older long serials.',
      example: { serial: 'W08139999', reads: 'Built in week 8 of 2013 (around February) at plant W, West Nuevo Laredo' },
      plants: {
        F: 'Fort Smith, Arkansas',
        M: 'Milledgeville, Georgia',
        D: 'Dewey, Oklahoma',
        T: 'Trenton, South Carolina',
        W: 'West Nuevo Laredo',
      },
      sourceIds: ['rheemSerialArticle', 'rheemRchlParts', 'rheemSmjParts', 'rheemRa13Parts'],
      caveats: [
        'The plant letters come from Rheem parts lists dated 2002 (F, M, D, T) and 2015 (W). Rheem does not publish a current full list, so other letters are shown as not listed rather than guessed.',
        'The RA13 parts list we cite is a copy of Rheem\'s form 92-42801-RA13 hosted by a distributor (Meier Supply), because Rheem\'s own parts-list site did not load for us.',
        'Rheem dates by week, so the month is approximate. If the unit was installed long after it was built, the installer\'s invoice is what sets the warranty start.',
      ],
    },
  ],
  warranty: [
    {
      label: 'Register within 90 days for the longer terms',
      detail: 'Rheem\'s residential split-system warranty, which covers Rheem and Ruud, says the conditional warranty terms require registration within 90 days of the original installation or of closing on your home. The unit must be in an owner-occupied single-family home, still owned by the original purchaser and in its original location. Registration is at registermyunit.com.',
      sourceIds: ['rheemWarrantySplit', 'rheemRegister', 'rheemWarranties'],
    },
    {
      label: 'When coverage starts',
      detail: 'Coverage starts on the installation date on the installer\'s invoice (or the occupancy permit or builder proof of purchase on new construction). Without that, Rheem uses the manufacture date shown by the serial number plus 90 days.',
      sourceIds: ['rheemWarrantySplit'],
    },
    {
      label: 'Outdoor units: what the spec sheets list',
      detail: 'Classic and Achiever (RA14AY, RA15AY, RP14AY) and Classic Plus RP15AY: 10-year conditional parts warranty, registration required. Prestige RA19AY and RP19AY and Ruud Ultra UP19AY: 10-year conditional unit replacement (registration required) and 10 years on parts.',
      sourceIds: ['ruudRa14ay', 'ruudRa15ay', 'rheemRp14ay', 'rheemRp15ay', 'rheemRa19ay', 'rheemRp19ay', 'ruudUp19ay'],
    },
    {
      label: 'Unit replacement has extra conditions',
      detail: 'The 10-year conditional unit replacement replaces the unit if the compressor fails, but only if it was installed with a new Rheem-made air handler, or coil and gas furnace, matched per AHRI ratings, with the designated EcoNet thermostat, and with pre-approval from a Rheem District Technical Representative.',
      sourceIds: ['rheemWarrantySplit'],
    },
    {
      label: 'Furnaces and air handlers',
      detail: 'R962V Classic Plus furnace: 10-year conditional unit replacement (registration required), 10 years on parts and a limited lifetime heat exchanger. R921T: 10-year conditional parts and a limited lifetime heat exchanger. R801T 80% furnace: 10-year conditional parts and a 20-year heat exchanger. RH2TY air handler: 10-year conditional parts. RHMVY air handler: 10 years on parts.',
      sourceIds: ['rheemR962v', 'rheemR921t', 'rheemR801tUh', 'rheemRh2ty', 'ruudRhmvy'],
    },
    {
      label: 'Labor, online sales and commercial use',
      detail: 'The warranty does not cover labor unless you have a labor agreement with your contractor. Rheem does not warrant equipment sold online direct to consumers, through auction sites or by liquidators. Three-phase compressors get 5 years, and commercial equipment gets 1 year.',
      sourceIds: ['rheemWarrantySplit'],
    },
  ],
  gotchas: [
    {
      title: 'Y means R-454B, Z means R-410A',
      text: 'The fifth character of a current outdoor model is the refrigerant. RP14AY is R-454B and RA16AZ is R-410A. If a quote promises the new refrigerant, look for the Y.',
      sourceIds: ['rheemRp14ay', 'rheemRa16az'],
    },
    {
      title: 'A Rheem and a Ruud can be the same unit',
      text: 'The RP14AY appears in both Rheem\'s Classic sheet and Ruud\'s Achiever sheet with the same model numbers and specs. Don\'t pay more because one quote says Rheem and another says Ruud. Compare the model number.',
      sourceIds: ['rheemRp14ay', 'ruudRp14ay'],
    },
    {
      title: 'The furnace\'s 3 or 5 is cooling capacity, not heat',
      text: 'On R962V0403A17M4SCAP, 040 is a 40,000 Btu/h heating input and the 3 after it means the blower can serve up to a 3-ton air conditioner.',
      sourceIds: ['rheemR962v'],
    },
    {
      title: 'The 10-year unit replacement needs a matched system and pre-approval',
      text: 'Replacing only the outdoor unit, or skipping the EcoNet thermostat, can void the unit-replacement promise on Prestige and Ultra models. Ask the installer to confirm in writing which conditions your system meets.',
      sourceIds: ['rheemWarrantySplit'],
    },
    {
      title: 'Online-bought equipment is not warranted',
      text: 'Rheem\'s warranty excludes units sold to consumers online, through auction sites or by liquidators. Buy through a contractor if you want the factory warranty.',
      sourceIds: ['rheemWarrantySplit'],
    },
  ],
  faqs: [
    {
      q: 'How do I tell how old my Rheem or Ruud AC, heat pump or furnace is?',
      a: 'Find the letter at the start or in the middle of the serial number. The two digits right after it are the week and the next two are the year. W08139999 was built in week 8 of 2013. On older long serials such as 7166F27049999, ignore the digits before the letter: F2704 means week 27 of 2004.',
    },
    {
      q: 'What size is my Rheem or Ruud unit?',
      a: 'On a current outdoor unit, read the two digits after the refrigerant letter (Y or Z): 18 = 1.5 tons, 24 = 2, 30 = 2.5, 36 = 3, 42 = 3.5, 48 = 4 and 60 = 5. RA14AY36AJ1NA is a 3-ton air conditioner. On older R-410A models such as RA1736AJ2NA, the size comes straight after the SEER digits.',
    },
    {
      q: 'Are Rheem and Ruud the same?',
      a: 'Both are made by Rheem Manufacturing and share the same model numbering. Many models have identical model numbers and specs under both brands, such as the RP14AY heat pump (Rheem Classic, Ruud Achiever) and the R921T furnace. Rheem\'s split-system warranty certificate covers both brands.',
    },
    {
      q: 'Is my Rheem or Ruud unit R-454B or R-410A?',
      a: 'Look at the fifth character of a current outdoor model: Y is R-454B and Z is R-410A. Older models with the size right after the SEER digits (like RA1724AJ2NB) are R-410A. Endeavor Line air handlers with a Y in fifth place (RH2TY, RHMVY) are built for R-454B.',
    },
    {
      q: 'Do I have to register a Rheem or Ruud unit for the 10-year warranty?',
      a: 'Yes. Rheem\'s warranty says the conditional terms need registration within 90 days of installation or closing, at registermyunit.com. The home must be owner-occupied and you must be the original purchaser.',
    },
    {
      q: 'Where is the model and serial number on a Rheem or Ruud system?',
      a: 'A split system has two tags: one on the outdoor unit and one on the furnace or air handler, where Rheem\'s diagram shows it inside the front top cover. A packaged unit has a single tag.',
    },
  ],
  serialOptions: [
    { label: 'Rheem', rule: 'rheem-letter-wwyy' },
    { label: 'Ruud', rule: 'rheem-letter-wwyy' },
  ],
  notCovered: [
    'A current list of Rheem plant letters. We show only the letters printed in Rheem parts lists (F, M, D and T from 2002, W from 2015).',
    'Water heaters, tankless units and boilers. Their serials and model numbers follow different layouts that this page does not cover.',
    'Ruud R-410A legacy models (UA/UP with SEER digits), Sure Comfort, WeatherKing and Russell models, and the R-410A region codes other than A (for example RA13NZ). We found no Rheem or Ruud key covering them.',
    'SEER2 classes other than 14, 15, 16 and 19, and the R-454B two-stage RA16AY. Its Rheem spec sheet link returned an error.',
    'Older furnace layouts such as the R802V/U802V downflow and R801T in the 2019 style, packaged units, coils and ductless mini-splits.',
    'The exact warranty years for each model from the warranty certificate. Its tables are images, so we list only the terms printed as text on the spec sheets.',
  ],
  updated: '2026-11-05',
};
