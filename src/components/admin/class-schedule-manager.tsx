
'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, deleteDoc } from 'firebase/firestore';
import type { ClassSchedule } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, CalendarIcon } from 'lucide-react';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const ClassScheduleForm = ({ schedule, onSave, closeDialog }: { schedule?: ClassSchedule; onSave: (data: Omit<ClassSchedule, 'id'> | Partial<ClassSchedule>) => void; closeDialog: () => void }) => {
  const [formData, setFormData] = useState({
    className: schedule?.className || '',
    instructor: schedule?.instructor || '',
    classDate: schedule?.classDate ? new Date(schedule.classDate) : new Date(),
    startTime: schedule?.startTime || '',
    durationMinutes: schedule?.durationMinutes || 60,
    capacity: schedule?.capacity || 10,
    difficulty: schedule?.difficulty || 'Intermediate',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleDateChange = (date?: Date) => {
    if (date) {
      setFormData(prev => ({ ...prev, classDate: date }));
    }
  };

  const handleDifficultyChange = (value: 'Beginner' | 'Intermediate' | 'Advanced') => {
    setFormData(prev => ({ ...prev, difficulty: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      classDate: format(formData.classDate, 'yyyy-MM-dd'),
    };
    onSave(dataToSave);
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{schedule ? 'Edit Class' : 'Add New Class'}</DialogTitle>
        <DialogDescription>
            {schedule ? 'Update the details for this class.' : 'Fill in the details for the new class schedule.'}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="className" className="text-right">Class Name</Label>
          <Input id="className" name="className" value={formData.className} onChange={handleChange} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="instructor" className="text-right">Instructor</Label>
          <Input id="instructor" name="instructor" value={formData.instructor} onChange={handleChange} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="classDate" className="text-right">Date</Label>
            <Popover>
                <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !formData.classDate && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.classDate ? format(formData.classDate, "PPP") : <span>Pick a date</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={formData.classDate}
                    onSelect={handleDateChange}
                    initialFocus
                />
                </PopoverContent>
            </Popover>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="startTime" className="text-right">Start Time</Label>
          <Input id="startTime" name="startTime" type="time" value={formData.startTime} onChange={handleChange} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="difficulty" className="text-right">Difficulty</Label>
            <Select name="difficulty" value={formData.difficulty} onValueChange={handleDifficultyChange}>
                <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a difficulty" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="durationMinutes" className="text-right">Duration (min)</Label>
          <Input id="durationMinutes" name="durationMinutes" type="number" value={formData.durationMinutes} onChange={handleChange} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="capacity" className="text-right">Capacity</Label>
          <Input id="capacity" name="capacity" type="number" value={formData.capacity} onChange={handleChange} className="col-span-3" required />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={closeDialog}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
};

export function ClassScheduleManager() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ClassSchedule | undefined>(undefined);
  
  const schedulesQuery = useMemoFirebase(() => query(collection(firestore, 'classSchedules'), orderBy('classDate', 'desc')), [firestore]);
  const { data: schedules, isLoading, setData: setSchedules } = useCollection<ClassSchedule>(schedulesQuery);

  const handleSave = async (data: Omit<ClassSchedule, 'id'> | Partial<ClassSchedule>) => {
    try {
      if (editingSchedule) {
        const docRef = doc(firestore, 'classSchedules', editingSchedule.id);
        updateDocumentNonBlocking(docRef, data);
        toast({ title: 'Success', description: 'Class schedule updated.' });
      } else {
        await addDocumentNonBlocking(collection(firestore, 'classSchedules'), data);
        toast({ title: 'Success', description: 'New class added.' });
      }
      closeDialog();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      const docRef = doc(firestore, 'classSchedules', id);
      try {
        await deleteDoc(docRef);
        toast({ title: 'Success', description: 'Class schedule deleted.' });
        if(schedules && setSchedules) {
            setSchedules(schedules.filter(s => s.id !== id));
        }
      } catch (error: any) {
        toast({
          title: 'Deletion Failed',
          description: error.message || 'Could not delete class schedule.',
          variant: 'destructive',
        });
        console.error('Error deleting document: ', error);
      }
    }
  };

  const openDialog = (schedule?: ClassSchedule) => {
    setEditingSchedule(schedule);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingSchedule(undefined);
    setDialogOpen(false);
  };

  return (
    <div className="border rounded-lg shadow-lg overflow-hidden bg-card p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold font-headline">Manage Classes</h2>
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <ClassScheduleForm schedule={editingSchedule} onSave={handleSave} closeDialog={closeDialog} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <p>Loading schedules...</p>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Class Name</TableHead>
            <TableHead>Instructor</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules?.map((schedule) => (
            <TableRow key={schedule.id}>
              <TableCell>{schedule.className}</TableCell>
              <TableCell>{schedule.instructor}</TableCell>
              <TableCell>{format(new Date(schedule.classDate), 'PPP')} at {schedule.startTime}</TableCell>
              <TableCell className="space-x-2">
                <Button variant="ghost" size="icon" onClick={() => openDialog(schedule)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(schedule.id)}>
                    <Trash2 className="h-4 w-4 text-destructive"/>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
