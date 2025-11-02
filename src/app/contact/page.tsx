import { Mail, MapPin, Phone } from "lucide-react";
import { MapComponent } from "@/components/map-component";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import('@/components/map-component').then(mod => mod.MapComponent), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted flex items-center justify-center rounded-lg"><p>Loading map...</p></div>
});


export default function ContactPage() {
  const contactDetails = [
    {
      icon: MapPin,
      title: "Our Address",
      value: "PR-459, Aguadilla, 00603, Puerto Rico",
      href: "https://www.google.com/maps/search/?api=1&query=18.4875,-67.1279",
    },
    {
      icon: Phone,
      title: "Phone Number",
      value: "(123) 456-7890",
      href: "tel:+1234567890",
    },
    {
      icon: Mail,
      title: "Email Address",
      value: "hello@onefitness.studio",
      href: "mailto:hello@onefitness.studio",
    },
  ];

  return (
    <div className="container max-w-screen-xl mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">Get In Touch</h1>
        <p className="mt-4 text-lg text-foreground/80">We're here to help you start your fitness journey. Reach out to us!</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          {contactDetails.map((detail) => (
            <Card key={detail.title} className="bg-card">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <div className="p-3 bg-primary/10 rounded-full">
                  <detail.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-headline">{detail.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={detail.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg text-foreground/80 hover:text-primary transition-colors"
                >
                  {detail.value}
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="h-[400px] lg:h-full w-full rounded-lg overflow-hidden shadow-lg">
          <DynamicMap />
        </div>
      </div>
    </div>
  );
}
