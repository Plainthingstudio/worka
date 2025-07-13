-- Add RLS policies to allow administrators and owners to view all data

-- Clients table - Add policy for administrators and owners to view all clients
CREATE POLICY "Administrators and owners can view all clients" 
ON public.clients 
FOR SELECT 
USING (
  has_role(auth.uid(), 'owner'::app_role) OR 
  has_role(auth.uid(), 'administrator'::app_role)
);

-- Leads table - Add policy for administrators and owners to view all leads
CREATE POLICY "Administrators and owners can view all leads" 
ON public.leads 
FOR SELECT 
USING (
  has_role(auth.uid(), 'owner'::app_role) OR 
  has_role(auth.uid(), 'administrator'::app_role)
);

-- Invoices table - Add policy for administrators and owners to view all invoices
CREATE POLICY "Administrators and owners can view all invoices" 
ON public.invoices 
FOR SELECT 
USING (
  has_role(auth.uid(), 'owner'::app_role) OR 
  has_role(auth.uid(), 'administrator'::app_role)
);

-- Invoice items table - Add policy for administrators and owners to view all invoice items
CREATE POLICY "Administrators and owners can view all invoice items" 
ON public.invoice_items 
FOR SELECT 
USING (
  has_role(auth.uid(), 'owner'::app_role) OR 
  has_role(auth.uid(), 'administrator'::app_role)
);

-- Payments table - Add policy for administrators and owners to view all payments
CREATE POLICY "Administrators and owners can view all payments" 
ON public.payments 
FOR SELECT 
USING (
  has_role(auth.uid(), 'owner'::app_role) OR 
  has_role(auth.uid(), 'administrator'::app_role)
);