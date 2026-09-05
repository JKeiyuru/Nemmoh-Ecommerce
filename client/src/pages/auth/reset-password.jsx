// client/src/pages/auth/reset-password.jsx
import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config/config.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Lock, CheckCircle, ArrowLeft } from "lucide-react";

function ResetPassword() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const navigate = useNavigate();
  const { toast } = useToast();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();

    if (newPassword.length < 6) {
      return toast({ title: "Password must be at least 6 characters", variant: "destructive" });
    }
    if (newPassword !== confirmPassword) {
      return toast({ title: "Passwords do not match", variant: "destructive" });
    }

    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        email,
        token,
        newPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate("/auth/login"), 2000);
    } catch (error) {
      toast({
        title: "Could not reset password",
        description: error.response?.data?.message || "This link may have expired.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!email || !token) {
    return (
      <div className="mx-auto w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-light text-gray-900">Invalid reset link</h1>
        <p className="text-sm text-gray-500">This password reset link is missing information. Please request a new one.</p>
        <Link to="/auth/forgot-password" className="inline-block text-sm font-medium text-gray-900 hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto w-full max-w-md space-y-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-9 h-9 text-green-600" />
        </div>
        <h1 className="text-2xl font-light text-gray-900">Password reset!</h1>
        <p className="text-sm text-gray-500">Redirecting you to sign in…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-light tracking-tight text-gray-900">Set a new password</h1>
        <p className="mt-2 text-sm text-gray-500">Choose a new password for {email}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="newPassword"
              type="password"
              placeholder="At least 6 characters"
              className="pl-9"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              className="pl-9"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading ? "Resetting…" : "Reset Password"}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500">
        <Link to="/auth/login" className="inline-flex items-center gap-1 font-medium text-gray-900 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>
      </p>
    </div>
  );
}

export default ResetPassword;
