'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { ClassSchedule } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { setDocumentNonBlocking, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const ClassScheduleForm = ({ schedule, onSave, closeDialog }: { schedule?: ClassSchedule; onSave: (data: Omit<ClassSchedule, 'id'>) => void; closeDialog: () => void }) => {
  const [formData, setFormData] = useState<Omit<ClassSchedule, 'id'>>({
    className: schedule?.className || '',
    instructor: schedule?.instructor || '',
    dayOfWeek: schedule?.dayOfWeek || '',
    startTime: schedule?.startTime || '',
    durationMinutes: schedule?.durationMinutes || 60,
    capacity: schedule?.capacity || 10,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{schedule ? 'Edit Class' : 'Add New Class'}</DialogTitle>
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
          <Label htmlFor="dayOfWeek" className="text-right">Day</Label>
          <Input id="dayOfWeek" name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="startTime" className="text-right">Start Time</Label>
          <Input id="startTime" name="startTime" type="time" value={formData.startTime} onChange={handleChange} className="col-span-3" required />
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

  const schedulesRef = useMemoFirebase(() => collection(firestore, 'classSchedules'), [firestore]);
  const { data: schedules, isLoading } = useCollection<ClassSchedule>(schedulesRef);

  const handleSave = async (data: Omit<ClassSchedule, 'id'>) => {
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
  
  const handleDelete = (id: string) => {
      if(window.confirm('Are you sure you want to delete this class?')) {
          const docRef = doc(firestore, 'classSchedules', id);
          deleteDocumentNonBlocking(docRef);
          toast({ title: 'Success', description: 'Class schedule deleted.' });
      }
  }

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
              <TableCell>{schedule.dayOfWeek} at {schedule.startTime}</TableCell>
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
