import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import WellnessRecommendations from "@/components/dashboard/WellnessRecommendations";
import { Music, Watch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";

const Wellness = () => {
  const { user } = useUser();
  const [connecting, setConnecting] = useState(false);

  const connectSmartwatch = async () => {
    try {
      setConnecting(true);
      const resp = await fetch("http://127.0.0.1:8083/smartwatch/google/auth_url");
      const data = await resp.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error("Smartwatch connect failed", e);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <DashboardLayout role="user">
      <div className="p-8 gradient-calm min-h-screen">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-7xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Music className="w-10 h-10 text-primary" />
              Wellness & Relaxation
            </h1>
            <p className="text-muted-foreground text-lg">Discover personalized wellness activities, {user?.name}</p>
            <div className="mt-4">
              <Button onClick={connectSmartwatch} disabled={connecting} className="gap-2">
                <Watch className="w-4 h-4" />
                {connecting ? "Connecting..." : "Connect Smartwatch"}
              </Button>
            </div>
          </div>

          <WellnessRecommendations />
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Wellness;
