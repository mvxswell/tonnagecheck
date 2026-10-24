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
