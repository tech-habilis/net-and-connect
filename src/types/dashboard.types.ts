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
  start: string; // ISO format
  location: string;
  url: string;
}
