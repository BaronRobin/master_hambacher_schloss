-- 1. Create the Tickets Table
CREATE TABLE public.tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,      -- e.g. "USED", or random QR scans
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create the Blocks Table
CREATE TABLE public.blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES public.tickets(id),  -- Can be null if testing locally
  nickname TEXT DEFAULT 'Anonymous',
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  z INTEGER NOT NULL,
  texture_url TEXT,               -- This holds the WebP base64 string
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Setup Row Level Security (RLS) so anyone using the app can read/write directly
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

-- Allow anyone to select blocks/tickets (Public Read)
CREATE POLICY "Public Read Blocks" ON public.blocks FOR SELECT USING (true);
CREATE POLICY "Public Read Tickets" ON public.tickets FOR SELECT USING (true);

-- Allow anyone to insert blocks (Public Insert)
CREATE POLICY "Public Insert Blocks" ON public.blocks FOR INSERT WITH CHECK (true);

-- Allow anyone to update existing tickets (Marking them as 'used')
CREATE POLICY "Public Update Tickets" ON public.tickets FOR UPDATE USING (true);

-- 4. Insert a completely blank mock ticket you can use for testing our bypassing script!
INSERT INTO public.tickets (code, is_used) VALUES ('TEST', false);
INSERT INTO public.tickets (code, is_used) VALUES ('USED', false);
