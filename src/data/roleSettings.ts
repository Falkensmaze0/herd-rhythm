import { UserRole } from '@/types';

export type ThemeableScope = 'global' | 'role' | 'shift' | 'system';

interface LayoutPreset {
  id: string;
  title: string;
  description: string;
  focus: string[];
  recommended?: boolean;
}

interface WidgetControl {
  id: string;
  label: string;
  description: string;
  scope: ThemeableScope;
  required?: boolean;
  defaultEnabled?: boolean;
  tags?: string[];
  badges?: string[];
}

interface ToolScope {
  id: string;
  name: string;
  description: string;
  level: 'view' | 'edit' | 'admin';
  surface: string;
  badges?: string[];
}

interface AutomationRule {
  id: string;
  title: string;
  description: string;
  effect: string;
  status?: 'active' | 'draft';
}

export interface RoleSettingsConfig {
  hero: {
    title: string;
    description: string;
    kicker?: string;
  };
  scopeSummary: string[];
  layoutPresets: LayoutPreset[];
  widgetControls: WidgetControl[];
  toolScopes: ToolScope[];
  automationRules: AutomationRule[];
}

export const ROLE_SETTINGS: Record<UserRole, RoleSettingsConfig> = {
  helper: {
    hero: {
      title: 'Helper workspace settings',
      description: 'Tune the task list, vitals widgets, and shift automations that guide herd care routines.',
      kicker: 'Shift toolkit',
    },
    scopeSummary: ['Stable floor coverage', 'Environmental quality', 'Shift logbook'],
    layoutPresets: [
      {
        id: 'task-first',
        title: 'Task-first stream',
        description: 'Compact vitals beside a dense task queue for fast triage during busy shifts.',
        focus: ['Task queue', 'Vitals glance', 'Quick actions'],
        recommended: true,
      },
      {
        id: 'wellness',
        title: 'Wellness watch',
        description: 'Places hydration, environment, and alert widgets at the top for early detection.',
        focus: ['Water watch', 'Env sensors', 'Care backlog'],
      },
      {
        id: 'balanced',
        title: 'Balanced grid',
        description: 'Even two-column layout for crews that rotate between care, cleaning, and maintenance.',
        focus: ['Shift log', 'Task queue', 'Status highlights'],
      },
    ],
    widgetControls: [
      {
        id: 'dailyTasks',
        label: 'Daily task queue',
        description: 'Prioritized assignments with SLA timers and completion controls.',
        scope: 'shift',
        required: true,
      },
      {
        id: 'cowVitals',
        label: 'Cow vitals & hydration',
        description: 'Live water, feed, and environment signal cards.',
        scope: 'shift',
        defaultEnabled: true,
        tags: ['Sensors'],
      },
      {
        id: 'workLog',
        label: 'Shift logbook',
        description: 'Structured log entries for every completed task.',
        scope: 'role',
        defaultEnabled: true,
      },
      {
        id: 'quickActions',
        label: 'Quick actions',
        description: 'One-tap logging buttons for recurring chores.',
        scope: 'shift',
        defaultEnabled: true,
      },
      {
        id: 'waterAlerts',
        label: 'Hydration alerts',
        description: 'Highlights herds or zones below configured thresholds.',
        scope: 'global',
        defaultEnabled: false,
        tags: ['Alerting'],
      },
    ],
    toolScopes: [
      {
        id: 'logbook',
        name: 'Shift logbook',
        description: 'Write and edit entries for feeding, cleaning, and incidents.',
        level: 'edit',
        surface: 'Mobile & tablet',
        badges: ['Audited'],
      },
      {
        id: 'requests',
        name: 'Resource requests',
        description: 'Submit bedding, feed, or tooling requests to office/manager queues.',
        level: 'edit',
        surface: 'Dashboard drawer',
      },
      {
        id: 'playbooks',
        name: 'Task playbooks',
        description: 'Read-only access to SOPs and safety cards.',
        level: 'view',
        surface: 'Inline modal',
      },
      {
        id: 'alerts',
        name: 'Safety briefs',
        description: 'Receive environment and incident alerts for the assigned zone.',
        level: 'view',
        surface: 'Push & in-app',
      },
    ],
    automationRules: [
      {
        id: 'autoPrioritize',
        title: 'Auto-prioritize overdue chores',
        description: 'Promotes tasks that breach their SLA to the top of the queue.',
        effect: 'Reorders queue + sends push notice',
        status: 'active',
      },
      {
        id: 'hydrationWatch',
        title: 'Hydration watch',
        description: 'Flags barns where water sensors drop by 10% in 30 minutes.',
        effect: 'Creates alert + pings technician',
        status: 'active',
      },
      {
        id: 'sanitationEscalation',
        title: 'Sanitation escalation',
        description: 'If cleaning score stays low for 2 shifts, notify manager.',
        effect: 'Escalates to manager dashboard',
        status: 'draft',
      },
    ],
  },
  manager: {
    hero: {
      title: 'Manager workspace settings',
      description: 'Control roster, compliance, and operational widgets for crew orchestration.',
      kicker: 'Crew strategy',
    },
    scopeSummary: ['Roster automation', 'Compliance optics', 'Budget alignment'],
    layoutPresets: [
      {
        id: 'opsPulse',
        title: 'Operations pulse',
        description: 'High-level KPIs across the top with crew load below.',
        focus: ['KPIs', 'Crew load', 'Escalations'],
        recommended: true,
      },
      {
        id: 'crewsFirst',
        title: 'Crews first',
        description: 'Crew board and task assignments dominate the canvas.',
        focus: ['Shift planner', 'Crew availability'],
      },
      {
        id: 'forecast',
        title: 'Forecast cockpit',
        description: 'Places workforce forecast and budget variance charts up front.',
        focus: ['Forecast', 'Budget', 'Risks'],
      },
    ],
    widgetControls: [
      {
        id: 'crewLoad',
        label: 'Crew load monitor',
        description: 'Live utilization, callouts, and overtime indicators.',
        scope: 'role',
        required: true,
      },
      {
        id: 'compliance',
        label: 'Compliance radar',
        description: 'Shows vaccination and SOP adherence trends.',
        scope: 'global',
        defaultEnabled: true,
      },
      {
        id: 'alerts',
        label: 'Escalation queue',
        description: 'Aggregates incidents from helper/technician roles.',
        scope: 'role',
        defaultEnabled: true,
        tags: ['Alerts'],
      },
      {
        id: 'inventory',
        label: 'Inventory signals',
        description: 'Low feed, medication, and spare-part stock notifications.',
        scope: 'global',
        defaultEnabled: false,
      },
      {
        id: 'messaging',
        label: 'Crew messaging',
        description: 'Pinned broadcasts and rotation updates.',
        scope: 'shift',
        defaultEnabled: false,
      },
    ],
    toolScopes: [
      {
        id: 'rotaBuilder',
        name: 'Roster & rota builder',
        description: 'Drag-and-drop crew assignments with policy checks.',
        level: 'edit',
        surface: 'Desktop only',
        badges: ['Beta'],
      },
      {
        id: 'budgetConsole',
        name: 'Budget console',
        description: 'View budget burndown and approve spend alerts.',
        level: 'view',
        surface: 'Analytics tab',
      },
      {
        id: 'policyDeck',
        name: 'Policy decks',
        description: 'Maintain SOP versions and publish changes.',
        level: 'admin',
        surface: 'Document hub',
      },
      {
        id: 'handoff',
        name: 'Cross-role handoff',
        description: 'Structured summary sent to doctor/office roles each shift.',
        level: 'edit',
        surface: 'Handoff wizard',
      },
    ],
    automationRules: [
      {
        id: 'loadBalancing',
        title: 'Crew load balancing',
        description: 'Automatically reshuffles tasks when a crew breaches 120% load.',
        effect: 'Updates task routing + notifies leads',
        status: 'active',
      },
      {
        id: 'policyAlerts',
        title: 'Policy deviation alerts',
        description: 'Alerts when SOP compliance dips below 92% for a window.',
        effect: 'Triggers compliance review task',
        status: 'active',
      },
      {
        id: 'capacityForecast',
        title: 'Capacity forecast pilot',
        description: 'Predicts staffing gaps based on schedules and PTO.',
        effect: 'Creates hiring signal in dashboard',
        status: 'draft',
      },
    ],
  },
  doctor: {
    hero: {
      title: 'Doctor workspace settings',
      description: 'Configure caseflow views, analytics widgets, and care automation for clinical teams.',
      kicker: 'Clinical intelligence',
    },
    scopeSummary: ['Protocols', 'Case monitoring', 'Risk alerts'],
    layoutPresets: [
      {
        id: 'clinicalRounds',
        title: 'Clinical rounds',
        description: 'Case queue on the left with vitals and lab cards on the right.',
        focus: ['Case feed', 'Vitals', 'Next actions'],
        recommended: true,
      },
      {
        id: 'analyticsDeck',
        title: 'Analytics deck',
        description: 'Charts and compliance trends take priority.',
        focus: ['Outcomes', 'Compliance', 'Cohorts'],
      },
      {
        id: 'triage',
        title: 'Rapid triage',
        description: 'Prioritizes alerts and risk scoring for on-call flow.',
        focus: ['Alerts', 'Risk models'],
      },
    ],
    widgetControls: [
      {
        id: 'caseFeed',
        label: 'Case feed',
        description: 'Streaming cases with filters for barns, tags, and urgency.',
        scope: 'role',
        required: true,
      },
      {
        id: 'protocolCompliance',
        label: 'Protocol compliance',
        description: 'Visualizes protocol adherence and backlog.',
        scope: 'global',
        defaultEnabled: true,
      },
      {
        id: 'riskDeck',
        label: 'Risk deck',
        description: 'At-risk herds with predictive scoring.',
        scope: 'global',
        defaultEnabled: true,
      },
      {
        id: 'labBoard',
        label: 'Lab board',
        description: 'Pending lab orders and expedite controls.',
        scope: 'system',
        defaultEnabled: false,
      },
      {
        id: 'followUps',
        label: 'Follow-up reminders',
        description: 'Auto-generated follow ups for chronic cases.',
        scope: 'role',
        defaultEnabled: true,
      },
    ],
    toolScopes: [
      {
        id: 'carePlans',
        name: 'Care plan builder',
        description: 'Author and version care plans with templated blocks.',
        level: 'edit',
        surface: 'Care studio',
      },
      {
        id: 'labOrders',
        name: 'Lab order console',
        description: 'Place, track, and adjust lab work orders.',
        level: 'edit',
        surface: 'Lab board',
        badges: ['Realtime'],
      },
      {
        id: 'pharmacy',
        name: 'Medication locker',
        description: 'Request and reconcile meds inventory with office staff.',
        level: 'view',
        surface: 'Inventory sync',
      },
      {
        id: 'research',
        name: 'Research exports',
        description: 'Request anonymized data pulls under governance controls.',
        level: 'admin',
        surface: 'Data desk',
      },
    ],
    automationRules: [
      {
        id: 'protocolGaps',
        title: 'Protocol gap detection',
        description: 'Identifies stalled treatments or missed injections.',
        effect: 'Creates task + notifies assigned doctor',
        status: 'active',
      },
      {
        id: 'riskScoring',
        title: 'Risk scoring refresh',
        description: 'Regenerates predictive risk every 4 hours with sensor deltas.',
        effect: 'Updates risk deck + sends digest',
        status: 'active',
      },
      {
        id: 'labReminder',
        title: 'Lab reminder pilot',
        description: 'Auto-reminds technicians when labs sit idle for 2 hrs.',
        effect: 'Sends reminder to technician dashboard',
        status: 'draft',
      },
    ],
  },
  technician: {
    hero: {
      title: 'Technician workspace settings',
      description: 'Govern maintenance queue, diagnostics widgets, and sensor automations.',
      kicker: 'Precision upkeep',
    },
    scopeSummary: ['Equipment uptime', 'Sensor health', 'Shop floor SOPs'],
    layoutPresets: [
      {
        id: 'shopFloor',
        title: 'Shop-floor board',
        description: 'Queue-focused layout with work orders in swim lanes.',
        focus: ['Maintenance queue', 'Parts status'],
        recommended: true,
      },
      {
        id: 'complianceDeck',
        title: 'Compliance deck',
        description: 'Safety, inspection, and lockout widgets first.',
        focus: ['Checklists', 'Lockouts'],
      },
      {
        id: 'systemsView',
        title: 'Systems view',
        description: 'Sensor and automation health front and center.',
        focus: ['Sensor health', 'Automation status'],
      },
    ],
    widgetControls: [
      {
        id: 'maintenanceQueue',
        label: 'Maintenance queue',
        description: 'Categorized work orders with SLA timers.',
        scope: 'role',
        required: true,
      },
      {
        id: 'sensorHealth',
        label: 'Sensor health matrix',
        description: 'Status of hydration, feed, and barn sensors.',
        scope: 'system',
        defaultEnabled: true,
      },
      {
        id: 'spareParts',
        label: 'Spare parts forecast',
        description: 'Predicts when stockouts will occur.',
        scope: 'global',
        defaultEnabled: false,
      },
      {
        id: 'handoffs',
        label: 'Handoff summary',
        description: 'Captures context for next shift technicians.',
        scope: 'shift',
        defaultEnabled: true,
      },
      {
        id: 'documents',
        label: 'Maintenance docs',
        description: 'Quick access to wiring diagrams and SOPs.',
        scope: 'role',
        defaultEnabled: true,
      },
    ],
    toolScopes: [
      {
        id: 'workOrders',
        name: 'Work order console',
        description: 'Create, reprioritize, and close work orders.',
        level: 'edit',
        surface: 'Desktop + tablet',
      },
      {
        id: 'checklists',
        name: 'Inspection checklists',
        description: 'Digitized lockout/tagout and inspection routines.',
        level: 'edit',
        surface: 'Mobile',
        badges: ['Offline'],
      },
      {
        id: 'inventory',
        name: 'Parts inventory',
        description: 'Adjust min/max levels and request replenishment.',
        level: 'edit',
        surface: 'Inventory hub',
      },
      {
        id: 'dispatch',
        name: 'Dispatch board',
        description: 'Assign urgent repairs to available techs.',
        level: 'admin',
        surface: 'Command center',
      },
    ],
    automationRules: [
      {
        id: 'downtimeAlerts',
        title: 'Downtime alerts',
        description: 'Creates incident tasks if equipment is offline > 5 minutes.',
        effect: 'Push alert + work order',
        status: 'active',
      },
      {
        id: 'sensorDiagnostics',
        title: 'Sensor diagnostics',
        description: 'Auto-runs calibration routine nightly.',
        effect: 'Logs health report to dashboard',
        status: 'active',
      },
      {
        id: 'safetyLockout',
        title: 'Safety lockout escalation',
        description: 'Escalates if lockout is bypassed without clearance.',
        effect: 'Notifies manager + admin',
        status: 'draft',
      },
    ],
  },
  office: {
    hero: {
      title: 'Office workspace settings',
      description: 'Curate billing, compliance, and communication widgets for ops support.',
      kicker: 'Back-office clarity',
    },
    scopeSummary: ['Billing queues', 'Customer comms', 'Document governance'],
    layoutPresets: [
      {
        id: 'backOffice',
        title: 'Back-office hub',
        description: 'Balanced queue and compliance overview.',
        focus: ['Billing queue', 'Tickets', 'Compliance'],
        recommended: true,
      },
      {
        id: 'billingFirst',
        title: 'Billing first',
        description: 'Places billing KPIs and task lists up top.',
        focus: ['Billing KPIs', 'Aging'],
      },
      {
        id: 'supportFirst',
        title: 'Support first',
        description: 'Highlights external requests and follow-ups.',
        focus: ['Tickets', 'Escalations'],
      },
    ],
    widgetControls: [
      {
        id: 'billingQueue',
        label: 'Billing queue',
        description: 'Line items awaiting coding, review, or approval.',
        scope: 'role',
        required: true,
      },
      {
        id: 'ticketAging',
        label: 'Ticket aging',
        description: 'Support tickets grouped by service level.',
        scope: 'global',
        defaultEnabled: true,
      },
      {
        id: 'documentVault',
        label: 'Document vault',
        description: 'Contracts, compliance docs, and releases.',
        scope: 'global',
        defaultEnabled: true,
      },
      {
        id: 'escalations',
        label: 'Escalation inbox',
        description: 'Office escalations from clinics or managers.',
        scope: 'role',
        defaultEnabled: true,
      },
      {
        id: 'calendar',
        label: 'Coordination calendar',
        description: 'Upcoming audits, onboarding, and renewals.',
        scope: 'system',
        defaultEnabled: false,
      },
    ],
    toolScopes: [
      {
        id: 'contracts',
        name: 'Contract workspace',
        description: 'Upload, tag, and route contracts for signature.',
        level: 'edit',
        surface: 'Document hub',
      },
      {
        id: 'billingConsole',
        name: 'Billing console',
        description: 'Bulk approve invoices and manage payouts.',
        level: 'admin',
        surface: 'Billing center',
      },
      {
        id: 'communications',
        name: 'Communication bridge',
        description: 'Send email/SMS updates to partners.',
        level: 'edit',
        surface: 'Omni-channel',
      },
      {
        id: 'compliance',
        name: 'Compliance tracker',
        description: 'Monitor renewals and documentation requirements.',
        level: 'view',
        surface: 'Compliance desk',
      },
    ],
    automationRules: [
      {
        id: 'agingAlertsOffice',
        title: 'Invoice aging alerts',
        description: 'Auto-pings collectors when invoices breach target aging.',
        effect: 'Adds reminder + email summary',
        status: 'active',
      },
      {
        id: 'summaryBots',
        title: 'Ticket summary bots',
        description: 'Drafts response summaries using AI for review.',
        effect: 'Adds draft reply + tags mention',
        status: 'draft',
      },
      {
        id: 'handoffReminder',
        title: 'Inter-team handoff reminders',
        description: 'Nudges office owners when docs await manager signature.',
        effect: 'Push + calendar block',
        status: 'active',
      },
    ],
  },
  admin: {
    hero: {
      title: 'Admin workspace settings',
      description: 'Define governance widgets, instrumentation, and access controls.',
      kicker: 'Platform governance',
    },
    scopeSummary: ['Identity & roles', 'Telemetry health', 'Release gates'],
    layoutPresets: [
      {
        id: 'governance',
        title: 'Governance cockpit',
        description: 'Audit log, identity, and incident queue prioritized.',
        focus: ['Identity', 'Audit', 'Incidents'],
        recommended: true,
      },
      {
        id: 'security',
        title: 'Security watch',
        description: 'Threat detection and anomaly charts up top.',
        focus: ['Security events', 'Anomalies'],
      },
      {
        id: 'release',
        title: 'Release desk',
        description: 'Places release readiness and migration widgets forward.',
        focus: ['Migrations', 'Schemas'],
      },
    ],
    widgetControls: [
      {
        id: 'systemHealth',
        label: 'System health',
        description: 'Runtime uptime, API latency, and queue depth monitors.',
        scope: 'system',
        required: true,
      },
      {
        id: 'accessRequests',
        label: 'Access requests',
        description: 'Pending role or environment access approvals.',
        scope: 'global',
        defaultEnabled: true,
      },
      {
        id: 'auditLog',
        label: 'Audit log',
        description: 'Streaming audit events with filters.',
        scope: 'system',
        defaultEnabled: true,
      },
      {
        id: 'releaseNotes',
        label: 'Release readiness',
        description: 'Schema diffs, migration status, and approvals.',
        scope: 'system',
        defaultEnabled: false,
      },
      {
        id: 'incidentQueue',
        label: 'Incident queue',
        description: 'Active incidents across roles and their owners.',
        scope: 'global',
        defaultEnabled: true,
      },
    ],
    toolScopes: [
      {
        id: 'identity',
        name: 'Identity & roles',
        description: 'Create roles, rotate credentials, and audit sessions.',
        level: 'admin',
        surface: 'Security center',
      },
      {
        id: 'observability',
        name: 'Observability',
        description: 'Manage tracing exporters and log sinks.',
        level: 'admin',
        surface: 'Telemetry hub',
      },
      {
        id: 'policyEngine',
        name: 'Policy engine',
        description: 'Author access policies and route approvals.',
        level: 'edit',
        surface: 'Rules studio',
      },
      {
        id: 'secretsVault',
        name: 'Secrets vault',
        description: 'Rotate app secrets and set expirations.',
        level: 'admin',
        surface: 'Vault',
      },
    ],
    automationRules: [
      {
        id: 'roleExpiry',
        title: 'Role expiry',
        description: 'Automates temporary role expiry and reminders.',
        effect: 'Auto-downgrades + emails owners',
        status: 'active',
      },
      {
        id: 'anomalyDetection',
        title: 'Anomaly detection',
        description: 'Flags unusual login locations and api spikes.',
        effect: 'Creates incident + notifies admin',
        status: 'active',
      },
      {
        id: 'backupVerification',
        title: 'Backup verification',
        description: 'Validates nightly backups and reports drift.',
        effect: 'Posts report to admin dashboard',
        status: 'draft',
      },
    ],
  },
};
