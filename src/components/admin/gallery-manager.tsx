
'use client';

import { useState, useCallback } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useStorage } from '@/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
import { Edit, PlusCircle, Trash2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { Progress } from '../ui/progress';

const ImageDropzone = ({ onUrlChange, setUploading }: { onUrlChange: (url: string) => void; setUploading: (isUploading: boolean) => void; }) => {
  const storage = useStorage();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      handleUpload(files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    if (!storage) {
        toast({ title: "Storage not available", variant: 'destructive'});
        return;
    }
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid File Type', description: 'Please upload an image file.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    const storageRef = ref(storage, `gallery-images/${Date.now()}-${file.name}`);
    
    try {
      // For progress, we'd need uploadBytesResumable, but for simplicity let's stick to uploadBytes
      // This is a simplified progress simulation
      const uploadTask = uploadBytes(storageRef, file);
      
      // Simulate progress
      const interval = setInterval(() => {
          setUploadProgress(prev => {
              if (prev === null) return 0;
              if (prev >= 95) return prev;
              return prev + 5;
          });
      }, 200);

      await uploadTask;
      clearInterval(interval);
      setUploadProgress(100);

      const downloadURL = await getDownloadURL(storageRef);
      onUrlChange(downloadURL);
      toast({ title: 'Upload Successful', description: 'Image URL has been set.' });
    } catch (error: any) {
      toast({ title: 'Upload Failed', description: error.message, variant: 'destructive' });
      setUploadProgress(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div className="col-span-3">
        <label
            htmlFor="dropzone-file"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50 ${isDragging ? 'border-primary' : 'border-input'}`}
        >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="mb-1 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
            </div>
            <input id="dropzone-file" type="file" className="hidden" onChange={e => handleFileChange(e.target.files)} accept="image/*" />
        </label>
        {uploadProgress !== null && (
            <div className="mt-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-center mt-1">{uploadProgress}%</p>
            </div>
        )}
    </div>
  )
};


const GalleryItemForm = ({
  item,
  onSave,
  closeDialog,
}: {
  item?: GalleryItem;
  onSave: (data: Omit<GalleryItem, 'id'>) => void;
  closeDialog: () => void;
}) => {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    description: item?.description || '',
    itemType: item?.itemType || 'venue',
    imageUrl: item?.imageUrl || '',
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: 'venue' | 'competition') => {
    setFormData((prev) => ({ ...prev, itemType: value as 'venue' | 'competition' }));
  };

  const handleUrlChange = useCallback((url: string) => {
    setFormData(prev => ({...prev, imageUrl: url}));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
          <Label className="text-right">Upload</Label>
          <ImageDropzone onUrlChange={handleUrlChange} setUploading={setIsUploading} />
        </div>
        
        {formData.imageUrl && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="imageUrl" className="text-right">
              Image URL
            </Label>
            <div className="col-span-3 relative">
                <Input id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="pr-10" required />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => handleUrlChange('')}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <div className="col-start-2 col-span-3">
              <Image src={formData.imageUrl} alt="Preview" width={80} height={60} className="rounded-md object-cover" />
            </div>
          </div>
        )}

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
        <Button type="button" variant="secondary" onClick={closeDialog} disabled={isUploading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isUploading || !formData.imageUrl}>
          {isUploading ? 'Uploading...' : 'Save'}
        </Button>
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
  const { data: galleryItems, isLoading, error } = useCollection<GalleryItem>(galleryItemsRef);
  
  if (error) {
    console.error("Error fetching gallery items:", error);
    toast({
      title: "Error",
      description: "Could not fetch gallery items.",
      variant: "destructive"
    });
  }

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
    } catch (err: any) {
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'galleryItems', item.id));
      toast({ title: 'Success', description: 'Gallery item deleted.' });
    } catch (error: any) {
       toast({ title: 'Deletion Failed', description: error.message, variant: 'destructive' });
       console.error("Delete gallery item failed:", error);
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
          <DialogContent className="sm:max-w-[625px]">
            <GalleryItemForm 
              item={editingItem} 
              onSave={handleSave} 
              closeDialog={closeDialog}
            />
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
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item)}>
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
