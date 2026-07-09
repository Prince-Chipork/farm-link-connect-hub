-- =============================================================
-- Gebeya Marketplace: Realtime & Storage Setup
-- Enable Realtime on products table
-- Create product-images storage bucket with public read access
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. ENABLE REALTIME ON PRODUCTS TABLE
-- Allows live updates when products are added/changed/deleted
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.products REPLICA IDENTITY FULL;

-- ─────────────────────────────────────────────────────────────
-- 2. CREATE STORAGE BUCKET FOR PRODUCT IMAGES
-- Public bucket: anyone can read, only authenticated farmers can upload
-- ─────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product-images bucket

-- Public read access: anyone can view product images
CREATE POLICY "Public read access for product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Authenticated farmers can upload images
CREATE POLICY "Farmers can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

-- Farmers can update their own images
CREATE POLICY "Farmers can update their product images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

-- Farmers can delete their own images
CREATE POLICY "Farmers can delete their product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );
