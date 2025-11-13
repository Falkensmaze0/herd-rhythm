import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MailSendPayload } from "@/types/mail";

interface MailComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: MailSendPayload) => Promise<void> | void;
  isSending: boolean;
}

const LOCAL_DOMAIN = process.env.NEXT_PUBLIC_LOCAL_MAIL_DOMAIN || "farm.com";

export const MailComposer = ({ open, onOpenChange, onSubmit, isSending }: MailComposerProps) => {
  const form = useForm<MailSendPayload>({
    defaultValues: {
      to: "",
      subject: "",
      body: "",
    },
  });

  const recipient = form.watch("to");
  const isLocal = recipient.endsWith(`@${LOCAL_DOMAIN}`);

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">Compose</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Compose message</DialogTitle>
          <DialogDescription>Send a quick note to any teammate on the host.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            try {
              await onSubmit(values);
              onOpenChange(false);
            } catch (error) {
              console.error("[mail] compose failed", error);
            }
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input id="to" placeholder={`user@${LOCAL_DOMAIN}`} {...form.register("to", { required: true })} />
            {recipient ? (
              <p className="text-xs text-muted-foreground">
                Delivering via {isLocal ? "local pipe (instant)" : "external SMTP"}.
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="Subject" {...form.register("subject", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea id="body" rows={6} placeholder="Write your note..." {...form.register("body", { required: true })} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSending} className="w-full">
              {isSending ? "Sending…" : "Send"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
