import type { DecoderBrand, ModelField } from './types';

// Every position below is transcribed from the "Nomenclature" figures in Bosch Thermotechnology's current R-454B
// IDS product specifications (Light, Premium Connected and Ultra condensing units; Light, Premium, BIWA and BICA
// air handlers) and the BGH96/BGH97 furnace submittal sheets. The serial date code comes from Bosch's Serial
// Number Reference Guide (BTC 310004101 K, 07.2026). Codes a chart does not print are left out.
const CAP_TONS: Record<string, number> = { '18': 1.5, '24': 2, '27': 2.25, '30': 2.5, '36': 3, '48': 4, '60': 5 };
const CAP_TEXT: Record<string, string> = {
  '18': '18 × 1,000 Btu/h (1½-ton class)',
  '24': '24 × 1,000 Btu/h (2-ton class)',
  '27': '27 × 1,000 Btu/h (2¼-ton class)',
  '30': '30 × 1,000 Btu/h (2½-ton class)',
  '36': '36 × 1,000 Btu/h (3-ton class)',
  '48': '48 × 1,000 Btu/h (4-ton class)',
  '60': '60 × 1,000 Btu/h (5-ton class)',
};
const pick = (keys: string[]) => ({
  tons: Object.fromEntries(keys.map((k) => [k, CAP_TONS[k]])),
  codes: Object.fromEntries(keys.map((k) => [k, CAP_TEXT[k]])),
});
const PERFORMANCE = { M: 'Max Performance heat pump', R: 'Regular heat pump', X: 'AC only' };
const CONNECTED = { X: 'Non-connected', T: 'Connected (internet gateway)', C: 'Communication capable (indoor unit)' };
const REFRIGERANT = { N: 'R-410A', B: 'R-454B' };
const POWER = { M: '208/230 V, 1-phase, 60 Hz' };
const SERIES = { A: 'A Series', B: 'B Series' };
const common = (start: number): ModelField[] => [
  { group: start, label: 'Performance', codes: PERFORMANCE },
  { group: start + 1, label: 'Internet connected', codes: CONNECTED },
  { group: start + 2, label: 'Refrigerant', codes: REFRIGERANT },
  { group: start + 3, label: 'Power supply', codes: POWER },
];

