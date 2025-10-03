
export interface WorkforceStepRequirement {
  worker_per_cows?: number;
  technician_per_cows?: number;
  doctor_per_cows?: number;
}

export interface WorkforceEnabledSyncStep {
  id: string;
  day: number;
  title: string;
  description: string;
  hormoneType?: string;
  notes?: string;
  workforceRequirements?: WorkforceStepRequirement;
}

export interface WorkforceEnabledSyncMethod {
  id: string;
  name: string;
  description: string;
  steps: WorkforceEnabledSyncStep[];
  duration: number;
  isCustom: boolean;
  hasWorkforceSettings?: boolean;
}
