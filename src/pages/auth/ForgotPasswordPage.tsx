import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `https://8d322e49.mydala.app/`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Check your inbox</CardTitle>
            <CardDescription>
              A password reset link has been sent to {email}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login">
              <Button className="w-full">Back to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handlePasswordReset}>
          <CardContent className="grid gap-4"> 
            <div className="grid gap-2"> 
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send reset link'}
            </Button>
          </CardContent>
        </form>
        <CardFooter>
          <div className="text-sm text-center w-full"> 
            Remember your password?{" "}
            <Link to="/login" className="underline"> 
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}