
'use client';

import { useState, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import type { GalleryItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, PlusCircle, Trash2, RefreshCw } from 'lucide-react';
import Image from 'next/image';

const GalleryItemForm = ({
  item,
  onSave,
  closeDialog,
}: {
  item?: GalleryItem;
  onSave: (data: Omit<GalleryItem, 'id'>) => void;
  closeDialog: () => void;
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: item?.title || '',
    description: item?.description || '',
    imageUrl: item?.imageUrl || '',
    itemType: item?.itemType || 'venue',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: 'venue' | 'competition') => {
    setFormData((prev) => ({ ...prev, itemType: value as 'venue' | 'competition' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      toast({ title: 'Missing Image URL', description: 'Please provide an image URL.', variant: 'destructive' });
      return;
    }
    // The 'id' is handled by the parent component, so we omit it here.
    onSave(formData as Omit<GalleryItem, 'id'>);
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{item ? 'Edit' : 'Add'} Gallery Item</DialogTitle>
        <DialogDescription>
          {item ? 'Update the details for this gallery item.' : 'Provide an image URL and optional details.'}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="imageUrl" className="text-right">
            Image URL
          </Label>
          <Input id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right">
            Title
          </Label>
          <Input id="title" name="title" value={formData.title} onChange={handleChange} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <Input id="description" name="description" value={formData.description} onChange={handleChange} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="itemType" className="text-right">
            Type
          </Label>
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
        <Button type="button" variant="secondary" onClick={closeDialog}>
          Cancel
        </Button>
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
  const { data: galleryItems, isLoading, setData: setGalleryItems, error } = useCollection<GalleryItem>(galleryItemsRef);
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching gallery",
        description: "Could not load gallery items. Please check console for errors.",
        variant: "destructive"
      });
    }
  }, [error, toast]);


  const handleSave = async (data: Omit<GalleryItem, 'id'>) => {
    if (!firestore) return;

    try {
      if (editingItem) {
        const docRef = doc(firestore, 'galleryItems', editingItem.id);
        await updateDoc(docRef, data);
        toast({ title: 'Success', description: 'Gallery item updated.' });
      } else {
        await addDoc(collection(firestore, 'galleryItems'), data);
        toast({ title: 'Success', description: 'Gallery item added.' });
      }
      closeDialog();
      // useCollection will auto-refresh
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      console.error("Save gallery item failed:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDoc(doc(firestore, 'galleryItems', id));
        toast({ title: 'Success', description: 'Gallery item deleted.' });
        // The useCollection hook will automatically handle the UI update.
      } catch (error: any) {
         toast({ title: 'Deletion Failed', description: error.message, variant: 'destructive' });
         console.error("Delete gallery item failed:", error);
      }
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
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <GalleryItemForm item={editingItem} onSave={handleSave} closeDialog={closeDialog} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <p className="py-4">Loading gallery items...</p>}
      
      {!isLoading && galleryItems && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {galleryItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Image
                    src={item.imageUrl}
                    alt={item.title || 'Gallery Image'}
                    width={80}
                    height={60}
                    className="rounded-md object-cover"
                  />
                </TableCell>
                <TableCell>{item.title || '-'}</TableCell>
                <TableCell className="capitalize">{item.itemType}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openDialog(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
       {!isLoading && galleryItems?.length === 0 && <p className="text-center py-4 text-muted-foreground">No gallery items found.</p>}
    </div>
  );
}
