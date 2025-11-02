import Image from 'next/image';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

const venueImages = PlaceHolderImages.filter(p => p.id.startsWith('gallery-venue'));
const competitionImages = PlaceHolderImages.filter(p => p.id.startsWith('gallery-competition'));

const ImageCard = ({ image }: { image: ImagePlaceholder }) => (
  <Card className="overflow-hidden group">
    <CardContent className="p-0">
      <div className="relative aspect-w-4 aspect-h-3">
        <Image
          src={image.imageUrl}
          alt={image.description}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          data-ai-hint={image.imageHint}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    </CardContent>
  </Card>
);

export default function GalleryPage() {
  return (
    <div className="container max-w-screen-xl mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">Our Gallery</h1>
        <p className="mt-4 text-lg text-foreground/80">A glimpse into our world. See our state-of-the-art facility and celebrate our members' achievements.</p>
      </div>

      <Tabs defaultValue="venue" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="venue" className="font-headline">The Venue</TabsTrigger>
          <TabsTrigger value="competition" className="font-headline">Competition Wins</TabsTrigger>
        </TabsList>
        <TabsContent value="venue">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {venueImages.map(image => (
              <ImageCard key={image.id} image={image} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="competition">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitionImages.map(image => (
              <ImageCard key={image.id} image={image} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
