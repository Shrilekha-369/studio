
import { Mail, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleMapEmbed } from "@/components/google-map-embed";

export default function ContactPage() {
  const contactDetails = [
    {
      icon: MapPin,
      title: "Our Address",
      value: "Kaggadasapura Main Rd, above Union Bank of India, Nagavarapalya, Kaggadasapura, Bengaluru, Karnataka 560093",
      href: "https://www.google.com/maps/place/One+Fitness+Studio/@12.985074,77.673441,17z/data=!3m1!4b1!4m6!3m5!1s0x3bae11af6c4fcc29:0xc4727cddd5407567!8m2!3d12.985074!4d77.6734407!16s%2Fg%2F11f_6z0y1l?entry=ttu",
    },
    {
      icon: Phone,
      title: "Phone Number",
      value: "+91 7981304029",
      href: "tel:+917981304029",
    },
    {
      icon: Mail,
      title: "Email Address",
      value: "onefitnessstudios@gmail.com",
      href: "mailto:onefitnessstudios@gmail.com",
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
        
        <div className="h-[450px] lg:h-full w-full rounded-lg overflow-hidden shadow-lg">
          <GoogleMapEmbed />
        </div>
      </div>
    </div>
  );
}
