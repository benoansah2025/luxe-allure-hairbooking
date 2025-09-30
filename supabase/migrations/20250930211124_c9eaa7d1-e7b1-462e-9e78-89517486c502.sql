-- Drop all existing service management policies
DROP POLICY IF EXISTS "Services can be managed by anyone" ON public.services;
DROP POLICY IF EXISTS "Only staff and admin can insert services" ON public.services;
DROP POLICY IF EXISTS "Only staff and admin can update services" ON public.services;
DROP POLICY IF EXISTS "Only staff and admin can delete services" ON public.services;

-- Create secure policies that only allow staff and admin to manage services
CREATE POLICY "Only staff and admin can insert services"
ON public.services
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'staff')
  )
);

CREATE POLICY "Only staff and admin can update services"
ON public.services
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'staff')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'staff')
  )
);

CREATE POLICY "Only staff and admin can delete services"
ON public.services
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('admin', 'staff')
  )
);