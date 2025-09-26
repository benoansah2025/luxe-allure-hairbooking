import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, Phone, Mail, User, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  status: string;
  notes: string | null;
  created_at: string;
  services: {
    name: string;
    price: number;
    duration: number;
  };
}

export const AdminDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    revenue: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          services (
            name,
            price,
            duration
          )
        `)
        .order("booking_date", { ascending: false })
        .order("booking_time", { ascending: false });

      if (error) throw error;

      const bookingsData = data || [];
      setBookings(bookingsData);

      // Calculate stats
      const total = bookingsData.length;
      const pending = bookingsData.filter(b => b.status === 'pending').length;
      const confirmed = bookingsData.filter(b => b.status === 'confirmed').length;
      const completed = bookingsData.filter(b => b.status === 'completed').length;
      const revenue = bookingsData
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.services?.price || 0), 0);

      setStats({ total, pending, confirmed, completed, revenue });
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Error",
        description: "Failed to fetch bookings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", bookingId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Booking status updated to ${newStatus}.`,
      });

      fetchBookings(); // Refresh data
    } catch (error) {
      console.error("Error updating booking:", error);
      toast({
        title: "Error",
        description: "Failed to update booking status.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your salon bookings and appointments</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="salon-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="salon-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card className="salon-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
            </CardContent>
          </Card>

          <Card className="salon-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card className="salon-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${stats.revenue}</div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Table */}
        <Card className="salon-card">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Service & Location</TableHead>
                <TableHead>Date & Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{booking.customer_name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {booking.customer_email}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {booking.customer_phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{booking.services?.name}</div>
                        {booking.notes && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Note: {booking.notes}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {format(new Date(booking.booking_date), "PPP")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {booking.booking_time}
                        </div>
                      </TableCell>
                      <TableCell>
                        {booking.services?.duration ? formatDuration(booking.services.duration) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">
                          ${booking.services?.price || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`${getStatusColor(booking.status)} text-white`}
                        >
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {booking.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                              className="text-xs"
                            >
                              Confirm
                            </Button>
                          )}
                          {booking.status === 'confirmed' && (
                            <Button
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id, 'completed')}
                              className="text-xs"
                            >
                              Complete
                            </Button>
                          )}
                          {(booking.status === 'pending' || booking.status === 'confirmed') && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              className="text-xs"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {bookings.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No bookings found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};