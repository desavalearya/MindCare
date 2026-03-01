import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Smile, Meh, Frown, CloudRain, Angry, Moon, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MoodCheckInProps {
  onCheckIn?: (mood: string) => void;
}

const MoodCheckIn = ({ onCheckIn }: MoodCheckInProps) => {
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const { toast } = useToast();

  const containerVariants = {
    hidden: { opacity: 0, transition: { duration: 0.8 } }, // slow fade-out
    visible: { opacity: 1, transition: { duration: 0.4 } },
  };

  const moods = [
    { icon: Smile, label: "Happy", color: "bg-accent/10 hover:bg-accent/20 text-accent border-accent/20" },
    { icon: Meh, label: "Dull", color: "bg-muted hover:bg-muted/80 text-muted-foreground border-muted" },
    { icon: Frown, label: "Sad", color: "bg-secondary/10 hover:bg-secondary/20 text-secondary border-secondary/20" },
    { icon: CloudRain, label: "Anxious", color: "bg-primary/10 hover:bg-primary/20 text-primary border-primary/20" },
    { icon: Angry, label: "Angry", color: "bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/20" },
    { icon: Moon, label: "Stressed", color: "bg-highlight/10 hover:bg-highlight/20 text-highlight border-highlight/20" },
    { icon: Heart, label: "Depressed", color: "bg-peach/10 hover:bg-peach/20 text-peach-foreground border-peach/20" },
  ];

  useEffect(() => {
    const lastCheckIn = localStorage.getItem('lastMoodCheckIn');
    const today = new Date().toDateString();
    if (lastCheckIn === today) {
      setHasCheckedIn(true);
      setSelectedMood(localStorage.getItem('todayMood'));
    }
  }, []);

  const handleMoodSelect = (mood: string) => {
    const today = new Date().toDateString();
    localStorage.setItem('lastMoodCheckIn', today);
    localStorage.setItem('todayMood', mood);
    setSelectedMood(mood);
    setHasCheckedIn(true);
    // Hide the Quick Mood Check-in after submission (temporary for this session)
    setIsVisible(false);
    if (onCheckIn) {
      onCheckIn(mood);
    }
    toast({
      title: "Mood Logged ✨",
      description: `Feeling ${mood.toLowerCase()} today - we're here with you`,
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div initial="hidden" animate="visible" exit="hidden" variants={containerVariants}>
      <Card className="p-6 shadow-soft border-border bg-card mb-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Quick Mood Check-in</h2>
        <p className="text-muted-foreground mb-4">How are you feeling today?</p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {moods.map((mood, index) => (
            <motion.div
              key={mood.label}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                onClick={() => handleMoodSelect(mood.label)}
                className={`flex flex-col h-24 w-full ${mood.color} transition-smooth ${selectedMood === mood.label ? 'ring-2 ring-primary' : ''}`}
              >
                <mood.icon className="w-8 h-8 mb-2" />
                <span className="text-xs">{mood.label}</span>
              </Button>
            </motion.div>
          ))}
        </div>
        {hasCheckedIn && selectedMood && (
          <p className="text-sm text-muted-foreground mt-4">Today's mood: {selectedMood}</p>
        )}
      </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MoodCheckIn;
