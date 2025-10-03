
import { Cow, SyncMethod, Reminder, Analytics } from '../types';

export const mockCows: Cow[] = [
  {
    id: '1',
    name: 'Bessie',
    breed: 'Holstein',
    age: 4,
    lastSyncDate: '2024-05-15',
    healthNotes: 'Good overall health, responds well to synchronization',
    status: 'active',
    reminders: []
  },
  {
    id: '2',
    name: 'Daisy',
    breed: 'Jersey',
    age: 3,
    lastSyncDate: '2024-05-20',
    healthNotes: 'Slightly low body condition, monitor nutrition',
    status: 'pregnant',
    reminders: []
  },
  {
    id: '3',
    name: 'Luna',
    breed: 'Angus',
    age: 5,
    lastSyncDate: '2024-05-18',
    healthNotes: 'Previous difficult calving, extra monitoring needed',
    status: 'active',
    reminders: []
  },
  {
    id: '4',
    name: 'Rosie',
    breed: 'Simmental',
    age: 2,
    lastSyncDate: '2024-05-22',
    healthNotes: 'First synchronization, monitor closely',
    status: 'active',
    reminders: []
  },
  {
    id: '5',
    name: 'Bella',
    breed: 'Holstein',
    age: 3,
    lastSyncDate: '2024-05-25',
    healthNotes: 'Excellent reproductive history',
    status: 'active',
    reminders: []
  },
  {
    id: '6',
    name: 'Moo-nique',
    breed: 'Jersey',
    age: 4,
    lastSyncDate: '2024-05-19',
    healthNotes: 'Minor lameness, monitor during procedures',
    status: 'active',
    reminders: []
  },
  {
    id: '7',
    name: 'Buttercup',
    breed: 'Guernsey',
    age: 2,
    lastSyncDate: '2024-05-23',
    healthNotes: 'First-time breeder, requires gentle handling',
    status: 'active',
    reminders: []
  },
  {
    id: '8',
    name: 'Clover',
    breed: 'Brown Swiss',
    age: 5,
    lastSyncDate: '2024-05-21',
    healthNotes: 'High milk producer, excellent health',
    status: 'active',
    reminders: []
  }
];

