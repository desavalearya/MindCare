import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Users, Heart, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AdminAnalytics = () => {
  // Example data for the past 14 days
  const dailyActiveUsers = [
    { day: "Oct 1", count: 320 },
    { day: "Oct 2", count: 345 },
    { day: "Oct 3", count: 360 },
    { day: "Oct 4", count: 355 },
    { day: "Oct 5", count: 370 },
    { day: "Oct 6", count: 390 },
    { day: "Oct 7", count: 410 },
    { day: "Oct 8", count: 405 },
    { day: "Oct 9", count: 420 },
    { day: "Oct 10", count: 415 },
    { day: "Oct 11", count: 430 },
    { day: "Oct 12", count: 438 },
    { day: "Oct 13", count: 442 },
    { day: "Oct 14", count: 455 },
  ];

  const dailyActiveCounsellors = [
    { day: "Oct 1", count: 28 },
    { day: "Oct 2", count: 30 },
    { day: "Oct 3", count: 29 },
    { day: "Oct 4", count: 31 },
    { day: "Oct 5", count: 32 },
    { day: "Oct 6", count: 33 },
    { day: "Oct 7", count: 35 },
    { day: "Oct 8", count: 34 },
    { day: "Oct 9", count: 36 },
    { day: "Oct 10", count: 37 },
    { day: "Oct 11", count: 38 },
    { day: "Oct 12", count: 39 },
    { day: "Oct 13", count: 40 },
    { day: "Oct 14", count: 42 },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="p-8 gradient-calm min-h-screen">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
              <TrendingUp className="w-10 h-10 text-primary" />
              Admin Analytics
            </h1>
            <p className="text-muted-foreground text-lg">Daily Active Users (DAU) and Daily Active Counsellors (DAC)</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* DAU */}
            <Card className="p-6 shadow-soft border-border bg-card">
              <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Daily Active Users
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyActiveUsers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* DAC */}
            <Card className="p-6 shadow-soft border-border bg-card">
              <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
                <Heart className="w-5 h-5 text-secondary" />
                Daily Active Counsellors
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyActiveCounsellors}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--secondary))" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;