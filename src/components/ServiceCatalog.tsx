import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, ArrowRight } from "lucide-react";
import { BookingModal } from "./BookingModal";

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

interface Service {
  id: string;
  category_id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  image_url: string;
}

export const ServiceCatalog = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchServices(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("service_categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("category_id", categoryId)
        .order("name");

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 animate-fade-in">
            Luxe Allure Salon
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in">
            Transform your look with our premium hair services
          </p>
          <Button 
            className="salon-button text-lg px-8 py-4 animate-fade-in"
            onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Explore Services
          </Button>
        </div>
      </section>

      {/* Service Categories */}
      {!selectedCategory && (
        <section id="services" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">Our Services</h2>
              <p className="text-xl text-muted-foreground">
                Choose from our comprehensive range of professional hair services
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category) => (
                <Card 
                  key={category.id} 
                  className="category-card group"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="relative overflow-hidden rounded-t-2xl">
                    <img
                      src={category.image_url || "/placeholder.svg"}
                      alt={category.name}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full salon-button flex items-center justify-center gap-2">
                      View Services
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Individual Services */}
      {selectedCategory && (
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedCategory(null);
                  setServices([]);
                }}
                className="rounded-xl"
              >
                ← Back to Categories
              </Button>
              <h2 className="text-3xl font-bold text-foreground">
                {categories.find(cat => cat.id === selectedCategory)?.name} Services
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id} className="service-card group">
                  <div className="relative overflow-hidden rounded-t-2xl">
                    <img
                      src={service.image_url || "/placeholder.svg"}
                      alt={service.name}
                      className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {service.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(service.duration)}</span>
                      </div>
                      <Badge variant="secondary" className="flex items-center gap-1 rounded-xl">
                        <DollarSign className="w-3 h-3" />
                        {service.price}
                      </Badge>
                    </div>
                    <Button 
                      className="w-full salon-button"
                      onClick={() => handleBookService(service)}
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Booking Modal */}
      <BookingModal
        service={selectedService}
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedService(null);
        }}
      />
    </div>
  );
};