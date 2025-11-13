import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Archive, CheckCircle, CircleDashed, Download, Plus, Tag, Trash, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { MailFolder, MailMessage } from "@/types/mail";

interface MailMessageDetailProps {
  message?: MailMessage | null;
  onMarkRead: (message: MailMessage, next: boolean) => void;
  onDelete: (message: MailMessage) => void;
  onMoveToFolder: (message: MailMessage, folder: MailFolder) => void;
  onUpdateTags: (message: MailMessage, tags: string[]) => void;
}

const formatDate = (value: string) => format(new Date(value), "MMM d, yyyy • h:mm a");

export const MailMessageDetail = ({ message, onMarkRead, onDelete, onMoveToFolder, onUpdateTags }: MailMessageDetailProps) => {
  const [tagDraft, setTagDraft] = useState("");

  useEffect(() => {
    setTagDraft("");
  }, [message?.id]);

  const handleAddTag = () => {
    if (!message) return;
    const value = tagDraft.trim();
    if (!value || message.tags.includes(value)) {
      return;
    }
    onUpdateTags(message, [...message.tags, value]);
    setTagDraft("");
  };

  const handleRemoveTag = (tag: string) => {
    if (!message) return;
    onUpdateTags(
      message,
      message.tags.filter((existing) => existing !== tag)
    );
  };

  if (!message) {
    return (
      <Card className="min-h-[420px] animate-in fade-in-50">
        <CardHeader>
          <CardTitle>Open a message</CardTitle>
          <CardDescription>Select a thread on the left to view the content.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="animate-in fade-in-50">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="uppercase tracking-[0.2em]">
            {message.folder}
          </Badge>
          {message.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[0.65rem] uppercase">
              {tag}
            </Badge>
          ))}
        </div>
        <CardTitle className="text-2xl font-semibold">{message.subject}</CardTitle>
        <CardDescription>
          {message.senderName} ({message.senderEmail}) → {message.recipientEmail}
        </CardDescription>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => onMarkRead(message, !message.isRead)}>
            {message.isRead ? (
              <>
                <CircleDashed className="mr-2 h-4 w-4" /> Mark unread
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" /> Mark read
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              onMoveToFolder(message, message.folder === "archived" ? "inbox" : "archived")
            }
          >
            <Archive className="mr-2 h-4 w-4" />
            {message.folder === "archived" ? "Move to inbox" : "Archive"}
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => onDelete(message)}>
            <Trash className="mr-2 h-4 w-4" /> Trash
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-2xl bg-muted/30 p-4 text-sm text-muted-foreground">
          Sent {formatDate(message.createdAt)} • Updated {formatDate(message.updatedAt)}
        </div>
        <article className="prose prose-sm dark:prose-invert max-w-none space-y-4">
          {message.bodyHtml ? (
            <div dangerouslySetInnerHTML={{ __html: message.bodyHtml }} />
          ) : (
            message.body?.split("\n").map((line, index) => (
              <p key={index} className="leading-relaxed">
                {line}
              </p>
            ))
          )}
        </article>
        {message.attachments.length ? (
          <div className="space-y-3 rounded-2xl border border-border/60 p-4">
            <p className="text-sm font-semibold">Attachments</p>
            <Separator />
            <div className="space-y-2">
              {message.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2 text-sm hover:border-primary"
                >
                  <span>{attachment.fileName}</span>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>
        ) : null}
        <div className="space-y-3 rounded-2xl border border-border/60 p-4">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Tags</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {message.tags.length ? (
              message.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1 text-[0.7rem] uppercase"
                >
                  {tag}
                  <button
                    type="button"
                    aria-label={`Remove ${tag}`}
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No tags yet. Add one below.</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Add tag"
              value={tagDraft}
              onChange={(event) => setTagDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button type="button" size="sm" onClick={handleAddTag} disabled={!tagDraft.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
