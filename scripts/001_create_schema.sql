-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  name text,
  email text unique,
  photo_url text,
  role text check (role in ('user', 'admin')) default 'user',
  approved boolean default false,
  created_at timestamptz default now()
);

-- Teachers table
create table if not exists teachers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  bio text,
  avatar_url text
);

-- Buzzwords table
create table if not exists buzzwords (
  id uuid primary key default uuid_generate_v4(),
  teacher_id uuid references teachers(id) on delete cascade,
  label text not null
);

-- Sessions table
create table if not exists sessions (
  id uuid primary key default uuid_generate_v4(),
  teacher_id uuid references teachers(id),
  title text not null,
  scheduled_at timestamptz,
  created_by uuid references users(id),
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Submissions table
create table if not exists submissions (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references sessions(id) on delete cascade,
  created_by uuid references users(id),
  counts jsonb not null,
  timeline jsonb not null,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  created_at timestamptz default now(),
  approved_at timestamptz,
  approved_by uuid references users(id)
);

-- Session aggregates table
create table if not exists session_aggregates (
  session_id uuid primary key references sessions(id) on delete cascade,
  counts_avg jsonb,
  counts_sum jsonb,
  counts_stddev jsonb,
  sample_size int,
  time_series jsonb,
  last_updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table users enable row level security;
alter table teachers enable row level security;
alter table buzzwords enable row level security;
alter table sessions enable row level security;
alter table submissions enable row level security;
alter table session_aggregates enable row level security;

-- RLS Policies for users table
create policy "Users can view their own profile" on users
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on users
  for update using (auth.uid() = id);

create policy "Admins can view all users" on users
  for select using (
    exists (
      select 1 from users 
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update all users" on users
  for update using (
    exists (
      select 1 from users 
      where id = auth.uid() and role = 'admin'
    )
  );

-- RLS Policies for teachers table (public read)
create policy "Anyone can view teachers" on teachers
  for select using (true);

create policy "Admins can manage teachers" on teachers
  for all using (
    exists (
      select 1 from users 
      where id = auth.uid() and role = 'admin'
    )
  );

-- RLS Policies for buzzwords table (public read)
create policy "Anyone can view buzzwords" on buzzwords
  for select using (true);

create policy "Admins can manage buzzwords" on buzzwords
  for all using (
    exists (
      select 1 from users 
      where id = auth.uid() and role = 'admin'
    )
  );

-- RLS Policies for sessions table
create policy "Anyone can view approved sessions" on sessions
  for select using (status = 'approved');

create policy "Approved users can create sessions" on sessions
  for insert with check (
    exists (
      select 1 from users 
      where id = auth.uid() and approved = true
    )
  );

create policy "Users can view their own sessions" on sessions
  for select using (created_by = auth.uid());

create policy "Admins can manage all sessions" on sessions
  for all using (
    exists (
      select 1 from users 
      where id = auth.uid() and role = 'admin'
    )
  );

-- RLS Policies for submissions table
create policy "Anyone can view approved submissions" on submissions
  for select using (status = 'approved');

create policy "Approved users can create submissions" on submissions
  for insert with check (
    exists (
      select 1 from users 
      where id = auth.uid() and approved = true
    )
  );

create policy "Users can view their own submissions" on submissions
  for select using (created_by = auth.uid());

create policy "Admins can manage all submissions" on submissions
  for all using (
    exists (
      select 1 from users 
      where id = auth.uid() and role = 'admin'
    )
  );

-- RLS Policies for session_aggregates table (public read)
create policy "Anyone can view session aggregates" on session_aggregates
  for select using (true);

create policy "Admins can manage session aggregates" on session_aggregates
  for all using (
    exists (
      select 1 from users 
      where id = auth.uid() and role = 'admin'
    )
  );
