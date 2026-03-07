import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Video, CalendarDays, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const UpcomingMeets = () => {
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const meetings = [
    {
      counsellor: "Dr. Sarah Miller",
      date: "Today",
      time: "3:00 PM",
      type: "Video Call",
      status: "Upcoming"
    },
    {
      counsellor: "Dr. James Chen",
      date: "Tomorrow",
      time: "10:00 AM",
      type: "Chat Session",
      status: "Upcoming"
    },
    {
      counsellor: "Dr. Emily Johnson",
      date: "Apr 25",
      time: "2:00 PM",
      type: "Video Call",
      status: "Upcoming"
    },
  ];

  const handleReschedule = (meet: any) => {
    setSelectedMeeting(meet);
    setIsRescheduleOpen(true);
  };

  const confirmReschedule = () => {
    toast.success(`Session with ${selectedMeeting.counsellor} rescheduled to ${newDate} at ${newTime}`);
    setIsRescheduleOpen(false);
    setNewDate("");
    setNewTime("");
  };

  return (
    <Card className="p-6 shadow-soft border-border bg-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Upcoming Sessions</h2>
        </div>
        <Badge variant="outline" className="text-primary border-primary/20 font-bold px-3">
          {meetings.length} Scheduled
        </Badge>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {meetings.map((meet, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-muted/20 border border-border/50 hover:border-primary/20 transition-all group shadow-none flex flex-col justify-between h-full">
            <div className="flex flex-col gap-4 h-full">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-bold text-lg text-foreground mb-0.5 truncate">{meet.counsellor}</h3>
                  <p className="text-sm font-medium text-muted-foreground">
                    {meet.date} • {meet.time}
                  </p>
                </div>
                <Badge className={`shrink-0 border-none px-3 py-1 rounded-full text-[10px] font-bold ${meet.type === 'Video Call' ? 'bg-blue-100/80 text-blue-700' : 'bg-teal-100/80 text-teal-700'
                  }`}>
                  {meet.type}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-auto pt-4">
                <Button
                  className="bg-primary hover:bg-primary/90 text-white shadow-soft rounded-xl h-11 font-bold text-sm"
                  onClick={() => window.open("https://meet.google.com/mhu-eoab-rbe", "_blank")}
                >
                  Join Session
                </Button>
                <Button
                  variant="outline"
                  className="border-border hover:bg-muted text-foreground rounded-xl h-11 font-bold text-sm"
                  onClick={() => handleReschedule(meet)}
                >
                  Reschedule
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reschedule Session</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Select Date</Label>
              <Input
                id="date"
                type="date"
                className="col-span-3"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">Select Time</Label>
              <Input
                id="time"
                type="time"
                className="col-span-3"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleOpen(false)}>Cancel</Button>
            <Button onClick={confirmReschedule} disabled={!newDate || !newTime}>Confirm Reschedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card >
  );
};

export default UpcomingMeets;
