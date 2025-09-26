-- Create service categories table
CREATE TABLE public.service_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  duration INTEGER NOT NULL, -- duration in minutes
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (no auth required)
CREATE POLICY "Service categories are viewable by everyone" 
ON public.service_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Services are viewable by everyone" 
ON public.services 
FOR SELECT 
USING (true);

-- Allow anyone to create bookings (no auth required)
CREATE POLICY "Anyone can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to view all bookings (for admin dashboard without auth)
CREATE POLICY "Bookings are viewable by everyone" 
ON public.bookings 
FOR SELECT 
USING (true);

-- Allow anyone to update bookings (for admin dashboard without auth)
CREATE POLICY "Bookings can be updated by anyone" 
ON public.bookings 
FOR UPDATE 
USING (true);

-- Allow anyone to manage service categories and services (for admin)
CREATE POLICY "Service categories can be managed by anyone" 
ON public.service_categories 
FOR ALL 
USING (true);

CREATE POLICY "Services can be managed by anyone" 
ON public.services 
FOR ALL 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_service_categories_updated_at
  BEFORE UPDATE ON public.service_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample service categories
INSERT INTO public.service_categories (name, description, image_url) VALUES
('Hair Braiding', 'Professional braiding services including box braids, knotless, cornrows, and twists', 'https://images.unsplash.com/photo-1594736797933-d0201ba2fe65?w=400'),
('Weave-On & Extensions', 'Sew-in weaves, wig installations, closures, and tape-in extensions', 'https://images.unsplash.com/photo-1522336284037-91f7da073525?w=400'),
('Dreadlocks', 'Starter locs, retwist, styling, and instant locs services', 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=400'),
('Retouching & Relaxing', 'Full relaxer treatments, root retouch, and texturizer services', 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400'),
('Treatments & Care', 'Deep conditioning, protein treatments, hot oil, and hair repair', 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400'),
('Washing & Blow Dry', 'Professional washing, blow drying, and setting services', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400'),
('Coloring & Highlights', 'Full color services, highlights, and root touch-ups', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'),
('Natural Hair Styling', 'Twist outs, bantu knots, afro styling, and silk press', 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=400'),
('Special Occasion Styling', 'Bridal hair, party styles, and elegant updos', 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400'),
('Add-ons', 'Wig revamp, edge treatment, scalp massage, and split end trims', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400');

-- Insert sample services for Hair Braiding category
INSERT INTO public.services (category_id, name, description, duration, price, image_url)
SELECT 
  sc.id,
  t.service_name,
  t.service_description,
  t.duration_mins,
  t.price_amount,
  t.service_image_url
FROM public.service_categories sc,
(VALUES 
  ('Box Braids', 'Classic protective box braids in various sizes', 360, 150.00, 'https://images.unsplash.com/photo-1594736797933-d0201ba2fe65?w=300'),
  ('Knotless Braids', 'Gentle knotless braids for natural hair protection', 420, 180.00, 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=300'),
  ('Cornrows', 'Traditional cornrow styles and patterns', 180, 80.00, 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=300'),
  ('Twists', 'Protective twist styles for all hair types', 240, 100.00, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300')
) AS t(service_name, service_description, duration_mins, price_amount, service_image_url)
WHERE sc.name = 'Hair Braiding';