/**
 * ORI APP — Zod Validation Schemas
 */

import { z } from 'zod';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name is too long')
      .regex(/^[a-zA-Z\s'-]+$/, 'Full name contains invalid characters'),
    email: z
      .string()
      .email('Please enter a valid email address')
      .toLowerCase()
      .trim(),
    phone: z
      .string()
      .min(10, 'Phone number must be at least 10 digits')
      .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format')
      .transform((v) => v.replace(/\D/g, '')), // strip non-digits
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    patientId: z.string().optional(),
    patientState: z.string().optional(),
    is21Plus: z
      .boolean()
      .refine((v) => v === true, { message: 'You must be 21 or older to use this app' }),
    agreeToTerms: z
      .boolean()
      .refine((v) => v === true, { message: 'You must agree to the terms of service' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z.string().min(1, 'Password is required'),
});

export type SignInFormData = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ─── Reservation ──────────────────────────────────────────────────────────────
export const reservationSchema = z.object({
  pickupDate: z
    .date()
    .refine((d) => d >= new Date(), { message: 'Pickup date must be in the future' })
    .refine(
      (d) => {
        const maxDate = new Date();
        maxDate.setHours(maxDate.getHours() + 24);
        return d <= maxDate;
      },
      { message: 'Pickup must be within the next 24 hours' }
    ),
  pickupTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Invalid time format')
    .refine(
      (t) => {
        const [h] = t.split(':').map(Number);
        return h >= 10 && h < 20; // 10am - 8pm store hours
      },
      { message: 'Pickup must be between 10:00 AM and 8:00 PM' }
    ),
  notes: z.string().max(500, 'Notes too long').optional(),
});

export type ReservationFormData = z.infer<typeof reservationSchema>;

// ─── Checkout ─────────────────────────────────────────────────────────────────
export const shippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  line1: z.string().min(5, 'Street address required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City required'),
  state: z.string().length(2, 'Select a state'),
  zip: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  country: z.string().default('US'),
});

export type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

export function isValidEmail(email: string): boolean {
  return z.string().email().safeParse(email).success;
}
