export interface Resource {
  id: string;
  type: 'roadshow' | 'workspace' | 'activity';
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  organizer: string;
  isBooked: boolean;
  capacity?: number;
  bookedCount?: number;
}

export interface CalendarEvent {
  id: string;
  date: string;
  resources: Resource[];
}
