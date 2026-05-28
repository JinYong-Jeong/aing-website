import { createClient } from '@supabase/supabase-js';

const env = import.meta.env;
const supabaseUrl = env.REACT_APP_SUPABASE_URL || env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.REACT_APP_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured && !env.MODE?.includes('test')) {
  console.warn('Supabase environment variables are missing. Auth and live data features are disabled.');
}

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      autoRefreshToken: isSupabaseConfigured,
      persistSession: isSupabaseConfigured,
    },
  }
);

export const MEMBER_PUBLIC_SELECT = [
  'id',
  'name',
  'role',
  'track',
  'semester',
  'github',
  'linkedin',
  'avatar_url',
  'bio',
  'is_active',
  'created_at',
  'interests',
  'workload',
  'status',
  'skills',
  'looking_for_team',
  'project_idea',
].join(',');

export const MEMBER_PRIVATE_SELECT = [
  MEMBER_PUBLIC_SELECT,
  'email',
  'contact_email',
  'contact_info',
].join(',');

export type Member = {
  id: string;
  name: string;
  role: string;
  track: 'junior' | 'senior' | 'admin' | 'ob';
  semester: string;
  email?: string;
  github?: string;
  linkedin?: string;
  avatar_url?: string;
  bio?: string;
  is_active: boolean;
  created_at: string;
  interests?: string[];
  workload?: number;
  status?: 'busy' | 'mid' | 'free';
  skills?: string[];
  looking_for_team?: boolean;
  project_idea?: string;
  contact_info?: string;
  contact_email?: string;
};

export type TeamApplication = {
  id: string;
  team_post_id: string;
  applicant_id: string | null;
  applicant_name: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  applicant?: Member;
};

export type TeamPost = {
  id: string;
  author_id: string | null;
  author_name?: string;
  title: string;
  description: string;
  required_skills: string[];
  max_members: number;
  current_members: number;
  status: 'open' | 'closed';
  contact: string | null;
  created_at: string;
  updated_at?: string;
  author?: Member;
  applications?: TeamApplication[];
};

export type Project = {
  id: string;
  title: string;
  description?: string;
  type: 'study' | 'project' | 'research' | 'competition';
  status: 'planned' | 'ongoing' | 'completed' | 'archived';
  semester?: string;
  start_date?: string;
  end_date?: string;
  tags: string[];
  github?: string;
  demo_url?: string;
  thumbnail_url?: string;
  outcome?: string;
  created_at: string;
  updated_at: string;
  project_members?: ProjectMember[];
};

export type ProjectMember = {
  id: string;
  project_id: string;
  member_id: string;
  role: string;
  joined_at: string;
  member?: Member;
};

export type Activity = {
  id: string;
  semester: string;
  title: string;
  type: 'study' | 'project' | 'competition' | 'seminar';
  description: string;
  tags: string[];
  github?: string;
  status: 'ongoing' | 'completed' | 'upcoming';
  created_at?: string;
  // New optional fields
  detail_url?: string;
  start_date?: string;
  end_date?: string;
  participants?: number;
  participants_type?: 'single' | 'min' | 'max' | 'range';
  participants_min?: number;
  participants_max?: number;
  result?: string;
  image_url?: string;
  detail_content?: string;
  slug?: string;
  instagram_url?: string;
};

export type ActivityAward = {
  id: string;
  activity_id: string;
  member_id: string;
  rank: '1st' | '2nd' | '3rd' | 'special' | 'participation' | 'honor_completion' | 'completion';
  note?: string;
  created_at?: string;
  member?: Member;
};

export type HistoryEvent = {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  category: 'award' | 'hackathon' | 'project' | 'event' | 'milestone';
  link_url?: string;
  image_url?: string;
  display_order?: number;
  created_at: string;
};

export type OpsTeamMember = {
  id: string;
  name: string;
  role: string;
  responsibilities: string;
  level: 'president' | 'vp' | 'lead' | 'member';
  order: number;
  generation: number;
  avatar_url?: string;
  created_at?: string;
};

export type ExOpsMember = {
  id: string;
  name: string;
  role: string;
  generation: string;
  term: string;
  description: string;
  created_at?: string;
};
