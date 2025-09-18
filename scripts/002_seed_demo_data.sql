-- Insert demo teachers
insert into teachers (id, name, bio, avatar_url) values
  ('550e8400-e29b-41d4-a716-446655440001', 'Dr. Sarah Johnson', 'Professor of Computer Science specializing in AI and Machine Learning', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Prof. Michael Chen', 'Business Strategy expert with focus on digital transformation', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Dr. Emily Rodriguez', 'Marketing researcher and consumer behavior analyst', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face');

-- Insert demo buzzwords for Dr. Sarah Johnson (AI/ML)
insert into buzzwords (teacher_id, label) values
  ('550e8400-e29b-41d4-a716-446655440001', 'Machine Learning'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Neural Network'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Deep Learning'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Algorithm'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Data Science'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Artificial Intelligence'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Big Data'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Optimization');

-- Insert demo buzzwords for Prof. Michael Chen (Business)
insert into buzzwords (teacher_id, label) values
  ('550e8400-e29b-41d4-a716-446655440002', 'Synergy'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Paradigm Shift'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Disruptive'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Innovation'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Digital Transformation'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Scalable'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Agile'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Leverage');

-- Insert demo buzzwords for Dr. Emily Rodriguez (Marketing)
insert into buzzwords (teacher_id, label) values
  ('550e8400-e29b-41d4-a716-446655440003', 'Customer Journey'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Brand Awareness'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Engagement'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Conversion'),
  ('550e8400-e29b-41d4-a716-446655440003', 'ROI'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Omnichannel'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Personalization'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Analytics');

-- Insert demo approved sessions
insert into sessions (id, teacher_id, title, scheduled_at, status, created_at) values
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Introduction to Machine Learning', '2024-01-15 14:00:00+00', 'approved', now() - interval '7 days'),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Digital Transformation Strategies', '2024-01-20 10:00:00+00', 'approved', now() - interval '5 days'),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Modern Marketing Analytics', '2024-01-25 16:00:00+00', 'approved', now() - interval '3 days');
