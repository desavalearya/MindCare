import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wind, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface BreathingSessionProps {
  open: boolean;
  onClose: () => void;
  onComplete: (points: number) => void;
  technique?: "box" | "478" | "deep";
}

const BreathingSession = ({ open, onClose, onComplete, technique = "box" }: BreathingSessionProps) => {
  const [phase, setPhase] = useState<"ready" | "inhale" | "hold1" | "exhale" | "hold2" | "complete">("ready");
  const [isPaused, setIsPaused] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [counter, setCounter] = useState(4);
  const [heartRate, setHeartRate] = useState(75);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false); // ambient music for 4-7-8
  const [chimeEnabled, setChimeEnabled] = useState(true);  // chime on phase transitions for 4-7-8
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  const totalCycles = 4;

  const getPhaseDuration = (p: typeof phase) => {
    if (technique === "478") {
      if (p === "inhale") return 4;
      if (p === "hold1") return 7;
      if (p === "exhale") return 8;
      if (p === "hold2") return 0; // not used in 4-7-8
      return 0;
    }
    if (technique === "deep") {
      // Deep breathing: inhale/exhale only (no holds)
      if (p === "inhale") return 4;
      if (p === "exhale") return 6;
      return 0;
    }
    // Box breathing 4-4-4-4
    if (p === "inhale" || p === "hold1" || p === "exhale" || p === "hold2") return 4;
    return 0;
  };

  useEffect(() => {
    if (phase === "ready" || phase === "complete" || isPaused) return;

    const interval = setInterval(() => {
      setCounter((prev) => {
        if (prev > 1) return prev - 1;

        // Move to next phase based on technique
        if (technique === "478") {
          if (phase === "inhale") {
            setPhase("hold1");
            // phase transition chime
            if (chimeEnabled) playChime();
            return getPhaseDuration("hold1");
          } else if (phase === "hold1") {
            setPhase("exhale");
            if (chimeEnabled) playChime();
            return getPhaseDuration("exhale");
          } else if (phase === "exhale") {
            const nextCycle = cycle + 1;
            if (nextCycle >= totalCycles) {
              setPhase("complete");
              return 0;
            }
            setCycle(nextCycle);
            setPhase("inhale");
            if (chimeEnabled) playChime();
            return getPhaseDuration("inhale");
          }
          return getPhaseDuration("inhale");
        } else if (technique === "box") {
          // box
          if (phase === "inhale") {
            setPhase("hold1");
            return getPhaseDuration("hold1");
          } else if (phase === "hold1") {
            setPhase("exhale");
            return getPhaseDuration("exhale");
          } else if (phase === "exhale") {
            setPhase("hold2");
            return getPhaseDuration("hold2");
          } else if (phase === "hold2") {
            const nextCycle = cycle + 1;
            if (nextCycle >= totalCycles) {
              setPhase("complete");
              return 0;
            }
            setCycle(nextCycle);
            setPhase("inhale");
            return getPhaseDuration("inhale");
          }
          return getPhaseDuration("inhale");
        } else if (technique === "deep") {
          // deep: inhale -> exhale -> next cycle
          if (phase === "inhale") {
            setPhase("exhale");
            return getPhaseDuration("exhale");
          } else if (phase === "exhale") {
            const nextCycle = cycle + 1;
            if (nextCycle >= totalCycles) {
              setPhase("complete");
              return 0;
            }
            setCycle(nextCycle);
            setPhase("inhale");
            return getPhaseDuration("inhale");
          }
          return getPhaseDuration("inhale");
        }
      });

      // Simulate heart rate changing
      setHeartRate((prev) => {
        if (phase === "inhale" || phase === "hold1") return Math.max(60, prev - 1);
        if (phase === "exhale" || phase === "hold2") return Math.max(58, prev - 0.5);
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, cycle]);

  // Ambient music control for 4-7-8 (uses om-chant.mp3 as background)
  useEffect(() => {
    if (technique !== "478") return;
    const audio = bgAudioRef.current;
    if (!audio) return;
    audio.loop = true;
    audio.volume = 0.35;
    if (open && musicEnabled && phase !== "ready" && phase !== "complete") {
      audio.play().catch(() => { /* autoplay may be blocked */ });
    } else {
      audio.pause();
    }
  }, [technique, open, musicEnabled, phase]);

  // Soft chime using WebAudio at phase transitions (for 4-7-8)
  const playChime = () => {
    if (!chimeEnabled || technique !== "478") return;
    try {
      const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 660; // gentle tone
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch { }
  };

  // Speak helper using browser speech synthesis
  const speak = (text: string) => {
    if (!voiceEnabled) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.9;
    utter.pitch = 1.0;
    utter.lang = "en-US";
    try {
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => /en/i.test(v.lang) && /Google|Microsoft|Natural/i.test(v.name));
      if (preferred) utter.voice = preferred;
    } catch { }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  // Voice prompts on phase change
  useEffect(() => {
    if (!voiceEnabled) return;
    if (phase === "ready" || phase === "complete") return;
    const map: Record<typeof phase, string> = {
      inhale: "Breathe in",
      hold1: "Hold",
      exhale: "Breathe out",
      hold2: "Hold",
    };
    const prompt = map[phase];
    if (prompt) speak(prompt);
    // Cleanup any ongoing speech on unmount
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [phase, voiceEnabled]);

  const handleStart = () => {
    setPhase("inhale");
    setIsPaused(false);
    setCycle(0);
    setCounter(getPhaseDuration("inhale"));
    setHeartRate(75);
    if (voiceEnabled) speak("Breathe in");
  };

  const handleFinish = () => {
    onComplete(12);
    onClose();
    setPhase("ready");
    setIsPaused(false);
    setCycle(0);
    setCounter(4);
    setHeartRate(75);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const getPhaseText = () => {
    switch (phase) {
      case "inhale": return "Breathe In";
      case "hold1": return "Hold";
      case "exhale": return "Breathe Out";
      case "hold2": return "Hold";
      default: return "";
    }
  };

  const getPhaseHint = () => {
    if (technique !== "478") return "";
    if (phase === "inhale") return "4 s Inhale";
    if (phase === "hold1") return "7 s Hold";
    if (phase === "exhale") return "8 s Exhale";
    return "Ready";
  };

  const ringColor = technique === "478" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.4)";
  const phaseDuration = getPhaseDuration(phase);
  const phaseProgress = (phase === "ready" || phase === "complete" || !phaseDuration) ? 0 : Math.min(1, Math.max(0, (phaseDuration - counter + 1) / phaseDuration));

  const getCircleScale = () => {
    if (phase === "inhale") return 1.5;
    if (phase === "exhale") return 0.8;
    return 1;
  };

  const circleGradientClass = technique === "box"
    ? "from-primary to-accent"
    : technique === "478"
      ? "from-accent to-highlight"
      : "from-highlight to-primary";

  const leadIconColor = technique === "box" ? "text-primary" : technique === "478" ? "text-highlight" : "text-accent";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-foreground">{
            technique === "478" ? "4-7-8 Breathing Exercise" : technique === "deep" ? "Deep Breathing Exercise" : "Box Breathing Exercise"
          }</DialogTitle>
        </DialogHeader>

        {phase === "ready" && (
          <div className="space-y-6 py-8">
            <div className="text-center space-y-4">
              <Wind className={`w-16 h-16 ${leadIconColor} mx-auto`} />
              <h3 className="text-xl font-semibold text-foreground">{
                technique === "478" ? "4-7-8 Breathing" : technique === "deep" ? "Deep Breathing" : "4-4-4-4 Box Breathing"
              }</h3>
              <p className="text-muted-foreground">
                {technique === "478"
                  ? "Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds."
                  : technique === "deep"
                    ? "Inhale for 4 seconds, exhale for 6 seconds."
                    : "Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, hold for 4 seconds."}
              </p>
              <p className="text-muted-foreground">Complete 4 cycles to earn +12 points.</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Voice Guidance</p>
              <Button variant={voiceEnabled ? "default" : "outline"} size="sm" onClick={() => setVoiceEnabled(v => !v)}>
                {voiceEnabled ? "On" : "Off"}
              </Button>
            </div>
            <Button onClick={handleStart} size="lg" className="w-full gap-2">
              <Wind className="w-5 h-5" />
              Begin Exercise
            </Button>
          </div>
        )}

        {phase !== "ready" && phase !== "complete" && (
          <div className="space-y-6 py-8">
            {/* Session header chips (only for 4-7-8 integration) */}
            {technique === "478" && (
              <div className="flex items-center justify-center gap-3">
                <span className="px-2 py-1 rounded-full text-xs bg-muted/60 text-foreground">4-7-8 Technique</span>
                <span className="px-2 py-1 rounded-full text-xs bg-muted/60 text-foreground">{getPhaseHint()}</span>
                <span className="px-2 py-1 rounded-full text-xs bg-muted/60 text-foreground">Cycles: {cycle + 1}</span>
              </div>
            )}
            {/* Breathing Circle Animation with progress ring */}
            <div className="flex flex-col items-center justify-center h-64">
              <div className="relative w-40 h-40">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: `conic-gradient(${ringColor} ${Math.round(phaseProgress * 360)}deg, transparent 0deg)` }}
                />
                <div className="absolute inset-2 rounded-full bg-muted/30" />
                <motion.div
                  animate={{ scale: isPaused ? undefined : getCircleScale() }}
                  transition={{ duration: isPaused ? 0 : Math.max(1, getPhaseDuration(phase)), ease: "easeInOut" }}
                  className={`absolute inset-4 rounded-full bg-gradient-to-br ${circleGradientClass} flex items-center justify-center shadow-elegant`}
                >
                  <span className="text-4xl font-bold text-white">{counter}</span>
                </motion.div>
              </div>
              <motion.p
                key={phase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-semibold text-foreground mt-6"
              >
                {getPhaseText()} {isPaused && "(Paused)"}
              </motion.p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={isPaused ? "default" : "outline"}
                size="lg"
                className="w-32 gap-2"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? "Resume" : "Pause"}
              </Button>
              <Button
                variant="destructive"
                size="lg"
                className="w-32 gap-2"
                onClick={() => {
                  setPhase("ready");
                  setIsPaused(false);
                  setCycle(0);
                  setCounter(4);
                }}
              >
                Stop
              </Button>
            </div>

            {/* Progress */}
            <div className="text-center">
              <p className="text-muted-foreground">
                Cycle {cycle + 1} of {totalCycles}
              </p>
            </div>

            {/* Voice Guidance & 4-7-8 Ambient Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Voice Guidance</p>
                <Button variant={voiceEnabled ? "default" : "outline"} size="sm" onClick={() => setVoiceEnabled(v => !v)}>
                  {voiceEnabled ? "On" : "Off"}
                </Button>
              </div>
              {technique === "478" && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Ambient Music</p>
                  <Button variant={musicEnabled ? "default" : "outline"} size="sm" onClick={() => setMusicEnabled(v => !v)}>
                    {musicEnabled ? "On" : "Off"}
                  </Button>
                </div>
              )}
            </div>

            {/* Smartwatch Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 text-center bg-card border-border">
                <Heart className="w-6 h-6 text-peach-foreground mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{Math.round(heartRate)}</p>
                <p className="text-sm text-muted-foreground">Heart Rate (bpm)</p>
              </Card>

              <Card className="p-4 text-center bg-card border-border">
                <Wind className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{phase === "inhale" ? "In" : phase === "exhale" ? "Out" : "Hold"}</p>
                <p className="text-sm text-muted-foreground">Breathing Phase</p>
              </Card>
            </div>
          </div>
        )}

        {phase === "complete" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 py-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto"
            >
              <Wind className="w-10 h-10 text-primary" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Well Done!</h3>
              <p className="text-muted-foreground mb-4">You've earned +12 wellness points 🌟</p>
              <p className="text-sm text-muted-foreground">Your heart rate decreased by {Math.round(75 - heartRate)} bpm</p>
            </div>
            <Button onClick={handleFinish} className="w-full" size="lg">
              Complete Exercise
            </Button>
          </motion.div>
        )}
      </DialogContent>
      {/* Hidden audio element for 4-7-8 ambient music */}
      {technique === "478" && (
        <audio ref={bgAudioRef} src="/om-chant.mp3" preload="auto" />
      )}
    </Dialog>
  );
};

export default BreathingSession;
