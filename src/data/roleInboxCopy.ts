import { UserRole } from "@/types";
import { RoleInboxCopy } from "@/types/mail";

export const ROLE_INBOX_COPY = {
  admin: {
    role: "admin",
    kicker: "Signal inbox",
    description: "Command queue for governance, escalations, and automation notices.",
    highlights: [
      { label: "Unresolved", value: "4", hint: "Need response" },
      { label: "Automation logs", value: "12", hint: "Last 24h" },
      { label: "Muted flows", value: "2", hint: "Dormant" },
    ],
    automation: [
      { title: "Access attestations", description: "Daily digest send at 07:00", status: "Scheduled" },
      { title: "Vendor SLA nudges", description: "Office ops subscribed", status: "Active" },
      { title: "Security recall", description: "Sleeping until Feb 2", status: "Paused" },
    ],
    defaultFilters: ["all", "priority", "automation"],
  },
  manager: {
    role: "manager",
    kicker: "Squad inbox",
    description: "Coaching notes, shift escalations, and pod rituals in one place.",
    highlights: [
      { label: "Unread rituals", value: "3", hint: "Needs coaching" },
      { label: "Escalations", value: "1", hint: "Tagged priority" },
      { label: "Ops nudges", value: "6", hint: "Automation" },
    ],
    automation: [
      { title: "Standup recaps", description: "Auto-post at 11:00 + 17:00", status: "Active" },
      { title: "Coverage mismatch alerts", description: "Comparing schedule vs telemetry", status: "Active" },
      { title: "Coaching reminders", description: "Weekly on Mondays", status: "Paused" },
    ],
    defaultFilters: ["all", "priority", "automation"],
  },
  doctor: {
    role: "doctor",
    kicker: "Clinical inbox",
    description: "Live alerts, lab follow-ups, and helper escalations.",
    highlights: [
      { label: "Critical signals", value: "2", hint: "Requires decisions" },
      { label: "Lab panels", value: "5", hint: "Pending review" },
      { label: "Helper syncs", value: "4", hint: "Awaiting notes" },
    ],
    automation: [
      { title: "Vitals anomaly pings", description: "Escalates via SMS + inbox", status: "Active" },
      { title: "Lab batching", description: "Compiles results nightly", status: "Scheduled" },
      { title: "Helper sticky notes", description: "Summaries at shift end", status: "Active" },
    ],
    defaultFilters: ["all", "priority"],
  },
  technician: {
    role: "technician",
    kicker: "Systems inbox",
    description: "Diagnostics, parts approvals, and automation telemetry.",
    highlights: [
      { label: "Open work orders", value: "7", hint: "Need acknowledgement" },
      { label: "Telemetry alerts", value: "3", hint: "Critical" },
      { label: "Workshop updates", value: "5", hint: "Recently closed" },
    ],
    automation: [
      { title: "Diagnostics sweeps", description: "Runs hourly on barns 2, 5, 6", status: "Active" },
      { title: "Inventory sync", description: "Pushes nightly to office ops", status: "Active" },
      { title: "Rover release notes", description: "Shared weekly", status: "Scheduled" },
    ],
    defaultFilters: ["all", "automation"],
  },
  helper: {
    role: "helper",
    kicker: "Field inbox",
    description: "Resident updates, family notes, and nudges from digital twins.",
    highlights: [
      { label: "Unread nudges", value: "5", hint: "Action soon" },
      { label: "Checklists due", value: "2", hint: "Before noon" },
      { label: "Stories shared", value: "8", hint: "Week to date" },
    ],
    automation: [
      { title: "Calm cues", description: "Twice daily routines", status: "Active" },
      { title: "Family digest", description: "Auto compile Wed", status: "Scheduled" },
      { title: "Checklist reminders", description: "Mute after completion", status: "Active" },
    ],
    defaultFilters: ["all"],
  },
  office: {
    role: "office",
    kicker: "Back office inbox",
    description: "Vendor comms, approvals, and finance nudges.",
    highlights: [
      { label: "Approvals", value: "3", hint: "Need decisions" },
      { label: "Vendor replies", value: "7", hint: "Last 24h" },
      { label: "Docs pending", value: "2", hint: "Signature" },
    ],
    automation: [
      { title: "Payment batches", description: "Auto-run Tue & Fri", status: "Active" },
      { title: "Contract nudges", description: "Reminder 30 days before expiry", status: "Active" },
      { title: "Spend telemetry", description: "Feeds exec dashboards", status: "Building" },
    ],
    defaultFilters: ["all", "priority"],
  },
} satisfies Record<UserRole, RoleInboxCopy>;
