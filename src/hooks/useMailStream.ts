import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/components/ui/use-toast";

export const useMailStream = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const source = new EventSource("/api/ws/mail");
    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ["mail"] }).catch((error) => console.error("[mail] invalidate failed", error));
      queryClient.invalidateQueries({ queryKey: ["mail-counts"] }).catch((error) => console.error("[mail] invalidate counts failed", error));
    };

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as { event?: string };
        if (payload?.event === "new_mail") {
          toast({
            title: "New message landed",
            description: "Refreshing inbox...",
          });
        }
      } catch (error) {
        console.error("[mail] SSE parse", error);
      } finally {
        invalidate();
      }
    };

    source.onerror = () => {
      toast({
        title: "Realtime connection lost",
        description: "Trying to reconnect to the inbox stream.",
        variant: "destructive",
      });
    };

    return () => {
      source.close();
    };
  }, [queryClient, toast]);
};
