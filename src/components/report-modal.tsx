"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { submitFeedback, type FeedbackType } from "@/lib/feedback-client";
import { toast } from "sonner";

type ReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  appSlug: string;
  appName: string;
};

const FEEDBACK_TYPES: { value: FeedbackType; label: string }[] = [
  { value: "incorrect_information", label: "Incorect Information" },
  { value: "broken_link", label: "Broken Link" },
  { value: "license_issue", label: "License Issue" },
  { value: "wrong_category", label: "Wrong Category" },
  { value: "outdated", label: "Outdated" },
  { value: "other", label: "Other" },
];

export function ReportModal({ isOpen, onClose, appSlug, appName }: ReportModalProps) {
  const [email, setEmail] = useState("");
  const [type, setType] = useState<FeedbackType | "">("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !type) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    const result = await submitFeedback({
      email,
      type: type as FeedbackType,
      message,
      appSlug,
      appName,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success("Report submitted successfully. Thank you!");
      setEmail("");
      setType("");
      setMessage("");
      onClose();
    } else {
      toast.error(result.error || "Failed to submit report");
    }
  };

  const handleClose = () => {
    setEmail("");
    setType("");
    setMessage("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report {appName}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            What is happening with this tool?
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>
              Type <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-2">
              {FEEDBACK_TYPES.map((feedbackType) => (
                <label
                  key={feedbackType.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="type"
                    value={feedbackType.value}
                    checked={type === feedbackType.value}
                    onChange={(e) => setType(e.target.value as FeedbackType)}
                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <span className="text-sm">{feedbackType.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Provide additional details about the issue..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !email || !type}
              className="flex-1"
            >
              {isSubmitting ? "Sending..." : "Send"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
