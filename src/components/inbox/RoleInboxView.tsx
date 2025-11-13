'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivitySquare, ArrowLeft, BellRing, Filter, Inbox, Loader2, Plus, Search, Settings2 } from 'lucide-react';

import { RoleDashboardLayout } from '@/components/dashboards/RoleDashboardLayout';
import { MailComposer } from '@/components/inbox/MailComposer';
import { MailMessageDetail } from '@/components/inbox/MailMessageDetail';
import { MailMessageList } from '@/components/inbox/MailMessageList';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROLE_INBOX_COPY } from '@/data/roleInboxCopy';
import { useMail, MailFilterOptions } from '@/hooks/useMail';
import { useMailStream } from '@/hooks/useMailStream';
import { useUserSettings } from '@/hooks/useUserSettings';
import { MailFolder, MailMessage, MailSearchBuckets, MailSortOption } from '@/types/mail';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';

const FOLDER_OPTIONS: Array<{ label: string; value: MailFolder }> = [
  { label: 'Inbox', value: 'inbox' },
  { label: 'Sent', value: 'sent' },
  { label: 'Archived', value: 'archived' },
  { label: 'Trash', value: 'trash' },
];

const SORT_OPTIONS: Array<{ label: string; value: MailSortOption }> = [
  { label: 'Newest first', value: 'date-desc' },
  { label: 'Oldest first', value: 'date-asc' },
];

const isMailFolder = (value: unknown): value is MailFolder =>
  value === 'inbox' || value === 'sent' || value === 'archived' || value === 'trash';

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  doctor: 'Doctor',
  technician: 'Technician',
  helper: 'Helper',
  office: 'Office',
};

interface RoleInboxViewProps {
  role: UserRole;
}

