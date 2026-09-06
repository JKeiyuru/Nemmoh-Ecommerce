/* eslint-disable no-unused-vars */
//client/src/pages/auth/login.jsx
import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { loginFormControls } from "@/config";
import { loginUser, syncFirebaseAuth } from "@/store/auth-slice";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";
import { AuthProviders } from "@/components/auth/auth-providers";
import { Loader2 } from "lucide-react";

const initialState = {
  email: "",
  password: "",
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Once Redux confirms the user is authenticated (regardless of which path
  // got them there — email/password, Firebase, or Google), navigate them
  // onward: back to whatever protected page they were trying to reach (e.g.
  // checkout), or to their role's home otherwise. Guest-cart merging is
  // handled globally in App.jsx.
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectTo =
        location.state?.from?.pathname ||
        (user.role === "admin" ? "/admin/dashboard" : "/shop/home");
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.state]);

  function friendlyFirebaseError(firebaseError) {
    switch (firebaseError.code) {
      case "auth/user-not-found":
        return null; // Not a Firebase account — try traditional login instead.
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Incorrect email or password.";
      case "auth/invalid-email":
        return "That doesn't look like a valid email address.";
      case "auth/user-disabled":
        return "This account has been disabled. Please contact support.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a moment and try again.";
      default:
        return null;
    }
  }

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    try {
      // Try Firebase first — most accounts are Firebase-authenticated.
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Sync with our backend so we know the user's role, id, etc.
      // (This is the single source of truth for post-Firebase-login sync —
      // App.jsx's onAuthStateChanged listener will also fire and no-op if
      // this already succeeded.)
      const syncResult = await dispatch(syncFirebaseAuth(userCredential.user));

      if (!syncResult?.payload?.success) {
        throw new Error(
          syncResult?.payload?.message || "We couldn't finish signing you in. Please try again."
        );
      }

      toast({ title: "Logged in successfully!" });
      // Navigation + cart merge handled by the useEffect above once Redux updates.
    } catch (firebaseError) {
      const knownMessage = friendlyFirebaseError(firebaseError);

      if (knownMessage) {
        toast({ title: "Login failed", description: knownMessage, variant: "destructive" });
        setIsLoading(false);
        return;
      }

      // Firebase doesn't recognize this account (or errored unexpectedly) —
      // fall back to a traditional local-password login.
      try {
        const response = await dispatch(loginUser({ formData }));

        if (response?.payload?.success) {
          toast({ title: "Logged in successfully!" });
          // Navigation + cart merge handled by the useEffect above.
        } else {
          toast({
            title: "Login failed",
            description: response?.payload?.message || "Please check your credentials and try again.",
            variant: "destructive",
          });
        }
      } catch (backendError) {
        toast({
          title: "Login failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Google/Social login success
  const handleSocialLoginSuccess = () => {
    toast({ title: "Logged in successfully!" });
    // Navigation + cart merge handled by the useEffect above.
  };

  // Handle social login error
  const handleSocialLoginError = (error) => {
    toast({
      title: "Authentication failed",
      description: error,
      variant: "destructive",
    });
  };

  // Don't render the form if already authenticated
  if (isAuthenticated && user) {
    return null; // Let useEffect handle navigation
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Sign in to your account
        </h1>
        <p className="mt-2">
          Don&apos;t have an account
          <Link
            className="font-medium ml-2 text-primary hover:underline"
            to="/auth/register"
          >
            Register
          </Link>
        </p>
      </div>

      <CommonForm
        formControls={loginFormControls}
        buttonText={
          isLoading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Signing In...
            </span>
          ) : (
            "Sign In"
          )
        }
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        disabled={isLoading}
      />

      <div className="text-right -mt-4">
        <Link
          to="/auth/forgot-password"
          className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline"
        >
          Forgot your password?
        </Link>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <AuthProviders 
        onSuccess={handleSocialLoginSuccess}
        onError={handleSocialLoginError}
      />
    </div>
  );
}

export default AuthLogin;
