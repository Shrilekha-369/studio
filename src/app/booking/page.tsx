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
import type { ClassSchedule } from "@/lib/types";

const schedule: ClassSchedule[] = [
  { id: 'yoga-mon-0700', className: 'Sunrise Yoga', instructor: 'Anna', dayOfWeek: 'Monday', startTime: '07:00', durationMinutes: 60, capacity: 15, spotsLeft: 8, icon: 'Dumbbell' },
  { id: 'hiit-mon-1800', className: 'HIIT Power Hour', instructor: 'Mark', dayOfWeek: 'Monday', startTime: '18:00', durationMinutes: 60, capacity: 10, spotsLeft: 3, icon: 'HeartPulse' },
  { id: 'spin-tue-1730', className: 'Rhythm Spin', instructor: 'Chloe', dayOfWeek: 'Tuesday', startTime: '17:30', durationMinutes: 45, capacity: 12, spotsLeft: 0, icon: 'Bike' },
  { id: 'strength-wed-0700', className: 'Full Body Strength', instructor: 'David', dayOfWeek: 'Wednesday', startTime: '07:00', durationMinutes: 60, capacity: 12, spotsLeft: 5, icon: 'Dumbbell' },
  { id: 'yoga-wed-1830', className: 'Restorative Flow', instructor: 'Anna', dayOfWeek: 'Wednesday', startTime: '18:30', durationMinutes: 75, capacity: 15, spotsLeft: 10, icon: 'Dumbbell' },
  { id: 'cycle-thu-1800', className: 'Cycle & Core', instructor: 'Chloe', dayOfWeek: 'Thursday', startTime: '18:00', durationMinutes: 45, capacity: 12, spotsLeft: 2, icon: 'Bike' },
  { id: 'hiit-sat-0900', className: 'Weekend Warrior HIIT', instructor: 'Mark', dayOfWeek: 'Saturday', startTime: '09:00', durationMinutes: 60, capacity: 10, spotsLeft: 6, icon: 'HeartPulse' },
  { id: 'yoga-sun-1000', className: 'Sunday Zen Yoga', instructor: 'Anna', dayOfWeek: 'Sunday', startTime: '10:00', durationMinutes: 75, capacity: 15, spotsLeft: 12, icon: 'Dumbbell' },
];

const getLevel = (className: string) => {
    if (className.includes('HIIT')) return 'Advanced';
    if (className.includes('Yoga') || className.includes('Flow')) return 'Beginner';
    return 'Intermediate';
}

const formatTime = (day: string, time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const formattedHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
    return `${day.substring(0,3)} ${formattedHour}:${minute} ${ampm}`;
}

const iconMap: { [key: string]: React.ElementType } = {
  Dumbbell,
  HeartPulse,
  Bike
};

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
            {schedule.map((classInfo) => {
              const IconComponent = iconMap[classInfo.icon];
              const level = getLevel(classInfo.className);
              return (
                <TableRow key={classInfo.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {IconComponent && <IconComponent className="h-5 w-5 text-primary hidden sm:inline-block" />}
                      {classInfo.className}
                    </div>
                  </TableCell>
                  <TableCell>{classInfo.instructor}</TableCell>
                  <TableCell>{formatTime(classInfo.dayOfWeek, classInfo.startTime)}</TableCell>
                  <TableCell>
                    <Badge variant={
                      level === 'Beginner' ? 'secondary' :
                      level === 'Intermediate' ? 'default' : 'destructive'
                    } className="bg-primary/20 text-primary-foreground">
                      {level}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{classInfo.spotsLeft}</TableCell>
                  <TableCell className="text-right">
                    <BookingModal classInfo={classInfo} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
