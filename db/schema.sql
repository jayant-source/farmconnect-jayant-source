-- FarmConnect Database Schema
-- This schema should be executed in your Supabase database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(15) NOT NULL UNIQUE,
  name TEXT,
  age INTEGER,
  location TEXT,
  farm_size DECIMAL(10, 2),
  primary_crops JSONB,
  language VARCHAR(5) DEFAULT 'en',
  is_onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disease reports table
CREATE TABLE disease_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  crop_type TEXT,
  disease_name TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('Low', 'Medium', 'High')),
  confidence DECIMAL(5, 2),
  symptoms TEXT,
  treatment TEXT,
  is_mock_result BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mandi prices table
CREATE TABLE mandi_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  market TEXT NOT NULL,
  state TEXT NOT NULL,
  commodity TEXT NOT NULL,
  variety TEXT,
  grade TEXT,
  min_price DECIMAL(10, 2),
  max_price DECIMAL(10, 2),
  modal_price DECIMAL(10, 2),
  price_unit TEXT DEFAULT 'per quintal',
  report_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community posts table
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  images JSONB,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  tags JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketplace items table
CREATE TABLE marketplace_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('seeds', 'fertilizers', 'tools', 'produce', 'equipment')),
  price DECIMAL(10, 2) NOT NULL,
  price_unit TEXT DEFAULT 'per unit',
  quantity DECIMAL(10, 2),
  quantity_unit TEXT,
  images JSONB,
  location TEXT,
  contact_info TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weather cache table
CREATE TABLE weather_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location TEXT NOT NULL,
  weather_data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_disease_reports_user_id ON disease_reports(user_id);
CREATE INDEX idx_disease_reports_created_at ON disease_reports(created_at DESC);
CREATE INDEX idx_mandi_prices_market_date ON mandi_prices(market, report_date DESC);
CREATE INDEX idx_mandi_prices_commodity ON mandi_prices(commodity);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_marketplace_items_category ON marketplace_items(category);
CREATE INDEX idx_marketplace_items_active ON marketplace_items(is_active, created_at DESC);
CREATE INDEX idx_weather_cache_location ON weather_cache(location);
CREATE INDEX idx_weather_cache_expires ON weather_cache(expires_at);

-- RLS (Row Level Security) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- Users can view their own disease reports
CREATE POLICY "Users can view own disease reports" ON disease_reports
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own disease reports
CREATE POLICY "Users can create disease reports" ON disease_reports
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Community posts are readable by everyone
CREATE POLICY "Community posts are publicly readable" ON community_posts
  FOR SELECT TO PUBLIC;

-- Users can create community posts
CREATE POLICY "Users can create community posts" ON community_posts
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own community posts
CREATE POLICY "Users can update own community posts" ON community_posts
  FOR UPDATE USING (user_id = auth.uid());

-- Marketplace items are readable by everyone
CREATE POLICY "Marketplace items are publicly readable" ON marketplace_items
  FOR SELECT TO PUBLIC;

-- Users can create marketplace items
CREATE POLICY "Users can create marketplace items" ON marketplace_items
  FOR INSERT WITH CHECK (seller_id = auth.uid());

-- Users can update their own marketplace items
CREATE POLICY "Users can update own marketplace items" ON marketplace_items
  FOR UPDATE USING (seller_id = auth.uid());

-- Mandi prices and weather cache are publicly readable
CREATE POLICY "Mandi prices are publicly readable" ON mandi_prices
  FOR SELECT TO PUBLIC;

CREATE POLICY "Weather cache is publicly readable" ON weather_cache
  FOR SELECT TO PUBLIC;

-- Storage bucket for disease images
-- Run this in Supabase Dashboard > Storage or via API
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('disease-images', 'disease-images', true);

-- Storage policy for disease images
-- CREATE POLICY "Users can upload disease images" ON storage.objects
-- FOR INSERT TO authenticated
-- WITH CHECK (bucket_id = 'disease-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Disease images are publicly accessible" ON storage.objects
-- FOR SELECT TO public
-- USING (bucket_id = 'disease-images');

-- Sample data for testing (optional)
-- Insert sample mandi prices
INSERT INTO mandi_prices (market, state, commodity, variety, grade, min_price, max_price, modal_price, report_date)
VALUES
  ('Sangli Market', 'Maharashtra', 'Rice', 'Basmati', 'Grade A', 3000, 3400, 3200, NOW()),
  ('Sangli Market', 'Maharashtra', 'Wheat', 'Lokvan', 'Grade A', 2700, 3000, 2850, NOW()),
  ('Sangli Market', 'Maharashtra', 'Cotton', 'Medium Staple', 'FAQ', 6200, 6600, 6400, NOW()),
  ('Mumbai APMC', 'Maharashtra', 'Rice', 'Basmati', 'Grade A', 3100, 3500, 3300, NOW()),
  ('Pune Market', 'Maharashtra', 'Wheat', 'Sharbati', 'Grade A', 2800, 3100, 2950, NOW());

-- Clean up expired weather cache entries (run this periodically)
-- DELETE FROM weather_cache WHERE expires_at < NOW();

-- Function to clean up old weather cache
CREATE OR REPLACE FUNCTION cleanup_weather_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM weather_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE users IS 'Farmer user profiles with authentication and onboarding status';
COMMENT ON TABLE disease_reports IS 'Crop disease detection results from AI analysis';
COMMENT ON TABLE mandi_prices IS 'Market prices for various agricultural commodities';
COMMENT ON TABLE community_posts IS 'Community forum posts where farmers can share experiences';
COMMENT ON TABLE marketplace_items IS 'Items for sale in the farmer marketplace';
COMMENT ON TABLE weather_cache IS 'Cached weather data to reduce API calls';

COMMENT ON COLUMN users.primary_crops IS 'JSON array of crop types the farmer grows';
COMMENT ON COLUMN disease_reports.confidence IS 'AI confidence score (0-100)';
COMMENT ON COLUMN disease_reports.is_mock_result IS 'True if result was generated without AI (demo mode)';
COMMENT ON COLUMN mandi_prices.modal_price IS 'Most common trading price';
COMMENT ON COLUMN community_posts.images IS 'JSON array of image URLs';
COMMENT ON COLUMN community_posts.tags IS 'JSON array of tags for categorization';
COMMENT ON COLUMN marketplace_items.images IS 'JSON array of product image URLs';
