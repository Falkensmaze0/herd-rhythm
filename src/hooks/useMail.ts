import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/components/ui/use-toast";
import { MailFolder, MailMessage, MailSendPayload, MailSortOption, MailUnreadCount } from "@/types/mail";

export interface MailFilterOptions {
  folders: MailFolder[];
  sort?: MailSortOption;
  tags?: string[];
  onlyUnread?: boolean;
}

const buildQuery = (filters: MailFilterOptions) => {
  const params = new URLSearchParams();
  if (filters.folders?.length) {
    params.set("folders", filters.folders.join(","));
  }
  if (filters.sort) {
    params.set("sort", filters.sort);
  }
  if (filters.tags?.length) {
    params.set("tags", filters.tags.join(","));
  }
  if (filters.onlyUnread) {
    params.set("onlyUnread", "true");
  }
  return params.toString();
};

const fetchInbox = async (filters: MailFilterOptions): Promise<MailMessage[]> => {
  const query = buildQuery(filters);
  const response = await fetch(`/api/mail/inbox?${query}`, { credentials: "include" });
  if (!response.ok) {
    throw new Error("Unable to load inbox");
  }
  const payload = (await response.json()) as { data: MailMessage[] };
  return payload.data;
};

const fetchCounts = async (): Promise<MailUnreadCount> => {
  const response = await fetch("/api/mail/unread_count", { credentials: "include" });
  if (!response.ok) {
    throw new Error("Unable to load counts");
  }
  const payload = (await response.json()) as { data: MailUnreadCount };
  return payload.data;
};

const sendMessage = async (data: MailSendPayload) => {
  const response = await fetch("/api/mail/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Unable to send message");
  }
  return (await response.json()) as { data: { mode: "local" | "external" } };
};

const markRead = async (id: string, isRead: boolean) => {
  const response = await fetch(`/api/mail/${id}/read`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ isRead }),
  });
  if (!response.ok) {
    throw new Error("Unable to update message");
  }
  const payload = (await response.json()) as { data: MailMessage };
  return payload.data;
};

const deleteMessage = async (id: string) => {
  const response = await fetch(`/api/mail/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Unable to delete message");
  }
  return true;
};

const changeFolder = async (id: string, folder: MailFolder) => {
  const response = await fetch(`/api/mail/${id}/folder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ folder }),
  });
  if (!response.ok) {
    throw new Error("Unable to move message");
  }
  return true;
};

const updateTags = async (id: string, tags: string[]) => {
  const response = await fetch(`/api/mail/${id}/tags`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ tags }),
  });
  if (!response.ok) {
    throw new Error("Unable to update tags");
  }
  return true;
};

export const useMail = (filters: MailFilterOptions) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const inbox = useQuery({
    queryKey: ["mail", filters],
    queryFn: () => fetchInbox(filters),
  });

  const counts = useQuery({
    queryKey: ["mail-counts"],
    queryFn: fetchCounts,
  });

  const send = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mail"] }).catch(() => undefined);
      queryClient.invalidateQueries({ queryKey: ["mail-counts"] }).catch(() => undefined);
      toast({ title: "Message sent", description: "Your message is on its way." });
    },
    onError: (error) => {
      console.error("[mail] send failed", error);
      toast({
        title: "Send failed",
        description: "We couldn't send that message. Please retry.",
        variant: "destructive",
      });
    },
  });

  const toggleRead = useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) => markRead(id, isRead),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mail"] }).catch(() => undefined);
      queryClient.invalidateQueries({ queryKey: ["mail-counts"] }).catch(() => undefined);
      toast({
        title: variables.isRead ? "Marked as read" : "Marked as unread",
        description: variables.isRead ? "Message archived in your head." : "We'll keep it highlighted.",
      });
    },
  });

  const removeMessage = useMutation({
    mutationFn: (id: string) => deleteMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mail"] }).catch(() => undefined);
      queryClient.invalidateQueries({ queryKey: ["mail-counts"] }).catch(() => undefined);
      toast({
        title: "Message deleted",
        description: "Moved to trash.",
      });
    },
  });

  const moveToFolder = useMutation({
    mutationFn: ({ id, folder }: { id: string; folder: MailFolder }) => changeFolder(id, folder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mail"] }).catch(() => undefined);
      queryClient.invalidateQueries({ queryKey: ["mail-counts"] }).catch(() => undefined);
      toast({
        title: "Message moved",
        description: "Folder updated successfully.",
      });
    },
  });

  const updateMessageTags = useMutation({
    mutationFn: ({ id, tags }: { id: string; tags: string[] }) => updateTags(id, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mail"] }).catch(() => undefined);
      toast({
        title: "Tags updated",
        description: "Message tags saved.",
      });
    },
  });

  return {
    inbox,
    counts,
    send,
    toggleRead,
    removeMessage,
    moveToFolder,
    updateTags: updateMessageTags,
  };
};
