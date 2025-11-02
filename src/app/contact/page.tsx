import { Mail, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        
        <div className="h-[450px] lg:h-full w-full rounded-lg overflow-hidden shadow-lg">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.793212820604!2d77.67344066609483!3d12.985073995684935!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae11af6c4fcc29%3A0xc4727cddd5407567!2sOne%20Fitness%20Studio!5e0!3m2!1sen!2sin!4v1762072846866!5m2!1sen!2sin" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true}
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
