export type ClassSchedule = {
  id: string;
  className: string;
  instructor: string;
  dayOfWeek: string;
  startTime: string;
  durationMinutes: number;
  capacity: number;
  spotsLeft: number;
  icon: string;
};

export type Booking = {
  id: string;
  classScheduleId: string;
  userId: string;
  bookingDate: string;
};

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};