export const mockReminders: Reminder[] = [
  // Today's reminders (2024-06-02)
  {
    id: '1',
    cowId: '1',
    title: 'GnRH Injection',
    description: 'Administer GnRH injection for Ovsynch protocol - Day 0',
    dueDate: '2024-06-02',
    completed: false,
    priority: 'high',
    type: 'injection',
    syncMethodId: 'ovsynch',
    syncStepId: '1',
    estimatedCowCount: 4,
    workforceSnapshot: {
      workers: 1,
      technicians: 1,
      doctors: 0
    }
  },
  {
    id: '2',
    cowId: '2',
    title: 'GnRH Injection',
    description: 'Administer GnRH injection for Ovsynch protocol - Day 0',
    dueDate: '2024-06-02',
    completed: false,
    priority: 'high',
    type: 'injection',
    syncMethodId: 'ovsynch',
    syncStepId: '1'
  },
  {
    id: '3',
    cowId: '5',
    title: 'CIDR Insertion',
    description: 'Insert CIDR device and administer GnRH - Day 0',
    dueDate: '2024-06-02',
    completed: false,
    priority: 'high',
    type: 'custom',
    syncMethodId: 'cidr',
    syncStepId: '1'
  },
  {
    id: '4',
    cowId: '6',
    title: 'Pregnancy Check',
    description: 'Ultrasound examination to confirm pregnancy status',
    dueDate: '2024-06-02',
    completed: false,
    priority: 'medium',
    type: 'checkup'
  },

  // Tomorrow's reminders (2024-06-03)
  {
    id: '5',
    cowId: '3',
    title: 'Heat Detection',
    description: 'Monitor for signs of estrus - Select Synch protocol',
    dueDate: '2024-06-03',
    completed: false,
    priority: 'medium',
    type: 'checkup',
    syncMethodId: 'selectsynch',
    syncStepId: '3'
  },
  {
    id: '6',
    cowId: '7',
    title: 'CIDR Insertion',
    description: 'Insert CIDR device and administer GnRH',
    dueDate: '2024-06-03',
    completed: false,
    priority: 'high',
    type: 'custom',
    syncMethodId: 'cidr',
    syncStepId: '1'
  },

  // Day after tomorrow (2024-06-04)
  {
    id: '7',
    cowId: '4',
    title: 'Artificial Insemination',
    description: 'Perform AI with selected bull semen - timing critical',
    dueDate: '2024-06-04',
    completed: false,
    priority: 'high',
    type: 'ai',
    syncMethodId: 'ovsynch',
    syncStepId: '4'
  },
  {
    id: '8',
    cowId: '8',
    title: 'GnRH Injection',
    description: 'Second GnRH injection for Ovsynch protocol - Day 9',
    dueDate: '2024-06-04',
    completed: false,
    priority: 'high',
    type: 'injection',
    syncMethodId: 'ovsynch',
    syncStepId: '3'
  },

  // Week ahead reminders
  {
    id: '9',
    cowId: '1',
    title: 'PGF2α Injection',
    description: 'Administer PGF2α injection - Ovsynch Day 7',
    dueDate: '2024-06-09',
    completed: false,
    priority: 'high',
    type: 'injection',
    syncMethodId: 'ovsynch',
    syncStepId: '2'
  },
  {
    id: '10',
    cowId: '2',
    title: 'PGF2α Injection',
    description: 'Administer PGF2α injection - Ovsynch Day 7',
    dueDate: '2024-06-09',
    completed: false,
    priority: 'high',
    type: 'injection',
    syncMethodId: 'ovsynch',
    syncStepId: '2'
  },
  {
    id: '11',
    cowId: '5',
    title: 'CIDR Removal + PGF2α',
    description: 'Remove CIDR device and inject PGF2α - Day 7',
    dueDate: '2024-06-09',
    completed: false,
    priority: 'high',
    type: 'custom',
    syncMethodId: 'cidr',
    syncStepId: '2'
  },
  {
    id: '12',
    cowId: '7',
    title: 'CIDR Removal + PGF2α',
    description: 'Remove CIDR device and inject PGF2α - Day 7',
    dueDate: '2024-06-10',
    completed: false,
    priority: 'high',
    type: 'custom',
    syncMethodId: 'cidr',
    syncStepId: '2'
  },
  {
    id: '13',
    cowId: '3',
    title: 'Artificial Insemination',
    description: 'AI based on heat detection - Select Synch protocol',
    dueDate: '2024-06-05',
    completed: false,
    priority: 'high',
    type: 'ai',
    syncMethodId: 'selectsynch',
    syncStepId: '4'
  },
  {
    id: '14',
    cowId: '1',
    title: 'Second GnRH Injection',
    description: 'Administer second GnRH injection - Ovsynch Day 9',
    dueDate: '2024-06-11',
    completed: false,
    priority: 'high',
    type: 'injection',
    syncMethodId: 'ovsynch',
    syncStepId: '3'
  },
  {
    id: '15',
    cowId: '2',
    title: 'Second GnRH Injection',
    description: 'Administer second GnRH injection - Ovsynch Day 9',
    dueDate: '2024-06-11',
    completed: false,
    priority: 'high',
    type: 'injection',
    syncMethodId: 'ovsynch',
    syncStepId: '3'
  },
  {
    id: '16',
    cowId: '5',
    title: 'Artificial Insemination',
    description: 'Perform timed AI - CIDR protocol completion',
    dueDate: '2024-06-11',
    completed: false,
    priority: 'high',
    type: 'ai',
    syncMethodId: 'cidr',
    syncStepId: '4'
  },
  {
    id: '17',
    cowId: '7',
    title: 'Artificial Insemination',
    description: 'Perform timed AI - CIDR protocol completion',
    dueDate: '2024-06-12',
    completed: false,
    priority: 'high',
    type: 'ai',
    syncMethodId: 'cidr',
    syncStepId: '4'
  },
  {
    id: '18',
    cowId: '1',
    title: 'Artificial Insemination',
    description: 'Perform timed AI 16-20 hours after second GnRH',
    dueDate: '2024-06-12',
    completed: false,
    priority: 'high',
    type: 'ai',
    syncMethodId: 'ovsynch',
    syncStepId: '4'
  },
  {
    id: '19',
    cowId: '2',
    title: 'Artificial Insemination',
    description: 'Perform timed AI 16-20 hours after second GnRH',
    dueDate: '2024-06-12',
    completed: false,
    priority: 'high',
    type: 'ai',
    syncMethodId: 'ovsynch',
    syncStepId: '4'
  },
  {
    id: '20',
    cowId: '6',
    title: 'Follow-up Pregnancy Check',
    description: 'Second pregnancy confirmation via palpation',
    dueDate: '2024-06-06',
    completed: false,
    priority: 'medium',
    type: 'checkup'
  },
  {
    id: '21',
    cowId: '8',
    title: 'Health Assessment',
    description: 'Routine health check and body condition scoring',
    dueDate: '2024-06-07',
    completed: false,
    priority: 'low',
    type: 'checkup'
  },
  {
    id: '22',
    cowId: '4',
    title: 'Post-AI Monitoring',
    description: 'Monitor for signs of successful insemination',
    dueDate: '2024-06-08',
    completed: false,
    priority: 'medium',
    type: 'checkup'
  }
];

