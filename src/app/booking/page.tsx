
'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BookingModal } from '@/components/booking-modal';
import { Dumbbell, HeartPulse, Bike, Activity, LucideProps } from 'lucide-react';
import type { ClassSchedule } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format, startOfToday } from 'date-fns';

const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const formattedHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
    return `${formattedHour}:${minute} ${ampm}`;
};

const iconMap: { [key: string]: React.ElementType<LucideProps> } = {
  Dumbbell,
  HeartPulse,
  Bike,
  Yoga: Dumbbell, 
  HIIT: HeartPulse,
  Spin: Bike,
  Strength: Dumbbell,
  Cycle: Bike,
  Default: Activity,
};

const getIcon = (className: string): React.ElementType<LucideProps> => {
    if (className.toLowerCase().includes('yoga')) return iconMap.Yoga;
    if (className.toLowerCase().includes('hiit')) return iconMap.HIIT;
    if (className.toLowerCase().includes('spin') || className.toLowerCase().includes('cycle')) return iconMap.Cycle;
    if (className.toLowerCase().includes('strength')) return iconMap.Strength;
    return iconMap.Default;
}

export default function BookingPage() {
  const firestore = useFirestore();
  const [schedule, setSchedule] = useState<ClassSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!firestore) return;
      
      setIsLoading(true);
      setError(null);

      try {
        const todayStr = format(startOfToday(), 'yyyy-MM-dd');
        const q = query(
          collection(firestore, 'classSchedules'), 
          where('classDate', '>=', todayStr),
          orderBy('classDate'),
          orderBy('startTime')
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedClasses = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ClassSchedule));

        const scheduleWithSpots = fetchedClasses.map(s => ({
            ...s,
            spotsLeft: s.capacity > 0 ? s.capacity - (Math.floor(Math.random() * (s.capacity / 2))) : 0, 
        }));

        setSchedule(scheduleWithSpots);
      } catch (e: any) {
        console.error("Error fetching schedule:", e);
        setError("Failed to load class schedule. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [firestore]);
  

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
              <TableHead>Date & Time</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Level</TableHead>
              <TableHead className="text-center">Spots Left</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skel-${i}`}>
                  <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-2/3" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-5 w-4 mx-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : error ? (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-destructive">
                        {error}
                    </TableCell>
                </TableRow>
            ) : schedule.length > 0 ? (
              schedule.map((classInfo) => {
                const IconComponent = getIcon(classInfo.className);
                const level = classInfo.difficulty;
                return (
                  <TableRow key={classInfo.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {IconComponent && <IconComponent className="h-5 w-5 text-primary hidden sm:inline-block" />}
                        {classInfo.className}
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(classInfo.classDate), 'EEE, MMM d')} at {formatTime(classInfo.startTime)}</TableCell>
                    <TableCell>{classInfo.instructor}</TableCell>
                    <TableCell>
                      <Badge variant={
                        level === 'Beginner' ? 'secondary' :
                        level === 'Intermediate' ? 'default' : 'destructive'
                      } className="bg-primary/20 text-primary-foreground">
                        {level}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{classInfo.spotsLeft ?? 0}</TableCell>
                    <TableCell className="text-right">
                      <BookingModal classInfo={classInfo} />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                        No upcoming classes found. Please check back later!
                    </TableCell>
                </TableRow>
             )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
