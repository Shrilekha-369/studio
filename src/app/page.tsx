import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, HeartPulse, Sparkles, Star, Users } from 'lucide-react';
import { useUser } from '@/firebase';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-bg');
  const classImages = {
    yoga: PlaceHolderImages.find(p => p.id === 'class-yoga'),
    hiit: PlaceHolderImages.find(p => p.id === 'class-hiit'),
    spin: PlaceHolderImages.find(p => p.id === 'class-spin'),
  };

  const featuredClasses = [
    {
      title: 'Sunrise Yoga',
      description: 'Start your day with energizing yoga flows and mindful breathing.',
      icon: Sparkles,
      image: classImages.yoga
    },
    {
      title: 'HIIT Power Hour',
      description: 'Push your limits with high-intensity interval training for maximum results.',
      icon: HeartPulse,
      image: classImages.hiit
    },
    {
      title: 'Rhythm Spin',
      description: 'Ride to the beat in our immersive and high-energy cycling class.',
      icon: Dumbbell,
      image: classImages.spin
    },
  ];

  const testimonials = [
    {
      name: 'Jessica M.',
      quote: "One Fitness Studio has completely changed my outlook on fitness. The trainers are so supportive and the community is amazing!",
      avatar: 'JM'
    },
    {
      name: 'David L.',
      quote: "The variety of classes keeps me motivated. I've never been in better shape. Highly recommend the HIIT Power Hour!",
      avatar: 'DL'
    },
    {
      name: 'Sarah K.',
      quote: "A beautiful and clean space with a welcoming atmosphere. It feels like my second home. The sunrise yoga is my favorite.",
      avatar: 'SK'
    },
  ];
  
  return (
    <div className="flex flex-col">
      <section className="relative h-[60vh] md:h-[80vh] w-full flex items-center justify-center text-center">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="relative z-10 container px-4 md:px-6 flex flex-col items-center">
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-4 text-foreground">
            Transform Your Body & Mind
          </h1>
          <p className="max-w-[700px] text-lg md:text-xl text-foreground/80 mb-8">
            Join a community dedicated to strength, wellness, and personal growth. Your journey to a better you starts here.
          </p>
          <Button asChild size="lg" className="font-bold">
            <Link href="/booking">Book a Free Demo</Link>
          </Button>
        </div>
      </section>

      <section id="about" className="py-16 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-4">
                <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">About One Fitness Studio</h2>
                <p className="text-foreground/80">
                  One Fitness Studio is more than just a gym; it's a lifestyle. We believe in a holistic approach to fitness that encompasses physical strength, mental clarity, and a supportive community. Our state-of-the-art facility and expert trainers are here to guide you on your path to wellness, no matter your starting point.
                </p>
                <div className="flex gap-8 pt-4">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-8 w-8 text-primary"/>
                    <span className="font-semibold">Expert Trainers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-8 w-8 text-primary"/>
                    <span className="font-semibold">Vibrant Community</span>
                  </div>
                </div>
            </div>
            <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-xl">
                 {classImages.yoga && <Image src={classImages.yoga.imageUrl} alt="About Us Image" fill className="object-cover" data-ai-hint={classImages.yoga.imageHint} />}
            </div>
          </div>
        </div>
      </section>

      <section id="classes" className="py-16 md:py-24 bg-secondary/50">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">Our Featured Classes</h2>
            <p className="max-w-2xl mx-auto text-foreground/80">
              We offer a diverse range of classes designed to challenge and inspire you. Find your perfect fit.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredClasses.map((item) => (
              <Card key={item.title} className="overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                {item.image && (
                    <div className="relative h-48 w-full">
                        <Image src={item.image.imageUrl} alt={item.title} fill className="object-cover" data-ai-hint={item.image.imageHint}/>
                    </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="font-headline">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-16 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">What Our Members Say</h2>
            <p className="max-w-2xl mx-auto text-foreground/80">
              Real stories from our dedicated community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="flex flex-col justify-between">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-foreground/80 italic">"{testimonial.quote}"</blockquote>
                </CardContent>
                <div className="p-6 pt-0 font-semibold">{testimonial.name}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
