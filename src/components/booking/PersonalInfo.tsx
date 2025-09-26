import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight, ArrowLeft, MapPin, Home } from "lucide-react";

interface PersonalInfoProps {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceLocation: 'in-salon' | 'at-home';
  onCustomerNameChange: (name: string) => void;
  onCustomerEmailChange: (email: string) => void;
  onCustomerPhoneChange: (phone: string) => void;
  onServiceLocationChange: (location: 'in-salon' | 'at-home') => void;
  onNext: () => void;
  onBack: () => void;
}

export const PersonalInfo = ({
  customerName,
  customerEmail,
  customerPhone,
  serviceLocation,
  onCustomerNameChange,
  onCustomerEmailChange,
  onCustomerPhoneChange,
  onServiceLocationChange,
  onNext,
  onBack
}: PersonalInfoProps) => {
  const isValid = customerName.trim() && customerEmail.trim() && customerPhone.trim();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Personal Information</h2>
        <p className="text-muted-foreground">
          Please provide your contact details
        </p>
      </div>

      <div className="space-y-6">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              placeholder="Enter your full name"
              required
              className="rounded-xl mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={customerPhone}
              onChange={(e) => onCustomerPhoneChange(e.target.value)}
              placeholder="(555) 123-4567"
              required
              className="rounded-xl mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={customerEmail}
            onChange={(e) => onCustomerEmailChange(e.target.value)}
            placeholder="your@email.com"
            required
            className="rounded-xl mt-1"
          />
        </div>

        {/* Service Location */}
        <div>
          <Label className="text-base font-semibold">Service Location *</Label>
          <p className="text-sm text-muted-foreground mb-4">Where would you like your appointment?</p>
          
          <RadioGroup 
            value={serviceLocation} 
            onValueChange={(value: 'in-salon' | 'at-home') => onServiceLocationChange(value)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-3 rounded-xl border border-input p-4 hover:bg-muted/30 transition-colors">
              <RadioGroupItem value="in-salon" id="in-salon" />
              <label htmlFor="in-salon" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">In-Salon</div>
                    <div className="text-sm text-muted-foreground">Visit our salon location</div>
                  </div>
                </div>
              </label>
            </div>

            <div className="flex items-center space-x-3 rounded-xl border border-input p-4 hover:bg-muted/30 transition-colors">
              <RadioGroupItem value="at-home" id="at-home" />
              <label htmlFor="at-home" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-secondary/10">
                    <Home className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">At-Home Service</div>
                    <div className="text-sm text-muted-foreground">We come to you (+$25 travel fee)</div>
                  </div>
                </div>
              </label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Services
        </Button>
        <Button
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 salon-button"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};