'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GalleryItem } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

interface ImageModalProps {
  image: GalleryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (direction: 'next' | 'prev') => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export function ImageModal({ image, isOpen, onClose, onNavigate, hasNext, hasPrev }: ImageModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' && hasNext) {
      onNavigate('next');
    } else if (e.key === 'ArrowLeft' && hasPrev) {
      onNavigate('prev');
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [hasNext, hasPrev, onNavigate, onClose]);

  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setImageLoaded(false);
      window.addEventListener('keydown', handleKeyDown);
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, image, handleKeyDown]);

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
        className="max-w-4xl w-full h-[90vh] bg-background/80 backdrop-blur-sm p-0 flex flex-col border-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        >
        <DialogTitle className="sr-only">{image?.title || 'Full-size gallery image'}</DialogTitle>
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
        
        {hasPrev && (
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/50 hover:bg-background/80"
                onClick={() => onNavigate('prev')}
            >
                <ChevronLeft className="h-8 w-8"/>
            </Button>
        )}
        {hasNext && (
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/50 hover:bg-background/80"
                onClick={() => onNavigate('next')}
            >
                <ChevronRight className="h-8 w-8"/>
            </Button>
        )}


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
