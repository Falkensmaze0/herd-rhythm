import { UserRole } from '@/types';

export interface MockUserData {
  id: string;
  name: string;
  email: string;
  password: string; // This will be hashed during seeding
  role: UserRole;
  isActive: boolean;
  timezone: string;
  language: string;
  twoFactorEnabled: boolean;
}

export const mockUsers: MockUserData[] = [
  {
    id: 'admin-001',
    name: 'System Administrator',
    email: 'admin@farm.com',
    password: 'demo123', // Will be hashed during seeding
    role: 'admin',
    isActive: true,
    timezone: 'UTC',
    language: 'en',
    twoFactorEnabled: false,
  },
  {
    id: 'manager-001',
    name: 'Farm Manager',
    email: 'manager@farm.com',
    password: 'demo123',
    role: 'manager',
    isActive: true,
    timezone: 'UTC',
    language: 'en',
    twoFactorEnabled: false,
  },
  {
    id: 'doctor-001',
    name: 'Dr. Sarah Johnson',
    email: 'doctor@farm.com',
    password: 'demo123',
    role: 'doctor',
    isActive: true,
    timezone: 'UTC',
    language: 'en',
    twoFactorEnabled: false,
  },
  {
    id: 'technician-001',
    name: 'AI Technician',
    email: 'technician@farm.com',
    password: 'demo123',
    role: 'technician',
    isActive: true,
    timezone: 'UTC',
    language: 'en',
    twoFactorEnabled: false,
  },
  {
    id: 'helper-001',
    name: 'Farm Helper',
    email: 'helper@farm.com',
    password: 'demo123',
    role: 'helper',
    isActive: true,
    timezone: 'UTC',
    language: 'en',
    twoFactorEnabled: false,
  },
  {
    id: 'office-001',
    name: 'Office Administrator',
    email: 'office@farm.com',
    password: 'demo123',
    role: 'office',
    isActive: true,
    timezone: 'UTC',
    language: 'en',
    twoFactorEnabled: false,
  },
];