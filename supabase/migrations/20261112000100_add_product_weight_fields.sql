-- Add weight metadata to products.
-- Existing products retain NULL because their historical weight
-- measurement method may be unknown.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS weight_kg numeric(12, 3),
  ADD COLUMN IF NOT EXISTS weight_source text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_weight_kg_positive'
      AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_weight_kg_positive
      CHECK (weight_kg IS NULL OR weight_kg > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_weight_source_valid'
      AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_weight_source_valid
      CHECK (
        weight_source IS NULL
        OR weight_source IN ('weighed', 'estimated', 'standard')
      );
  END IF;
END
$$;
