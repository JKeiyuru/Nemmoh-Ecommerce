/* eslint-disable no-unused-vars */
//client/src/pages/auth/register.jsx
import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { registerFormControls } from "@/config";
import { registerFirebaseUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";
import { AuthProviders } from "@/components/auth/auth-providers";
import { Loader2 } from "lucide-react";

const initialState = {
  userName: "",
  email: "",
  password: "",
};

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    let firebaseUserForCleanup = null;

    try {
      // First, create the Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      firebaseUserForCleanup = userCredential.user;

      const idToken = await userCredential.user.getIdToken();

      const response = await dispatch(
        registerFirebaseUser({
          userName: formData.userName,
          email: formData.email,
          firebaseUid: userCredential.user.uid,
          idToken,
        })
      );

      if (response?.payload?.success) {
        toast({
          title: "Account created successfully!",
          description: "You will be redirected shortly.",
        });
        // Don't manually navigate — the auth state listener in App.jsx
        // (and CheckAuth watching Redux) will handle the redirect.
      } else {
        // Backend registration failed — clean up the orphaned Firebase user.
        await firebaseUserForCleanup.delete().catch(() => {});
        throw new Error(response?.payload?.message || "Registration failed");
      }
    } catch (error) {
      let description = error.message || "An unexpected error occurred";

      if (error.code === "auth/email-already-in-use") {
        description = "An account with this email already exists. Try logging in instead.";
      } else if (error.code === "auth/weak-password") {
        description = "Please choose a stronger password (at least 6 characters).";
      } else if (error.code === "auth/invalid-email") {
        description = "That doesn't look like a valid email address.";
      }

      toast({
        title: "Registration failed",
        description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Create new account
        </h1>
        <p className="mt-2">
          Already have an account
          <Link
            className="font-medium ml-2 text-primary hover:underline"
            to="/auth/login"
          >
            Login
          </Link>
        </p>
      </div>
      <CommonForm
        formControls={registerFormControls}
        buttonText={
          isLoading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
            </span>
          ) : (
            "Sign Up"
          )
        }
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        disabled={isLoading}
      />
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
        onSuccess={() => {
          toast({ 
            title: "Account created successfully!",
            description: "You will be redirected shortly."
          });
        }}
        onError={(error) => {
          toast({
            title: "Registration failed",
            description: error,
            variant: "destructive"
          });
        }}
      />
    </div>
  );
}

export default AuthRegister;
