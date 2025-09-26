-- Add service location field to bookings table
ALTER TABLE public.bookings 
ADD COLUMN service_location TEXT NOT NULL DEFAULT 'in-salon' CHECK (service_location IN ('in-salon', 'at-home'));

-- Add order number field to bookings table
ALTER TABLE public.bookings 
ADD COLUMN order_number TEXT UNIQUE;

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number() 
RETURNS TEXT AS $$
BEGIN
  RETURN 'SB' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Add trigger to generate order numbers
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number = generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_order_number_trigger
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Insert all services for each category
-- Hair Braiding services (already exist, so skip)

-- Weave-On & Extensions services
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
  ('Sew-In Weave', 'Professional sew-in weave installation with natural hair blending', 300, 200.00, 'https://images.unsplash.com/photo-1522336284037-91f7da073525?w=300'),
  ('Wig Install', 'Expert wig installation and styling for natural look', 180, 120.00, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300'),
  ('Closure Install', 'Lace closure installation for seamless hairline', 240, 160.00, 'https://images.unsplash.com/photo-1594736797933-d0201ba2fe65?w=300'),
  ('Tape-In Extensions', 'Damage-free tape-in extension application', 120, 180.00, 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=300')
) AS t(service_name, service_description, duration_mins, price_amount, service_image_url)
WHERE sc.name = 'Weave-On & Extensions';

-- Dreadlocks services
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
  ('Starter Locs', 'Professional starter dreadlock formation', 360, 180.00, 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=300'),
  ('Retwist', 'Root maintenance and retwisting service', 180, 80.00, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300'),
  ('Loc Styling', 'Creative styling and shaping for established locs', 120, 60.00, 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=300'),
  ('Instant Locs', 'Quick loc formation using twisting method', 300, 150.00, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300')
) AS t(service_name, service_description, duration_mins, price_amount, service_image_url)
WHERE sc.name = 'Dreadlocks';

-- Retouching & Relaxing services
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
  ('Full Relaxer', 'Complete hair relaxing treatment for smooth texture', 240, 120.00, 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=300'),
  ('Root Retouch', 'New growth relaxer touch-up service', 150, 70.00, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300'),
  ('Texturizer', 'Light chemical treatment for texture softening', 180, 90.00, 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=300')
) AS t(service_name, service_description, duration_mins, price_amount, service_image_url)
WHERE sc.name = 'Retouching & Relaxing';

-- Treatments & Care services
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
  ('Deep Conditioning', 'Intensive moisture treatment for damaged hair', 90, 50.00, 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=300'),
  ('Protein Treatment', 'Strengthening protein therapy for weak hair', 75, 65.00, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300'),
  ('Hot Oil Treatment', 'Nourishing hot oil scalp and hair treatment', 60, 40.00, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300'),
  ('Hair Repair', 'Restorative treatment for severely damaged hair', 120, 85.00, 'https://images.unsplash.com/photo-1594736797933-d0201ba2fe65?w=300')
) AS t(service_name, service_description, duration_mins, price_amount, service_image_url)
WHERE sc.name = 'Treatments & Care';

-- Washing & Blow Dry services
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
  ('Wash & Blow Dry', 'Cleansing shampoo with professional blow dry styling', 90, 45.00, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300'),
  ('Wash & Set', 'Shampoo with roller set and styling', 120, 55.00, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300')
) AS t(service_name, service_description, duration_mins, price_amount, service_image_url)
WHERE sc.name = 'Washing & Blow Dry';

-- Coloring & Highlights services
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
  ('Full Color', 'Complete hair color transformation', 240, 150.00, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300'),
  ('Highlights', 'Professional highlighting for dimension and depth', 300, 180.00, 'https://images.unsplash.com/photo-1522336284037-91f7da073525?w=300'),
  ('Root Touch-Up', 'Color retouch for new growth coverage', 120, 80.00, 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=300')
) AS t(service_name, service_description, duration_mins, price_amount, service_image_url)
WHERE sc.name = 'Coloring & Highlights';

-- Natural Hair Styling services
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
  ('Twist Out', 'Defined twist out styling for natural texture', 150, 70.00, 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=300'),
  ('Bantu Knots', 'Traditional bantu knot styling and setting', 120, 60.00, 'https://images.unsplash.com/photo-1594736797933-d0201ba2fe65?w=300'),
  ('Afro Styling', 'Professional afro shaping and styling', 90, 50.00, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300'),
  ('Silk Press', 'Smooth silk press for temporary straightening', 180, 120.00, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300')
) AS t(service_name, service_description, duration_mins, price_amount, service_image_url)
WHERE sc.name = 'Natural Hair Styling';

-- Special Occasion Styling services
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
  ('Bridal Hair', 'Elegant bridal hairstyling for your special day', 240, 200.00, 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=300'),
  ('Party Styles', 'Glamorous styling for parties and events', 150, 100.00, 'https://images.unsplash.com/photo-1522336284037-91f7da073525?w=300'),
  ('Updos', 'Sophisticated updo styles for formal occasions', 180, 120.00, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300')
) AS t(service_name, service_description, duration_mins, price_amount, service_image_url)
WHERE sc.name = 'Special Occasion Styling';

-- Add-ons services
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
  ('Wig Revamp', 'Professional wig cleaning, styling and refreshing', 120, 75.00, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300'),
  ('Edge Treatment', 'Specialized edge laying and styling service', 45, 25.00, 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=300'),
  ('Scalp Massage', 'Relaxing therapeutic scalp massage treatment', 30, 30.00, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300'),
  ('Trim Split Ends', 'Precision split end trimming service', 30, 20.00, 'https://images.unsplash.com/photo-1594736797933-d0201ba2fe65?w=300')
) AS t(service_name, service_description, duration_mins, price_amount, service_image_url)
WHERE sc.name = 'Add-ons';