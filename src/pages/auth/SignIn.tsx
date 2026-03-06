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
// TODO: Switch to Cognito once AWS is set up
// import { cognitoSignIn, getCognitoUserAttributes } from "@/lib/cognito-auth";
import { tempSignIn, getTempUserAttributes } from "@/lib/tempAuth";
import { useToast } from "@/hooks/use-toast";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<'user' | 'counsellor' | 'admin'>('user');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Switch to Cognito
      // const result = await cognitoSignIn({ email, password });
      const result = await tempSignIn({ email, password });

      if (result.success && result.user) {
        // TODO: Switch to Cognito
        // const attributes = await getCognitoUserAttributes();
        const attributes = await getTempUserAttributes();
        
        if (!attributes) {
          throw new Error('Could not retrieve user attributes');
        }

        // Check if role matches
        if (attributes.role !== selectedRole) {
          toast({
            title: "Role mismatch",
            description: `This account is registered as ${attributes.role}, not ${selectedRole}`,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        login({
          userId: result.user.userId,
          name: attributes.name,
          email: attributes.email,
          role: attributes.role as 'user' | 'counsellor' | 'admin',
        });

        toast({
          title: "Welcome back!",
          description: `Signed in successfully as ${attributes.role}`,
        });

        navigate(`/dashboard/${attributes.role}`);
      } else {
        throw new Error('Sign in failed');
      }
    } catch (err: any) {
      toast({
        title: "Sign in failed",
        description: err?.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
            <p className="text-muted-foreground">Sign in to continue</p>
          </div>

          <Card className="p-8 shadow-soft border-border bg-card">
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
                        disabled={loading}
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
                        disabled={loading}
                        className="border-input"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 transition-smooth"
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
                    </Button>
                  </form>
                </TabsContent>
              ))}
            </Tabs>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              New to MindCare?{" "}
              <Link to="/auth/signup" className="text-primary hover:underline font-medium">
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
