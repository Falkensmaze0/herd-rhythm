import { formatDistanceToNow } from "date-fns";
import { Mail, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MailMessage } from "@/types/mail";
import { cn } from "@/lib/utils";

interface MailMessageListProps {
  messages: MailMessage[];
  selectedId?: string;
  isLoading?: boolean;
  onSelect: (message: MailMessage) => void;
  emptyState?: React.ReactNode;
  showFolderBadge?: boolean;
}

const LoadingState = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="space-y-2 rounded-2xl border border-border/60 p-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    ))}
  </div>
);

export const MailMessageList = ({
  messages,
  selectedId,
  isLoading,
  onSelect,
  emptyState,
  showFolderBadge = false,
}: MailMessageListProps) => {
  if (isLoading) {
    return <LoadingState />;
  }

  if (!messages.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
        {emptyState ?? (
          <>
            <Sparkles className="mb-3 h-6 w-6 text-primary" />
            <p>Your inbox is clear. Automation handled the rest.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => {
        const isActive = message.id === selectedId;
        return (
          <button
            type="button"
            key={message.id}
            className={cn(
              "w-full rounded-2xl border border-border/60 p-4 text-left transition duration-200",
              isActive ? "border-primary/60 bg-primary/5 shadow-lg shadow-primary/10" : "hover:border-primary/40 hover:bg-muted/40"
            )}
            onClick={() => onSelect(message)}
          >
            <div className="flex flex-wrap items-center gap-2">
              {showFolderBadge ? (
                <Badge variant="outline" className="text-[0.65rem] uppercase tracking-[0.2em]">
                  {message.folder}
                </Badge>
              ) : null}
              <Badge variant={message.isRead ? "outline" : "default"} className="text-xs">
                {message.isRead ? "Logged" : "Unread"}
              </Badge>
              {message.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[0.65rem] uppercase tracking-widest">
                  {tag}
                </Badge>
              ))}
            </div>
            <p className={cn("mt-2 text-sm font-semibold", message.isRead ? "text-foreground" : "text-primary")}>
              {message.subject}
            </p>
            <p className="text-sm text-muted-foreground">{message.body?.slice(0, 90) ?? "—"}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span>
                {message.senderName} → {message.recipientName}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
