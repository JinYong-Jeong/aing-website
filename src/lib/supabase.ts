import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Member = {
  id: string;
  name: string;
  role: string;
  track: 'junior' | 'senior' | 'admin';
  semester: string;
  github?: string;
  avatar_url?: string;
  bio?: string;
  is_active: boolean;
  created_at: string;
  password_hash?: string;
  interests?: string[];
  workload?: number;
  status?: 'active' | 'busy' | 'open';
  skills?: string[];
  looking_for_team?: boolean;
  project_idea?: string;
  contact_kakao?: string;
  contact_email?: string;
};

export type TeamPost = {
  id: string;
  author_id: string | null;
  title: string;
  description: string;
  required_skills: string[];
  max_members: number;
  current_members: number;
  status: 'open' | 'closed';
  contact: string | null;
  created_at: string;
  author?: Member;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  author_id: string | null;
  category: 'notice' | 'activity' | 'study' | 'project';
  tags: string[];
  is_pinned: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  author?: Member;
  comments?: Comment[];
};

export type Comment = {
  id: string;
  post_id: string;
  author_name: string;
  author_email?: string;
  content: string;
  is_approved: boolean;
  parent_id?: string;
  created_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
};
