import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Search, MapPin, Heart, Coffee, Book, Music as MusicIcon, Gamepad2, Wind } from "lucide-react";
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";

const PeerConnections = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");

  const peerGroups = [
    {
      name: "Book Club Reader",
      members: 156,
      description: "A cozy corner for bookworms to discuss their latest reads and share literary inspiration.",
      icon: Book,
      link: "https://chat.whatsapp.com/CM53trTKykF3cwmonxkyVN?mode=hqrt1",
      tag: "Reading"
    },
    {
      name: "Music Lover",
      members: 242,
      description: "Connect through the power of rhythm and melody. Share your favorite tracks and playlists.",
      icon: MusicIcon,
      link: "https://chat.whatsapp.com/FZ3gkFDI53o1Lk5BQi0MlF?mode=hqrt1",
      tag: "Music"
    },
    {
      name: "Stress Relief",
      members: 310,
      description: "A supportive space to share techniques and stories for managing daily stress and finding calm.",
      icon: Coffee,
      link: "https://chat.whatsapp.com/Is6UilvaOnnC1UeYpZZqB9?mode=hqrc",
      tag: "Support"
    },
    {
      name: "Depression Warriors",
      members: 425,
      description: "You're not alone. Join fellow warriors in a safe space dedicated to healing and mutual support.",
      icon: Heart,
      link: "https://chat.whatsapp.com/L387BqLgD4K2yT78VgHdEY?mode=hqrc",
      tag: "Recovery"
    },
    {
      name: "Anxiety Support Circle",
      members: 380,
      description: "Finding peace together. A group for sharing coping strategies and supporting each other through anxiety.",
      icon: Wind,
      link: "https://chat.whatsapp.com/DR1AEyxv1WIBKiqkFOtPfi?mode=hqrc",
      tag: "Anxiety"
    },
    {
      name: "Gaming Together",
      members: 198,
      description: "Level up your mood! Connect with other gamers for casual play and friendly competition.",
      icon: Gamepad2,
      link: "https://chat.whatsapp.com/JeeqW1evVt81sO4N1RkuxK",
      tag: "Gaming"
    },
  ];

  const hangoutSpots = [
    { name: "Serenity Park", type: "Outdoor", distance: "2 km" },
    { name: "Calm Cafe", type: "Indoor", distance: "1.5 km" },
    { name: "Wellness Center", type: "Activity", distance: "3 km" },
  ];

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
              <Users className="w-10 h-10 text-primary" />
              Peer Connections
            </h1>
            <p className="text-muted-foreground text-lg">Find your community, {user?.name}</p>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search groups by name or interest..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {peerGroups.filter(g =>
              g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              g.tag.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((group, index) => (
              <motion.div
                key={group.name}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 shadow-soft border-border bg-card hover:shadow-gentle transition-smooth h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <group.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{group.name}</h3>
                        <p className="text-sm text-muted-foreground">{group.members} members</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{group.tag}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6 flex-1">{group.description}</p>
                  <Button
                    className="w-full gap-2"
                    onClick={() => window.open(group.link, "_blank")}
                  >
                    Join Group
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Suggested Hangout Spots */}
          <Card className="p-6 shadow-soft border-border bg-card mt-6">
            <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent" />
              Suggested Places to Hang Out
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {hangoutSpots.map((spot, index) => (
                <motion.div
                  key={spot.name}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-smooth"
                >
                  <h3 className="font-semibold text-foreground mb-1">{spot.name}</h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{spot.type}</span>
                    <span>{spot.distance}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default PeerConnections;
