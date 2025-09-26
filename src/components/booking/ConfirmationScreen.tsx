import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calendar, Clock, DollarSign, Copy } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  name: string;
  price: number;
}

interface ConfirmationScreenProps {
  orderNumber: string;
  selectedServices: Service[];
  customerName: string;
  serviceLocation: 'in-salon' | 'at-home';
  date: Date | undefined;
  time: string;
  totalAmount: number;
  onClose: () => void;
}

export const ConfirmationScreen = ({
  orderNumber,
  selectedServices,
  customerName,
  serviceLocation,
  date,
  time,
  totalAmount,
  onClose
}: ConfirmationScreenProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Order number copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="space-y-6 text-center">
      {/* Success Icon */}
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center animate-scale-in">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
          <p className="text-muted-foreground">
            Thank you {customerName}, your appointment has been successfully booked.
          </p>
        </div>
      </div>

      {/* Order Number */}
      <Card className="salon-card border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">Order Number</div>
            <div className="flex items-center justify-center gap-2">
              <code className="text-lg font-mono font-bold text-primary bg-primary/10 px-4 py-2 rounded-xl">
                {orderNumber}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={copyOrderNumber}
                className="h-10 w-10 p-0"
              >
                <Copy className={`w-4 h-4 ${copied ? 'text-primary' : ''}`} />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Save this number for your records
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Summary */}
      <Card className="salon-card">
        <CardHeader>
          <CardTitle className="text-lg">Appointment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-left">
          {/* Services */}
          <div>
            <div className="font-medium text-foreground mb-2">Services:</div>
            <div className="space-y-2">
              {selectedServices.map((service) => (
                <div key={service.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{service.name}</span>
                  <span className="font-medium">${service.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Date</div>
                <div className="font-medium text-sm">
                  {date ? format(date, "MMM do, yyyy") : "TBD"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Time</div>
                <div className="font-medium text-sm">{time}</div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <div className="text-xs text-muted-foreground mb-1">Location</div>
            <div className="font-medium text-sm">
              {serviceLocation === 'in-salon' ? 'Luxe Allure Salon' : 'At-Home Service'}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">Total Amount:</span>
            </div>
            <span className="text-lg font-bold text-primary">${totalAmount.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="salon-card bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-left space-y-3">
            <h3 className="font-semibold text-foreground">What's Next?</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• You'll receive a confirmation email shortly</li>
              <li>• Our team will contact you 24 hours before your appointment</li>
              <li>• Please arrive 10 minutes early for in-salon appointments</li>
              <li>• For cancellations or changes, please call us with your order number</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Done Button */}
      <Button
        onClick={onClose}
        className="w-full salon-button text-lg py-6 rounded-xl"
      >
        Done
      </Button>
    </div>
  );
};