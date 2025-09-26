-- Drop the overly permissive RLS policies on bookings table
DROP POLICY IF EXISTS "Bookings are viewable by everyone" ON public.bookings;
DROP POLICY IF EXISTS "Bookings can be updated by anyone" ON public.bookings;

-- Create secure RLS policies for bookings table
-- Only authenticated users (staff) can view booking data
CREATE POLICY "Only authenticated users can view bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (true);

-- Only authenticated users (staff) can update booking status and details
CREATE POLICY "Only authenticated users can update bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Keep the existing INSERT policy as anonymous users need to create bookings
-- This policy already exists: "Anyone can create bookings"