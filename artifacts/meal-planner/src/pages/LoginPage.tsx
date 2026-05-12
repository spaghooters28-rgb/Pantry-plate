import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChefHat, LogIn, UserPlus, Eye, EyeOff, Mail, CheckCircle } from "lucide-react";

type Mode = "login" | "register" | "forgot";

export function LoginPage({ initialMode = "login" }: { initialMode?: "login" | "register" }) {
  const { login, register, forgotPassword } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setForgotSent(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email.trim(), password);
      } else if (mode === "register") {
        await register(email.trim(), displayName.trim(), password);
      } else {
        await forgotPassword(email.trim());
        setForgotSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = mode === "forgot"
    ? !!email.trim() && !loading
    : mode === "login"
      ? !!email.trim() && !!password && !loading
      : !!email.trim() && !!displayName.trim() && !!password && !loading;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <ChefHat className="w-9 h-9 text-primary" />
            <h1 className="text-3xl font-serif font-bold text-primary">Kitchen AI-d</h1>
          </div>
          <p className="text-muted-foreground text-sm">Your household meal planning app</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-serif">
              {mode === "login" ? "Welcome back" : mode === "register" ? "Create an account" : "Reset password"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Sign in to access your shared grocery list, pantry, and meal plans."
                : mode === "register"
                  ? "Set up your household account. Anyone with these credentials can access your shared data."
                  : "Enter your email address and we'll send you a reset link."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {forgotSent ? (
              <div className="text-center space-y-4 py-2">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
                <div>
                  <p className="font-semibold mb-1">Check your email</p>
                  <p className="text-sm text-muted-foreground">
                    If an account exists for <strong>{email}</strong>, a reset link has been sent. Check your inbox (and spam folder).
                  </p>
                </div>
                <button
                  onClick={() => switchMode("login")}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Display name — register only */}
                {mode === "register" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      type="text"
                      autoComplete="name"
                      placeholder="e.g. The Smith Family"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">This is how you'll appear in the app.</p>
                  </div>
                )}

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                {/* Password — login & register only */}
                {mode !== "forgot" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      {mode === "login" && (
                        <button
                          type="button"
                          onClick={() => switchMode("forgot")}
                          className="text-xs text-primary hover:underline"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={!canSubmit}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      {mode === "login" ? "Signing in…" : mode === "register" ? "Creating account…" : "Sending link…"}
                    </span>
                  ) : mode === "login" ? (
                    <span className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </span>
                  ) : mode === "register" ? (
                    <span className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Create Account
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Send Reset Link
                    </span>
                  )}
                </Button>
              </form>
            )}

            {!forgotSent && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                {mode === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <button onClick={() => switchMode("register")} className="text-primary hover:underline font-medium">
                      Create one
                    </button>
                  </>
                ) : mode === "register" ? (
                  <>
                    Already have an account?{" "}
                    <button onClick={() => switchMode("login")} className="text-primary hover:underline font-medium">
                      Sign in
                    </button>
                  </>
                ) : (
                  <button onClick={() => switchMode("login")} className="text-primary hover:underline font-medium">
                    Back to sign in
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Share your email and password with your household so everyone can access the same grocery list and pantry.
        </p>
      </div>
    </div>
  );
}
