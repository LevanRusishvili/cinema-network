export type Venue = { id: number; slug: string; name: string; city: string; formats?: Format[] };
export type Format = { id: number; slug: string; name: string; priceUplift: number };
export type Language = { id: number; slug: string; name: string; code: string };
export type Genre = { id: number; slug: string; name: string };
export type AgeRating = { code: string; minAge: number; description: string };
export type TicketType = {
  id: number;
  slug: string;
  name: string;
  priceRatio: number;
  note: string | null;
  blockedFromRatingAge: number | null;
};

export type User = {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  fullName: string | null;
  mobileNumber: string | null;
  dateOfBirth: string | null;
  age: number | null;
  preferredVenue: Venue | null;
  profileComplete: boolean;
};
export type AuthResponse = { user: User; token: string };

export type Movie = {
  id: number;
  slug: string;
  title: string;
  kind: string;
  runtimeMinutes: number;
  posterUrl: string;
  backdropUrl: string;
  releaseDate: string;
  isComingSoon: boolean;
  isNotified: boolean;
  isFeatured: boolean;
  fromPrice: number;
  ageRating: AgeRating;
  genres: Genre[];
  formats: Format[];
  synopsis?: string;
};
export type MovieDetail = Movie & {
  director: string;
  cast: string;
  availableDates: string[];
};

export type Session = {
  id: number;
  startsAt: string;
  date: string;
  time: string;
  timeBand: "morning" | "afternoon" | "evening";
  price: number;
  seatsLeft: number;
  isSoldOut: boolean;
  hall: { id: number; name: string; venue?: Venue };
  venue: Venue;
  format: Format;
  language: Language;
  movie: Movie;
};
export type SessionGroup = { movie: Movie; sessions: Session[] };
export type VenueSessions = { venue: Venue; sessions: Omit<Session, "movie">[] };
export type SessionsMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  totalSessions: number;
  totalMovies: number;
  date: string;
};

export type FilterOptions = {
  venues: Venue[];
  formats: Format[];
  languages: Language[];
  timeBands: { id: string; label: string }[];
  sorts: { id: string; label: string }[];
  ticketTypes: TicketType[];
  ageRatings: AgeRating[];
  maxSeatsPerOrder: number;
  holdMinutes: number;
};

export type SeatState = "available" | "sold" | "held" | "unavailable";
export type Seat = {
  id: number;
  code: string;
  label: string;
  state: SeatState;
  aisleAfter: boolean;
  isMine: boolean;
};
export type SeatMap = {
  sessionId: number;
  hall: { id: number; name: string };
  sections: { name: string; rows: { label: string; seats: Seat[] }[] }[];
};

export type SeatHold = {
  holdId: string;
  sessionId: number;
  expiresAt: string;
  secondsRemaining: number;
  isLive: boolean;
  subtotal: number;
  seats: {
    seatId: number;
    code: string;
    ticketType: { slug: string; name: string };
    price: number;
  }[];
};

export type Order = {
  id: number;
  reference: string;
  status: string;
  totalPrice: number;
  paidAt: string;
  refundedAt: string | null;
  isUpcoming: boolean;
  isRefundable: boolean;
  cardLastFour: string;
  contact: { fullName: string; email: string; mobileNumber: string };
  session: Session;
  tickets: {
    id: number;
    seatCode: string;
    ticketType: { slug: string; name: string };
    price: number;
  }[];
};