export const RoleInboxView = ({ role }: RoleInboxViewProps) => {
  const copy = useMemo(() => ROLE_INBOX_COPY[role], [role]);
  const { settings, updateSettings } = useUserSettings();
  const persistedFolder = settings?.inboxView && isMailFolder(settings.inboxView) ? settings.inboxView : 'inbox';

  const [selectedFolders, setSelectedFolders] = useState<MailFolder[]>([persistedFolder]);
  const [sortOption, setSortOption] = useState<MailSortOption>('date-desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<MailSearchBuckets | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState('');
  const [selected, setSelected] = useState<MailMessage | undefined>();
  const [isComposerOpen, setComposerOpen] = useState(false);

  const mailFilters: MailFilterOptions = useMemo(
    () => ({
      folders: selectedFolders,
      sort: sortOption,
      tags: filterTags,
    }),
    [selectedFolders, sortOption, filterTags]
  );

  const { inbox, counts, send, toggleRead, removeMessage, moveToFolder, updateTags } = useMail(mailFilters);

  useMailStream();

  useEffect(() => {
    if (settings?.inboxView && isMailFolder(settings.inboxView)) {
      setSelectedFolders((prev) => {
        if (prev.includes(settings.inboxView)) {
          return prev;
        }
        return [settings.inboxView, ...prev];
      });
    }
  }, [settings?.inboxView]);

  useEffect(() => {
    if (!selectedFolders.length) {
      setSelectedFolders(['inbox']);
    }
  }, [selectedFolders]);

  useEffect(() => {
    const nextPrimary = selectedFolders[0];
    if (nextPrimary && settings?.inboxView !== nextPrimary) {
      void updateSettings({ inboxView: nextPrimary }, { silent: true });
    }
  }, [selectedFolders, settings?.inboxView, updateSettings]);

  const activeMessages = useMemo(() => {
    if (searchTerm.trim()) {
      return searchResults?.primary ?? [];
    }
    return inbox.data ?? [];
  }, [searchTerm, searchResults, inbox.data]);

  useEffect(() => {
    if (!activeMessages.length) {
      setSelected(undefined);
      return;
    }

    setSelected((current) => {
      if (current) {
        const next = activeMessages.find((message) => message.id === current.id);
        if (next) {
          return next;
        }
      }
      return activeMessages[0];
    });
  }, [activeMessages]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults(null);
      return;
    }

    const controller = new AbortController();
    const handle = setTimeout(async () => {
      setIsSearching(true);
      try {
        const params = new URLSearchParams();
        params.set('q', searchTerm);
        if (selectedFolders.length) {
          params.set('folders', selectedFolders.join(','));
        }
        const response = await fetch(`/api/mail/search?${params.toString()}`, {
          signal: controller.signal,
        });
        if (response.ok) {
          const payload = (await response.json()) as { data: MailSearchBuckets };
          setSearchResults(payload.data);
        }
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(handle);
    };
  }, [searchTerm, selectedFolders]);

  const toggleFolder = useCallback((nextFolder: MailFolder) => {
    setSelectedFolders((prev) => {
      if (prev.includes(nextFolder)) {
        if (prev.length === 1) {
          return prev;
        }
        return prev.filter((folder) => folder !== nextFolder);
      }
      return [...prev, nextFolder];
    });
  }, []);

  const handleSelect = useCallback((message: MailMessage) => {
    setSelected(message);
  }, []);

  const handleMarkRead = useCallback(
    (message: MailMessage, isRead: boolean) => {
      toggleRead.mutate({ id: message.id, isRead });
      setSelected({ ...message, isRead });
    },
    [toggleRead]
  );

  const handleDelete = useCallback(
    (message: MailMessage) => {
      removeMessage.mutate(message.id);
      setSelected(undefined);
    },
    [removeMessage]
  );

  const handleArchive = useCallback(
    (message: MailMessage, folder: MailFolder) => {
      moveToFolder.mutate({ id: message.id, folder });
    },
    [moveToFolder]
  );

  const handleTagUpdate = useCallback(
    (message: MailMessage, tags: string[]) => {
      updateTags.mutate({ id: message.id, tags });
    },
    [updateTags]
  );

  const addFilterTag = () => {
    const value = tagDraft.trim();
    if (!value || filterTags.includes(value)) {
      return;
    }
    setFilterTags((prev) => [...prev, value]);
    setTagDraft('');
  };

  const removeFilterTag = (tag: string) => {
    setFilterTags((prev) => prev.filter((entry) => entry !== tag));
  };

  const digestCards = [
    { label: 'Unread now', value: counts.data?.total ?? 0, hint: 'Across this host' },
    { label: 'Priority', value: counts.data?.priority ?? 0, hint: 'Tagged urgent' },
    { label: 'Viewing', value: activeMessages.length, hint: `${selectedFolders.join(', ')}` },
  ];

  const showFolderBadge = selectedFolders.length > 1;

  return (
    <RoleDashboardLayout
      role={role}
      title={`${ROLE_LABEL[role]} inbox`}
      description={copy.description}
      kicker={copy.kicker}
      highlights={copy.highlights}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/${role}`}>
              <ArrowLeft className="mr-2 h-3.5 w-3.5" />
              Back to dashboard
            </Link>
          </Button>
          <MailComposer
            open={isComposerOpen}
            onOpenChange={setComposerOpen}
            onSubmit={async (values) => {
              await send.mutateAsync(values);
            }}
            isSending={send.isPending}
          />
          <Button variant="outline" size="sm" onClick={() => inbox.refetch()} disabled={inbox.isFetching}>
            {inbox.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[380px,1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-4 w-4 text-primary" />
                Views & Filters
              </CardTitle>
              <CardDescription>Choose categories, refine search, and save signals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search subject or body"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {FOLDER_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    size="sm"
                    variant={selectedFolders.includes(option.value) ? 'default' : 'secondary'}
                    className={cn(
                      selectedFolders.includes(option.value) ? 'shadow shadow-primary/20' : 'opacity-80',
                      'capitalize'
                    )}
                    onClick={() => toggleFolder(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 px-0 text-sm text-primary">
                    <Settings2 className="h-4 w-4" />
                    Advanced search
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 rounded-2xl border border-dashed border-border/60 p-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-muted-foreground">Sort by</Label>
                    <Select value={sortOption} onValueChange={(value) => setSortOption(value as MailSortOption)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort" />
                      </SelectTrigger>
                      <SelectContent>
                        {SORT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-muted-foreground">Filter tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {filterTags.length ? (
                        filterTags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1 text-[0.65rem] uppercase">
                            {tag}
                            <button type="button" aria-label={`Remove ${tag}`} onClick={() => removeFilterTag(tag)}>
                              ×
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">No tag filters. Add one below.</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Add tag filter"
                        value={tagDraft}
                        onChange={(event) => setTagDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            addFilterTag();
                          }
                        }}
                      />
                      <Button type="button" size="sm" onClick={addFilterTag} disabled={!tagDraft.trim()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          {searchTerm ? (
            <>
              <Card className="animate-in fade-in-50">
                <CardHeader>
                  <CardTitle className="text-base">Search results</CardTitle>
                  <CardDescription>
                    {isSearching
                      ? 'Scanning…'
                      : `${searchResults?.primary.length ?? 0} matches in ${selectedFolders.join(', ')}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MailMessageList
                    messages={searchResults?.primary ?? []}
                    selectedId={selected?.id}
                    isLoading={isSearching}
                    onSelect={handleSelect}
                    emptyState={<p>No matches in the selected folders.</p>}
                    showFolderBadge={showFolderBadge}
                  />
                </CardContent>
              </Card>
              {searchResults?.secondary?.length ? (
                <Card className="animate-in fade-in-50">
                  <CardHeader>
                    <CardTitle className="text-base">Other results</CardTitle>
                    <CardDescription>Found outside your selected folders.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MailMessageList
                      messages={searchResults.secondary}
                      selectedId={selected?.id}
                      isLoading={isSearching}
                      onSelect={handleSelect}
                      showFolderBadge
                    />
                  </CardContent>
                </Card>
              ) : null}
            </>
          ) : (
            <Card className="animate-in fade-in-50">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Inbox className="h-5 w-5 text-primary" />
                    {selectedFolders.length > 1 ? 'Combined view' : `${selectedFolders[0]} threads`}
                  </CardTitle>
                  <CardDescription>
                    {selectedFolders.length > 1 ? 'Merged timeline from your selected folders.' : 'Latest routed messages.'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <MailMessageList
                  messages={inbox.data ?? []}
                  selectedId={selected?.id}
                  isLoading={inbox.isLoading}
                  onSelect={handleSelect}
                  showFolderBadge={showFolderBadge}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <MailMessageDetail
            message={selected}
            onMarkRead={handleMarkRead}
            onDelete={handleDelete}
            onMoveToFolder={handleArchive}
            onUpdateTags={handleTagUpdate}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ActivitySquare className="h-5 w-5 text-primary" />
                Inbox digest
              </CardTitle>
              <CardDescription>Live rollup from automation.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {digestCards.map((item) => (
                <div key={item.label} className="rounded-2xl bg-muted/40 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-semibold text-foreground">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.hint}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BellRing className="h-5 w-5 text-primary" />
                Automation center
              </CardTitle>
              <CardDescription>Flows currently feeding this inbox.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {copy.automation.map((automation) => (
                <div key={automation.title} className="rounded-2xl border border-border/60 p-4">
                  <p className="text-sm font-semibold">{automation.title}</p>
                  <p className="text-xs text-muted-foreground">{automation.description}</p>
                  <Badge variant="secondary" className="mt-2 bg-muted text-[0.65rem] uppercase">
                    {automation.status}
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

export default RoleInboxView;
