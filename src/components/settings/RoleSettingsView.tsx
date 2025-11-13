'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, LayoutDashboard, Layers, Settings2, Sparkles } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { RoleDashboardLayout } from '@/components/dashboards/RoleDashboardLayout';
import type { Highlight } from '@/components/dashboards/RoleDashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useUserSettings } from '@/hooks/useUserSettings';
import { ROLE_SETTINGS } from '@/data/roleSettings';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  doctor: 'Doctor',
  technician: 'Technician',
  helper: 'Helper',
  office: 'Office',
};

const SECTION_IDS = ['layout', 'widgets', 'tools', 'automations', 'scope'] as const;
type SectionId = (typeof SECTION_IDS)[number];

const getDefaultCollapsedState = (): Record<SectionId, boolean> =>
  SECTION_IDS.reduce<Record<SectionId, boolean>>((state, sectionId) => {
    state[sectionId] = false;
    return state;
  }, {} as Record<SectionId, boolean>);

const ChevronIcon = ({ collapsed }: { collapsed: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn('role-card-toggle__icon', collapsed && 'role-card-toggle__icon--collapsed')}
    aria-hidden
  >
    <path d="M5 9.5 12 16l7-6.5" />
  </svg>
);

interface SectionCardProps {
  sectionId: SectionId;
  title: string;
  description?: ReactNode;
  icon: ReactNode;
  collapsed: boolean;
  onToggle: (sectionId: SectionId) => void;
  children: ReactNode;
}

const SectionCard = ({
  sectionId,
  title,
  description,
  icon,
  collapsed,
  onToggle,
  children,
}: SectionCardProps) => (
  <Card data-collapsed={collapsed ? 'true' : 'false'}>
    <div className="role-card-header">
      <div
        className="role-card-toggle-zone"
        aria-hidden="true"
        onClick={() => onToggle(sectionId)}
      >
        <button
          type="button"
          aria-label={collapsed ? `Expand ${title}` : `Collapse ${title}`}
          aria-expanded={!collapsed}
          className="role-card-toggle"
          onClick={(event) => {
            event.stopPropagation();
            onToggle(sectionId);
          }}
        >
          <ChevronIcon collapsed={collapsed} />
        </button>
      </div>
      <div className="role-card-header__content">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
        {!collapsed && description ? <CardDescription>{description}</CardDescription> : null}
      </div>
    </div>
    {!collapsed ? children : null}
  </Card>
);

interface RoleSettingsViewProps {
  role: UserRole;
}

