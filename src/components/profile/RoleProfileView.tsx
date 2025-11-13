'use client';

import { useCallback, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Activity, ArrowLeft, Calendar, CheckCircle2, Sparkles, Target, Users } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { RoleDashboardLayout } from '@/components/dashboards/RoleDashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAutoSave } from '@/hooks/useAutoSave';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';
import { ProfileSettings, ThemeChoice, DensityChoice, InboxViewChoice, NotificationSettings } from '@/types/userSettings';

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  doctor: 'Doctor',
  technician: 'Technician',
  helper: 'Helper',
  office: 'Office',
};

const NOTIFICATION_FALLBACK: NotificationSettings = {
  alerts: true,
  digests: true,
  escalations: true,
  smsFallback: false,
};

const ROLE_COPY: Record<UserRole, { kicker: string; description: string; hero: string }> = {
  admin: {
    kicker: 'People profile',
    description: 'Guardian of governance, security, and scale.',
    hero: 'Command overview',
  },
  manager: {
    kicker: 'Squad lead profile',
    description: 'Keeps pods unblocked and rituals on beat.',
    hero: 'Field cadence',
  },
  doctor: {
    kicker: 'Clinical profile',
    description: 'Blends telemetrics with bedside intuition.',
    hero: 'Care intelligence',
  },
  technician: {
    kicker: 'Systems engineer profile',
    description: 'Owns rovers, sensors, and rugged automation.',
    hero: 'Device integrity',
  },
  helper: {
    kicker: 'Field guide profile',
    description: 'Frontline storyteller for caretakers & families.',
    hero: 'Resident connection',
  },
  office: {
    kicker: 'Back office profile',
    description: 'Keeps runways funded and vendors in sync.',
    hero: 'Operations spine',
  },
};

const ROLE_FORM_FIELDS: Record<UserRole, Array<{ name: keyof ProfileSettings; label: string; placeholder: string; description?: string; textarea?: boolean }>> = {
  admin: [
    { name: 'headline', label: 'Headline', placeholder: 'Steward of fleet compliance & automation', description: 'Short summary shown to other operators.', textarea: true },
    { name: 'region', label: 'Coverage region', placeholder: 'Global / Remote' },
    { name: 'specialty', label: 'Program lane', placeholder: 'Governance, audit, policy' },
    { name: 'preferredChannel', label: 'Preferred channel', placeholder: '#command-center' },
    { name: 'avatarUrl', label: 'Profile image URL', placeholder: 'https://images.herd/avatar.png' },
  ],
  manager: [
    { name: 'headline', label: 'Headline', placeholder: 'Crew cadence lead for Habitat + Ranger pods', description: 'Describe how you coach teams.', textarea: true },
    { name: 'region', label: 'Region', placeholder: 'Mountain / Hybrid' },
    { name: 'squadFocus', label: 'Squad focus', placeholder: 'Habitat pods' },
    { name: 'coverageWindow', label: 'Coverage window', placeholder: 'Mon-Fri, 8 am – 6 pm' },
    { name: 'preferredChannel', label: 'Preferred channel', placeholder: '#manager-ops' },
    { name: 'avatarUrl', label: 'Profile image URL', placeholder: 'https://images.herd/avatar.png' },
  ],
  doctor: [
    { name: 'headline', label: 'Headline', placeholder: 'Clinical lead for Blue herd', description: 'Share your care mission.', textarea: true },
    { name: 'region', label: 'Region', placeholder: 'Coastal North' },
    { name: 'specialty', label: 'Medical field', placeholder: 'Obstetrics, Internal Med, etc.' },
    { name: 'coverageWindow', label: 'On-call window', placeholder: 'Rotating 12h shifts' },
    { name: 'preferredChannel', label: 'Preferred channel', placeholder: '#clinical' },
    { name: 'avatarUrl', label: 'Profile image URL', placeholder: 'https://images.herd/avatar.png' },
  ],
  technician: [
    { name: 'headline', label: 'Headline', placeholder: 'Systems engineer for rover + sensor fleets', textarea: true },
    { name: 'region', label: 'Region', placeholder: 'Central Corridor' },
    { name: 'squadFocus', label: 'Ops lane', placeholder: 'Rovers / Sensors / Workshop' },
    { name: 'coverageWindow', label: 'Coverage window', placeholder: 'Split shifts, 4/3' },
    { name: 'preferredChannel', label: 'Preferred channel', placeholder: '#tech-lab' },
    { name: 'avatarUrl', label: 'Profile image URL', placeholder: 'https://images.herd/avatar.png' },
  ],
  helper: [
    { name: 'headline', label: 'Headline', placeholder: 'Field storyteller across River Valley habitats', textarea: true },
    { name: 'region', label: 'Region', placeholder: 'River Valley' },
    { name: 'coverageWindow', label: 'Shift rhythm', placeholder: 'Split shifts, 10 h' },
    { name: 'preferredChannel', label: 'Preferred channel', placeholder: '#helper-support' },
    { name: 'avatarUrl', label: 'Profile image URL', placeholder: 'https://images.herd/avatar.png' },
  ],
  office: [
    { name: 'headline', label: 'Headline', placeholder: 'Finance + procurement partner for habitats', textarea: true },
    { name: 'region', label: 'Region', placeholder: 'HQ / Hybrid' },
    { name: 'officeAnchor', label: 'Office anchor', placeholder: 'Procurement / Docs / Finance' },
    { name: 'preferredChannel', label: 'Preferred channel', placeholder: '#office-ops' },
    { name: 'avatarUrl', label: 'Profile image URL', placeholder: 'https://images.herd/avatar.png' },
  ],
};

