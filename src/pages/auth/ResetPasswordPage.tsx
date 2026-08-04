import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);

  const handleReset = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } =
      await supabase.auth.updateUser({
        password,
      });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password updated successfully.");

setTimeout(() => {
  navigate("/login");
}, 1500);

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-sm">

        <CardHeader>
          <CardTitle>
            Reset Password
          </CardTitle>

          <CardDescription>
            Enter your new password.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleReset}>

          <CardContent className="space-y-4">

            <div>
              <Label>
                New Password
              </Label>

              <Input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>

            <div>
              <Label>
                Confirm Password
              </Label>

              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                required
              />
            </div>

            <Button
              className="w-full"
              disabled={loading}
              type="submit"
            >
              {loading
                ? "Updating..."
                : "Update Password"}
            </Button>

          </CardContent>

        </form>

      </Card>
    </div>
  );
            }
