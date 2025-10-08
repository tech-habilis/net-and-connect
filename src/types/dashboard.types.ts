export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  tokens: number;
  linkedin?: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  start: string; // ISO format
  end: string; // ISO format
  location: string;
  url: string;
  coverImage?: string;
  timezone?: string;
}
