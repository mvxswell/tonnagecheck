// Rebate / credit check shown on the scorecard. Statements here are limited to what the cited primary
// sources say; amounts that depend on a state program are never presented as guaranteed.
import { SOURCES } from '../data/sources';
import type { SystemType } from '../data/equipment';
import { STATE_NAMES, stateForZip } from './zip3';

export interface RebateItem {
  name: string;
  status: 'not-available' | 'check' | 'possible';
  detail: string;
  links: { label: string; url: string }[];
}

export function rebateCheck(systemType: SystemType, zip: string, energyStarMatched: boolean): RebateItem[] {
  const st = stateForZip(zip);
  const stateName = st ? STATE_NAMES[st] : null;
  const isHeatPump = systemType !== 'ac-furnace';
  const items: RebateItem[] = [
    {
      name: 'Federal 25C tax credit',
      status: 'not-available',
      detail: 'Ended. The IRS lists 25C as not allowed for property placed in service after Dec. 31, 2025. A 2026 installation does not qualify, whatever a salesperson says. (Systems installed in 2025 could claim up to $2,000 for a qualifying heat pump on a 2025 return.)',
      links: [{ label: 'IRS: OBBB provisions', url: SOURCES.irsObbba.url }, { label: 'IRS: 25C', url: SOURCES.irs25c.url }],
    },
    isHeatPump
      ? {
          name: 'HEAR / HEEHR point-of-sale rebate (IRA § 50122)',
          status: 'check',
          detail: `Income-qualified only: households under 150% of area median income. Federal law caps it at $8,000 for a heat pump (100% of cost under 80% AMI, 50% from 80–150% AMI). Since DOE Program Notice 26-2 (May 2026) it no longer pays for fuel switching: it covers replacing existing electric heating or cooling (for example electric resistance heat or an old heat pump) with a more efficient electric system, not replacing a gas, oil or propane furnace, and homes must address insulation and air sealing first unless already adequate. It is run by ${stateName ? `the ${stateName}` : 'your state'} energy office, and availability and rules vary by state.`,
          links: [{ label: '42 U.S.C. § 18795a', url: SOURCES.hearStatute.url }, { label: 'DOE Program Notice 26-2', url: SOURCES.doePn262.url }, ...(stateName ? [{ label: `${stateName} energy prices & rebates`, url: `/states/${stateName.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '')}/` }] : [{ label: 'Find your state energy office', url: SOURCES.naseo.url }])],
        }
      : {
          name: 'HEAR / HEEHR point-of-sale rebate (IRA § 50122)',
          status: 'not-available',
          detail: 'Covers heat pumps, not central air conditioners or gas furnaces. Since DOE Program Notice 26-2 (May 2026) it also no longer pays to replace a gas furnace with a heat pump; it is limited to upgrading existing electric equipment.',
          links: [{ label: '42 U.S.C. § 18795a', url: SOURCES.hearStatute.url }, { label: 'DOE Program Notice 26-2', url: SOURCES.doePn262.url }],
        },
    {
      name: 'Utility and state rebates',
      status: 'possible',
      detail: `Utilities and states run their own heat pump and AC rebates with their own equipment lists.${energyStarMatched ? ' At least one matched system here is in the ENERGY STAR database, which many programs require.' : ''} Some programs can be combined and some cannot, and some need pre-approval, so read the terms before you sign.`,
      links: [
        { label: 'ENERGY STAR Rebate Finder', url: SOURCES.esRebateFinder.url },
        { label: 'DSIRE incentives for your ZIP', url: /^\d{5}$/.test(zip) ? `${SOURCES.dsire.url}?zipcode=${zip}` : SOURCES.dsire.url },
      ],
    },
  ];
  return items;
}
