import {
  Activity,
  AlertCircle,
  Briefcase,
  CalendarClock,
  ChartColumnBig,
  ClipboardCheck,
  ClipboardList,
  ClipboardPenLine,
  FileBarChart,
  FileText,
  HeartPulse,
  Layers,
  Lightbulb,
  LineChart,
  ListChecks,
  Network,
  ScrollText,
  Settings,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from 'lucide-react';

import { UserRole } from '@/types';

import { RoleLandingConfig } from './types';

export const ROLE_LANDING_CONFIGS: Record<UserRole, RoleLandingConfig> = {
  admin: {
    role: 'admin',
    hero: {
      eyebrow: 'Command Center Overview',
      title: 'System administration cockpit',
      subtitle: 'Monitor infrastructure health, security posture, and mission-critical telemetry in one harmonized surface.',
      description:
        'These launch pads will be swapped with real-time observability widgets as backend data streams are linked. Meanwhile, they communicate the hierarchy and intent of the final experience.',
      metrics: [
        {
          id: 'platform-uptime',
          label: 'Platform Uptime',
          value: '99.98%',
          hint: 'rolling 30d',
          delta: { label: '+0.02%', trend: 'up' },
        },
        {
          id: 'active-users',
          label: 'Active Sessions',
          value: '1,284',
          hint: 'global',
          delta: { label: '-32 vs yesterday', trend: 'down' },
        },
        {
          id: 'alerts-open',
          label: 'Open Alerts',
          value: '12',
          delta: { label: 'stable', trend: 'stable' },
        },
        {
          id: 'deployments',
          label: 'Deployments Today',
          value: '4',
          hint: 'automation',
          delta: { label: '+1', trend: 'up' },
        },
      ],
      callToAction: {
        primaryLabel: 'Review System Health',
        secondaryLabel: 'Open Audit Console',
      },
    },
    tabs: [
      {
        id: 'observability',
        label: 'Observability',
        description: 'Infrastructure and performance signals tuned for rapid triage.',
        icon: Network,
        sections: [
          {
            id: 'live-health',
            title: 'Live technical pulse',
            description:
              'Visual placeholders replicate the planned telemetry layout for uptime, latency, and throughput analytics. Wire these to monitoring APIs when available.',
            widgets: [
              {
                id: 'admin-performance-chart',
                type: 'chart',
                title: 'Latency trendlines',
                description: 'Swap with production-grade charts from the analytics service to track request performance.',
                note: 'TODO: Hook into /api/admin/metrics for real latency series.',
              },
              {
                id: 'admin-stats-kpis',
                type: 'stats',
                title: 'Core system vitals',
                description: 'Surface CPU, memory, disk, and network saturation once telemetry ingestion is ready.',
              },
              {
                id: 'admin-alerts-timeline',
                type: 'timeline',
                title: 'Critical incident timeline',
                description: 'Integrate with alerting pipeline to show escalations and resolution progress.',
              },
            ],
          },
        ],
      },
      {
        id: 'compliance',
        label: 'Compliance',
        description: 'Audit readiness snapshots and policy oversight.',
        icon: ShieldCheck,
        sections: [
          {
            id: 'policy-coverage',
            title: 'Policy coverage & controls',
            description:
              'Communicate coverage status across authentication, authorization, and data protection controls.',
            widgets: [
              {
                id: 'policy-kpi',
                type: 'kpi',
                title: 'Policy adherence KPIs',
                description: 'Connect to compliance scoring service to populate risk posture and control coverage.',
              },
              {
                id: 'audit-readiness',
                type: 'list',
                title: 'Audit readiness checklist',
                description: 'Represents the checklists auditors expect. Replace list items with live compliance tasks.',
              },
              {
                id: 'audit-calendar',
                type: 'calendar',
                title: 'Upcoming compliance events',
                description: 'Populate with certification renewals, vendor audits, and quarterly controls testing.',
              },
            ],
          },
        ],
      },
      {
        id: 'operations',
        label: 'Operations',
        description: 'Governance of deployments and configuration changes.',
        icon: Settings,
        sections: [
          {
            id: 'deployment-oversight',
            title: 'Deployment oversight',
            description:
              'Provide teams with traceability from code deploy to infrastructure impact. Wire up to CI/CD audit tables later.',
            widgets: [
              {
                id: 'ops-timeline',
                type: 'timeline',
                title: 'Release & change log',
                description: 'Slot in GitOps or CI/CD timeline feed for change visibility.',
              },
              {
                id: 'ops-kpi',
                type: 'kpi',
                title: 'Change success metrics',
                description: 'Future metrics: change failure rate, mean time to restore, and automated rollout coverage.',
              },
              {
                id: 'ops-list',
                type: 'list',
                title: 'Pending approvals',
                description: 'Connect to change-management queue for approval workflows.',
              },
            ],
          },
        ],
      },
    ],
    recommendations: [
      'Review security anomalies flagged in the last 24 hours.',
      'Schedule infrastructure failover test for next maintenance window.',
      'Validate backup integrity reports before quarter-end audit.',
    ],
  },

  manager: {
    role: 'manager',
    hero: {
      eyebrow: 'Operational Leadership',
      title: 'Farm oversight & workforce orchestration',
      subtitle: 'Plan daily execution, monitor team load, and respond to herd health signals with confidence.',
      metrics: [
        {
          id: 'herd-size',
          label: 'Herd Size',
          value: '842',
          hint: 'active cows',
          delta: { label: '+6 new heifers', trend: 'up' },
        },
        {
          id: 'tasks-complete',
          label: 'Tasks Completed',
          value: '78%',
          hint: 'today',
          delta: { label: '+4% vs avg', trend: 'up' },
        },
        {
          id: 'staff-coverage',
          label: 'Staff Coverage',
          value: '92%',
          delta: { label: '-3% staffing', trend: 'down' },
        },
        {
          id: 'feed-inventory',
          label: 'Feed Inventory',
          value: '21 days',
          delta: { label: 'stable', trend: 'stable' },
        },
      ],
      callToAction: {
        primaryLabel: 'Assign Workforce',
        secondaryLabel: 'Open Operations Board',
      },
    },
    tabs: [
      {
        id: 'workforce',
        label: 'Workforce',
        description: 'Staff readiness, scheduling, and workload distribution.',
        icon: Users,
        sections: [
          {
            id: 'coverage-plan',
            title: 'Coverage planner',
            description:
              'These placeholders illustrate workforce visualizations that will connect to WorkforceService forecasts.',
            widgets: [
              {
                id: 'manager-stats',
                type: 'stats',
                title: 'Shift readiness metrics',
                description: 'Replace with live coverage vs requirement stats grouped by role.',
              },
              {
                id: 'manager-calendar',
                type: 'calendar',
                title: 'Shift assignments',
                description: 'Integrate with scheduling module to show staff coverage by role.',
                note: 'TODO: Wire to WorkforceService.getForecastForNextDays.',
              },
              {
                id: 'manager-list',
                type: 'list',
                title: 'Actionable staffing tasks',
                description: 'Surface overtime approvals, shift swaps, and pending confirmations.',
              },
            ],
          },
        ],
      },
      {
        id: 'operations-tab',
        label: 'Operations',
        description: 'Daily operations, tasks, and production outputs.',
        icon: Briefcase,
        sections: [
          {
            id: 'task-progress',
            title: 'Task execution status',
            description:
              'Communicate progress against scheduled herd management tasks before wiring in live reminder data.',
            widgets: [
              {
                id: 'manager-chart',
                type: 'chart',
                title: 'Task completion trends',
                description: 'Will be replaced with reminders completion rate across categories.',
              },
              {
                id: 'manager-timeline',
                type: 'timeline',
                title: 'Operational highlights',
                description: 'Show late tasks, escalations, or milestone completions once event stream is ready.',
              },
              {
                id: 'manager-kpi',
                type: 'kpi',
                title: 'Production efficiency KPIs',
                description: 'Indicators for milk yield, fertility trends, and budget adherence.',
              },
            ],
          },
        ],
      },
      {
        id: 'planning',
        label: 'Planning',
        description: 'Forward-looking initiatives & resource allocation.',
        icon: CalendarClock,
        sections: [
          {
            id: 'planning-roadmap',
            title: 'Planning roadmap',
            description:
              'Set expectations for strategic planning modules (capital projects, crop rotations, and herd expansion).',
            widgets: [
              {
                id: 'planning-calendar',
                type: 'calendar',
                title: 'Capital project milestones',
                description: 'Populate with budgeting and infrastructure initiatives.',
              },
              {
                id: 'planning-list',
                type: 'list',
                title: 'Budget checkpoints',
                description: 'Tie into finance system to flag budget variances and approvals.',
              },
              {
                id: 'planning-stats',
                type: 'stats',
                title: 'Strategic KPIs',
                description: 'Future metrics: herd growth rate, facility utilization, input cost variance.',
              },
            ],
          },
        ],
      },
    ],
    recommendations: [
      'Review tomorrow’s staffing requirements from WorkforceService.',
      'Synchronize crop feed deliveries with inventory projections.',
      'Analyze reminder backlog to redistribute technician workload.',
    ],
  },

  doctor: {
    role: 'doctor',
    hero: {
      eyebrow: 'Veterinary Care Suite',
      title: 'Precision medicine for herd health',
      subtitle: 'Track patient signals, triage urgent cases, and coordinate treatment rounds seamlessly.',
      metrics: [
        {
          id: 'critical-cases',
          label: 'Critical Cases',
          value: '7',
          hint: 'triage',
          delta: { label: '-2 resolved', trend: 'down' },
        },
        {
          id: 'wellness-score',
          label: 'Wellness Index',
          value: '86',
          hint: '/100',
          delta: { label: '+3 vs last week', trend: 'up' },
        },
        {
          id: 'treatments-today',
          label: 'Treatments Today',
          value: '24',
          delta: { label: '+5 scheduled', trend: 'up' },
        },
        {
          id: 'pregnancy-rate',
          label: 'Pregnancy Rate',
          value: '58%',
          delta: { label: 'stable', trend: 'stable' },
        },
      ],
      callToAction: {
        primaryLabel: 'Open Rounds Planner',
        secondaryLabel: 'Review Critical Alerts',
      },
    },
    tabs: [
      {
        id: 'clinical',
        label: 'Clinical',
        description: 'Medical records, diagnostics, and treatment protocols.',
        icon: Stethoscope,
        sections: [
          {
            id: 'triage-dashboard',
            title: 'Triage dashboard',
            description:
              'Displays placeholders for case severity distribution, high-priority reminders, and treatment outcomes.',
            widgets: [
              {
                id: 'doctor-chart',
                type: 'chart',
                title: 'Condition prevalence',
                description: 'Later connect to health analytics to show disease incidence over time.',
              },
              {
                id: 'doctor-kpi',
                type: 'kpi',
                title: 'Treatment efficacy KPIs',
                description: 'Highlight antibiotic efficacy, recovery time, and complication rates.',
              },
              {
                id: 'doctor-list',
                type: 'list',
                title: 'Critical cases queue',
                description: 'Feed from reminders flagged as urgent medical interventions.',
              },
            ],
          },
        ],
      },
      {
        id: 'scheduling',
        label: 'Scheduling',
        description: 'Treatment calendar and veterinary rounds.',
        icon: CalendarClock,
        sections: [
          {
            id: 'rounds-planning',
            title: 'Rounds planning',
            description:
              'Guide physicians through daily and weekly rounds with centralized scheduling visualizations.',
            widgets: [
              {
                id: 'doctor-calendar',
                type: 'calendar',
                title: 'Treatment sessions',
                description: 'Integrate with ReminderService to auto-populate upcoming procedures.',
              },
              {
                id: 'doctor-timeline',
                type: 'timeline',
                title: 'Follow-up timeline',
                description: 'Show post-treatment checkpoints and diagnostics follow-ups.',
              },
              {
                id: 'doctor-stats',
                type: 'stats',
                title: 'Resource allocation',
                description: 'Represent technician, doctor, and equipment utilization for treatments.',
              },
            ],
          },
        ],
      },
      {
        id: 'research',
        label: 'Research',
        description: 'Breeding insights and protocol optimization.',
        icon: Lightbulb,
        sections: [
          {
            id: 'outcome-analysis',
            title: 'Outcome analysis',
            description:
              'Prepare the stage for comparative studies across AI protocols and reproductive health metrics.',
            widgets: [
              {
                id: 'doctor-research-chart',
                type: 'chart',
                title: 'Protocol success trends',
                description: 'Eventually powered by SyncMethod analytics tracking conception rates.',
              },
              {
                id: 'doctor-research-list',
                type: 'list',
                title: 'Investigation backlog',
                description: 'Log research questions, lab results, and ongoing trials.',
              },
              {
                id: 'doctor-research-kpi',
                type: 'kpi',
                title: 'Innovation KPIs',
                description: 'Track new protocol approvals, average recovery improvement, and research output.',
              },
            ],
          },
        ],
      },
    ],
    recommendations: [
      'Validate post-operative monitoring tasks for high-risk cows.',
      'Coordinate with technicians on sync protocol adjustments.',
      'Log findings from recent pregnancy checks into medical records.',
    ],
  },

  technician: {
    role: 'technician',
    hero: {
      eyebrow: 'Synchronization Operations',
      title: 'Execute synchronization protocols with precision',
      subtitle: 'Control AI workflows, monitor protocol timings, and maintain equipment readiness at a glance.',
      metrics: [
        {
          id: 'pending-ai',
          label: 'Pending AI Procedures',
          value: '36',
          delta: { label: '+4 queued', trend: 'up' },
        },
        {
          id: 'success-rate',
          label: 'Success Rate',
          value: '64%',
          hint: '30-day',
          delta: { label: '+2% vs baseline', trend: 'up' },
        },
        {
          id: 'equipment-status',
          label: 'Equipment Status',
          value: '98%',
          delta: { label: 'stable', trend: 'stable' },
        },
        {
          id: 'protocols-active',
          label: 'Active Protocols',
          value: '5',
          delta: { label: 'stable', trend: 'stable' },
        },
      ],
      callToAction: {
        primaryLabel: 'Launch Procedure Console',
        secondaryLabel: 'Sync Protocol Library',
      },
    },
    tabs: [
      {
        id: 'today',
        label: 'Today',
        description: 'Immediate procedures, reminders, and logistics.',
        icon: ClipboardCheck,
        sections: [
          {
            id: 'procedures',
            title: 'Procedures in focus',
            description:
              'Aligns technicians on the daily caseload. Replace once ReminderService exposes schedule endpoints.',
            widgets: [
              {
                id: 'tech-list',
                type: 'list',
                title: 'Today’s queue',
                description: 'List AI and sync tasks sorted by priority and due time.',
              },
              {
                id: 'tech-calendar',
                type: 'calendar',
                title: 'Timing matrix',
                description: 'Visualize hormone injections, inseminations, and follow-ups.',
              },
              {
                id: 'tech-kpi',
                type: 'kpi',
                title: 'Protocol adherence KPIs',
                description: 'Focus on on-time percentage, completion rate, and exceptions.',
              },
            ],
          },
        ],
      },
      {
        id: 'protocols',
        label: 'Protocols',
        description: 'Standard operating procedures and readiness dashboards.',
        icon: ClipboardList,
        sections: [
          {
            id: 'protocol-library',
            title: 'Protocol library',
            description:
              'Communicate structure of the upcoming protocol repository with readiness, versioning, and training cues.',
            widgets: [
              {
                id: 'tech-stats',
                type: 'stats',
                title: 'Protocol readiness',
                description: 'Show status of SOPs, training completion, and compliance checks.',
              },
              {
                id: 'tech-timeline',
                type: 'timeline',
                title: 'Protocol lifecycle',
                description: 'Represent protocol drafts, approvals, deployments, and reviews.',
              },
              {
                id: 'tech-chart',
                type: 'chart',
                title: 'Outcome comparison',
                description: 'Graph protocol success by breed, season, or technician once data is wired.',
              },
            ],
          },
        ],
      },
      {
        id: 'equipment',
        label: 'Equipment',
        description: 'Instrument readiness and maintenance logs.',
        icon: ClipboardPenLine,
        sections: [
          {
            id: 'upkeep',
            title: 'Equipment upkeep',
            description:
              'Plan instrumentation maintenance and calibration cycles with placeholders for upcoming modules.',
            widgets: [
              {
                id: 'equipment-stats',
                type: 'stats',
                title: 'Maintenance KPIs',
                description: 'Surface calibration compliance, downtime, and inspections.',
              },
              {
                id: 'equipment-calendar',
                type: 'calendar',
                title: 'Maintenance calendar',
                description: 'Schedule cleaning, checks, and replacement cycles.',
              },
              {
                id: 'equipment-list',
                type: 'list',
                title: 'Open work orders',
                description: 'Highlight pending repairs and parts requisitions.',
              },
            ],
          },
        ],
      },
    ],
    recommendations: [
      'Confirm tomorrow’s hormone administration timings.',
      'Run equipment sterilization checklist before evening shift.',
      'Update AI outcomes in breeding records after rounds.',
    ],
  },

  helper: {
    role: 'helper',
    hero: {
      eyebrow: 'Daily Task Hub',
      title: 'Stay on top of herd care responsibilities',
      subtitle: 'Your personalized command center for feeding, cleaning, and daily maintenance priorities.',
      metrics: [
        {
          id: 'tasks-due',
          label: 'Tasks Due',
          value: '14',
          delta: { label: '-3 completed', trend: 'down' },
        },
        {
          id: 'overdue',
          label: 'Overdue Items',
          value: '2',
          delta: { label: 'stable', trend: 'stable' },
        },
        {
          id: 'completed',
          label: 'Completed Today',
          value: '11',
          delta: { label: '+2 vs avg', trend: 'up' },
        },
        {
          id: 'alerts',
          label: 'Alerts',
          value: '1',
          delta: { label: 'feed pen 3', trend: 'stable' },
        },
      ],
      callToAction: {
        primaryLabel: 'View My Task List',
        secondaryLabel: 'Log Work Update',
      },
    },
    tabs: [
      {
        id: 'tasks',
        label: 'Tasks',
        description: 'Assigned work items and completion tracking.',
        icon: ListChecks,
        sections: [
          {
            id: 'task-tracker',
            title: 'Task tracker',
            description:
              'Illustrates the prioritized task list, progress indicators, and quick completion logging.',
            widgets: [
              {
                id: 'helper-list',
                type: 'list',
                title: 'Assigned tasks',
                description: 'Replace with live reminder tasks filtered by assignee from ReminderService.',
              },
              {
                id: 'helper-stats',
                type: 'stats',
                title: 'Progress snapshot',
                description: 'Focus on completion rate, average duration, and priority mix.',
              },
              {
                id: 'helper-kpi',
                type: 'kpi',
                title: 'Quality KPIs',
                description: 'Capture cleanliness score, feeding timeliness, and animal wellness reports.',
              },
            ],
          },
        ],
      },
      {
        id: 'schedule',
        label: 'Schedule',
        description: 'Upcoming duties and shift allocations.',
        icon: CalendarClock,
        sections: [
          {
            id: 'shift-schedule',
            title: 'Shift schedule',
            description:
              'Prepare for integration with workforce scheduling so helpers see their shifts and shared chores.',
            widgets: [
              {
                id: 'helper-calendar',
                type: 'calendar',
                title: 'Weekly overview',
                description: 'Calendar placeholder for assigned shifts and rotational duties.',
              },
              {
                id: 'helper-timeline',
                type: 'timeline',
                title: 'Recent updates',
                description: 'Log feedings, cleanings, and issues to create audit trail of care.',
              },
              {
                id: 'helper-chart',
                type: 'chart',
                title: 'Time allocation',
                description: 'Visualize time spent per chore once telemetry is captured.',
              },
            ],
          },
        ],
      },
      {
        id: 'learning',
        label: 'Learning',
        description: 'Training tips and best practices.',
        icon: Sparkles,
        sections: [
          {
            id: 'training-feed',
            title: 'Training feed',
            description:
              'Motivate helpers with curated guidance tied to their responsibilities and seasonal needs.',
            widgets: [
              {
                id: 'helper-learning-list',
                type: 'list',
                title: 'Skill boosters',
                description: 'Replace with recommended training modules from LMS integration.',
              },
              {
                id: 'helper-learning-kpi',
                type: 'kpi',
                title: 'Progress milestones',
                description: 'Highlight completed certifications, evaluations, and recognition badges.',
              },
              {
                id: 'helper-learning-stats',
                type: 'stats',
                title: 'Learning engagement',
                description: 'Show participation and assessment scores over time.',
              },
            ],
          },
        ],
      },
    ],
    recommendations: [
      'Acknowledge completed feeding rounds to unlock tomorrow’s prep list.',
      'Review cleaning standards update shared by management.',
      'Capture photo evidence for completed maintenance tasks.',
    ],
  },

  office: {
    role: 'office',
    hero: {
      eyebrow: 'Administrative Control',
      title: 'Coordinate communication & logistics',
      subtitle: 'Keep appointments on schedule, manage documentation, and streamline farm-wide messaging.',
      metrics: [
        {
          id: 'appointments-today',
          label: 'Appointments Today',
          value: '18',
          delta: { label: '+3 added', trend: 'up' },
        },
        {
          id: 'messages',
          label: 'Messages Awaiting Reply',
          value: '5',
          delta: { label: '-2 cleared', trend: 'down' },
        },
        {
          id: 'documents',
          label: 'Documents Pending',
          value: '9',
          delta: { label: 'stable', trend: 'stable' },
        },
        {
          id: 'compliance',
          label: 'Compliance Tasks',
          value: '3',
          delta: { label: 'stable', trend: 'stable' },
        },
      ],
      callToAction: {
        primaryLabel: 'Schedule New Appointment',
        secondaryLabel: 'Open Communications Hub',
      },
    },
    tabs: [
      {
        id: 'appointments',
        label: 'Appointments',
        description: 'Scheduling and on-site coordination.',
        icon: CalendarClock,
        sections: [
          {
            id: 'appointment-operations',
            title: 'Appointment operations',
            description:
              'Future-state calendar views, follow-up reminders, and resource reservations for clinic rooms.',
            widgets: [
              {
                id: 'office-calendar',
                type: 'calendar',
                title: 'Daily schedule',
                description: 'Integrate with appointment service to view bookings in real-time.',
              },
              {
                id: 'office-list',
                type: 'list',
                title: 'Check-in queue',
                description: 'Show patients awaiting intake and highlight required paperwork.',
              },
              {
                id: 'office-kpi',
                type: 'kpi',
                title: 'Service KPIs',
                description: 'Track average wait time, no-show rate, and satisfaction scores.',
              },
            ],
          },
        ],
      },
      {
        id: 'communications',
        label: 'Communications',
        description: 'Messaging pipelines and broadcast readiness.',
        icon: FileText,
        sections: [
          {
            id: 'communications-hub',
            title: 'Communications hub',
            description:
              'Represent consolidated inbox, announcements, and outbound campaigns for stakeholder engagement.',
            widgets: [
              {
                id: 'office-stats',
                type: 'stats',
                title: 'Engagement metrics',
                description: 'Populate with open rate, response time, and message volume stats.',
              },
              {
                id: 'office-timeline',
                type: 'timeline',
                title: 'Broadcast timeline',
                description: 'Map message sends, acknowledgements, and follow-up sequences.',
              },
              {
                id: 'office-communications-list',
                type: 'list',
                title: 'Action required messages',
                description: 'Swap with messages awaiting response or signature.',
              },
            ],
          },
        ],
      },
      {
        id: 'records',
        label: 'Records',
        description: 'Documentation and compliance workflows.',
        icon: ScrollText,
        sections: [
          {
            id: 'records-oversight',
            title: 'Records oversight',
            description:
              'Preview the document management experience with placeholders for audits, templates, and routing.',
            widgets: [
              {
                id: 'office-records-chart',
                type: 'chart',
                title: 'Document lifecycle',
                description: 'Future integration with document routing for approvals and expirations.',
              },
              {
                id: 'office-records-list',
                type: 'list',
                title: 'Pending signatures',
                description: 'Show outstanding document approvals once document service is ready.',
              },
              {
                id: 'office-records-stats',
                type: 'stats',
                title: 'Compliance coverage',
                description: 'Surface completed training docs, policy acknowledgements, and audits.',
              },
            ],
          },
        ],
      },
    ],
    recommendations: [
      'Send daily schedule summary to on-call veterinarian.',
      'Upload vaccination certificates from recent herd health check.',
      'Review communications backlog and triage priority responses.',
    ],
  },
};

export const getRoleLandingConfig = (role: UserRole): RoleLandingConfig => {
  return ROLE_LANDING_CONFIGS[role];
};
