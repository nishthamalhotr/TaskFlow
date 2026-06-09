import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Trash2, Loader2, Users, ListTodo } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth, useIsAdmin } from "@/hooks/use-auth";
import { adminDeleteUser } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  component: Admin,
});

function Admin() {
  const { user, loading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin(user?.id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const deleteUserFn = useServerFn(adminDeleteUser);

  useEffect(() => {
    if (!loading && !roleLoading && !isAdmin) {
      toast.error("Admin access required");
      navigate({ to: "/dashboard" });
    }
  }, [isAdmin, loading, roleLoading, navigate]);

  const usersQ = useQuery({
    queryKey: ["admin-users"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const tasksQ = useQuery({
    queryKey: ["admin-tasks"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const delTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tasks"] }); toast.success("Task deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const delUser = useMutation({
    mutationFn: (userId: string) => deleteUserFn({ data: { userId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-tasks"] });
      toast.success("User deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!isAdmin) return null;

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Admin panel</h1>
        <p className="text-sm text-muted-foreground">Manage all users and tasks across the platform.</p>
      </div>
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" /> Users</TabsTrigger>
          <TabsTrigger value="tasks"><ListTodo className="h-4 w-4 mr-1" /> Tasks</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <Card>
            <CardHeader><CardTitle>All users</CardTitle></CardHeader>
            <CardContent>
              {usersQ.isLoading ? <Spinner /> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Joined</TableHead><TableHead className="w-20" />
                  </TableRow></TableHeader>
                  <TableBody>
                    {usersQ.data?.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.name || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell className="text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost"
                            disabled={u.id === user?.id || delUser.isPending}
                            onClick={() => { if (confirm("Delete this user and all their data?")) delUser.mutate(u.id); }}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tasks">
          <Card>
            <CardHeader><CardTitle>All tasks</CardTitle></CardHeader>
            <CardContent>
              {tasksQ.isLoading ? <Spinner /> : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead>Priority</TableHead><TableHead>Created</TableHead><TableHead className="w-20" />
                  </TableRow></TableHeader>
                  <TableBody>
                    {tasksQ.data?.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.title}</TableCell>
                        <TableCell><Badge variant="outline">{t.status.replace("_", " ")}</Badge></TableCell>
                        <TableCell><Badge variant="outline">{t.priority}</Badge></TableCell>
                        <TableCell className="text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => delTask.mutate(t.id)} disabled={delTask.isPending}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function Spinner() { return <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>; }
