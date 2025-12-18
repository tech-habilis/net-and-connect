export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  organizationRole: string;
  tokens: number;
  linkedin?: string;
  image?: string;
}

export interface Expert {
  id: string;
  name: string;
  phone: string;
  email: string;
  description: string;
  image: string;
  title: string;
  website?: string;
}

export interface Partner {
  id: string;
  title: string;
  image: string;
}

export interface Event {
  id: string;
  api_id?: string; // Luma API ID for joining events
  title: string;
  description?: string;
  start: string; // ISO format
  end: string; // ISO format
  location: string;
  url: string;
  coverImage?: string;
  timezone?: string;
}

export interface Community {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  company?: string;
  image?: string;
}