const ROLE_DETAILS: Record<UserRole, Array<{ label: string; key: keyof ProfileSettings | 'email' | 'license' }>> = {
  admin: [
    { label: 'Email', key: 'email' },
    { label: 'Program lane', key: 'specialty' },
    { label: 'Coverage region', key: 'region' },
    { label: 'Preferred channel', key: 'preferredChannel' },
  ],
  manager: [
    { label: 'Email', key: 'email' },
    { label: 'Pods', key: 'squadFocus' },
    { label: 'Coverage', key: 'coverageWindow' },
    { label: 'Preferred channel', key: 'preferredChannel' },
  ],
  doctor: [
    { label: 'Email', key: 'email' },
    { label: 'Medical field', key: 'specialty' },
    { label: 'Region', key: 'region' },
    { label: 'On-call window', key: 'coverageWindow' },
    { label: 'License', key: 'license' },
  ],
  technician: [
    { label: 'Email', key: 'email' },
    { label: 'Ops lane', key: 'squadFocus' },
    { label: 'Region', key: 'region' },
    { label: 'Coverage', key: 'coverageWindow' },
  ],
  helper: [
    { label: 'Email', key: 'email' },
    { label: 'Region', key: 'region' },
    { label: 'Shift rhythm', key: 'coverageWindow' },
    { label: 'Preferred channel', key: 'preferredChannel' },
  ],
  office: [
    { label: 'Email', key: 'email' },
    { label: 'Office anchor', key: 'officeAnchor' },
    { label: 'Region', key: 'region' },
    { label: 'Preferred channel', key: 'preferredChannel' },
  ],
};

