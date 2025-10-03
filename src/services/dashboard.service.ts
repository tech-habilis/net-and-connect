import { Member, Event } from "@/types/dashboard.types";

export interface IDashboardService {
  getMembers(): Promise<Member[]>;
  getUpcomingEvents(): Promise<Event[]>;
}

export class DashboardService implements IDashboardService {
  async getMembers(): Promise<Member[]> {
    // In a real app, this would fetch from an API or database
    return [
      {
        id: "1",
        name: "Dupont Alice",
        email: "dupontalice@example.com",
        linkedin: "https://www.linkedin.com/...",
        phone: "+33 1234 5678",
      },
      {
        id: "2",
        name: "Martin Bruno",
        email: "martinbruno@example.com",
        linkedin: "https://www.linkedin.com/...",
        phone: "+33 1234 5678",
      },
      {
        id: "3",
        name: "Taibi Jalil",
        email: "taibijalil@example.com",
        linkedin: "https://www.linkedin.com/...",
        phone: "+33 1234 5678",
      },
      {
        id: "4",
        name: "Floyd Miles",
        email: "floydmiles@example.com",
        linkedin: "https://www.linkedin.com/...",
        phone: "+33 1234 5678",
      },
      {
        id: "5",
        name: "Brooklyn Simmons",
        email: "brooklyn10@example.com",
        linkedin: "https://www.linkedin.com/...",
        phone: "+33 1234 5678",
      },
      {
        id: "6",
        name: "Cameron Williamson",
        email: "william23@example.com",
        linkedin: "https://www.linkedin.com/...",
        phone: "+33 1234 5678",
      },
      {
        id: "7",
        name: "Dianne Russell",
        email: "diannerus_@example.com",
        linkedin: "https://www.linkedin.com/...",
        phone: "+33 1234 5678",
      },
      {
        id: "8",
        name: "Brooklyn Simmons",
        email: "brooklyn10@example.com",
        linkedin: "https://www.linkedin.com/...",
        phone: "+33 1234 5678",
      },
      {
        id: "9",
        name: "Marvin McKinney",
        email: "marvinmc@example.com",
        linkedin: "https://www.linkedin.com/...",
        phone: "+33 1234 5678",
      },
    ];
  }

  async getUpcomingEvents(): Promise<Event[]> {
    const today = new Date();
    return [
      {
        id: "1",
        title: "Afterwork business",
        date: new Date(today.getFullYear(), today.getMonth(), 9),
        time: "10:00 - 12:00 PM",
        location: "Boulogne, Paris",
      },
      {
        id: "2",
        title: "Afterwork business",
        date: new Date(today.getFullYear(), today.getMonth(), 16),
        time: "10:00 - 12:00 PM",
        location: "Boulogne, Paris",
      },
      {
        id: "3",
        title: "Afterwork business",
        date: new Date(today.getFullYear(), today.getMonth(), 21),
        time: "10:00 - 12:00 PM",
        location: "Boulogne, Paris",
      },
      {
        id: "4",
        title: "Afterwork business",
        date: new Date(today.getFullYear(), today.getMonth(), 23),
        time: "10:00 - 12:00 PM",
        location: "Boulogne, Paris",
      },
      {
        id: "5",
        title: "Afterwork business",
        date: new Date(today.getFullYear(), today.getMonth(), 26),
        time: "10:00 - 12:00 PM",
        location: "Boulogne, Paris",
      },
      {
        id: "6",
        title: "Afterwork business",
        date: new Date(today.getFullYear(), today.getMonth(), 30),
        time: "10:00 - 12:00 PM",
        location: "Boulogne, Paris",
      },
      {
        id: "7",
        title: "Afterwork business",
        date: new Date(today.getFullYear(), today.getMonth(), 31),
        time: "10:00 - 12:00 PM",
        location: "Boulogne, Paris",
      },
    ];
  }
}
