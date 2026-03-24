import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export type UserRole = 'seeker' | 'employer' | 'admin';

export interface CVData {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    bio: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | '';
  };
  address: {
    country: string;
    city: string;
    district: string;
    streetAddress: string;
    postalCode: string;
    countryId?: number | null;
    cityId?: number | null;
    districtId?: number | null;
  };
  education: Array<{
    id: string;
    institutions: string;
    degreeLevel: string;
    major?: string;
    startYear: string;
    endYear: string;
    description?: string;
    institutionId?: number;
    degreeLevelId?: number;
    majorId?: number;
  }>;
  work: Array<{
    id: string;
    companyName: string;
    jobTitle: string;
    employmentType: string;
    industry: string;
    startYear: string;
    endYear: string;
    isPresent: boolean;
    description?: string;
    jobTitleId?: number;
    employmentTypeId?: number;
    industryId?: number;
  }>;
  skills: Array<{
    id: string;
    skill: string;
    proficiency: string;
    skillId?: number;
    proficiencyId?: number;
  }>;
  certificates: Array<{
    id: string;
    certificate: string;
    issuingOrganization: string;
    issuedYear: string;
    description: string;
    certificateId?: number;
    issuingOrgId?: number;
  }>;
}
