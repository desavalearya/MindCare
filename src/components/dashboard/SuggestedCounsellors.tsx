import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, MessageCircle, Video } from "lucide-react";

import { toast } from "sonner";

const SuggestedCounsellors = () => {
  const counsellors = [
    {
      name: "Dr. Sarah Miller",
      specialty: "Anxiety & Depression",
      rating: 4.9,
      sessions: "245 sessions",
      status: "online"
    },
    {
      name: "Dr. James Chen",
      specialty: "Stress Management",
      rating: 4.8,
      sessions: "189 sessions",
      status: "away"
    },
    {
      name: "Dr. Emily Johnson",
      specialty: "Relationship Therapy",
      rating: 4.9,
      sessions: "312 sessions",
      status: "online"
    },
    {
      name: "Dr. Michael Brown",
      specialty: "Trauma & PTSD",
      rating: 4.7,
      sessions: "156 sessions",
      status: "offline"
    },
  ];

  const handleChat = (name: string) => {
    toast.success(`Connecting you directly with ${name}...`);
    window.location.href = `/dashboard/user/ai-companion?counsellor=${encodeURIComponent(name)}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {counsellors.map((counsellor, idx) => (
        <Card key={idx} className="p-6 rounded-[24px] bg-white border border-border/60 hover:border-primary/30 transition-all group shadow-sm flex flex-col">
          <div className="flex items-start gap-4 mb-8">
            <div className="relative shrink-0">
              <Avatar className="w-16 h-16 border-2 border-background shadow-sm bg-muted/30">
                <AvatarFallback className="bg-primary/5 text-primary/80 font-bold text-lg">
                  {counsellor.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full border-2 border-background ${counsellor.status === 'online' ? 'bg-green-500' : counsellor.status === 'away' ? 'bg-amber-500' : 'bg-slate-400'
                }`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[#1A1A1A] text-xl mb-0.5 leading-tight">{counsellor.name}</h3>
              <p className="text-sm font-medium text-muted-foreground/80 mb-2">{counsellor.specialty}</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-green-600 font-bold">
                  <Star className="w-4 h-4 fill-green-600" />
                  {counsellor.rating}
                </div>
                <span className="text-xs text-muted-foreground/60">• {counsellor.sessions}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-auto">
            <Button
              size="lg"
              className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-soft rounded-2xl h-12 font-bold text-sm"
              onClick={() => window.open("https://meet.google.com/mhu-eoab-rbe", "_blank")}
            >
              <Video className="w-4 h-4" />
              Book Video
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-border/80 hover:bg-muted/50 text-foreground rounded-2xl h-12 font-bold text-sm"
              onClick={() => handleChat(counsellor.name)}
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default SuggestedCounsellors;
