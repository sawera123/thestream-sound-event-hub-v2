-- Create storage buckets for music and video files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('music-files', 'music-files', true, 52428800, ARRAY['audio/mpeg', 'audio/mp3']),
  ('video-files', 'video-files', true, 524288000, ARRAY['video/mp4', 'video/mpeg']),
  ('thumbnails', 'thumbnails', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- Storage policies for music files
CREATE POLICY "Anyone can view music files"
ON storage.objects FOR SELECT
USING (bucket_id = 'music-files');

CREATE POLICY "Artists can upload music files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'music-files' AND
  auth.uid() IS NOT NULL AND
  has_role(auth.uid(), 'artist')
);

CREATE POLICY "Artists can update own music files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'music-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can delete music files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'music-files' AND
  is_admin(auth.uid())
);

-- Storage policies for video files
CREATE POLICY "Anyone can view video files"
ON storage.objects FOR SELECT
USING (bucket_id = 'video-files');

CREATE POLICY "Artists can upload video files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'video-files' AND
  auth.uid() IS NOT NULL AND
  has_role(auth.uid(), 'artist')
);

CREATE POLICY "Artists can update own video files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'video-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can delete video files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'video-files' AND
  is_admin(auth.uid())
);

-- Storage policies for thumbnails
CREATE POLICY "Anyone can view thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

CREATE POLICY "Authenticated users can upload thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'thumbnails' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update own thumbnails"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'thumbnails' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add video-specific columns to music table for video streaming
ALTER TABLE public.music ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.music ADD COLUMN IF NOT EXISTS is_video boolean DEFAULT false;

-- Create video interactions table for likes and comments
CREATE TABLE IF NOT EXISTS public.video_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES public.music(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  interaction_type text NOT NULL CHECK (interaction_type IN ('like', 'comment')),
  comment_text text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.video_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view interactions"
ON public.video_interactions FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create interactions"
ON public.video_interactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own interactions"
ON public.video_interactions FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_video_interactions_video_id ON public.video_interactions(video_id);
CREATE INDEX IF NOT EXISTS idx_video_interactions_user_id ON public.video_interactions(user_id);