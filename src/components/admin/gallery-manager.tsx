
'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useStorage } from '@/firebase';
import { collection, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { ref, uploadBytesResumable, getDownloadURL, UploadTask, deleteObject } from 'firebase/storage';
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
import { Edit, PlusCircle, Trash2, Upload, X, Ban } from 'lucide-react';
import Image from 'next/image';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

// To manage uploads that might not be tied to component state
const uploadManager = {
  tasks: new Map<string, { uploadTask: UploadTask; docId: string }>(),

  add(id: string, uploadTask: UploadTask, docId: string) {
    this.tasks.set(id, { uploadTask, docId });
  },

  get(id: string) {
    return this.tasks.get(id);
  },

  remove(id: string) {
    this.tasks.delete(id);
  },

  cancelAll() {
    const tasksToCancel = Array.from(this.tasks.values());
    this.tasks.clear();
    return tasksToCancel;
  },
};


const GalleryItemForm = ({
  item,
  onSave,
  closeDialog,
}: {
  item?: GalleryItem;
  onSave: (data: Omit<GalleryItem, 'id' | 'imageUrl'>, file?: File) => void;
  closeDialog: () => void;
}) => {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    description: item?.description || '',
    itemType: item?.itemType || 'venue',
  });
  const [file, setFile] = useState<File | undefined>();
  const [preview, setPreview] = useState<string | undefined>(item?.imageUrl);
  
  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const selectedFile = files[0];
       if (!selectedFile.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      setFile(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, file);
    closeDialog();
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
            <Label className="text-right">Image</Label>
            <div className="col-span-3">
                 <Input id="image-upload" type="file" onChange={(e) => handleFileChange(e.target.files)} accept="image/*" className="h-11"/>
                 {!item && <p className="text-xs text-muted-foreground mt-1">You can save now and the upload will begin in the background.</p>}
            </div>
        </div>
        
        {preview && (
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-start-2 col-span-3">
              <Image src={preview} alt="Preview" width={80} height={60} className="rounded-md object-cover" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right">
            Title
          </Label>
          <Input id="title" name="title" value={formData.title} onChange={(e) => setFormData(p => ({...p, title: e.target.value}))} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <Input id="description" name="description" value={formData.description} onChange={(e) => setFormData(p => ({...p, description: e.target.value}))} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="itemType" className="text-right">
            Type
          </Label>
          <Select name="itemType" value={formData.itemType} onValueChange={(v) => setFormData(p => ({...p, itemType: v as 'venue' | 'competition'}))}>
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
        <Button type="submit">
          Save
        </Button>
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

  const galleryItemsRef = useMemoFirebase(() => collection(firestore, 'galleryItems'), [firestore]);
  const { data: serverGalleryItems, isLoading, error } = useCollection<GalleryItem>(galleryItemsRef);
  
  const [localUploads, setLocalUploads] = useState<GalleryItem[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});

  const galleryItems = useMemo(() => {
    const combined = [...(serverGalleryItems || [])];
    
    localUploads.forEach(localItem => {
        if (!combined.some(serverItem => serverItem.id === localItem.id)) {
            combined.push(localItem);
        }
    });

    return combined.sort((a,b) => ((b as any).createdAt?.seconds || 0) - ((a as any).createdAt?.seconds || 0));
  }, [serverGalleryItems, localUploads]);


  if (error) {
    console.error("Error fetching gallery items:", error);
  }

  const handleSave = async (data: Omit<GalleryItem, 'id' | 'imageUrl'>, file?: File) => {
    if (!firestore || !storage) return;

    if (editingItem) { // Updating existing item
        const docRef = doc(firestore, 'galleryItems', editingItem.id);
        updateDocumentNonBlocking(docRef, data);
        toast({ title: 'Success', description: 'Gallery item updated.' });
    } else { // Creating new item
        const tempId = `local_${Date.now()}`;
        const newDocData: Omit<GalleryItem, 'id'> & { createdAt: any } = {
          ...data,
          imageUrl: 'uploading', // Placeholder status
          createdAt: serverTimestamp(),
        };

        if (file) {
            const localItem = { ...newDocData, id: tempId, createdAt: { seconds: Date.now() / 1000 } } as GalleryItem;
            setLocalUploads(prev => [...prev, localItem]);
            setUploadProgress(prev => ({...prev, [tempId]: 0}));
            
            const docRef = await addDocumentNonBlocking(collection(firestore, 'galleryItems'), newDocData);
            if(docRef) {
              handleUpload(file, docRef.id, tempId);
            }
            toast({ title: 'Success', description: 'Gallery item saved. Uploading in background.' });
        } else {
            addDocumentNonBlocking(collection(firestore, 'galleryItems'), { ...newDocData, imageUrl: 'placeholder' });
            toast({ title: 'Success', description: 'Gallery item added without an image.' });
        }
    }
    closeDialog();
  };

  const handleUpload = (file: File, docId: string, tempId: string) => {
    if (!storage) return;
    const storageRef = ref(storage, `gallery-images/${docId}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    uploadManager.add(tempId, uploadTask, docId);

    uploadTask.on('state_changed',
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(prev => ({...prev, [tempId]: progress}));
        },
        (error: any) => {
            // Don't show toast for user-initiated cancellations
            if (error.code === 'storage/canceled') {
              console.log('Upload canceled by user.');
            } else {
              console.error("Upload failed:", error);
              const docRef = doc(firestore, 'galleryItems', docId);
              updateDocumentNonBlocking(docRef, { imageUrl: 'failed' });
              toast({ title: `Upload Failed for ${file.name}`, description: error.message, variant: 'destructive' });
            }
            
            // Clean up local state regardless of error type
            setLocalUploads(prev => prev.filter(item => item.id !== tempId));
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[tempId];
              return newProgress;
            });
            uploadManager.remove(tempId);
        },
        async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const docRef = doc(firestore, 'galleryItems', docId);
            updateDocumentNonBlocking(docRef, { imageUrl: downloadURL });
            
            // Clean up local state
            setLocalUploads(prev => prev.filter(item => item.id !== tempId));
            setUploadProgress(prev => {
                const newProgress = { ...prev };
                delete newProgress[tempId];
                return newProgress;
            });
            uploadManager.remove(tempId);
        }
    );
  }

  const handleDelete = async (item: GalleryItem) => {
    if (!firestore) return;

    const isUploading = item.id.startsWith('local_');
  
    // If it's a local item that's uploading, cancel the upload
    if (isUploading) {
        const uploadInfo = uploadManager.get(item.id);
        if (uploadInfo) {
            uploadInfo.uploadTask.cancel(); // This will trigger the error handler in uploadTask which cleans up
            
            // Immediately delete the firestore doc that was created for it
            const docRef = doc(firestore, 'galleryItems', uploadInfo.docId);
            await deleteDoc(docRef).catch(e => console.warn("Could not delete temp firestore doc", e));

            toast({ title: 'Success', description: 'Upload canceled and item removed.' });
        }
    } else if (item.imageUrl && !item.id.startsWith('local_')) {
      // It's a completed item from Firestore
      try {
        if (storage && item.imageUrl.includes('firebasestorage')) {
          const imageRef = ref(storage, item.imageUrl);
          await deleteObject(imageRef).catch(err => {
              // Ignore not found errors, as the file might already be deleted
              if (err.code !== 'storage/object-not-found') {
                  throw err;
              }
          });
        }
        
        await deleteDoc(doc(firestore, 'galleryItems', item.id));
        toast({ title: 'Success', description: 'Gallery item deleted.' });

      } catch (error: any) {
        toast({ title: 'Deletion Failed', description: error.message, variant: 'destructive' });
        console.error("Delete gallery item failed:", error);
      }
    } else {
        // Fallback for items in a weird state (e.g., 'failed' or 'placeholder')
        if (!item.id.startsWith('local_')) {
          await deleteDoc(doc(firestore, 'galleryItems', item.id));
          toast({ title: 'Success', description: 'Gallery item deleted.' });
        }
    }

    // Immediately remove from local state for instant UI update
    setLocalUploads(prev => prev.filter(local => local.id !== item.id));
    setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[item.id];
        return newProgress;
    });
  };

  const handleCancelAll = async () => {
    if (!firestore) return;

    const tasksToCancel = uploadManager.cancelAll();
    
    if (tasksToCancel.length === 0) {
      toast({ title: 'No active uploads', description: 'There are no uploads to cancel.' });
      return;
    }

    const deletePromises = tasksToCancel.map(taskInfo => {
      taskInfo.uploadTask.cancel();
      return deleteDoc(doc(firestore, 'galleryItems', taskInfo.docId));
    });

    try {
      await Promise.all(deletePromises);
      setLocalUploads([]);
      setUploadProgress({});
      toast({ title: 'Success', description: `${tasksToCancel.length} uploads have been canceled and removed.` });
    } catch (error: any) {
      toast({ title: 'Error', description: `Failed to remove all items: ${error.message}`, variant: 'destructive' });
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
  
  const activeUploadsCount = localUploads.length;

  return (
    <div className="border rounded-lg shadow-lg overflow-hidden bg-card p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold font-headline">Manage Gallery</h2>
        <div className="flex items-center gap-2">
            {activeUploadsCount > 0 && (
                <Button onClick={handleCancelAll} variant="destructive" size="sm">
                    <Ban className="mr-2 h-4 w-4" /> Cancel All ({activeUploadsCount})
                </Button>
            )}
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
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Could not fetch gallery items. Please try again later.</AlertDescription>
        </Alert>
      )}

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
            {galleryItems.map((item) => {
              const isUploading = item.id.startsWith('local_');
              const progress = uploadProgress[item.id];
              const isUrlValid = item.imageUrl && item.imageUrl.startsWith('http');

              return (
                <TableRow key={item.id}>
                    <TableCell>
                    {isUploading ? (
                        <div className="w-20">
                            <Progress value={progress} className="h-2"/>
                            <p className="text-xs text-center">{Math.round(progress || 0)}%</p>
                        </div>
                    ) : item.imageUrl === 'failed' ? (
                        <span className="text-xs text-destructive">Upload Failed</span>
                    ) : isUrlValid ? (
                        <Image
                            src={item.imageUrl}
                            alt={item.title || 'Gallery Image'}
                            width={80}
                            height={60}
                            className="rounded-md object-cover"
                        />
                    ): (
                        <span className="text-xs text-muted-foreground">No Image</span>
                    )}
                    </TableCell>
                    <TableCell>{item.title || '-'}</TableCell>
                    <TableCell className="capitalize">{item.itemType}</TableCell>
                    <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openDialog(item)} disabled={isUploading}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
       {!isLoading && galleryItems?.length === 0 && <p className="text-center py-4 text-muted-foreground">No gallery items found.</p>}
    </div>
  );
}

    