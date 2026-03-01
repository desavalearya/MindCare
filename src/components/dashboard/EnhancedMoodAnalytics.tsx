import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { TrendingUp, Brain, Heart, Zap, Shield } from "lucide-react";

const EnhancedMoodAnalytics = () => {
  const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8000";

  const [timeline, setTimeline] = useState<Array<any>>([]);
  const [current, setCurrent] = useState<Record<string, number>>({});
  const [averages, setAverages] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/analytics/emotions`);
        const data = await res.json();
        if (!cancelled) {
          setTimeline(Array.isArray(data?.timeline) ? data.timeline : []);
          setCurrent(typeof data?.current === "object" && data.current ? data.current : {});
          setAverages(typeof data?.averages === "object" && data.averages ? data.averages : {});
        }
      } catch (e) {
        // Keep UI functional even if backend unavailable
        if (!cancelled) {
          setTimeline([]);
          setCurrent({});
          setAverages({});
        }
      }
    };
    fetchData();
    const id = setInterval(fetchData, 60_000); // refresh every minute
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const formatTime = (ts?: string) => {
    if (!ts) return "";
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const lineData = timeline.map((e) => ({
    time: formatTime(e.timestamp),
    // convert to integer percentages
    neutral: Math.max(0, Math.min(100, Math.round(100 * Number(e.neutral ?? 0)))),
    sadness: Math.max(0, Math.min(100, Math.round(100 * Number(e.sadness ?? 0)))),
    fear: Math.max(0, Math.min(100, Math.round(100 * Number(e.fear ?? 0)))),
    disgust: Math.max(0, Math.min(100, Math.round(100 * Number(e.disgust ?? 0)))),
    surprise: Math.max(0, Math.min(100, Math.round(100 * Number(e.surprise ?? 0)))),
    anger: Math.max(0, Math.min(100, Math.round(100 * Number(e.anger ?? 0)))),
  }));

  const radarData = [
    { metric: "Neutral", value: Math.max(0, Math.min(100, Math.round(100 * Number(current.neutral ?? 0)))) },
    { metric: "Sadness", value: Math.max(0, Math.min(100, Math.round(100 * Number(current.sadness ?? 0)))) },
    { metric: "Fear", value: Math.max(0, Math.min(100, Math.round(100 * Number(current.fear ?? 0)))) },
    { metric: "Disgust", value: Math.max(0, Math.min(100, Math.round(100 * Number(current.disgust ?? 0)))) },
    { metric: "Surprise", value: Math.max(0, Math.min(100, Math.round(100 * Number(current.surprise ?? 0)))) },
    { metric: "Anger", value: Math.max(0, Math.min(100, Math.round(100 * Number(current.anger ?? 0)))) },
  ];

  const clamp10 = (x: number) => Math.max(0, Math.min(10, x));
  const currentMetrics = [
    { metric: "Mood", value: Math.round(clamp10(10 * ((averages.neutral ?? 0) - 0.4 * (averages.sadness ?? 0) - 0.3 * (averages.fear ?? 0) - 0.3 * (averages.anger ?? 0)))) },
    { metric: "Stress", value: Math.round(clamp10(10 * (0.5 * (averages.anger ?? 0) + 0.5 * (averages.fear ?? 0) + 0.3 * (averages.disgust ?? 0)))) },
    { metric: "Anxiety", value: Math.round(clamp10(10 * (averages.fear ?? 0))) },
    { metric: "Confidence", value: Math.round(clamp10(10 * ((averages.neutral ?? 0) - 0.3 * (averages.fear ?? 0) - 0.3 * (averages.sadness ?? 0)))) },
  ];

  const metrics = [
    { name: "Mood", icon: Heart, color: "hsl(var(--primary))", description: "Overall wellbeing" },
    { name: "Stress", icon: Zap, color: "hsl(var(--peach))", description: "Stress levels" },
    { name: "Anxiety", icon: Brain, color: "hsl(var(--secondary))", description: "Anxiety state" },
    { name: "Confidence", icon: Shield, color: "hsl(var(--accent))", description: "Self-confidence" },
  ];

  return (
    <Card className="p-6 shadow-soft border-border bg-card">
      <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        Mental Health Metrics
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {metrics.map((metric, idx) => (
          <div key={idx} className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <metric.icon className="w-4 h-4" style={{ color: metric.color }} />
              <p className="text-sm font-medium text-foreground">{metric.name}</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: metric.color }}>
              {currentMetrics.find((m) => m.metric === metric.name)?.value}/10
            </p>
            <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) => [
                  `${Math.round(Number(value))}%`,
                  name,
                ]}
              />
              <Line type="monotone" dataKey="neutral" stroke="hsl(var(--primary))" strokeWidth={2} />
              <Line type="monotone" dataKey="sadness" stroke="hsl(var(--peach))" strokeWidth={2} />
              <Line type="monotone" dataKey="fear" stroke="hsl(var(--secondary))" strokeWidth={2} />
              <Line type="monotone" dataKey="disgust" stroke="hsl(var(--accent))" strokeWidth={2} />
              <Line type="monotone" dataKey="surprise" stroke="hsl(var(--highlight))" strokeWidth={2} />
              <Line type="monotone" dataKey="anger" stroke="hsl(var(--destructive))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v}%`} />
              <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="daily">
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Daily view coming soon
          </div>
        </TabsContent>

        <TabsContent value="monthly">
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Monthly view coming soon
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default EnhancedMoodAnalytics;
