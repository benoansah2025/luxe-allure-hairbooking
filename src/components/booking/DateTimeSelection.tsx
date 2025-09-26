import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Clock, ArrowRight, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DateTimeSelectionProps {
  date: Date | undefined;
  time: string;
  notes: string;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
  onNotesChange: (notes: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const DateTimeSelection = ({
  date,
  time,
  notes,
  onDateChange,
  onTimeChange,
  onNotesChange,
  onNext,
  onBack
}: DateTimeSelectionProps) => {
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ];

  const isValid = date && time;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Select Date & Time</h2>
        <p className="text-muted-foreground">
          Choose your preferred appointment date and time
        </p>
      </div>

      <div className="space-y-6">
        {/* Date & Time Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-base font-semibold">Select Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal rounded-xl mt-2 h-12",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={onDateChange}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground mt-1">
              We're closed on Sundays
            </p>
          </div>

          <div>
            <Label htmlFor="time" className="text-base font-semibold">Select Time *</Label>
            <select
              id="time"
              value={time}
              onChange={(e) => onTimeChange(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground mt-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Choose time</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Available 9:00 AM - 6:00 PM
            </p>
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <Label htmlFor="notes" className="text-base font-semibold">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any special requests, allergies, or notes for your stylist..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="rounded-xl mt-2"
            rows={4}
          />
        </div>

        {/* Appointment Info */}
        {date && time && (
          <div className="p-4 bg-muted/30 rounded-xl">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock className="w-4 h-4" />
              Appointment scheduled for {format(date, "EEEE, MMMM do")} at {time}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 salon-button"
        >
          Review Booking
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};