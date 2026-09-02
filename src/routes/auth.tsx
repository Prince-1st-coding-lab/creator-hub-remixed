import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LOGO_SRC } from "@/lib/site-data";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Owner sign in | G Modern Creativity Ltd" },
      { name: "description", content: "Sign in to manage the G Modern Creativity Ltd website." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Owner sign in | G Modern Creativity Ltd" },
      { property: "og:description", content: "Private area for the business owner." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        setMessage("Account created. If email confirmation is required, check your inbox.");
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate({ to: "/admin" });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-5 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
        <img
          src={LOGO_SRC}
          alt="G Modern Creativity Ltd logo"
          width={48}
          height={48}
          className="h-12 w-12 rounded-full object-cover ring-1 ring-border"
        />
        <h1 className="mt-4 text-2xl">Owner sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your website content.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        {message ? <p className="mt-4 text-sm text-destructive">{message}</p> : null}
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 text-sm text-muted-foreground underline"
        >
          {mode === "signin" ? "Create the owner account" : "I already have an account"}
        </button>
      </div>
    </div>
  );
}
