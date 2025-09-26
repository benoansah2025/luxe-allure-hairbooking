import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, DollarSign, ArrowRight, X } from "lucide-react";

interface Service {
  id: string;
  category_id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  image_url: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

interface ServiceSelectionProps {
  selectedServices: Service[];
  onServicesChange: (services: Service[]) => void;
  onNext: () => void;
}

export const ServiceSelection = ({ selectedServices, onServicesChange, onNext }: ServiceSelectionProps) => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const toggleService = (service: Service) => {
    const isSelected = selectedServices.some(s => s.id === service.id);
    if (isSelected) {
      onServicesChange(selectedServices.filter(s => s.id !== service.id));
    } else {
      onServicesChange([...selectedServices, service]);
    }
  };

  const removeService = (serviceId: string) => {
    onServicesChange(selectedServices.filter(s => s.id !== serviceId));
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((total, service) => total + Number(service.price), 0);
  };

  const getTotalDuration = () => {
    return selectedServices.reduce((total, service) => total + service.duration, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <Card className="salon-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Selected Services ({selectedServices.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedServices.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <div className="flex-1">
                  <div className="font-medium text-foreground">{service.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(service.duration)}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      ${service.price}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeService(service.id)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="text-sm text-muted-foreground">
                Total: {formatDuration(getTotalDuration())}
              </div>
              <div className="text-lg font-semibold text-primary">
                ${getTotalPrice().toFixed(2)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Categories */}
      {!selectedCategory && (
        <div>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Select Services</h2>
            <p className="text-muted-foreground">
              Choose one or more services for your appointment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card 
                key={category.id} 
                className="category-card group cursor-pointer"
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="relative overflow-hidden rounded-t-2xl">
                  <img
                    src={category.image_url || "/placeholder.svg"}
                    alt={category.name}
                    className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">
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
      )}

      {/* Individual Services */}
      {selectedCategory && (
        <div>
          <div className="flex items-center gap-4 mb-6">
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
            <h2 className="text-xl font-bold text-foreground">
              {categories.find(cat => cat.id === selectedCategory)?.name} Services
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => {
              const isSelected = selectedServices.some(s => s.id === service.id);
              return (
                <Card key={service.id} className={`service-card group cursor-pointer transition-all duration-200 ${
                  isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}>
                  <div className="relative overflow-hidden rounded-t-2xl">
                    <img
                      src={service.image_url || "/placeholder.svg"}
                      alt={service.name}
                      className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center">
                        ✓
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-foreground">
                      {service.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatDuration(service.duration)}</span>
                      </div>
                      <Badge variant="secondary" className="flex items-center gap-1 rounded-xl">
                        <DollarSign className="w-3 h-3" />
                        {service.price}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`service-${service.id}`}
                        checked={isSelected}
                        onCheckedChange={() => toggleService(service)}
                      />
                      <label 
                        htmlFor={`service-${service.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </label>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Continue Button */}
      {selectedServices.length > 0 && (
        <div className="flex justify-end pt-4">
          <Button 
            onClick={onNext}
            className="salon-button px-8"
          >
            Continue with {selectedServices.length} Service{selectedServices.length > 1 ? 's' : ''}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};