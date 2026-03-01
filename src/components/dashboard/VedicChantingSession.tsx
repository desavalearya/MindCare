import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface VedicChantingSessionProps {
  open: boolean;
  onClose: () => void;
  onComplete: (points: number) => void;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const VedicChantingSession = ({ open, onClose, onComplete }: VedicChantingSessionProps) => {
  const [remaining, setRemaining] = useState(15 * 60);
  const [isActive, setIsActive] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [omEnabled, setOmEnabled] = useState(true);
  const [omVolume, setOmVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement | null>(null);


  // Handle countdown timer
  useEffect(() => {
    if (!isActive || showCompletion) return;
    if (remaining <= 0) {
      setShowCompletion(true);
      setIsActive(false);
      return;
    }
    const id = window.setInterval(() => setRemaining((prev) => prev - 1), 1000);
    return () => clearInterval(id);
  }, [isActive, remaining, showCompletion]);

  // Manage OM audio playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = true;
    audio.volume = Math.min(Math.max(omVolume, 0), 1);
    if (open && isActive && omEnabled) {
      audio.play().catch(() => {/* autoplay may be blocked until user action */ });
    } else {
      audio.pause();
    }
  }, [open, isActive, omEnabled, omVolume]);

  // Pause and reset audio when dialog closes
  useEffect(() => {
    if (!open && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [open]);

  const handleStart = () => {
    // Reset if needed
    setRemaining(15 * 60);
    setShowCompletion(false);
    setIsActive(true);
    // Ensure audio has a source (default to public/om-chant.mp3)
    const audio = audioRef.current;
    if (audio) {
      // Use bundled asset in public/ for consistent playback
      audio.src = "/om-chant.mp3";
      audio.load();
    }
  };

  const handleComplete = () => {
    onComplete(15);
    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    onClose();
    // Reset state
    setIsActive(false);
    setShowCompletion(false);
    setRemaining(15 * 60);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-foreground">Vedic Chanting Session</DialogTitle>
        </DialogHeader>

        {!isActive && !showCompletion && (
          <div className="space-y-6 py-6">
            <div className="text-center space-y-3">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl font-bold text-primary"
              >
                ॐ
              </motion.div>
              <p className="text-muted-foreground max-w-md mx-auto">
                Settle in for a 15-minute Vedic chanting practice. As you softly repeat "Om", background audio can accompany you for focus and calm.
              </p>
              <p className="text-sm text-muted-foreground">Complete to earn +15 points.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 text-center bg-card border-border">
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-xl font-bold text-foreground">15:00</p>
              </Card>
              <Card className="p-4 text-center bg-card border-border">
                <p className="text-sm text-muted-foreground">Background OM Audio</p>
                <Badge variant="secondary">Enabled</Badge>
              </Card>
            </div>

            <Button onClick={handleStart} size="lg" className="w-full gap-2">
              <Sparkles className="w-5 h-5" />
              Begin Chanting
            </Button>
          </div>
        )}

        {isActive && !showCompletion && (
          <div className="space-y-6 py-6">
            {/* Timer and OM focus */}
            <div className="text-center py-4">
              <motion.div
                key={remaining}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-bold text-foreground mb-3"
              >
                {formatTime(remaining)}
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 mx-auto flex items-center justify-center shadow-soft"
              >
                <span className="text-4xl font-bold">ॐ</span>
              </motion.div>
              <p className="text-muted-foreground mt-4">Gently chant "Om" with the rhythm.</p>
            </div>

            {/* OM audio controls */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <Button
                  onClick={() => setIsActive(!isActive)}
                  variant={isActive ? "outline" : "default"}
                  className="flex-1 gap-2"
                >
                  {isActive ? "Pause" : "Play"}
                </Button>
                <Button
                  onClick={() => {
                    setIsActive(false);
                    setRemaining(15 * 60);
                    if (audioRef.current) {
                      audioRef.current.pause();
                      audioRef.current.currentTime = 0;
                    }
                  }}
                  variant="destructive"
                  className="flex-1 gap-2"
                >
                  Stop
                </Button>
              </div>

              <Card className="p-4 bg-card border-border">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-foreground">Background OM Audio</p>
                  <Badge variant="secondary">{omEnabled ? "On" : "Off"}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant={omEnabled ? "default" : "outline"} size="sm" onClick={() => setOmEnabled(!omEnabled)}>
                    {omEnabled ? "Disable" : "Enable"}
                  </Button>
                  <div className="flex-1">
                    <label className="text-sm text-muted-foreground">OM Volume</label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={omVolume}
                      onChange={(e) => setOmVolume(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </Card>
            </div>

            <Button onClick={() => setShowCompletion(true)} size="lg" variant="secondary" className="w-full">
              Finish Session & Earn Points
            </Button>
          </div>
        )}

        {showCompletion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 py-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto"
            >
              <span className="text-3xl">ॐ</span>
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Chanting Complete</h3>
              <p className="text-muted-foreground mb-4">You've earned +15 wellness points 🌟</p>
              <p className="text-sm text-muted-foreground">Carry the calm with you.</p>
            </div>
            <Button onClick={handleComplete} className="w-full" size="lg">
              Close Session
            </Button>
          </motion.div>
        )}
      </DialogContent>
      {/* Hidden audio element for OM playback (default MP4 in public/) */}
      <audio ref={audioRef} src="/om-chant.mp4" preload="auto" />
    </Dialog>
  );
};

export default VedicChantingSession;