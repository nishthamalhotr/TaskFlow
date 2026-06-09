import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

type Status = "pending" | "in_progress" | "completed";
type Priority = "low" | "medium" | "high";
interface Task {
  id: string; title: string; description: string;
  status: Status; priority: Priority;
  created_by: string; created_at: string; updated_at: string;
}

const taskSchema = z.object({
  title: z.string().trim().min(1, "Title required").max(120),
  description: z.string().trim().max(2000).default(""),
  status: z.enum(["pending", "in_progress", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
});

function Dashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Task | null>(null);
  const [open, setOpen] = useState(false);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["my-tasks", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("created_by", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Task[];
    },
  });

  const upsert = useMutation({
    mutationFn: async (input: z.infer<typeof taskSchema> & { id?: string }) => {
      if (input.id) {
        const { error } = await supabase.from("tasks").update({
          title: input.title, description: input.description,
          status: input.status, priority: input.priority,
        }).eq("id", input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("tasks").insert({
          title: input.title, description: input.description,
          status: input.status, priority: input.priority,
          created_by: user!.id,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-tasks"] });
      toast.success(editing ? "Task updated" : "Task created");
      setOpen(false); setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-tasks"] });
      toast.success("Task deleted");
    },
  });

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = taskSchema.safeParse({
      title: fd.get("title"),
      description: fd.get("description") ?? "",
      status: fd.get("status"),
      priority: fd.get("priority"),
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    upsert.mutate({ ...parsed.data, id: editing?.id });
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My tasks</h1>
          <p className="text-sm text-muted-foreground">Manage your personal task list.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> New task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit task" : "Create task"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={editing?.title} required maxLength={120} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={editing?.description} maxLength={2000} rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select name="status" defaultValue={editing?.status ?? "pending"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select name="priority" defaultValue={editing?.priority ?? "medium"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={upsert.isPending}>
                  {upsert.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {editing ? "Save changes" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : tasks.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">No tasks yet. Create your first one!</CardContent></Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((t) => (
            <Card key={t.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{t.title}</CardTitle>
                  <PriorityBadge p={t.priority} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {t.description && <p className="text-sm text-muted-foreground line-clamp-3">{t.description}</p>}
                <StatusBadge s={t.status} />
                <div className="flex justify-end gap-1 pt-2">
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(t); setOpen(true); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => del.mutate(t.id)} disabled={del.isPending}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function PriorityBadge({ p }: { p: Priority }) {
  const map = { low: "bg-muted text-muted-foreground", medium: "bg-warning/20 text-foreground", high: "bg-destructive/15 text-destructive" };
  return <Badge variant="outline" className={map[p]}>{p}</Badge>;
}
function StatusBadge({ s }: { s: Status }) {
  const map: Record<Status, string> = {
    pending: "bg-muted text-muted-foreground",
    in_progress: "bg-primary/15 text-primary",
    completed: "bg-success/15 text-foreground",
  };
  const label = s === "in_progress" ? "In progress" : s[0].toUpperCase() + s.slice(1);
  return <Badge variant="outline" className={map[s]}>{label}</Badge>;
}
