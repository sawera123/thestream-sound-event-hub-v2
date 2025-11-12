-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('user', 'artist', 'admin');

-- Create enum for subscription plans
CREATE TYPE public.subscription_plan_type AS ENUM ('free', 'standard', 'premium');

-- Create enum for ticket status
CREATE TYPE public.ticket_status AS ENUM ('active', 'refunded', 'cancelled');

-- Create enum for event status
CREATE TYPE public.event_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  is_banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create subscription_plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan_type subscription_plan_type NOT NULL UNIQUE,
  price DECIMAL(10,2) NOT NULL,
  upload_limit INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, plan_type, price, upload_limit, description) VALUES
  ('Free Plan', 'free', 0.00, 3, 'Upload up to 3 music tracks'),
  ('Standard Plan', 'standard', 9.99, 10, 'Upload up to 10 music tracks'),
  ('Premium Plan', 'premium', 29.99, 999999, 'Unlimited music uploads');

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id) NOT NULL,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create upload_limits table (tracks IP-based uploads)
CREATE TABLE public.upload_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  upload_count INTEGER DEFAULT 0,
  last_upload_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ip_address)
);

-- Create music table
CREATE TABLE public.music (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  price DECIMAL(10,2) NOT NULL,
  genre TEXT,
  duration INTEGER,
  plays INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create music_purchases table
CREATE TABLE public.music_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  music_id UUID REFERENCES public.music(id) ON DELETE CASCADE NOT NULL,
  price_paid DECIMAL(10,2) NOT NULL,
  is_refunded BOOLEAN DEFAULT FALSE,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  refunded_at TIMESTAMPTZ,
  UNIQUE(buyer_id, music_id)
);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  venue TEXT NOT NULL,
  ticket_price DECIMAL(10,2) NOT NULL,
  total_capacity INTEGER NOT NULL,
  available_tickets INTEGER NOT NULL,
  status event_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tickets table
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  qr_code TEXT NOT NULL UNIQUE,
  price_paid DECIMAL(10,2) NOT NULL,
  status ticket_status DEFAULT 'active',
  is_resale BOOLEAN DEFAULT FALSE,
  resale_price DECIMAL(10,2),
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
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
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Profiles RLS policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- User roles RLS policies
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE USING (public.is_admin(auth.uid()));

-- Subscriptions RLS policies
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Music RLS policies
CREATE POLICY "Anyone can view approved music" ON public.music
  FOR SELECT USING (is_approved = TRUE OR auth.uid() = artist_id OR public.is_admin(auth.uid()));

CREATE POLICY "Artists can insert music" ON public.music
  FOR INSERT WITH CHECK (auth.uid() = artist_id AND public.has_role(auth.uid(), 'artist'));

CREATE POLICY "Artists can update own music" ON public.music
  FOR UPDATE USING (auth.uid() = artist_id);

CREATE POLICY "Admins can update any music" ON public.music
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete music" ON public.music
  FOR DELETE USING (public.is_admin(auth.uid()));

-- Music purchases RLS policies
CREATE POLICY "Users can view own purchases" ON public.music_purchases
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Admins can view all purchases" ON public.music_purchases
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can insert purchases" ON public.music_purchases
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Events RLS policies
CREATE POLICY "Anyone can view approved events" ON public.events
  FOR SELECT USING (status = 'approved' OR auth.uid() = creator_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can create events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Event creators can update own events" ON public.events
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Admins can update any event" ON public.events
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete events" ON public.events
  FOR DELETE USING (public.is_admin(auth.uid()));

-- Tickets RLS policies
CREATE POLICY "Users can view own tickets" ON public.tickets
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Admins can view all tickets" ON public.tickets
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can insert tickets" ON public.tickets
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Admins can update tickets" ON public.tickets
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- Upload limits policies (no RLS needed, managed by backend)
CREATE POLICY "Anyone can read upload limits" ON public.upload_limits
  FOR SELECT USING (TRUE);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_music_updated_at
  BEFORE UPDATE ON public.music
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();