export const RoleSettingsView = ({ role }: RoleSettingsViewProps) => {
  const { user } = useAuth();
  const config = ROLE_SETTINGS[role];
  const { settings, updateSettings, isUpdating } = useUserSettings();

  const initialPreset = useMemo(
    () => config.layoutPresets.find((preset) => preset.recommended)?.id ?? config.layoutPresets[0]?.id,
    [config.layoutPresets]
  );

  const [selectedPreset, setSelectedPreset] = useState(initialPreset);
  const defaultWidgetState = useMemo(
    () =>
      config.widgetControls.reduce<Record<string, boolean>>((state, widget) => {
        state[widget.id] =
          widget.required || widget.defaultEnabled === undefined ? true : Boolean(widget.defaultEnabled);
        return state;
      }, {}),
    [config.widgetControls]
  );
  const remoteWidgetState = useMemo(() => {
    if (!settings?.widgetPreferences) {
      return defaultWidgetState;
    }
    return Object.entries(settings.widgetPreferences).reduce<Record<string, boolean>>((state, [id, pref]) => {
      if (typeof pref?.enabled === 'boolean') {
        state[id] = pref.enabled;
      }
      return state;
    }, { ...defaultWidgetState });
  }, [defaultWidgetState, settings?.widgetPreferences]);
  const [widgetState, setWidgetState] = useState<Record<string, boolean>>(remoteWidgetState);
  const [collapsedSections, setCollapsedSections] = useState<Record<SectionId, boolean>>(
    getDefaultCollapsedState
  );
  const [collapseHydrated, setCollapseHydrated] = useState(false);
  const availablePresetIds = useMemo(
    () => new Set(config.layoutPresets.map((preset) => preset.id)),
    [config.layoutPresets]
  );

  useEffect(() => {
    if (settings?.layoutPreset && availablePresetIds.has(settings.layoutPreset)) {
      setSelectedPreset(settings.layoutPreset);
      return;
    }
    setSelectedPreset(initialPreset);
  }, [settings?.layoutPreset, availablePresetIds, initialPreset]);

  const handlePresetSelect = useCallback(
    async (presetId: string) => {
      setSelectedPreset(presetId);
      try {
        await updateSettings({ layoutPreset: presetId }, { silent: true });
      } catch (error) {
        console.error('Failed to persist layout preset', error);
      }
    },
    [updateSettings]
  );

  const collapseStorageKey = `role-settings-collapsed:${role}`;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const stored = window.localStorage.getItem(collapseStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<Record<SectionId, boolean>>;
        setCollapsedSections({
          ...getDefaultCollapsedState(),
          ...parsed,
        });
      } else {
        setCollapsedSections(getDefaultCollapsedState());
      }
    } catch (error) {
      console.error('Unable to load role settings collapse state', error);
      setCollapsedSections(getDefaultCollapsedState());
    } finally {
      setCollapseHydrated(true);
    }
  }, [collapseStorageKey]);

  useEffect(() => {
    if (!collapseHydrated || typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(collapseStorageKey, JSON.stringify(collapsedSections));
    } catch (error) {
      console.error('Unable to persist role settings collapse state', error);
    }
  }, [collapsedSections, collapseHydrated, collapseStorageKey]);

  const enabledWidgets = Object.values(widgetState).filter(Boolean).length;
  const activeAutomations = config.automationRules.filter((rule) => rule.status === 'active').length;

  const highlights: Highlight[] = [
    {
      label: 'Active widgets',
      value: `${enabledWidgets}/${config.widgetControls.length}`,
      hint: `${config.widgetControls.length - enabledWidgets} paused`,
    },
    {
      label: 'Layout preset',
      value:
        config.layoutPresets.find((preset) => preset.id === selectedPreset)?.title ?? 'Custom layout',
      hint: config.scopeSummary[0] ?? 'Workspace baseline',
    },
    {
      label: 'Automations',
      value: `${activeAutomations}`,
      hint: `${config.automationRules.length} total rules`,
      tone: activeAutomations ? 'positive' : 'warn',
    },
  ];

  useEffect(() => {
    setWidgetState(remoteWidgetState);
  }, [remoteWidgetState]);

  const handleWidgetToggle = useCallback(
    (id: string, nextValue: boolean, scope: string) => {
      setWidgetState((prev) => ({ ...prev, [id]: nextValue }));
      void updateSettings(
        {
          widgetPreferences: {
            [id]: {
              enabled: nextValue,
              scope,
            },
          },
        },
        { silent: true }
      );
    },
    [updateSettings]
  );

  const handleSectionToggle = (sectionId: SectionId) => {
    setCollapsedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  return (
    <RoleDashboardLayout
      role={role}
      title={`${ROLE_LABEL[role]} settings`}
      description={
        config.hero.description ??
        `Personalize the workspace experience for ${user?.name ?? 'your team'}.`
      }
      kicker={config.hero.kicker ?? 'Workspace settings'}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/${role}`}>
              <ArrowLeft className="mr-2 h-3.5 w-3.5" />
              Back to dashboard
            </Link>
          </Button>
          <Badge
            variant="secondary"
            className={cn(
              'text-[0.65rem] uppercase tracking-widest',
              isUpdating ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {isUpdating ? 'Saving…' : 'Auto-save on'}
          </Badge>
        </div>
      }
      highlights={highlights}
    >
      <div className="grid gap-5 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          <SectionCard
            sectionId="layout"
            title="Layout presets"
            description="Select a layout profile for this role's dashboard."
            icon={<LayoutDashboard className="h-5 w-5 text-primary" />}
            collapsed={collapsedSections.layout}
            onToggle={handleSectionToggle}
          >
            <CardContent className="space-y-3">
              {config.layoutPresets.map((preset) => {
                const isActive = selectedPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    className={cn(
                      'w-full rounded-xl border p-4 text-left transition-all duration-200',
                      isActive
                        ? 'border-primary/60 bg-primary/5 shadow-sm ring-1 ring-primary/40'
                        : 'border-border/70 hover:border-primary/40 hover:bg-muted/30'
                    )}
                    onClick={() => handlePresetSelect(preset.id)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{preset.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{preset.description}</p>
                      </div>
                      {isActive ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden />
                      ) : null}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {preset.focus.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="border-primary/30 bg-primary/5 text-xs font-medium text-primary"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </SectionCard>

          <SectionCard
            sectionId="widgets"
            title="Widget controls"
            description="Toggle visibility and scope inheritance for each role-specific widget."
            icon={<Settings2 className="h-5 w-5 text-primary" />}
            collapsed={collapsedSections.widgets}
            onToggle={handleSectionToggle}
          >
            <CardContent className="space-y-4">
              {config.widgetControls.map((widget) => {
                const enabled =
                  widget.required || widgetState[widget.id] === undefined
                    ? true
                    : widgetState[widget.id];
                return (
                  <div
                    key={widget.id}
                    className="flex items-start justify-between gap-4 rounded-xl border border-border/80 p-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{widget.label}</p>
                        {widget.required ? (
                          <Badge variant="secondary" className="bg-muted text-[0.65rem] uppercase">
                            Required
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{widget.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground/80">
                        <Badge variant="outline" className="border-dashed text-[0.7rem] uppercase">
                          Scope: {widget.scope}
                        </Badge>
                        {widget.badges?.map((badge) => (
                          <Badge key={badge} variant="secondary" className="bg-muted text-[0.65rem] uppercase">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Switch
                      disabled={widget.required}
                      checked={enabled}
                      onCheckedChange={(checked) => handleWidgetToggle(widget.id, checked, widget.scope)}
                      aria-label={`Toggle ${widget.label}`}
                    />
                  </div>
                );
              })}
              <div className="rounded-2xl bg-muted/40 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Widget visibility summary</p>
                <Progress value={(enabledWidgets / Math.max(config.widgetControls.length, 1)) * 100} className="mt-3" />
                <p className="mt-2 text-xs">
                  {enabledWidgets} of {config.widgetControls.length} widgets are visible on the dashboard.
                </p>
              </div>
            </CardContent>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard
            sectionId="tools"
            title="Tool access & scope"
            description="Review which tools are exposed to this role."
            icon={<Layers className="h-5 w-5 text-primary" />}
            collapsed={collapsedSections.tools}
            onToggle={handleSectionToggle}
          >
            <CardContent className="space-y-3">
              {config.toolScopes.map((tool) => (
                <div key={tool.id} className="rounded-xl border border-border/70 p-4 text-sm shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{tool.name}</p>
                    <Badge variant="outline" className="text-xs uppercase">
                      {tool.level}
                    </Badge>
                  </div>
                  <p className="mt-1 text-muted-foreground">{tool.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-muted text-xs">
                      Surface: {tool.surface}
                    </Badge>
                    {tool.badges?.map((badge) => (
                      <Badge key={badge} variant="secondary" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </SectionCard>

          <SectionCard
            sectionId="automations"
            title="Automations & alerts"
            description="Enable proactive nudges tied to this role's widgets and tools."
            icon={<Sparkles className="h-5 w-5 text-primary" />}
            collapsed={collapsedSections.automations}
            onToggle={handleSectionToggle}
          >
            <CardContent className="space-y-4">
              {config.automationRules.map((rule) => (
                <div key={rule.id} className="rounded-xl border border-border/80 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{rule.title}</p>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                    </div>
                    <Badge
                      variant={rule.status === 'active' ? 'default' : 'outline'}
                      className={cn('text-xs uppercase', rule.status === 'draft' && 'text-muted-foreground')}
                    >
                      {rule.status ?? 'planned'}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground/80">{rule.effect}</p>
                </div>
              ))}
            </CardContent>
          </SectionCard>

          <SectionCard
            sectionId="scope"
            title="Scope summary"
            description="Key responsibilities influenced by this configuration."
            icon={<CheckCircle2 className="h-5 w-5 text-primary" />}
            collapsed={collapsedSections.scope}
            onToggle={handleSectionToggle}
          >
            <CardContent className="space-y-2">
              {config.scopeSummary.map((scope) => (
                <div key={scope} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary/60" />
                  {scope}
                </div>
              ))}
            </CardContent>
          </SectionCard>
        </div>
      </div>
    </RoleDashboardLayout>
  );
};

export default RoleSettingsView;
