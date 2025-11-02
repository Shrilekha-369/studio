'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { GalleryItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, PlusCircle, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { updateDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';


const GalleryItemForm = ({ item, onSave, closeDialog }: { item?: GalleryItem; onSave: (data: Partial<GalleryItem>) => void; closeDialog: () => void }) => {
  const [formData, setFormData] = useState<Partial<GalleryItem>>({
    title: item?.title || '',
    description: item?.description || '',
    imageUrl: item?.imageUrl || '',
    itemType: item?.itemType || 'venue',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: 'venue' | 'competition') => {
    setFormData(prev => ({ ...prev, itemType: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl || !formData.itemType) {
        // Basic validation
        return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{item ? 'Edit' : 'Add'} Gallery Item</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right">Title</Label>
          <Input id="title" name="title" value={formData.title} onChange={handleChange} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">Description</Label>
          <Input id="description" name="description" value={formData.description} onChange={handleChange} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
          <Input id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="itemType" className="text-right">Type</Label>
          <Select name="itemType" value={formData.itemType} onValueChange={handleSelectChange}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="venue">Venue</SelectItem>
              <SelectItem value="competition">Competition</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={closeDialog}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
};


export function GalleryManager() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | undefined>(undefined);

  const galleryItemsRef = useMemoFirebase(() => collection(firestore, 'galleryItems'), [firestore]);
  const { data: galleryItems, isLoading } = useCollection<GalleryItem>(galleryItemsRef);

  const handleSave = (data: Partial<GalleryItem>) => {
    try {
      if (editingItem) {
        const docRef = doc(firestore, 'galleryItems', editingItem.id);
        updateDocumentNonBlocking(docRef, data);
        toast({ title: 'Success', description: 'Gallery item updated.' });
      } else {
        addDocumentNonBlocking(collection(firestore, 'galleryItems'), data);
        toast({ title: 'Success', description: 'New gallery item added.' });
      }
      closeDialog();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
        const docRef = doc(firestore, 'galleryItems', id);
        deleteDocumentNonBlocking(docRef);
        toast({ title: 'Success', description: 'Gallery item deleted.' });
    }
  };
  
  const openDialog = (item?: GalleryItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingItem(undefined);
    setDialogOpen(false);
  };

  return (
    <div className="border rounded-lg shadow-lg overflow-hidden bg-card p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold font-headline">Manage Gallery</h2>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>

      {isLoading && <p>Loading gallery items...</p>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {galleryItems?.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Image src={item.imageUrl} alt={item.title} width={80} height={60} className="rounded-md object-cover" />
              </TableCell>
              <TableCell>{item.title}</TableCell>
              <TableCell className="capitalize">{item.itemType}</TableCell>
              <TableCell className='text-right'>
                <Button variant="ghost" size="icon" onClick={() => openDialog(item)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive"/>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
            <GalleryItemForm item={editingItem} onSave={handleSave} closeDialog={closeDialog} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