const ROLE_FOCUS_DATA: Record<UserRole, Array<{ title: string; description: string; badge: string }>> = {
  admin: [
    { title: 'Security posture reviews', description: 'Rolling review of privileged access and attestations.', badge: 'Live' },
    { title: 'Policy refresh sprint', description: 'Align 2025 compliance lens with rituals.', badge: 'Week 4' },
  ],
  manager: [
    { title: 'Ritual hygiene', description: 'Standup kit refresh for pods with >10 contributors.', badge: 'Rolling' },
    { title: 'Shift safety cues', description: 'Embed wellness checks into midday huddles.', badge: 'Piloting' },
  ],
  doctor: [
    { title: 'Respiratory watchlist', description: 'Live monitoring for barns 4–6 humidity spikes.', badge: 'Critical' },
    { title: 'Nutrition review', description: 'Partner with office ops to rebalance feed cadence.', badge: 'Scheduled' },
  ],
  technician: [
    { title: 'Rover drivetrain swap', description: 'Coordinate helper assist on Model C units.', badge: 'In shop' },
    { title: 'Sensor hardening', description: 'Deploy firmware for overnight freeze warnings.', badge: 'Deploying' },
  ],
  helper: [
    { title: 'Morning calm loops', description: 'Routine for sensitive calves before activity.', badge: 'Pilot' },
    { title: 'Observation tagging', description: 'Refining quick-tag voice notes for compliance.', badge: 'Beta' },
  ],
  office: [
    { title: 'Renewal playbook', description: 'Update doc set for top vendors.', badge: 'Review' },
    { title: 'Spend telemetry', description: 'Link spare parts to dashboards.', badge: 'Building' },
  ],
};

const ROLE_TIMELINE: Record<UserRole, Array<{ title: string; timestamp: string; description: string }>> = {
  admin: [
    { title: 'Risk board sync complete', timestamp: 'Today, 08:20', description: 'Cleared two blockers on bio-sensor shipping.' },
    { title: 'Escalation cleared', timestamp: 'Mon, 11:42', description: 'Closed privilege drift impacting helper tools.' },
  ],
  manager: [
    { title: 'Coaching retro shipped', timestamp: 'Today, 07:50', description: 'Shared notes from helper & technician pairing.' },
    { title: 'Shift handoff recorded', timestamp: 'Yesterday, 18:12', description: 'Documented Ranger pod adjustments.' },
  ],
  doctor: [
    { title: 'Telemetric alert closed', timestamp: 'Today, 05:58', description: 'Hydration anomaly resolved with helper support.' },
    { title: 'Lab panel review', timestamp: 'Yesterday, 19:05', description: 'Cleared 5 pending results for Blue herd.' },
  ],
  technician: [
    { title: 'Diagnostics sweep', timestamp: 'Today, 04:55', description: 'Flagged 3 nodes for proactive part orders.' },
    { title: 'Parts manifest shipped', timestamp: 'Yesterday, 17:45', description: 'Technician + office ops sync finished.' },
  ],
  helper: [
    { title: 'Sunrise walk report', timestamp: 'Today, 06:05', description: 'Flagged hydration boost for pen 12.' },
    { title: 'Family call follow-up', timestamp: 'Yesterday, 19:10', description: 'Captured sentiment and next steps.' },
  ],
  office: [
    { title: 'Invoice batch cleared', timestamp: 'Today, 10:40', description: 'Released helper stipend payouts early.' },
    { title: 'Forecast scenario shared', timestamp: 'Yesterday, 16:05', description: 'Routed to leadership for sign-off.' },
  ],
};

const ROLE_METRICS: Record<UserRole, Array<{ label: string; value: number; hint: string }>> = {
  admin: [
    { label: 'Governance coverage', value: 86, hint: '7 / 8 streams' },
    { label: 'Automation adoption', value: 72, hint: 'New guardrails live' },
    { label: 'Team bandwidth', value: 64, hint: '2 hires in pipeline' },
  ],
  manager: [
    { label: 'Coverage compliance', value: 94, hint: 'Only 1 red pod' },
    { label: 'Feedback latency', value: 68, hint: 'Avg 2.3h loops' },
    { label: 'Playbook freshness', value: 78, hint: '6 of 8 updated' },
  ],
  doctor: [
    { label: 'Pathway adherence', value: 91, hint: '4 KPIs green' },
    { label: 'Alert response', value: 88, hint: '<18 min avg' },
    { label: 'Care plan freshness', value: 74, hint: 'Next audit Thu' },
  ],
  technician: [
    { label: 'Device uptime', value: 89, hint: 'Target 92%' },
    { label: 'Backlog health', value: 76, hint: '4 critical' },
    { label: 'Knowledge base', value: 63, hint: 'Needs refresh' },
  ],
  helper: [
    { label: 'Visit completion', value: 98, hint: 'Ahead of target' },
    { label: 'Story uploads', value: 71, hint: '3 pending edits' },
    { label: 'Safety checklists', value: 82, hint: '11 green' },
  ],
  office: [
    { label: 'Budget accuracy', value: 93, hint: 'Variance <3%' },
    { label: 'Vendor SLAs', value: 88, hint: '2 amber' },
    { label: 'Doc freshness', value: 79, hint: 'Audits weekly' },
  ],
};

