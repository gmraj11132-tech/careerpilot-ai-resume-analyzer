import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address').max(255, 'Email too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const jobApplicationSchema = z.object({
  company: z.string().min(1, 'Company is required').max(200),
  jobTitle: z.string().min(1, 'Job title is required').max(200),
  jobUrl: z.string().url('Invalid URL').max(500).optional().or(z.literal('')),
  location: z.string().max(200).optional().or(z.literal('')),
  appliedDate: z.string().min(1, 'Applied date is required'),
  status: z.enum(['SAVED', 'APPLIED', 'ASSESSMENT', 'INTERVIEW', 'OFFER', 'REJECTED']),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export const jobMatchSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required').max(200),
  companyName: z.string().max(200).optional().or(z.literal('')),
  jobDescription: z.string().min(20, 'Job description must be at least 20 characters').max(10000),
});

export const interviewSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required').max(200),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
});

export const skillStatusSchema = z.object({
  status: z.enum(['IDENTIFIED', 'LEARNING', 'COMPLETED']),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type JobApplicationInput = z.infer<typeof jobApplicationSchema>;
export type JobMatchInput = z.infer<typeof jobMatchSchema>;
export type InterviewInput = z.infer<typeof interviewSchema>;
