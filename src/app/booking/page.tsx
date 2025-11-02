import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookingModal } from "@/components/booking-modal";
import { Dumbbell, HeartPulse, Bike } from "lucide-react";

export type ClassInfo = {
  name: string;
  instructor: string;
  time: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  spots: number;
  icon: React.ElementType;
};

const schedule: ClassInfo[] = [
  { name: 'Sunrise Yoga', instructor: 'Anna', time: 'Mon 7:00 AM', duration: '60 min', level: 'Beginner', spots: 8, icon: Dumbbell },
  { name: 'HIIT Power Hour', instructor: 'Mark', time: 'Mon 6:00 PM', duration: '60 min', level: 'Advanced', spots: 3, icon: HeartPulse },
  { name: 'Rhythm Spin', instructor: 'Chloe', time: 'Tue 5:30 PM', duration: '45 min', level: 'Intermediate', spots: 0, icon: Bike },
  { name: 'Full Body Strength', instructor: 'David', time: 'Wed 7:00 AM', duration: '60 min', level: 'Intermediate', spots: 5, icon: Dumbbell },
  { name: 'Restorative Flow', instructor: 'Anna', time: 'Wed 6:30 PM', duration: '75 min', level: 'Beginner', spots: 10, icon: Dumbbell },
  { name: 'Cycle & Core', instructor: 'Chloe', time: 'Thu 6:00 PM', duration: '45 min', level: 'Intermediate', spots: 2, icon: Bike },
  { name: 'Weekend Warrior HIIT', instructor: 'Mark', time: 'Sat 9:00 AM', duration: '60 min', level: 'Advanced', spots: 6, icon: HeartPulse },
  { name: 'Sunday Zen Yoga', instructor: 'Anna', time: 'Sun 10:00 AM', duration: '75 min', level: 'Beginner', spots: 12, icon: Dumbbell },
];

export default function BookingPage() {
  return (
    <div className="container max-w-screen-lg mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">Class Schedule</h1>
        <p className="mt-4 text-lg text-foreground/80">Find your next workout and book a free demo session.</p>
      </div>

      <div className="border rounded-lg shadow-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Class</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Level</TableHead>
              <TableHead className="text-center">Spots Left</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedule.map((classInfo) => (
              <TableRow key={classInfo.name + classInfo.time}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <classInfo.icon className="h-5 w-5 text-primary hidden sm:inline-block" />
                    {classInfo.name}
                  </div>
                </TableCell>
                <TableCell>{classInfo.instructor}</TableCell>
                <TableCell>{classInfo.time}</TableCell>
                <TableCell>
                  <Badge variant={
                    classInfo.level === 'Beginner' ? 'secondary' :
                    classInfo.level === 'Intermediate' ? 'default' : 'destructive'
                  } className="bg-primary/20 text-primary-foreground">
                    {classInfo.level}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{classInfo.spots}</TableCell>
                <TableCell className="text-right">
                  <BookingModal classInfo={classInfo} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
