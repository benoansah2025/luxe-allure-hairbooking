import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, CalendarIcon, User, Phone, Mail, MapPin, Home, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
}

interface ReviewBookingProps {
  selectedServices: Service[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceLocation: 'in-salon' | 'at-home';
  date: Date | undefined;
  time: string;
  notes: string;
  onConfirm: () => void;
  onBack: () => void;
  loading: boolean;
}

export const ReviewBooking = ({
  selectedServices,
  customerName,
  customerEmail,
  customerPhone,
  serviceLocation,
  date,
  time,
  notes,
  onConfirm,
  onBack,
  loading
}: ReviewBookingProps) => {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const getSubtotal = () => {
    return selectedServices.reduce((total, service) => total + Number(service.price), 0);
  };

  const getTravelFee = () => {
    return serviceLocation === 'at-home' ? 25 : 0;
  };

  const getTotal = () => {
    return getSubtotal() + getTravelFee();
  };

  const getTotalDuration = () => {
    return selectedServices.reduce((total, service) => total + service.duration, 0);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Review Your Booking</h2>
        <p className="text-muted-foreground">
          Please review all details before confirming your appointment
        </p>
      </div>

      {/* Personal Information */}
      <Card className="salon-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>{customerName}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span>{customerEmail}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span>{customerPhone}</span>
          </div>
          <div className="flex items-center gap-3">
            {serviceLocation === 'in-salon' ? (
              <>
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>In-Salon Service</span>
              </>
            ) : (
              <>
                <Home className="w-4 h-4 text-muted-foreground" />
                <span>At-Home Service</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Services */}
      <Card className="salon-card">
        <CardHeader>
          <CardTitle className="text-lg">Selected Services ({selectedServices.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedServices.map((service) => (
            <div key={service.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div className="flex-1">
                <div className="font-medium text-foreground">{service.name}</div>
                <div className="text-sm text-muted-foreground">{service.description}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(service.duration)}
                </div>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1 rounded-xl">
                <DollarSign className="w-3 h-3" />
                {service.price}
              </Badge>
            </div>
          ))}
          
          <div className="pt-4 border-t border-border/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Duration:</span>
              <span className="font-medium">{formatDuration(getTotalDuration())}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date & Time */}
      <Card className="salon-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Appointment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            <span>{date ? format(date, "EEEE, MMMM do, yyyy") : "No date selected"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{time || "No time selected"}</span>
          </div>
          {notes && (
            <div className="pt-2 border-t border-border/50">
              <div className="text-sm text-muted-foreground mb-1">Notes:</div>
              <div className="text-sm">{notes}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price Summary */}
      <Card className="salon-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg text-primary">Price Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Services Subtotal:</span>
            <span className="font-medium">${getSubtotal().toFixed(2)}</span>
          </div>
          {getTravelFee() > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Travel Fee:</span>
              <span className="font-medium">${getTravelFee().toFixed(2)}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <span className="text-lg font-semibold text-foreground">Total:</span>
            <span className="text-lg font-bold text-primary">${getTotal().toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="flex-1 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 salon-button"
        >
          {loading ? "Confirming..." : "Confirm Booking"}
        </Button>
      </div>
    </div>
  );
};