export type MakeServiceSlug =
  | "express"
  | "blindada-online"
  | "blindada-dinheiro";

export type MakePaymentMethod = "pix" | "credit_card" | "cash" | "stub";

export type MakeAppointmentStatus =
  | "pending_payment"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "refunded"
  | "no_show";

export type MakeService = {
  id: string;
  slug: MakeServiceSlug;
  name: string;
  description: string | null;
  price_cents: number;
  duration_min: number;
  payment_methods: MakePaymentMethod[];
  active: boolean;
  sort_order: number;
  created_at: string;
};

export type MakeWeeklySchedule = {
  id: string;
  weekday: number; // 0=domingo … 6=sábado
  start_time: string; // 'HH:MM:SS'
  end_time: string;
  active: boolean;
  created_at: string;
};

export type MakeBlockedDate = {
  id: string;
  date: string; // 'YYYY-MM-DD'
  all_day: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
  created_at: string;
};

export type MakeAppointment = {
  id: string;
  service_id: string;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  starts_at: string;
  ends_at: string;
  status: MakeAppointmentStatus;
  amount_cents: number;
  payment_method: MakePaymentMethod | null;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  mp_status: string | null;
  notes: string | null;
  created_at: string;
  confirmed_at: string | null;
  cancelled_at: string | null;
  completed_at: string | null;
};

export type MakeSettings = {
  buffer_minutes: number;
  min_advance_hours: number;
  max_advance_days: number;
  cancel_refund_hours: number;
  slot_step_minutes: number;
  timezone: string;
};

export type MakeBusySlot = {
  starts_at: string;
  ends_at: string;
};

export type MakeSlot = {
  starts_at: Date;
  ends_at: Date;
};
