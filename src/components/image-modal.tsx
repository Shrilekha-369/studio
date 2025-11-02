'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import type { GalleryItem } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

interface ImageModalProps {
  image: GalleryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageModal({ image, isOpen, onClose }: ImageModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Reset state when a new image is opened
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setImageLoaded(false);
    }
  }, [isOpen, image]);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.2, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.2, 0.5));
  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      e.preventDefault();
      setIsDragging(true);
      setStartPos({ 
        x: e.clientX - position.x, 
        y: e.clientY - position.y 
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      setPosition({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl w-full h-[90vh] bg-background p-0 flex flex-col"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        >
        <div 
            className="flex-grow relative overflow-hidden cursor-grab"
            onMouseDown={handleMouseDown}
        >
          {image && (
            <>
              {!imageLoaded && <Skeleton className="w-full h-full" />}
              <Image
                src={image.imageUrl}
                alt={image.description || image.title || 'Full-size gallery image'}
                fill
                priority
                className={`object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                  cursor: scale > 1 ? 'move' : 'default',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                }}
                onLoad={() => setImageLoaded(true)}
              />
            </>
          )}
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/80 p-2 rounded-lg backdrop-blur-sm">
          <Button variant="outline" size="icon" onClick={handleZoomOut}>
            <ZoomOut />
          </Button>
           <Button variant="outline" onClick={handleResetZoom}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomIn}>
            <ZoomIn />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
