
'use client';

import { useState, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
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
import { Edit, PlusCircle, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';

const GalleryItemForm = ({
  item,
  onSave,
  closeDialog,
  isUploading,
  uploadProgress,
}: {
  item?: GalleryItem;
  onSave: (data: Omit<GalleryItem, 'id' | 'imageUrl'> & { imageFile?: File }, currentImageUrl?: string) => void;
  closeDialog: () => void;
  isUploading: boolean;
  uploadProgress: number;
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: item?.title || '',
    description: item?.description || '',
    itemType: item?.itemType || 'venue',
  });
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSelectChange = (value: 'venue' | 'competition') => {
    setFormData((prev) => ({ ...prev, itemType: value as 'venue' | 'competition' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile && !item) {
      toast({ title: 'No Image Selected', description: 'Please select an image to upload.', variant: 'destructive' });
      return;
    }
    onSave({ ...formData, imageFile }, item?.imageUrl);
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
          <Label htmlFor="imageFile" className="text-right">
            Image
          </Label>
          <Input id="imageFile" name="imageFile" type="file" onChange={handleFileChange} className="col-span-3" accept="image/*" />
        </div>
        {item?.imageUrl && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Current</Label>
            <div className="col-span-3">
              <Image src={item.imageUrl} alt="Current image" width={80} height={60} className="rounded-md object-cover" />
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
        {isUploading && (
          <div className="col-span-4 px-1">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-center mt-1">{`Uploading... ${Math.round(uploadProgress)}%`}</p>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={closeDialog} disabled={isUploading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isUploading}>
          {isUploading ? 'Saving...' : 'Save'}
        </Button>
      </DialogFooter>
    </form>
  );
};


export function GalleryManager() {
  const firestore = useFirestore();
  const storage = getStorage();
  const { toast } = useToast();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const galleryItemsRef = useMemoFirebase(() => collection(firestore, 'galleryItems'), [firestore]);
  const { data: galleryItems, isLoading, error } = useCollection<GalleryItem>(galleryItemsRef);
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching gallery",
        description: "Could not load gallery items. Please check console for errors.",
        variant: "destructive"
      });
    }
  }, [error, toast]);


  const handleSave = (
    data: Omit<GalleryItem, 'id' | 'imageUrl'> & { imageFile?: File },
    currentImageUrl?: string
  ) => {
    if (!firestore) return;

    const { imageFile, ...itemData } = data;

    // If no new image is selected and we are editing, just update the metadata
    if (editingItem && !imageFile) {
      const docRef = doc(firestore, 'galleryItems', editingItem.id);
      updateDoc(docRef, itemData)
        .then(() => {
          toast({ title: 'Success', description: 'Gallery item updated.' });
          closeDialog();
        })
        .catch(err => {
          toast({ title: 'Error', description: err.message, variant: 'destructive' });
        });
      return;
    }

    // If no image is selected for a new item
    if (!imageFile) {
      return; // Should be handled by form validation, but as a safeguard.
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    const storageRef = ref(storage, `gallery-images/${Date.now()}_${imageFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        toast({ title: 'Upload Failed', description: error.message, variant: 'destructive' });
        setIsUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          const finalData = { ...itemData, imageUrl: downloadURL };

          const dbPromise = editingItem
            ? updateDoc(doc(firestore, 'galleryItems', editingItem.id), finalData)
            : addDoc(collection(firestore, 'galleryItems'), finalData);
          
          dbPromise.then(() => {
              toast({ title: 'Success', description: `Gallery item ${editingItem ? 'updated' : 'added'}.` });

              // If we were editing and uploaded a new image, delete the old one.
              if (editingItem && currentImageUrl) {
                 const oldImageRef = ref(storage, currentImageUrl);
                 deleteObject(oldImageRef).catch(err => console.error("Failed to delete old image:", err));
              }
              closeDialog();
          }).catch(err => {
              toast({ title: 'Database Error', description: err.message, variant: 'destructive' });
          }).finally(() => {
              setIsUploading(false);
          });
        });
      }
    );
  };

  const handleDelete = async (item: GalleryItem) => {
    if (!firestore) return;
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        // Delete Firestore document
        await deleteDoc(doc(firestore, 'galleryItems', item.id));

        // Delete image from Storage
        const imageRef = ref(storage, item.imageUrl);
        await deleteObject(imageRef);

        toast({ title: 'Success', description: 'Gallery item and image deleted.' });
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
    setIsUploading(false);
    setUploadProgress(0);
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
            <GalleryItemForm 
              item={editingItem} 
              onSave={handleSave} 
              closeDialog={closeDialog}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
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
