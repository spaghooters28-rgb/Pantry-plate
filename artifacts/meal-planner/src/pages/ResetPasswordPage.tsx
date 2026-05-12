import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChefHat, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  token: string;
}

export function ResetPasswordPage({ token }: Props) {
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          <BrandLogo />
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
              <p className="font-semibold">Invalid reset link</p>
              <p className="text-sm text-muted-foreground">
                This password reset link is missing or invalid. Please request a new one.
              </p>
              <a href="/" className="text-sm text-primary hover:underline font-medium block">
                Back to sign in
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <BrandLogo />

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-serif">Set new password</CardTitle>
            <CardDescription>
              Choose a strong password for your account. You'll use it to sign in going forward.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center space-y-4 py-2">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
                <div>
                  <p className="font-semibold mb-1">Password updated!</p>
                  <p className="text-sm text-muted-foreground">
                    Your password has been changed. You can now sign in with your new password.
                  </p>
                </div>
                <a href="/" className="text-sm text-primary hover:underline font-medium block">
                  Go to sign in
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
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

                <div className="space-y-1.5">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input
                    id="confirm"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat your new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !password || !confirm}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Updating password…
                    </span>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BrandLogo() {
  return (
    <div className="text-center space-y-2">
      <div className="flex items-center justify-center gap-2">
        <ChefHat className="w-9 h-9 text-primary" />
        <h1 className="text-3xl font-serif font-bold text-primary">Kitchen AI-d</h1>
      </div>
      <p className="text-muted-foreground text-sm">Your household meal planning app</p>
    </div>
  );
}
