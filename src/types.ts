/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Service {
  id: string;
  name: string;
  category: 'skincare' | 'hair' | 'massage' | 'consult' | 'nails' | string;
  price: number;
  duration: number; // in minutes
  description: string;
  icon: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceId: string; // fallback or primary service
  serviceIds?: string[]; // list of all booked services
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (e.g., "10:00")
  duration: number; // in minutes (sum of all selected service durations)
  staffName: string;
  status: 'confirmed' | 'pending' | 'completed';
  notes?: string;
  colorClass?: string;
  clientId?: string; // linked client ID
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  stars: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  services?: string[]; // IDs of services they can perform
  category?: 'skincare' | 'hair' | 'massage' | 'consult' | 'nails' | string;
}


