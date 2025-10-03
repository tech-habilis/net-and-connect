export interface Member {
  id: string;
  name: string;
  email: string;
  linkedin?: string;
  phone?: string;
}

export interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  attendees?: number;
}
