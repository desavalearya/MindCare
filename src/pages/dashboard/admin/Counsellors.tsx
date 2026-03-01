import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { UserCheck, AlertCircle, FileText } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type Status = "pending" | "approved" | "rejected";

interface Counsellor {
  id: string;
  name: string;
  specialty: string;
  licenseNumber: string;
  certificateUrl: string;
  status: Status;
}

const AdminCounsellors = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Status>("pending");
  const [counsellors, setCounsellors] = useState<Counsellor[]>([
    {
      id: "1",
      name: "Dr. Emily Roberts",
      specialty: "Clinical Psychology",
      licenseNumber: "LIC-CP-98421",
      certificateUrl: "/placeholder.svg",
      status: "pending",
    },
    {
      id: "2",
      name: "Dr. Michael Chen",
      specialty: "Cognitive Behavioral Therapy",
      licenseNumber: "LIC-CBT-77120",
      certificateUrl: "/placeholder.svg",
      status: "pending",
    },
    {
      id: "3",
      name: "Dr. Sarah Anderson",
      specialty: "Family Therapy",
      licenseNumber: "LIC-FT-55219",
      certificateUrl: "/placeholder.svg",
      status: "pending",
    },
  ]);

  const handleDecision = (id: string, decision: Exclude<Status, "pending">) => {
    setCounsellors(prev => prev.map(c => (c.id === id ? { ...c, status: decision } : c)));
    toast({
      title: decision === "approved" ? "Counsellor Approved" : "Counsellor Rejected",
      description:
        decision === "approved"
          ? "Login request approved. Counsellor can now access the platform."
          : "Login request rejected. Counsellor will be notified.",
    });
  };

  const filtered = counsellors.filter(c => c.status === activeTab);

  return (
    <DashboardLayout role="admin">
      <div className="p-8 gradient-calm min-h-screen">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
              <UserCheck className="w-10 h-10 text-accent" />
              Counsellor Approvals
            </h1>
            <p className="text-muted-foreground text-lg">
              Review counsellors’ credentials and decide to approve or reject their login.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as Status)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filtered.length === 0 ? (
                <Card className="p-6 shadow-soft border-border bg-card">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="w-5 h-5" />
                    <span>No counsellors in this state.</span>
                  </div>
                </Card>
              ) : (
                filtered.map((c, index) => (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <Card className="p-6 shadow-soft border-border bg-card">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{c.name}</p>
                          <p className="text-sm text-muted-foreground">{c.specialty}</p>
                          <p className="text-sm text-muted-foreground">License: {c.licenseNumber}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={c.certificateUrl} target="_blank" rel="noreferrer">
                            <Button variant="outline" className="gap-2">
                              <FileText className="w-4 h-4" /> View Certificate
                            </Button>
                          </a>
                          {c.status === "pending" ? (
                            <>
                              <Button className="bg-accent hover:bg-accent/90" onClick={() => handleDecision(c.id, "approved")}>Approve</Button>
                              <Button variant="destructive" onClick={() => handleDecision(c.id, "rejected")}>Reject</Button>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">Status: {c.status}</span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AdminCounsellors;