
export type ClassSchedule = {
  id: string;
  className: string;
  instructor: string;
  classDate: string; // Changed from dayOfWeek to classDate
  startTime: string;
  durationMinutes: number;
  capacity: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
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
  classDay?: string; // This might be stale now, but leaving for old bookings
  classDate?: string;
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
  title?: string;
  description?: string;
  imageUrl: string;
  itemType: 'competition' | 'venue';
};
