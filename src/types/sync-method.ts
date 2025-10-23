export interface SyncMethod {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  isCustom: boolean;
  hasWorkforceSettings: boolean;
  steps: SyncMethodStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncMethodStep {
  id: string;
  title: string;
  description: string;
  notes: string;
  hormoneType: string;
  day: number;
  syncMethodId: string;
  workforceRequirements?: WorkforceRequirements;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkforceRequirements {
  worker_per_cows?: number;
  technician_per_cows?: number;
  doctor_per_cows?: number;
}