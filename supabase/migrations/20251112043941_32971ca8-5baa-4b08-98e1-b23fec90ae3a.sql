-- Enable RLS on subscription_plans table
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view subscription plans
CREATE POLICY "Everyone can view subscription plans"
ON public.subscription_plans FOR SELECT
USING (true);