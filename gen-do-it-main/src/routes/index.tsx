import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { CheckSquare, ShieldCheck, Layers, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TaskFlow — Task Management with Roles" },
      { name: "description", content: "A modern task manager with role-based access control. Sign up free." },
      { property: "og:title", content: "TaskFlow — Task Management" },
      { property: "og:description", content: "A modern task manager with role-based access control." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/40">
      <header className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-primary" />
          <span className="font-semibold tracking-tight">TaskFlow</span>
        </div>
        <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
      </header>
      <section className="max-w-3xl mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
          Focus on what matters. <span className="text-primary">Get tasks done.</span>
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          A clean, secure task management system with authentication and role-based access — built for teams and individuals.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/auth"><Button size="lg">Get started <ArrowRight className="h-4 w-4 ml-1" /></Button></Link>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-4 pb-24 grid sm:grid-cols-3 gap-6">
        <Feature icon={Layers} title="Full task CRUD" desc="Create, update, prioritize, and track status across your tasks." />
        <Feature icon={ShieldCheck} title="Role-based access" desc="Users manage their own tasks. Admins see and manage everything." />
        <Feature icon={CheckSquare} title="Secure by default" desc="Row-level security on every record. Hashed passwords, JWT sessions." />
      </section>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <Icon className="h-6 w-6 text-primary mb-3" />
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