export const bosch: DecoderBrand = {
  slug: 'bosch',
  name: 'Bosch',
  brands: ['Bosch'],
  // Empty on purpose: several Bosch listings in our price data are labelled "3-ton" but pair a 36 outdoor unit with
  // a 24 air handler, which Bosch's own AHRI table rates at 24,000 Btu/h. Until that seed data is corrected in a
  // separate audit batch, this page does not repeat those sizes or prices.
  seedBrands: [],
  title: 'Bosch Heat Pump Model & Serial Number Decoder (IDS)',
  description:
    'Decode a Bosch IDS heat pump, air handler or BGH furnace model number (BOVB, BIVA, BIVB, BGH96) and read the build date from the serial with Bosch\'s date table.',
  h1: 'Bosch heat pump model and serial number decoder',
  lead:
    'A Bosch IDS model number is fifteen positions long and reads the same way on the outdoor unit and the air handler: brand, indoor or outdoor, cabinet type, series, size, then performance, connectivity, refrigerant, power, efficiency tier and compressor. The serial number carries a three-character date code that Bosch publishes in its own lookup table.',
  intro: [
    'Start with the first four letters. B is Bosch. The second letter is O for an outdoor condensing unit or I for an indoor air handler, and the third is the cabinet: V is a vertical-discharge condenser or a vertical multi-position air handler, W a wall-mounted air handler and C a ceiling-mounted one. The fourth letter is the series, A or B. So BOVB is a B-series outdoor condensing unit and BIVA is an A-series multi-position air handler.',
    'After the dash, two digits give the nominal capacity in thousands of Btu/h (24, 36, 60 and so on). Then come three letters: performance (R for a regular heat pump, M for Max Performance, X for AC only), connectivity (T for the internet-connected gateway, X for non-connected, C for a communication-capable indoor unit) and refrigerant (B for R-454B, N for R-410A). After the second dash, M is 208/230 V single-phase power, the two digits are the SEER2 tier, and the last letter is the compressor: S for a standard inverter, E for an EVI inverter, and X on air handlers, which have none.',
    'Two things trip people up with Bosch. First, the capacity code on the outdoor unit is not always the system size, because Bosch rates its inverter condensers with smaller air handlers too: its own AHRI table rates a BOVB-36RTB-M15S with a BIVA-24RXB-M15X air handler at 24,000 Btu/h, a 2-ton system. Second, the SEER2 digits are the product line\'s tier, not your rating, so read the certified pairing. For the build date, take characters 5 to 7 of the serial number and look them up in Bosch\'s table: 720 is April 2017, 240 is April 2022.',
  ],
  labelLocation: {
    text: 'On Bosch IDS (BOVA/BOVB) systems the serial number is on the rating plate on the exterior front of both the indoor and outdoor units. Cased coils have it on the rating plate on the front, BICA air handlers on top of the blower motor housing and BIWA air handlers on the front of the chassis. BGH96 furnaces (Rev. A and B) have a barcode sticker on the lower access panel, and BGH97 furnaces a rating plate on the front. Bosch\'s warranty excludes parts whose tags or nameplates have been "removed, altered or defaced".',
    sourceIds: ['boschSerialGuide', 'boschWarranty'],
  },
  families: [
    {
      id: 'bosch-ids-outdoor',
      brand: 'Bosch',
      name: 'IDS Light, Premium Connected & Ultra condensing units (BOVA, BOVB)',
      kind: 'Inverter heat pump / AC outdoor unit',
      pattern: '^(B)(O)([VH])([AB])(\\d{2})([MRX])([XTC])([NB])(M)(\\d{2})([ES])',
      example: 'BOVB-36RTB-M20S',
      layout: 'B O V B - 36 R T B - M 20 S',
      fields: [
        { group: 1, label: 'Brand', codes: { B: 'Bosch' } },
        { group: 2, label: 'Application', codes: { O: 'Outdoor' } },
        { group: 3, label: 'Unit type', codes: { V: 'Vertical discharge condenser', H: 'Horizontal (side) discharge condenser' } },
        { group: 4, label: 'Series', codes: SERIES },
        { group: 5, label: 'Nominal capacity', ...pick(['18', '24', '27', '30', '36', '48', '60']) },
        ...common(6),
        { group: 10, label: 'Efficiency tier', codes: { '15': '15 SEER2', '16': '16 SEER2', '18': '18 SEER2', '19': '19 SEER2', '20': '20 SEER2' } },
        { group: 11, label: 'Compressor type', codes: { S: 'Standard inverter compressor', E: 'EVI (enhanced vapor injection) inverter compressor' } },
      ],
      sourceIds: ['boschLightOdu', 'boschPremiumOdu', 'boschUltraOdu'],
      notes: [
        'Bosch lists these codes in one shared chart. The current part lists are BOVB-24/36/60RTB-M15S (IDS Light), BOVB-36/60RTB-M20S (IDS Premium Connected) and BOVB-36/60MTB-M19E (IDS Ultra).',
        'The efficiency digits are the product line\'s tier, not a rating. Bosch describes the BOVB-…-M15S units as "up to 18 SEER2", and its AHRI table rates the BOVB-36RTB-M15S from 14.3 to 18.0 SEER2 depending on the indoor unit.',
      ],
    },
    {
      id: 'bosch-ids-indoor',
      brand: 'Bosch',
      name: 'IDS air handlers (BIVA, BIVB, BIWA, BICA)',
      kind: 'Air handler for IDS heat pumps',
      pattern: '^(B)(I)([VWC])([AB])(\\d{2})([MRX])([XTC])([NB])(M)(\\d{2})(X)',
      example: 'BIVB-24RCB-M20X',
      layout: 'B I V B - 24 R C B - M 20 X',
      fields: [
        { group: 1, label: 'Brand', codes: { B: 'Bosch' } },
        { group: 2, label: 'Application', codes: { I: 'Indoor' } },
        { group: 3, label: 'Unit type', codes: { V: 'Vertical multi-position air handler', W: 'Wall-mounted air handler', C: 'Ceiling-mounted air handler' } },
        { group: 4, label: 'Series', codes: SERIES },
        { group: 5, label: 'Nominal capacity', ...pick(['18', '24', '27', '30', '36', '48', '60']) },
        ...common(6),
        { group: 10, label: 'Efficiency tier', codes: { '15': '15 SEER2', '16': '16 SEER2', '19': '19 SEER2', '20': '20 SEER2' } },
        { group: 11, label: 'Compressor type', codes: { X: 'No compressor (indoor unit)' } },
      ],
      sourceIds: ['boschLightAhu', 'boschPremiumAhu', 'boschBiwa', 'boschBica'],
      notes: [
        'The tier code 18 is left undecoded on air handlers: the Premium air handler chart prints "18 — 18 SEER2" but the Light air handler chart prints "18 — 16 SEER2", so we do not pick one.',
        'An air handler\'s capacity code is its own size. Bosch rates the same 24 air handler with 24 and 36 outdoor units, so read the system size from the certified pairing, not from either label alone.',
      ],
    },
    {
      id: 'bosch-gas-furnace',
      brand: 'Bosch',
      name: 'BGH96 & BGH97 gas furnaces',
      kind: 'Two-stage gas furnace (often paired with an IDS heat pump and BMAC coil)',
      pattern: '^(B)(G)(H)(9[67])(M)(060|080|100|120)([BCD])([345])([A-Z])',
      example: 'BGH96M080B3C',
      layout: 'B G H 96 M 080 B 3 C',
      fields: [
        { group: 1, label: 'Brand', codes: { B: 'Bosch' } },
        { group: 2, label: 'Product', codes: { G: 'Gas furnace' } },
        { group: 3, label: 'Gas valve / fan motor', codes: { H: 'Two-stage gas valve, ECM multi-speed blower' } },
        { group: 4, label: 'AFUE (efficiency)', codes: { '96': '96% efficiency', '97': '97% efficiency' } },
        { group: 5, label: 'Orientation', codes: { M: 'Upflow / horizontal' } },
        { group: 6, label: 'Heating capacity', codes: { '060': '60 kBTU/hr', '080': '80 kBTU/hr', '100': '100 kBTU/hr', '120': '120 kBTU/hr' } },
        { group: 7, label: 'Cabinet width', codes: { B: '17½ inch', C: '21 inch', D: '24½ inch' } },
        { group: 8, label: 'Nominal cooling capacity (blower)', codes: { '3': '3 tons of airflow (Bosch: nominal 350–400 CFM per 12,000 Btu/h)', '4': '4 tons of airflow', '5': '5 tons of airflow' } },
        { group: 9, label: 'Series / revision', describe: 'Series letter (the BGH97 chart labels it "Series" and shows A; the BGH96 Rev. C sheet shows C)' },
      ],
      sourceIds: ['boschBgh97', 'boschBgh96RevC', 'boschLightOdu'],
      notes: [
        'The single digit before the last letter is the blower\'s cooling airflow class, not the size of the heat pump on top. Bosch\'s IDS Light AHRI table pairs the same BGH97M080B3A with a 2-ton (BOVB-24RTB-M15S + BMAC2430ABTA, 23,600 Btu/h) and a 3-ton system (BOVB-36RTB-M15S + BMAC3036ABTA, 32,600 Btu/h).',
      ],
    },
  ],
  serials: [
    {
      id: 'bosch-date-table',
      appliesTo: ['Bosch'],
      kind: 'bosch-date-table',
      title: 'Bosch serial numbers: three-character date code',
      rule: 'Ignore the dashes. Characters 5–7 of the serial (the three right after the first four) are the date code. Look them up in Bosch\'s table: 2010–2013 use the year digit plus the month (01–12); 2014–2019 use the year digit plus 17–20 for January–April and 53–60 for May–December; 2020–2029 use the year digit plus 37–40 and 73–80; 2030 uses 0A1–0AC.',
      example: { serial: '399A-720-000031-8733942691', reads: 'Date code 720: built in April 2017' },
      sourceIds: ['boschSerialGuide', 'boschPinE6'],
      caveats: [
        'Bosch says the date code is "typically" in this position, so a serial that does not decode may use another layout. The decoder rejects codes that are not in the table or that would fall in the future.',
        'Bosch calls this the production date code (FD). Its notice on R-410A IDS Light (BOVA15) control boards, for example, covers units "produced between April 2022 and December 2024 (FD240 to FD480)".',
        'Bosch does not publish what the first four characters or the rest of the serial mean, so we do not decode them.',
      ],
    },
  ],
  warranty: [
    {
      label: 'Residential (one- or two-family home)',
      detail: '10 years on compressors and internal components of IDS condensers, air handlers, BMAC cased coils and BMXF blowers, excluding the gateway assembly. This applies to the original purchaser while the unit stays where it was installed and requires installation and maintenance by a licensed HVAC contractor.',
      sourceIds: ['boschWarranty'],
    },
    {
      label: 'Registered within 90 days',
      detail: 'Registration adds a labor allowance: Bosch pays labor under its Warranty Labor Allowance Schedule for 90 days from the commencement date. Registration is done online through Bosch Home Comfort Pro or the Bosch EasyAir app.',
      sourceIds: ['boschWarranty', 'boschProPortal'],
    },
    {
      label: 'When coverage starts',
      detail: 'For a new home, the date the homeowner bought it from the builder. For an existing home, the original installation date. If neither can be verified, 90 days from the date of manufacture shown by the serial number.',
      sourceIds: ['boschWarranty'],
    },
    {
      label: 'Gateway assembly',
      detail: '2 years from the commencement date.',
      sourceIds: ['boschWarranty'],
    },
    {
      label: 'Commercial installs',
      detail: '3 years on compressors and 1 year on other internal components in buildings other than one- or two-family homes.',
      sourceIds: ['boschWarranty'],
    },
    {
      label: 'BGH97 gas furnace (spec sheet summary)',
      detail: '5 years on parts and 20 years on the primary and secondary heat exchangers in one- or two-family homes. Registering the product raises that to 10 years on parts and a lifetime heat exchanger warranty.',
      sourceIds: ['boschBgh97'],
    },
  ],
  gotchas: [
    {
      title: 'A "36" outdoor unit can be a 2-ton system',
      text: 'Bosch rates its inverter condensers with more than one air handler size. Its AHRI table lists BOVB-36RTB-M15S with a BIVA-24RXB-M15X at 24,000 Btu/h, and BOVB-36RTB-M20S with a BIVB-24RCB-M20X also at 24,000 Btu/h. If a quote says "3 ton", check that the indoor unit is a 36 too.',
      sourceIds: ['boschLightOdu', 'boschPremiumOdu'],
    },
    {
      title: 'M15S does not mean 15 SEER2',
      text: 'The efficiency digits are the product line\'s tier. Bosch describes the IDS Light BOVB-…-M15S condensers as "up to 18 SEER2", and the certified figure depends on the air handler or coil they are paired with.',
      sourceIds: ['boschLightOdu'],
    },
    {
      title: 'The 10 years does not depend on registration, but labor does',
      text: 'Bosch\'s residential warranty is 10 years on compressors and internal components from the commencement date. Registering within 90 days adds only a 90-day labor allowance. The gateway assembly has its own 2-year term.',
      sourceIds: ['boschWarranty'],
    },
    {
      title: 'Keep the install paperwork',
      text: 'If the installation date cannot be verified, Bosch starts the warranty 90 days after the manufacture date in the serial number. A claim needs the original invoice or proof of purchase, the serial number and proof of the installation date and location.',
      sourceIds: ['boschWarranty'],
    },
  ],
  faqs: [
    {
      q: 'How do I tell how old my Bosch heat pump is?',
      a: 'Take characters 5 to 7 of the serial number, ignoring dashes, and look them up in Bosch\'s date-code table. In 399A-720-000031-8733942691 the code is 720, which is April 2017. Codes 240 to 480 cover April 2022 to December 2024.',
    },
    {
      q: 'What size is my Bosch IDS heat pump?',
      a: 'The two digits after the dash are the nominal capacity in thousands of Btu/h: 24 is 2 tons, 36 is 3 tons, 48 is 4 tons, 60 is 5 tons. Bosch also rates 36 outdoor units with 24 air handlers at 24,000 Btu/h, so check that the indoor model has the same size code.',
    },
    {
      q: 'What is the difference between BOVA and BOVB?',
      a: 'Both are Bosch outdoor (O) vertical-discharge (V) condensing units. The fourth letter is the series, A or B. Bosch\'s chart lists the two series without explaining the difference, so compare the rest of the model and the spec sheet for your unit.',
    },
    {
      q: 'What do RTB and RXB mean on a Bosch model?',
      a: 'R is a regular heat pump (M would be Max Performance, X AC only). T means connected, with the internet gateway, and X means non-connected. B is R-454B refrigerant. So a BOVB-36RTB-M20S is a connected R-454B heat pump and a BIVA-24RXB-M15X is a non-connected R-454B air handler.',
    },
    {
      q: 'How long is the Bosch heat pump warranty?',
      a: '10 years on compressors and internal components for the original purchaser of a home installation, with the gateway covered for 2 years. Registering within 90 days adds a 90-day labor allowance. Commercial installs get 3 years on the compressor and 1 year on other parts.',
    },
  ],
  serialOptions: [{ label: 'Bosch', rule: 'bosch-date-table' }],
  notCovered: [
    'BMAC cased coil model positions (for example BMAC2430ABTA). The coil documents list the models but no nomenclature chart, so they are not decoded here.',
    'Bosch Climate 5000 and IDS Edge ductless and multi-zone units (BMS500, BOHA, BISA, BIKA, BIDA). Their current submittal sheets do not include a nomenclature chart we could transcribe.',
    'Older R-410A IDS model formats such as BOVA-36HDN1-M15G and BVA/BVB air handlers. Their codes are outside the R-454B charts above.',
    'What the A and B series letters stand for, and what the first four characters and the tail of the serial number mean. Bosch does not publish them.',
    'Air handler tier code 18, because two Bosch charts give it different meanings.',
    'Plant or factory codes. Bosch does not publish them.',
    'Bosch gas furnace registration windows. The BGH97 sheet summarises the registered terms without a deadline, so check Bosch\'s furnace warranty certificate.',
    'Water-source and geothermal heat pumps, boilers and water heaters.',
  ],
  updated: '2026-11-10',
};
