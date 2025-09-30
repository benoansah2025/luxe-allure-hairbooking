-- Drop existing INSERT policy for bookings
DROP POLICY IF EXISTS "Customers can create their own bookings" ON public.bookings;

-- Create a simpler INSERT policy that allows:
-- 1. Authenticated users to create bookings with their user_id
-- 2. Anonymous bookings with NULL user_id
CREATE POLICY "Allow authenticated and anonymous bookings"
ON public.bookings
FOR INSERT
TO public
WITH CHECK (
  -- Allow if user_id matches authenticated user
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  -- OR allow anonymous bookings (no user_id)
  OR (auth.uid() IS NULL AND user_id IS NULL)
  -- OR allow if user_id is NULL even when authenticated (for flexibility)
  OR (user_id IS NULL)
);