const ROLE_COLLABORATORS: Record<UserRole, Array<{ name: string; role: string; status: string }>> = {
  admin: [
    { name: 'Marley Campos', role: 'Security lead', status: 'On-call' },
    { name: 'Ivy Chen', role: 'Ops PM', status: 'Heads-down' },
  ],
  manager: [
    { name: 'Sloane Patel', role: 'Lead helper', status: 'Online' },
    { name: 'Kai Morales', role: 'Technician captain', status: 'In field' },
  ],
  doctor: [
    { name: 'Eli Vargas', role: 'Lead vet tech', status: 'Rounding' },
    { name: 'Mina Cho', role: 'Nutritionist', status: 'Async' },
  ],
  technician: [
    { name: 'Ada Gross', role: 'Workshop chief', status: 'On site' },
    { name: 'Theo Lind', role: 'Helper trainer', status: 'Reviewing' },
  ],
  helper: [
    { name: 'June Parra', role: 'Care navigator', status: 'Chat' },
    { name: 'Luca Price', role: 'Family liaison', status: 'Online' },
  ],
  office: [
    { name: 'Uma Glenn', role: 'Finance partner', status: 'Focus' },
    { name: 'Dex Ray', role: 'Admin proxy', status: 'Ping-ready' },
  ],
};

interface RoleProfileViewProps {
  role: UserRole;
}

type ProfileFormValues = Record<string, string>;

/**
 * Renders the full-role profile experience including identity, editable
 * per-role metadata, workspace preferences, timeline, and collaborator info.
 */
