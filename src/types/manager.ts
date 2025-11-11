export type ManagerAnalyticsTimeWindow = 'monthly' | 'quarterly' | 'yearly';

export interface ManagerAnalytics {
    totalCows: number;
    activeReminders: number;
    completedSyncs: number;
    pregnancyRate: number;
  timeWindow: ManagerAnalyticsTimeWindow;
  profitToSpending: number;
  profit: number;
  spending: number;
  costBreakdown: {
    feed: number;
    utilities: number;
    maintenance: number;
    deathsAndIllness: number;
    medical: {
      labor: number;
      equipment: number;
    };
    incidentals: number;
  };
  overdueTasks: number;
  overdueReminders: number;
  completionRate: number;
  workforceForecast: Array<{
    date: string;
    workers: number;
    technicians: number;
    doctors: number;
  }>;
  projection: Array<{
    timeHorizon: string;
    forecastedProfit: number;
    forecastedSpending: number;
    recommendedLabor: number;
  }>;
}
