-- Add payment_type column to invoices table
ALTER TABLE public.invoices 
ADD COLUMN payment_type text DEFAULT 'Milestone Payment';

-- Update existing records to have a default payment type
UPDATE public.invoices 
SET payment_type = 'Milestone Payment' 
WHERE payment_type IS NULL;