import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Users as UsersIcon, Search, TrendingUp, AlertCircle } from "lucide-react";
import { useMemo, useState } from "react";
import EnhancedMoodAnalytics from "@/components/dashboard/EnhancedMoodAnalytics";

type UserStatus = "active" | "flagged" | "inactive";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  lastLogin: string;
}

const AdminUsers = () => {
  const [activeTab, setActiveTab] = useState<UserStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const users: AdminUser[] = [
    { id: "u1", name: "Alice Johnson", email: "alice@example.com", status: "active", lastLogin: "2025-10-01" },
    { id: "u2", name: "Brian Smith", email: "brian@example.com", status: "flagged", lastLogin: "2025-09-30" },
    { id: "u3", name: "Carla Gomez", email: "carla@example.com", status: "inactive", lastLogin: "2025-09-15" },
    { id: "u4", name: "David Lee", email: "david@example.com", status: "active", lastLogin: "2025-10-03" },
    { id: "u5", name: "Ella Brown", email: "ella@example.com", status: "active", lastLogin: "2025-10-04" },
  ];

  const filtered = useMemo(() => {
    const byTab = activeTab === "all" ? users : users.filter(u => u.status === activeTab);
    const q = search.trim().toLowerCase();
    return q
      ? byTab.filter(u => `${u.name} ${u.email}`.toLowerCase().includes(q))
      : byTab;
  }, [activeTab, search]);

  return (
    <DashboardLayout role="admin">
      <div className="p-8 gradient-calm min-h-screen">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
              <UsersIcon className="w-10 h-10 text-primary" />
              Users Management
            </h1>
            <p className="text-muted-foreground text-lg">Browse all users and view their analytics, similar to counsellors.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Users list */}
            <Card className="p-6 shadow-soft border-border bg-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search users by name or email"
                    className="pl-9"
                  />
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="flagged">Flagged</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-3">
                  {filtered.length === 0 ? (
                    <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-2 text-muted-foreground">
                      <AlertCircle className="w-5 h-5" />
                      <span>No users match current filters.</span>
                    </div>
                  ) : (
                    filtered.map(u => (
                      <motion.div key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40">
                          <div>
                            <p className="font-medium text-foreground">{u.name}</p>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                            <p className="text-xs text-muted-foreground mt-1">Status: {u.status} • Last login: {u.lastLogin}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setSelectedUser(u)} className="gap-2">
                              <TrendingUp className="w-4 h-4" />
                              View Analytics
                            </Button>
                            <Button size="sm" onClick={() => setSelectedUser(u)}>Select</Button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </Card>

            {/* Right: Analytics panel */}
            <div className="space-y-4">
              {selectedUser ? (
                <>
                  <Card className="p-6 shadow-soft border-border bg-card">
                    <h2 className="text-xl font-semibold mb-2 text-foreground">Analytics for {selectedUser.name}</h2>
                    <p className="text-sm text-muted-foreground mb-4">Email: {selectedUser.email}</p>
                    <p className="text-sm text-muted-foreground mb-6">Status: {selectedUser.status} • Last login: {selectedUser.lastLogin}</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Showing mood analytics similar to the user dashboard.
                    </p>
                  </Card>
                  <EnhancedMoodAnalytics />
                </>
              ) : (
                <Card className="p-6 shadow-soft border-border bg-card">
                  <h2 className="text-xl font-semibold mb-2 text-foreground">Select a user</h2>
                  <p className="text-sm text-muted-foreground">Choose a user from the list to view their analytics.</p>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;