export const RoleProfileView = ({ role }: RoleProfileViewProps) => {
  const { user } = useAuth();
  const { settings, isLoading, isUpdating, updateSettings } = useUserSettings();
  const profileSettings = useMemo(
    () => ((settings?.profile ?? {}) as ProfileSettings),
    [settings?.profile]
  );

  const formFields = ROLE_FORM_FIELDS[role];
  const defaultValues = useMemo(() => {
    const entries = formFields.map((field) => [field.name, (profileSettings?.[field.name] as string) ?? '']);
    return Object.fromEntries(entries) as ProfileFormValues;
  }, [formFields, profileSettings]);

  const form = useForm<ProfileFormValues>({
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const persistProfileValues = useCallback(
    async (values: ProfileFormValues) => {
      try {
        await updateSettings({ profile: { ...profileSettings, ...values } }, { silent: true });
      } catch (error) {
        console.error('Profile auto-save failed', error);
      }
    },
    [profileSettings, updateSettings]
  );

  const handlePreferenceChange = async (payload: Partial<{ theme: ThemeChoice; density: DensityChoice; inboxView: InboxViewChoice }>) => {
    try {
      await updateSettings(payload, { silent: true });
    } catch (error) {
      console.error('Preference update failed', error);
    }
  };

  const handleNotificationChange = async (key: keyof NotificationSettings, value: boolean) => {
    try {
      await updateSettings({ notifications: { [key]: value } as Partial<NotificationSettings> }, { silent: true });
    } catch (error) {
      console.error('Notification update failed', error);
    }
  };

  const profileFormValues = form.watch();
  const autoSaveStatus = useAutoSave(profileFormValues, {
    enabled: Boolean(settings),
    delay: 700,
    onSave: persistProfileValues,
  });

  const [firstName = 'Operator', ...restName] = (user?.name ?? 'Operator').split(' ');
  const lastName = restName.join(' ');
  const avatarUrl = profileSettings.avatarUrl ?? user?.avatar ?? '';

  const highlights = useMemo(() => {
    const focusValue =
      role === 'doctor'
        ? profileSettings.specialty ?? 'Medical generalist'
        : role === 'manager'
        ? profileSettings.squadFocus ?? 'Habitat pods'
        : profileSettings.specialty ?? profileSettings.squadFocus ?? ROLE_COPY[role].hero;

    return [
      {
        label: 'Region',
        value: profileSettings.region ?? 'Not set',
        hint: 'Coverage lane',
      },
      {
        label: 'Focus lane',
        value: focusValue,
        hint: 'Role priority',
      },
      {
        label: 'Inbox view',
        value: (settings?.inboxView ?? 'all').toUpperCase(),
        hint: 'Default filter',
      },
    ];
  }, [profileSettings.region, profileSettings.specialty, profileSettings.squadFocus, role, settings?.inboxView]);

  const details = ROLE_DETAILS[role];

  return (
    <RoleDashboardLayout
      role={role}
      title={`${ROLE_LABEL[role]} profile`}
      description={ROLE_COPY[role].description}
      kicker={ROLE_COPY[role].kicker}
      highlights={highlights}
      actions={
        <Button variant="outline" size="sm" asChild>
          <Link href={`/${role}`}>
            <ArrowLeft className="mr-2 h-3.5 w-3.5" />
            Back to dashboard
          </Link>
        </Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.75fr,1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                Identity
              </CardTitle>
              <CardDescription>{ROLE_COPY[role].hero}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="profile-identity">
                <div className={cn('profile-identity__photo', !avatarUrl && 'profile-identity__photo--fallback')}>
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={`${user?.name ?? 'Operator'} avatar`}
                      width={56}
                      height={56}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{firstName.charAt(0)}{lastName.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {firstName} {lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{profileSettings.headline ?? ROLE_COPY[role].description}</p>
                  <Badge variant="secondary" className="mt-2 text-xs uppercase tracking-widest">
                    {ROLE_LABEL[role]}
                  </Badge>
                </div>
              </div>
              <dl className="grid gap-4 md:grid-cols-2">
                {details.map((detail) => {
                  let value: string | undefined;
                  if (detail.key === 'email') {
                    value = user?.email;
                  } else if (detail.key === 'license') {
                    value = user?.licenseNumber ?? 'Not set';
                  } else {
                    value = (profileSettings as Record<string, string | undefined>)[detail.key] ?? 'Not set';
                  }
                  return (
                    <div key={detail.label} className="rounded-xl bg-muted/40 p-3">
                      <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{detail.label}</dt>
                      <dd className="text-sm font-medium text-foreground">{value ?? 'Not set'}</dd>
                    </div>
                  );
                })}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                Role-specific profile
              </CardTitle>
              <CardDescription>Update the attributes other teams see.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && !settings ? (
                <p className="text-sm text-muted-foreground">Loading profile preferences...</p>
              ) : (
                <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
                  {formFields.map((field) => (
                    <div key={field.name} className="space-y-2">
                      <Label htmlFor={field.name}>{field.label}</Label>
                      {field.textarea ? (
                        <Textarea
                          id={field.name}
                          placeholder={field.placeholder}
                          {...form.register(field.name)}
                          className="resize-none"
                        />
                      ) : (
                        <Input id={field.name} placeholder={field.placeholder} {...form.register(field.name)} />
                      )}
                      {field.description ? (
                        <p className="text-xs text-muted-foreground">{field.description}</p>
                      ) : null}
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                      Values sync across your role routes immediately.
                    </p>
                    <span
                      className={cn(
                        'text-xs font-medium',
                        autoSaveStatus === 'error'
                          ? 'text-destructive'
                          : isUpdating || autoSaveStatus === 'saving'
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      )}
                    >
                      {autoSaveStatus === 'error'
                        ? 'Auto-save failed'
                        : isUpdating || autoSaveStatus === 'saving'
                        ? 'Saving…'
                        : 'Auto-save on'}
                    </span>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" />
                Focus lanes
              </CardTitle>
              <CardDescription>Live priorities for this role.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ROLE_FOCUS_DATA[role].map((focus) => (
                <div key={focus.title} className="rounded-2xl border border-border/70 p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-base font-semibold">{focus.title}</p>
                    <Badge variant="outline" className="text-[0.65rem] uppercase tracking-wider">
                      {focus.badge}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{focus.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                Activity timeline
              </CardTitle>
              <CardDescription>Recent notes shared with the network.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ROLE_TIMELINE[role].map((entry) => (
                <div key={entry.title} className="flex gap-3 rounded-xl bg-muted/30 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{entry.title}</p>
                    <p className="text-xs text-muted-foreground">{entry.timestamp}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{entry.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workspace preferences</CardTitle>
              <CardDescription>Tune how data shows up for you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select
                  disabled={!settings}
                  value={settings?.theme ?? 'system'}
                  onValueChange={(value) => handlePreferenceChange({ theme: value as ThemeChoice })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Density</Label>
                <Select
                  disabled={!settings}
                  value={settings?.density ?? 'comfortable'}
                  onValueChange={(value) => handlePreferenceChange({ density: value as DensityChoice })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Density" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Default inbox view</Label>
                <Select
                  disabled={!settings}
                  value={settings?.inboxView ?? 'inbox'}
                  onValueChange={(value) => handlePreferenceChange({ inboxView: value as InboxViewChoice })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Inbox view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbox">Primary inbox</SelectItem>
                    <SelectItem value="sent">Sent items</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    <SelectItem value="trash">Trash</SelectItem>
                    <SelectSeparator />
                    <SelectItem value="all">All signals (legacy)</SelectItem>
                    <SelectItem value="priority">Priority only</SelectItem>
                    <SelectItem value="automation">Automation logs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notifications</Label>
                <div className="space-y-3 rounded-xl border border-border/60 p-3">
                  {(['alerts', 'digests', 'escalations', 'smsFallback'] as Array<keyof NotificationSettings>).map((key) => (
                    <div key={key} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium capitalize">{key === 'smsFallback' ? 'SMS fallback' : key}</p>
                        <p className="text-xs text-muted-foreground">
                          {key === 'smsFallback' ? 'Send SMS when push/email fails' : 'Deliver updates through default channel'}
                        </p>
                      </div>
                      <Switch
                        checked={Boolean(settings?.notifications?.[key] ?? NOTIFICATION_FALLBACK[key])}
                        disabled={!settings}
                        onCheckedChange={(checked) => handleNotificationChange(key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-primary" />
                Momentum metrics
              </CardTitle>
              <CardDescription>Signals leadership watches.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ROLE_METRICS[role].map((metric) => (
                <div key={metric.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{metric.label}</span>
                    <span className="text-muted-foreground">{metric.value}%</span>
                  </div>
                  <Progress value={metric.value} className="mt-2" />
                  <p className="mt-1 text-xs text-muted-foreground">{metric.hint}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active collaborators</CardTitle>
              <CardDescription>People synced to this role.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {ROLE_COLLABORATORS[role].map((collaborator) => (
                <div key={collaborator.name} className="flex items-center justify-between rounded-xl border border-border/70 p-3">
                  <div>
                    <p className="text-sm font-semibold">{collaborator.name}</p>
                    <p className="text-xs text-muted-foreground">{collaborator.role}</p>
                  </div>
                  <Badge variant="outline" className="text-[0.65rem] uppercase tracking-widest">
                    {collaborator.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleDashboardLayout>
  );
};

export default RoleProfileView;
