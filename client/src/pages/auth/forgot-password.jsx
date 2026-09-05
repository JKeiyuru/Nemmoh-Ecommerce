// client/src/pages/auth/forgot-password.jsx
import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config/config.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { Mail, CheckCircle, ArrowLeft } from "lucide-react";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  async function onSubmit(event) {
    event.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
      setSubmitted(true);
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: error.response?.data?.message || "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto w-full max-w-md space-y-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-9 h-9 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-light text-gray-900">Check your email</h1>
          <p className="mt-2 text-gray-500 text-sm">
            If an account exists for <strong>{email}</strong>, we&apos;ve sent a link to reset your password. It&apos;ll expire in 1 hour.
          </p>
        </div>
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-900 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-light tracking-tight text-gray-900">
          Forgot your password?
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter the email on your account and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="pl-9"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading ? "Sending…" : "Send Reset Link"}
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

export default ForgotPassword;
