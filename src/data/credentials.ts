// Shared source of truth for education and certifications.
//
// These lists were previously duplicated (and had drifted) across
// src/pages/cv.astro and src/pages/about.astro. They now live here so a
// correction is made once. Render them from any page via:
//   import { education, certifications } from '../data/credentials';

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
