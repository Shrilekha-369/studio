export type ClassSchedule = {
  id: string;
  className: string;
  instructor: string;
  dayOfWeek: string;
  startTime: string;
  durationMinutes: number;
  capacity: number;
  spotsLeft?: number; // Made optional as it's UI-specific
  icon?: string; // Made optional
};

export type Booking = {
  id: string;
  classScheduleId: string;
  userId: string;
  bookingDate: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  // Denormalized fields for easier display
  className?: string;
  classStartTime?: string;
  classDay?: string;
};

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

export type GalleryItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  itemType: 'competition' | 'venue';
};
