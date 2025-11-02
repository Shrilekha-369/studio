
'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useStorage } from '@/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, type UploadTask } from 'firebase/storage';
import type { GalleryItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, PlusCircle, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { Progress } from '../ui/progress';


const GalleryItemForm = ({ item, onSave, closeDialog }: { item?: GalleryItem; onSave: (data: Partial<GalleryItem>, file?: File) => void; closeDialog: () => void }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<GalleryItem>>({
    title: item?.title || '',
    description: item?.description || '',
    imageUrl: item?.imageUrl || '',
    itemType: item?.itemType || 'venue',
  });
  const [file, setFile] = useState<File | undefined>(undefined);
  const [fileName, setFileName] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleSelectChange = (value: 'venue' | 'competition') => {
    setFormData(prev => ({ ...prev, itemType: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !item?.imageUrl) {
        toast({ title: 'Missing Image', description: 'Please upload an image.', variant: 'destructive' });
        return;
    }
    onSave(formData, file);
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{item ? 'Edit' : 'Add'} Gallery Item</DialogTitle>
        <DialogDescription>
            {item ? 'Update the details for this gallery item.' : 'Upload an image and provide optional details.'}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="image" className="text-right">Image</Label>
          <div className="col-span-3">
            <Button asChild variant="outline" className="w-full justify-start font-normal text-muted-foreground">
              <Label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="mr-2" />
                {fileName || 'Choose a file...'}
              </Label>
            </Button>
            <Input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
            {item?.imageUrl && !file && (
              <div className="mt-2 text-xs text-muted-foreground">
                Current image: <a href={item.imageUrl} target="_blank" rel="noopener noreferrer" className="underline">View</a>. Upload to replace.
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right">Title</Label>
          <Input id="title" name="title" value={formData.title} onChange={handleChange} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">Description</Label>
          <Input id="description" name="description" value={formData.description} onChange={handleChange} className="col-span-3" />
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
  const storage = useStorage();
  const { toast } = useToast();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | undefined>(undefined);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const galleryItemsRef = useMemoFirebase(() => collection(firestore, 'galleryItems'), [firestore]);
  const { data: galleryItems, isLoading } = useCollection<GalleryItem>(galleryItemsRef);

  const handleSave = async (data: Partial<GalleryItem>, file?: File) => {
    if (!firestore || !storage) return;

    closeDialog();

    // If we are just updating text fields without a new image
    if (!file) {
      if (editingItem) {
        const docRef = doc(firestore, 'galleryItems', editingItem.id);
        await updateDoc(docRef, data);
        toast({ title: 'Success', description: 'Gallery item updated.' });
      }
      return;
    }

    // If a file is present, start the upload process.
    const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        toast({ title: 'Upload Failed', description: error.message, variant: 'destructive' });
        setUploadProgress(null);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const dataToSave = { ...data, imageUrl: downloadURL };
        
        try {
          if (editingItem) {
            await updateDoc(doc(firestore, 'galleryItems', editingItem.id), dataToSave);
            toast({ title: 'Success', description: 'Gallery item updated.' });
          } else {
            await addDoc(collection(firestore, 'galleryItems'), dataToSave);
            toast({ title: 'Success', description: 'Gallery item added.' });
          }
        } catch (error: any) {
          toast({ title: 'Database Error', description: error.message, variant: 'destructive' });
        } finally {
          setTimeout(() => setUploadProgress(null), 2000);
        }
      }
    );
  };
  
  const handleDelete = async (id: string) => {
    if (!firestore) return;
    if (window.confirm('Are you sure you want to delete this item?')) {
        try {
            const docRef = doc(firestore, 'galleryItems', id);
            await deleteDoc(docRef);
            toast({ title: 'Success', description: 'Gallery item deleted.' });
        } catch (error: any) {
            toast({ title: 'Deletion Failed', description: error.message, variant: 'destructive' });
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
      
      {uploadProgress !== null && (
        <div className="my-4 space-y-2">
          <Label className="text-sm font-medium">Uploading Image...</Label>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {isLoading && <p className='py-4'>Loading gallery items...</p>}

      {!isLoading && (
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
                  <Image src={item.imageUrl} alt={item.title || 'Gallery Image'} width={80} height={60} className="rounded-md object-cover" />
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
      )}

    </div>
  );
}
    

    