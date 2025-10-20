-- Create user_balances table
CREATE TABLE IF NOT EXISTS public.user_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own balance" 
ON public.user_balances 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own balance" 
ON public.user_balances 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for user_balances on profiles insert
CREATE TRIGGER on_profile_created_initialize_balance
  AFTER INSERT ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.initialize_user_balance();