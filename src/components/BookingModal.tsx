import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ServiceSelection } from "./booking/ServiceSelection";
import { PersonalInfo } from "./booking/PersonalInfo";
import { DateTimeSelection } from "./booking/DateTimeSelection";
import { ReviewBooking } from "./booking/ReviewBooking";
import { ConfirmationScreen } from "./booking/ConfirmationScreen";

interface Service {
  id: string;
  category_id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  image_url: string;
}

type BookingStep = 'services' | 'personal' | 'datetime' | 'review' | 'confirmation';

interface BookingModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal = ({ service, isOpen, onClose }: BookingModalProps) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('services');
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [serviceLocation, setServiceLocation] = useState<'in-salon' | 'at-home'>('in-salon');
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const { toast } = useToast();

  // Initialize with passed service if provided
  useState(() => {
    if (service && isOpen) {
      setSelectedServices([service]);
      setCurrentStep('personal');
    } else if (isOpen && !service) {
      setSelectedServices([]);
      setCurrentStep('services');
    }
  });

  const resetForm = () => {
    setCurrentStep('services');
    setSelectedServices([]);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setServiceLocation('in-salon');
    setDate(undefined);
    setTime("");
    setNotes("");
    setOrderNumber("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'services':
        setCurrentStep('personal');
        break;
      case 'personal':
        setCurrentStep('datetime');
        break;
      case 'datetime':
        setCurrentStep('review');
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'personal':
        setCurrentStep('services');
        break;
      case 'datetime':
        setCurrentStep('personal');
        break;
      case 'review':
        setCurrentStep('datetime');
        break;
      default:
        break;
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedServices.length || !date || !time || !customerName || !customerEmail || !customerPhone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      // Calculate total including travel fee
      const subtotal = selectedServices.reduce((total, service) => total + Number(service.price), 0);
      const travelFee = serviceLocation === 'at-home' ? 25 : 0;
      const total = subtotal + travelFee;

      // Create booking for the first service (main booking)
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          service_id: selectedServices[0].id,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          booking_date: date.toISOString().split('T')[0],
          booking_time: time,
          service_location: serviceLocation,
          notes: notes.trim() || null,
          user_id: user?.id || null, // Set user_id if authenticated, null if anonymous
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // If multiple services, create additional bookings
      if (selectedServices.length > 1) {
        const additionalBookings = selectedServices.slice(1).map(service => ({
          service_id: service.id,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          booking_date: date.toISOString().split('T')[0],
          booking_time: time,
          service_location: serviceLocation,
          notes: `Additional service for booking ${bookingData.order_number}`,
          user_id: user?.id || null, // Set user_id if authenticated, null if anonymous
        }));

        const { error: additionalError } = await supabase
          .from("bookings")
          .insert(additionalBookings);

        if (additionalError) throw additionalError;
      }

      setOrderNumber(bookingData.order_number);
      setCurrentStep('confirmation');

      toast({
        title: "Booking Confirmed!",
        description: `Your appointment has been booked successfully.`,
      });
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        title: "Booking Failed",
        description: "There was an error creating your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTotalAmount = () => {
    const subtotal = selectedServices.reduce((total, service) => total + Number(service.price), 0);
    const travelFee = serviceLocation === 'at-home' ? 25 : 0;
    return subtotal + travelFee;
  };

  const getDialogTitle = () => {
    switch (currentStep) {
      case 'services':
        return 'Book Your Services';
      case 'personal':
        return 'Personal Information';
      case 'datetime':
        return 'Select Date & Time';
      case 'review':
        return 'Review Booking';
      case 'confirmation':
        return 'Booking Confirmed';
      default:
        return 'Book Appointment';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto salon-card ${
        currentStep === 'services' ? 'sm:max-w-6xl' : 'sm:max-w-4xl'
      }`}>
        {currentStep !== 'confirmation' && (
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">{getDialogTitle()}</h1>
            <div className="flex items-center justify-center gap-2 mt-4">
              {['services', 'personal', 'datetime', 'review'].map((step, index) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    currentStep === step ? 'bg-primary' : 
                    ['services', 'personal', 'datetime', 'review'].indexOf(currentStep) > index ? 'bg-primary/50' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {currentStep === 'services' && (
          <ServiceSelection
            selectedServices={selectedServices}
            onServicesChange={setSelectedServices}
            onNext={handleNext}
          />
        )}

        {currentStep === 'personal' && (
          <PersonalInfo
            customerName={customerName}
            customerEmail={customerEmail}
            customerPhone={customerPhone}
            serviceLocation={serviceLocation}
            onCustomerNameChange={setCustomerName}
            onCustomerEmailChange={setCustomerEmail}
            onCustomerPhoneChange={setCustomerPhone}
            onServiceLocationChange={setServiceLocation}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 'datetime' && (
          <DateTimeSelection
            date={date}
            time={time}
            notes={notes}
            onDateChange={setDate}
            onTimeChange={setTime}
            onNotesChange={setNotes}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 'review' && (
          <ReviewBooking
            selectedServices={selectedServices}
            customerName={customerName}
            customerEmail={customerEmail}
            customerPhone={customerPhone}
            serviceLocation={serviceLocation}
            date={date}
            time={time}
            notes={notes}
            onConfirm={handleConfirmBooking}
            onBack={handleBack}
            loading={loading}
          />
        )}

        {currentStep === 'confirmation' && (
          <ConfirmationScreen
            orderNumber={orderNumber}
            selectedServices={selectedServices}
            customerName={customerName}
            serviceLocation={serviceLocation}
            date={date}
            time={time}
            totalAmount={getTotalAmount()}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};