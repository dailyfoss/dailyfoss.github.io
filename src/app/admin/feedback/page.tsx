"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Filter,
  Loader2,
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  checkAdminStatus,
  deleteFeedback,
  getFeedbackList,
  updateFeedbackStatus,
  type Feedback,
  type FeedbackStatus,
} from "@/lib/feedback-client";

const STATUS_CONFIG: Record<FeedbackStatus, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: "Pending", icon: <Clock className="w-4 h-4" />, color: "text-yellow-500" },
  reviewed: { label: "Reviewed", icon: <AlertCircle className="w-4 h-4" />, color: "text-blue-500" },
  resolved: { label: "Resolved", icon: <CheckCircle className="w-4 h-4" />, color: "text-green-500" },
  dismissed: { label: "Dismissed", icon: <XCircle className="w-4 h-4" />, color: "text-gray-500" },
};

const TYPE_LABELS: Record<string, string> = {
  broken_link: "Broken Link",
  wrong_category: "Wrong Category",
  outdated: "Outdated",
  other: "Other",
};

export default function AdminFeedbackPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "all">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadFeedbacks();
    }
  }, [isAdmin, statusFilter]);

  const checkAccess = async () => {
    const result = await checkAdminStatus();
    setIsAdmin(result.isAdmin);
    setIsLoading(false);
    
    if (!result.isAdmin) {
      toast.error("Access denied. Admin privileges required.");
    }
  };

  const loadFeedbacks = async () => {
    setIsLoading(true);
    const result = await getFeedbackList({
      limit: 100,
      status: statusFilter === "all" ? undefined : statusFilter,
    });
    
    if (result.error) {
      toast.error(result.error);
    } else {
      setFeedbacks(result.feedbacks);
      setTotal(result.total);
    }
    setIsLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: FeedbackStatus) => {
    setUpdatingId(id);
    const result = await updateFeedbackStatus(id, newStatus);
    setUpdatingId(null);
    
    if (result.success) {
      toast.success("Status updated");
      loadFeedbacks();
    } else {
      toast.error(result.error || "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    
    setUpdatingId(id);
    const result = await deleteFeedback(id);
    setUpdatingId(null);
    
    if (result.success) {
      toast.success("Feedback deleted");
      loadFeedbacks();
    } else {
      toast.error(result.error || "Failed to delete");
    }
  };

  if (isLoading && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
        <p className="text-muted-foreground">Page not found</p>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl mt-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Feedback Management</h1>
          <p className="text-muted-foreground">
            {total} total feedback{total !== 1 ? "s" : ""}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as FeedbackStatus | "all")}
          >
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={loadFeedbacks}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {feedbacks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No feedback found
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((feedback) => (
            <FeedbackCard
              key={feedback.id}
              feedback={feedback}
              isUpdating={updatingId === feedback.id}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FeedbackCard({
  feedback,
  isUpdating,
  onStatusChange,
  onDelete,
}: {
  feedback: Feedback;
  isUpdating: boolean;
  onStatusChange: (id: string, status: FeedbackStatus) => void;
  onDelete: (id: string) => void;
}) {
  const statusConfig = STATUS_CONFIG[feedback.status];
  
  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <a
              href={`/${feedback.appSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:underline flex items-center gap-1"
            >
              {feedback.appName}
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="px-2 py-0.5 text-xs rounded-full bg-secondary">
              {TYPE_LABELS[feedback.type] || feedback.type}
            </span>
            <span className={`flex items-center gap-1 text-xs ${statusConfig.color}`}>
              {statusConfig.icon}
              {statusConfig.label}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">
            From: {feedback.email}
          </p>
          
          {feedback.message && (
            <p className="text-sm bg-muted p-2 rounded mb-2">
              {feedback.message}
            </p>
          )}
          
          <p className="text-xs text-muted-foreground">
            {format(new Date(feedback.createdAt), "PPp")}
            {feedback.updatedBy && (
              <span className="ml-2">
                · Updated by {feedback.updatedBy}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select
            value={feedback.status}
            onValueChange={(v) => onStatusChange(feedback.id, v as FeedbackStatus)}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(feedback.id)}
            disabled={isUpdating}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