export const predefinedSyncMethods: SyncMethod[] = [
  {
    id: 'ovsynch',
    name: 'Ovsynch',
    description: 'Standard Ovsynch protocol for timed AI',
    duration: 10,
    isCustom: false,
    hasWorkforceSettings: true,
    steps: [
      {
        id: '1',
        day: 0,
        title: 'GnRH Injection',
        description: 'Administer GnRH (100 μg) intramuscularly',
        hormoneType: 'GnRH',
        workforceRequirements: {
          worker_per_cows: 20,
          technician_per_cows: 15,
          doctor_per_cows: undefined
        }
      },
      {
        id: '2',
        day: 7,
        title: 'PGF2α Injection',
        description: 'Administer PGF2α (25 mg) intramuscularly',
        hormoneType: 'PGF2α',
        workforceRequirements: {
          worker_per_cows: 20,
          technician_per_cows: 15,
          doctor_per_cows: undefined
        }
      },
      {
        id: '3',
        day: 9,
        title: 'GnRH Injection',
        description: 'Second GnRH injection (100 μg)',
        hormoneType: 'GnRH',
        workforceRequirements: {
          worker_per_cows: 20,
          technician_per_cows: 15,
          doctor_per_cows: undefined
        }
      },
      {
        id: '4',
        day: 10,
        title: 'Artificial Insemination',
        description: 'Perform timed AI 16-20 hours after second GnRH',
        notes: 'Use high-quality semen from selected bull',
        workforceRequirements: {
          worker_per_cows: undefined,
          technician_per_cows: 10,
          doctor_per_cows: undefined
        }
      }
    ]
  },
  {
    id: 'cidr',
    name: 'CIDR Protocol',
    description: 'CIDR-based synchronization protocol',
    duration: 9,
    isCustom: false,
    hasWorkforceSettings: true,
    steps: [
      {
        id: '1',
        day: 0,
        title: 'CIDR Insertion',
        description: 'Insert CIDR device and administer GnRH',
        hormoneType: 'GnRH',
        workforceRequirements: {
          worker_per_cows: 15,
          technician_per_cows: 12,
          doctor_per_cows: undefined
        }
      },
      {
        id: '2',
        day: 7,
        title: 'CIDR Removal + PGF2α',
        description: 'Remove CIDR and inject PGF2α',
        hormoneType: 'PGF2α',
        workforceRequirements: {
          worker_per_cows: 15,
          technician_per_cows: 12,
          doctor_per_cows: undefined
        }
      },
      {
        id: '3',
        day: 8,
        title: 'Heat Detection',
        description: 'Monitor for signs of estrus',
        notes: 'Use heat detection aids if available',
        workforceRequirements: {
          worker_per_cows: 25,
          technician_per_cows: undefined,
          doctor_per_cows: undefined
        }
      },
      {
        id: '4',
        day: 9,
        title: 'Artificial Insemination',
        description: 'AI based on heat detection or timed protocol',
        workforceRequirements: {
          worker_per_cows: undefined,
          technician_per_cows: 10,
          doctor_per_cows: undefined
        }
      }
    ]
  },
  {
    id: 'selectsynch',
    name: 'Select Synch',
    description: 'Modified synchronization with heat detection',
    duration: 10,
    isCustom: false,
    hasWorkforceSettings: false,
    steps: [
      {
        id: '1',
        day: 0,
        title: 'GnRH Injection',
        description: 'First GnRH injection',
        hormoneType: 'GnRH'
      },
      {
        id: '2',
        day: 7,
        title: 'PGF2α Injection',
        description: 'Prostaglandin injection',
        hormoneType: 'PGF2α'
      },
      {
        id: '3',
        day: 8,
        title: 'Heat Detection Begins',
        description: 'Start monitoring for estrus signs'
      },
      {
        id: '4',
        day: 10,
        title: 'AI or GnRH',
        description: 'AI if in heat, otherwise GnRH + timed AI'
      }
    ]
  }
];

export const mockAnalytics: Analytics = {
  totalCows: 8,
  activeReminders: 22,
  completedSyncs: 12,
  pregnancyRate: 78,
  complianceRate: 94
};

export const pregnancyRateData = [
  { month: 'Jan', rate: 72 },
  { month: 'Feb', rate: 75 },
  { month: 'Mar', rate: 78 },
  { month: 'Apr', rate: 82 },
  { month: 'May', rate: 78 },
  { month: 'Jun', rate: 80 }
];

export const protocolUsageData = [
  { name: 'Ovsynch', value: 45, color: '#1e40af' },
  { name: 'CIDR', value: 30, color: '#16a34a' },
  { name: 'Select Synch', value: 15, color: '#eab308' },
  { name: 'Custom', value: 10, color: '#dc2626' }
];

export const complianceData = [
  { day: 'Mon', compliance: 95 },
  { day: 'Tue', compliance: 92 },
  { day: 'Wed', compliance: 98 },
  { day: 'Thu', compliance: 90 },
  { day: 'Fri', compliance: 96 },
  { day: 'Sat', compliance: 88 },
  { day: 'Sun', compliance: 94 }
];
