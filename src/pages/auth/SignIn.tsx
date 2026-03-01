import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Heart, User, Stethoscope, Shield } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { signInWithEmailPassword } from "@/lib/apiAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<'user' | 'counsellor' | 'admin'>('user');
  const navigate = useNavigate();
  const { login } = useUser();
  const { toast } = useToast();
  const googleBtnRef = useRef<HTMLDivElement | null>(null);

  // Google sign-in removed; email/password only
  useEffect(() => {}, [selectedRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const auth = await signInWithEmailPassword(email, password, selectedRole);
      const name = auth.displayName || (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1));

      login({ name, email: auth.email, role: selectedRole });

      toast({
        title: "Welcome back!",
        description: `Signed in successfully as ${selectedRole}`,
      });

      navigate(`/dashboard/${selectedRole}`);
    } catch (err: any) {
      toast({
        title: "Sign in failed",
        description: err?.message || "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-32 pb-20 gradient-warm min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">We're glad to see you again</p>
          </div>

          <Card className="p-8 shadow-soft border-border bg-card">
            {/* Email sign-in */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">Sign in with Email</p>
            </div>
            <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="user" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  User
                </TabsTrigger>
                <TabsTrigger value="counsellor" className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Counsellor
                </TabsTrigger>
                {/* Admin sign-in allowed but admin sign-up removed; still keep admin tab for sign-in */}
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Admin
                </TabsTrigger>
              </TabsList>

              {["user", "counsellor", "admin"].map((role) => (
                <TabsContent key={role} value={role}>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border-input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border-input"
                      />
                    </div>

                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 transition-smooth">
                      Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Button>
                  </form>
                </TabsContent>
              ))}
            </Tabs>
            <div className="mt-6">
              <Button
                type="button"
                className="w-full bg-secondary hover:bg-secondary/90 transition-smooth"
                onClick={() => {
                  window.location.href = '/auth/google';
                }}
              >
                Sign in with Google Fit
              </Button>
            </div>
            {/* Link to Sign Up */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              New to MindMate?{" "}
              <Link to="/auth/signup" className="text-primary hover:underline font-medium" aria-label="Go to Sign up">
                Sign up
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SignIn;
