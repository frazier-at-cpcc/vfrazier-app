// Shared source of truth for education, certifications, awards, and service.
//
// These lists were previously duplicated (and had drifted) across
// src/pages/cv.astro and src/pages/about.astro. They now live here so a
// correction is made once. Render them from any page via:
//   import { education, certifications, awards, service } from '../data/credentials';

export interface EducationEntry {
  /** Conferral date, e.g. "May 2025". */
  date: string;
  /** Degree line, matched to the transcript. */
  deg: string;
  /** Conferring institution. */
  inst: string;
  /** Optional honors line, e.g. "Summa Cum Laude · GPA 4.00". */
  honors?: string;
}

// NOTE (edit spec A5): the UNC Charlotte M.Ed. title below is UNVERIFIED
// against a transcript. Do not change its wording without a source. The
// ampersand→"and" normalization here is cosmetic only — it removed pre-existing
// drift between the two pages and does not alter the degree name.
export const education: EducationEntry[] = [
  {
    date: 'May 2025',
    deg: 'Ed.D., Education, Concentration in Instructional Design and Technology',
    inst: 'South College',
    honors: 'Summa Cum Laude · GPA 4.00',
  },
  { date: 'November 2024', deg: 'Ed.S., Instructional Design and Technology', inst: 'South College' },
  { date: 'March 2023', deg: 'M.S., Information Technology Management', inst: 'Western Governors University' },
  { date: 'August 2018', deg: 'M.Ed., Instructional Systems Technology, Training and Development', inst: 'UNC Charlotte' },
  { date: 'May 2014', deg: 'B.M.E., Music Education', inst: 'Wingate University' },
];

// NOTE (edit spec B3): these entries carry no earned dates or active/lapsed
// status yet. Once supplied, render each as
// "Credential name (earned YYYY, expires YYYY)" and move lapsed credentials
// under a "Previously held" subheading. Do not invent dates.
export const certifications: string[] = [
  'CISSP — Certified Information Systems Security Professional (ISC²)',
  'AWS Certified Cloud Practitioner',
  'Nutanix Certified Professional',
  'VMware Certified Cloud Infrastructure Administrator 2024',
  'Double VCP — Data Center Virtualization & Network Virtualization',
  'VMware Carbon Black Endpoint Protection 2020',
  'Fortinet FortiGate 7.4 Operator',
  'CompTIA Network+ ce',
];

export const awards: string[] = [
  'Worldwide Training Delivery Impact Award',
  'Worldwide Sales and Strategy Acceleration Quarterly Award — Accelerator',
  'Team Member Excellence Award',
  'Best of Show — DevLearn DemoFest (2016)',
];

export interface ServiceEntry {
  /** Date range, e.g. "2025 – 2028" or "July 2026 – present". */
  years: string;
  /** The role line, shown on both /cv and /about. */
  body: string;
  /** Elaboration rendered only on the full CV, appended after an em dash. */
  detail?: string;
}

// The GAIT co-PI role is deliberately NOT listed here: it is sponsored
// research, rendered in cv.astro's Sponsored research section (and stated in
// /about's lede), not service.
export const service: ServiceEntry[] = [
  { years: '2025 – 2028', body: 'Faculty Senator, Central Piedmont Community College' },
  {
    years: 'July 2026 – present',
    body: 'Chair, Curriculum Committee, Central Piedmont Community College',
    detail:
      'member since 2025; authored the Curriculum Management and Program Review Committee charter, its RACI model, and program evaluation instruments aligned to SACSCOC and NC Community College System standards',
  },
  { years: '2026 – 2027', body: 'Faculty Readiness Chair, Canvas Implementation Taskforce, Central Piedmont Community College' },
  {
    years: '2017 – present',
    body: 'Advisory Board member, Highland School of Technology (Gastonia, NC)',
    detail: 'eight years of service',
  },
];
