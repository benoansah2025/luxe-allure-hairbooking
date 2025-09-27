-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Add user_id column to bookings table for user-specific access
ALTER TABLE public.bookings ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Create trigger to update updated_at on user_roles
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Drop existing overly permissive RLS policies on bookings
DROP POLICY IF EXISTS "Only authenticated users can view bookings" ON public.bookings;
DROP POLICY IF EXISTS "Only authenticated users can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

-- Create secure RLS policies for bookings table
-- Users can only view their own bookings, admins can view all
CREATE POLICY "Users can view their own bookings, admins view all"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR 
  public.has_role(auth.uid(), 'admin')
);

-- Users can only update their own bookings, admins can update all
CREATE POLICY "Users can update their own bookings, admins update all"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR 
  public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  user_id = auth.uid() OR 
  public.has_role(auth.uid(), 'admin')
);

-- Anyone can create bookings (for public booking form)
CREATE POLICY "Anyone can create bookings"
ON public.bookings
FOR INSERT
WITH CHECK (
  user_id IS NULL OR 
  user_id = auth.uid() OR 
  public.has_role(auth.uid(), 'admin')
);

-- Fix service_categories RLS policies
DROP POLICY IF EXISTS "Service categories can be managed by anyone" ON public.service_categories;

-- Only admins can insert, update, delete service categories
CREATE POLICY "Only admins can manage service categories"
ON public.service_categories
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for user_roles table
-- Users can view their own roles, admins can view all
CREATE POLICY "Users can view their own roles, admins view all"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR 
  public.has_role(auth.uid(), 'admin')
);

-- Only admins can manage user roles
CREATE POLICY "Only admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));