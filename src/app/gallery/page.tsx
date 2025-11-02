
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { GalleryItem } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageModal } from '@/components/image-modal';

const ImageCard = ({ image, onImageClick }: { image: GalleryItem, onImageClick: (image: GalleryItem) => void }) => (
  <Card className="overflow-hidden group cursor-pointer" onClick={() => onImageClick(image)}>
    <CardContent className="p-0">
      <div className="relative w-full" style={{ paddingBottom: '75%' /* 4:3 aspect ratio */ }}>
        <Image
          src={image.imageUrl}
          alt={image.description || image.title || 'Gallery image'}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    </CardContent>
  </Card>
);

const GalleryGrid = ({ images, isLoading, onImageClick }: { images: GalleryItem[] | null; isLoading: boolean, onImageClick: (image: GalleryItem) => void; }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="relative w-full" style={{ paddingBottom: '75%' }}>
             <Skeleton className="absolute top-0 left-0 w-full h-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!images || images.length === 0) {
    return <p className="text-center text-foreground/80">No images in this category yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map(image => (
        <ImageCard key={image.id} image={image} onImageClick={onImageClick} />
      ))}
    </div>
  );
};

export default function GalleryPage() {
  const firestore = useFirestore();
  const galleryItemsRef = useMemoFirebase(() => collection(firestore, 'galleryItems'), [firestore]);
  const { data: galleryItems, isLoading } = useCollection<GalleryItem>(galleryItemsRef);

  const [activeTab, setActiveTab] = useState('venue');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const venueImages = useMemo(() => galleryItems?.filter(item => item.itemType === 'venue') || null, [galleryItems]);
  const competitionImages = useMemo(() => galleryItems?.filter(item => item.itemType === 'competition') || null, [galleryItems]);
  
  const currentImageList = activeTab === 'venue' ? venueImages : competitionImages;

  const handleImageClick = (image: GalleryItem) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };
  
  const handleNavigate = (direction: 'next' | 'prev') => {
    if (!selectedImage || !currentImageList) return;
    
    const currentIndex = currentImageList.findIndex(img => img.id === selectedImage.id);
    if (currentIndex === -1) return;

    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % currentImageList.length;
    } else {
      nextIndex = (currentIndex - 1 + currentImageList.length) % currentImageList.length;
    }
    setSelectedImage(currentImageList[nextIndex]);
  };

  return (
    <div className="container max-w-screen-xl mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">Our Gallery</h1>
        <p className="mt-4 text-lg text-foreground/80">A glimpse into our world. See our state-of-the-art facility and celebrate our members' achievements.</p>
      </div>

      <Tabs defaultValue="venue" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="venue" className="font-headline">The Venue</TabsTrigger>
          <TabsTrigger value="competition" className="font-headline">Competition Wins</TabsTrigger>
        </TabsList>
        <TabsContent value="venue">
          <GalleryGrid images={venueImages} isLoading={isLoading} onImageClick={handleImageClick} />
        </TabsContent>
        <TabsContent value="competition">
          <GalleryGrid images={competitionImages} isLoading={isLoading} onImageClick={handleImageClick} />
        </TabsContent>
      </Tabs>
      
      <ImageModal
        isOpen={!!selectedImage}
        onClose={handleCloseModal}
        image={selectedImage}
        onNavigate={handleNavigate}
        hasNext={!!currentImageList && currentImageList.length > 1}
        hasPrev={!!currentImageList && currentImageList.length > 1}
      />
    </div>
  );
}
