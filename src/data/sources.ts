// Every non-price claim the site makes (tax credits, rebates, efficiency criteria, cost benchmarks) points
// at one of these. Each URL was checked to load when it was added; quotes are short and verbatim.

export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string;
  note?: string;
}

export const SOURCES = {
  irs25c: {
    id: 'irs25c',
    title: 'Energy Efficient Home Improvement Credit (Section 25C)',
    publisher: 'Internal Revenue Service',
    url: 'https://www.irs.gov/credits-deductions/energy-efficient-home-improvement-credit',
    note: 'Was $2,000 per year for qualifying heat pumps; property had to be placed in service by December 31, 2025.',
  },
  irsObbba: {
    id: 'irsObbba',
    title: 'One, Big, Beautiful Bill provisions: home energy credit expirations (Sections 70505–70507)',
    publisher: 'Internal Revenue Service',
    url: 'https://www.irs.gov/newsroom/one-big-beautiful-bill-provisions',
    note: '25C is "Not allowed for any property placed in service after Dec. 31, 2025."',
  },
  hearStatute: {
    id: 'hearStatute',
    title: '42 U.S.C. § 18795a: High-efficiency electric home rebate program (IRA § 50122)',
    publisher: 'Legal Information Institute, Cornell Law School',
    url: 'https://www.law.cornell.edu/uscode/text/42/18795a',
    note: 'Up to $8,000 for a heat pump for space heating or cooling; $14,000 total cap; 100% of cost below 80% of area median income, 50% from 80% to 150%.',
  },
  doeRebates: {
    id: 'doeRebates',
    title: 'Home Energy Rebates Programs (HOMES and HEEHR/HEAR)',
    publisher: 'U.S. Department of Energy',
    url: 'https://www.energy.gov/scep/home-energy-rebates-programs',
    note: 'Rebates are run by state, territory and Tribal energy offices; DOE says to contact your state energy office for status.',
  },
  naseo: {
    id: 'naseo',
    title: 'State Energy Offices directory',
    publisher: 'National Association of State Energy Officials',
    url: 'https://www.naseo.org/state-energy-offices',
  },
  dsire: {
    id: 'dsire',
    title: 'DSIRE database of state and utility incentives',
    publisher: 'NC Clean Energy Technology Center',
    url: 'https://programs.dsireusa.org/system/program',
  },
  esRebateFinder: {
    id: 'esRebateFinder',
    title: 'ENERGY STAR Rebate Finder',
    publisher: 'U.S. EPA ENERGY STAR',
    url: 'https://www.energystar.gov/rebate-finder',
  },
  esCriteria: {
    id: 'esCriteria',
    title: 'Air-Source Heat Pumps: key product criteria',
    publisher: 'U.S. EPA ENERGY STAR',
    url: 'https://www.energystar.gov/products/air_source_heat_pumps/key-product-criteria',
    note: 'Split systems: ≥ 7.8 HSPF2, ≥ 15.2 SEER2, ≥ 11.0 EER2. Cold climate (ducted): ≥ 8.1 HSPF2 and COP at 5°F ≥ 1.75.',
  },
  esApi: {
    id: 'esApi',
    title: 'ENERGY STAR Certified Air-Source Heat Pumps dataset (w7cv-9xjt)',
    publisher: 'U.S. EPA ENERGY STAR, data.energystar.gov',
    url: 'https://data.energystar.gov/Active-Specifications/ENERGY-STAR-Certified-Air-Source-Heat-Pumps/w7cv-9xjt',
  },
  ahri: {
    id: 'ahri',
    title: 'AHRI Directory of Certified Product Performance',
    publisher: 'Air-Conditioning, Heating, and Refrigeration Institute',
    url: 'https://www.ahridirectory.org/',
  },
  remdb: {
    id: 'remdb',
    title: 'National Residential Efficiency Measures Database (REMDB)',
    publisher: 'National Laboratory of the Rockies (formerly NREL), U.S. DOE',
    url: 'https://remdb.nlr.gov/',
    note: 'Installed-cost regressions in 2023 dollars; heat pump data from "LBNL Regressions, August 2024".',
  },
  fredCpi: {
    id: 'fredCpi',
    title: 'Consumer Price Index for All Urban Consumers (CPIAUCSL)',
    publisher: 'U.S. Bureau of Labor Statistics via FRED, Federal Reserve Bank of St. Louis',
    url: 'https://fred.stlouisfed.org/series/CPIAUCSL',
  },
  doePn262: {
    id: 'doePn262',
    title: 'Home Energy Rebates Program Notice 26-2: HEEHR program for states and territories (May 2026)',
    publisher: 'U.S. Department of Energy',
    url: 'https://www.energy.gov/documents/program-notice-26-2',
    note: 'Removes fuel-switching from HEEHR (rebates only for upgrading existing electric equipment to more efficient electric equipment), requires insulation and air sealing first unless already adequate, and gives launched programs three months to comply.',
  },
  homesStatute: {
    id: 'homesStatute',
    title: '42 U.S.C. § 18795: HOMES whole-house energy savings rebates (IRA § 50121)',
    publisher: 'Legal Information Institute, Cornell Law School',
    url: 'https://www.law.cornell.edu/uscode/text/42/18795',
    note: 'Single-family: lesser of $2,000 or 50% of cost for 20–35% modeled savings, $4,000 or 50% for 35%+; under 80% AMI: $4,000 / $8,000 or 80% of cost. May not be combined with another federal rebate (including HEEHR) for the same single upgrade.',
  },
  eiaElectricity: {
    id: 'eiaElectricity',
    title: 'Electric Power Monthly, Table 5.6.B: average price of electricity by state, year to date',
    publisher: 'U.S. Energy Information Administration',
    url: 'https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_b',
  },
  eiaGas: {
    id: 'eiaGas',
    title: 'Price of natural gas delivered to residential consumers, by state (annual)',
    publisher: 'U.S. Energy Information Administration',
    url: 'https://www.eia.gov/dnav/ng/ng_pri_sum_a_EPG0_PRS_dmcf_a.htm',
  },
  eiaHeatContent: {
    id: 'eiaHeatContent',
    title: 'Heat content of natural gas delivered to consumers, by state (annual)',
    publisher: 'U.S. Energy Information Administration',
    url: 'https://www.eia.gov/dnav/ng/ng_cons_heat_a_EPG0_VGTH_btucf_a.htm',
  },
  pnnlClimateZones: {
    id: 'pnnlClimateZones',
    title: 'Guide to Determining Climate Zone by County: Building America and IECC 2021 Updates (PNNL-33270)',
    publisher: 'Pacific Northwest National Laboratory for the U.S. Department of Energy',
    url: 'https://www.pnnl.gov/publications/guide-determining-climate-zone-county-building-america-and-iecc-2021-updates',
  },
  bascColdClimate: {
    id: 'bascColdClimate',
    title: 'Cold Climate Heat Pump Sizing and Selection',
    publisher: 'Building America Solution Center (U.S. DOE; content by PNNL)',
    url: 'https://basc.pnnl.gov/resource-guides/cold-climate-heat-pump-sizing-and-selection',
    note: 'In climate zones 4 and above, "cold-climate heat pumps should be utilized if a significant portion of the heating load is to be met by the heat pump"; sizing is more sensitive in zones 5–8.',
  },
  censusCounties: {
    id: 'censusCounties',
    title: '2020 national county list (FIPS codes)',
    publisher: 'U.S. Census Bureau',
    url: 'https://www2.census.gov/geo/docs/reference/codes2020/national_county2020.txt',
  },
  hvacdirect: {
    id: 'hvacdirect',
    title: 'HVACDirect.com product listings',
    publisher: 'HVACDirect',
    url: 'https://hvacdirect.com/',
  },
  alpine: {
    id: 'alpine',
    title: 'Alpine Home Air Products listings',
    publisher: 'Alpine Home Air Products',
    url: 'https://www.alpinehomeair.com/',
  },
} satisfies Record<string, Source>;

export type SourceId = keyof typeof SOURCES;
