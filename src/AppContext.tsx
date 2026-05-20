import React, { createContext, useContext, useState, useEffect } from 'react';
import { Service, Appointment, Testimonial, Client, Staff } from './types';

interface AppContextType {
  services: Service[];
  clients: Client[];
  appointments: Appointment[];
  testimonials: Testimonial[];
  userRole: 'customer' | 'admin' | 'staff';
  adminTab: 'dashboard' | 'schedule';
  staffFilters: string[];
  serviceFilters: string[];
  selectedDate: string; // Active date for calendar (YYYY-MM-DD), default "2024-10-16"
  staff: Staff[];
  loggedInStaff: Staff | null;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => boolean;
  updateAppointmentStatus: (id: string, status: 'confirmed' | 'pending' | 'completed') => void;
  deleteAppointment: (id: string) => void;
  addClient: (client: Omit<Client, 'id'>) => Client;
  addService: (service: Omit<Service, 'id'>) => void;
  addStaff: (member: Omit<Staff, 'id'>) => void;
  updateStaff: (member: Staff) => void;
  deleteStaff: (id: string) => void;
  loginAsStaff: (email: string) => boolean;
  logoutStaff: () => void;
  setUserRole: (role: 'customer' | 'admin' | 'staff') => void;
  setAdminTab: (tab: 'dashboard' | 'schedule') => void;
  toggleStaffFilter: (staffName: string) => void;
  toggleServiceFilter: (serviceCategory: string) => void;
  setSelectedDate: (date: string) => void;
  checkSlotOverlap: (staffName: string, date: string, time: string, duration: number, ignoreAptId?: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_SERVICES: Service[] = [
  {
    id: 'manicure-signature',
    name: 'Manicure Signature',
    category: 'nails',
    price: 45,
    duration: 60,
    description: 'Tratamento completo com hidratação profunda e esmaltação perfeita.',
    icon: 'pan_tool'
  },
  {
    id: 'facial-glow',
    name: 'Facial Glow',
    category: 'skincare',
    price: 85,
    duration: 90,
    description: 'Limpeza profunda e revitalização cutânea para uma pele radiante.',
    icon: 'face'
  },
  {
    id: 'relaxamento-profundo',
    name: 'Relaxamento Profundo',
    category: 'massage',
    price: 110,
    duration: 75,
    description: 'Massagem terapêutica com óleos essenciais quentes.',
    icon: 'spa'
  },
  {
    id: 'precision-cut',
    name: 'Precision Cut & Style',
    category: 'hair',
    price: 85,
    duration: 45,
    description: 'Corte de cabelo sob medida seguido de uma finalização profissional.',
    icon: 'content_cut'
  },
  {
    id: 'bridal-consult',
    name: 'Bridal Consult',
    category: 'consult',
    price: 60,
    duration: 60,
    description: 'Consultoria exclusiva para planejar o visual dos seus sonhos.',
    icon: 'chat'
  }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    clientName: 'Emma W.',
    clientEmail: 'emma@example.com',
    clientPhone: '912 345 678',
    serviceId: 'facial-glow',
    date: '2024-10-14',
    time: '10:00',
    duration: 90,
    staffName: 'Sarah',
    status: 'confirmed',
    notes: 'Signature Facial',
    clientId: 'cli-1'
  },
  {
    id: 'apt-2',
    clientName: 'Chloe T.',
    clientEmail: 'chloe@example.com',
    clientPhone: '912 987 654',
    serviceId: 'precision-cut',
    date: '2024-10-14',
    time: '14:00',
    duration: 60,
    staffName: 'Maya',
    status: 'confirmed',
    notes: 'Balayage Touchup',
    clientId: 'cli-2'
  },
  {
    id: 'apt-3',
    clientName: 'Mr. Davis',
    clientEmail: 'davis@example.com',
    clientPhone: '911 222 333',
    serviceId: 'relaxamento-profundo',
    date: '2024-10-15',
    time: '09:30',
    duration: 90,
    staffName: 'Alex',
    status: 'confirmed',
    notes: 'Deep Tissue',
    clientId: 'cli-5'
  },
  {
    id: 'apt-4',
    clientName: 'Sophie M.',
    clientEmail: 'sophie@example.com',
    clientPhone: '922 444 555',
    serviceId: 'bridal-consult',
    date: '2024-10-16',
    time: '11:00',
    duration: 60,
    staffName: 'Elena',
    status: 'confirmed',
    notes: 'Bridal Consult',
    clientId: 'cli-3'
  },
  {
    id: 'apt-5',
    clientName: 'Olivia R.',
    clientEmail: 'olivia@example.com',
    clientPhone: '933 555 666',
    serviceId: 'precision-cut',
    date: '2024-10-16',
    time: '13:00',
    duration: 150,
    staffName: 'Maya',
    status: 'confirmed',
    notes: 'Full Color & Cut. Allergy: Ammonia',
    clientId: 'cli-4'
  },
  {
    id: 'apt-6',
    clientName: 'Sarah Jenkins',
    clientEmail: 'sarah.j@example.com',
    clientPhone: '911 234 567',
    serviceId: 'facial-glow',
    date: '2024-10-16',
    time: '10:00',
    duration: 90,
    staffName: 'Sarah',
    status: 'confirmed',
    notes: 'Signature Facial',
    clientId: 'cli-6'
  },
  {
    id: 'apt-7',
    clientName: 'Maria Garcia',
    clientEmail: 'maria.g@example.com',
    clientPhone: '922 345 678',
    serviceId: 'manicure-signature',
    date: '2024-10-16',
    time: '11:30',
    duration: 60,
    staffName: 'Sarah',
    status: 'pending',
    notes: 'Brow Lamination',
    clientId: 'cli-7'
  },
  {
    id: 'apt-8',
    clientName: 'Emily Chen',
    clientEmail: 'emily.c@example.com',
    clientPhone: '933 456 789',
    serviceId: 'facial-glow',
    date: '2024-10-16',
    time: '14:00',
    duration: 60,
    staffName: 'Sarah',
    status: 'confirmed',
    notes: 'Lash Extensions',
    clientId: 'cli-8'
  },
  {
    id: 'apt-9',
    clientName: 'Amanda Cole',
    clientEmail: 'amanda.c@example.com',
    clientPhone: '944 567 890',
    serviceId: 'bridal-consult',
    date: '2024-10-16',
    time: '16:15',
    duration: 60,
    staffName: 'Elena',
    status: 'confirmed',
    notes: 'Consultation',
    clientId: 'cli-9'
  }
];

const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Maria S.',
    text: '"Um atendimento impecável. O espaço transmite uma paz incrível e o serviço de unhas é simplesmente o melhor que já experimentei."',
    stars: 5
  },
  {
    id: 'test-2',
    name: 'Joana F.',
    text: '"Fiz a limpeza de pele \'Facial Glow\' e os resultados foram imediatos. Recomendo vivamente, o cuidado e o luxo estão em cada detalhe."',
    stars: 5
  },
  {
    id: 'test-3',
    name: 'Ana R.',
    text: '"A massagem relaxante foi uma experiência transformadora. O ambiente sonoro, o aroma, tudo perfeito para desligar do stress."',
    stars: 5
  }
];

const INITIAL_CLIENTS: Client[] = [
  { id: 'cli-1', name: 'Emma W.', email: 'emma@example.com', phone: '912 345 678' },
  { id: 'cli-2', name: 'Chloe T.', email: 'chloe@example.com', phone: '912 987 654' },
  { id: 'cli-3', name: 'Sophie M.', email: 'sophie@example.com', phone: '922 444 555' },
  { id: 'cli-4', name: 'Olivia R.', email: 'olivia@example.com', phone: '933 555 666' },
  { id: 'cli-5', name: 'Mr. Davis', email: 'davis@example.com', phone: '911 222 333' },
  { id: 'cli-6', name: 'Sarah Jenkins', email: 'sarah.j@example.com', phone: '911 234 567' },
  { id: 'cli-7', name: 'Maria Garcia', email: 'maria.g@example.com', phone: '922 345 678' },
  { id: 'cli-8', name: 'Emily Chen', email: 'emily.c@example.com', phone: '933 456 789' },
  { id: 'cli-9', name: 'Amanda Cole', email: 'amanda.c@example.com', phone: '944 567 890' }
];

const INITIAL_STAFF: Staff[] = [
  { id: 'stf-1', name: 'Maya', role: 'Hair Stylist', email: 'maya@elara.pt', phone: '912 345 611', category: 'hair' },
  { id: 'stf-2', name: 'Sarah', role: 'Skin Specialist', email: 'sarah@elara.pt', phone: '912 345 622', category: 'skincare' },
  { id: 'stf-3', name: 'Alex', role: 'Massage Therapist', email: 'alex@elara.pt', phone: '912 345 633', category: 'massage' },
  { id: 'stf-4', name: 'Elena', role: 'Coordenadora Estética', email: 'elena@elara.pt', phone: '912 345 644', category: 'consult' }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('elara_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('elara_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('elara_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem('elara_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [userRole, setUserRole] = useState<'customer' | 'admin' | 'staff'>('customer');
  const [adminTab, setAdminTab] = useState<'dashboard' | 'schedule'>('dashboard');
  
  const [staffFilters, setStaffFilters] = useState<string[]>(['All', 'Maya', 'Sarah', 'Alex', 'Elena']);
  const [serviceFilters, setServiceFilters] = useState<string[]>(['All', 'skincare', 'hair', 'massage', 'consult', 'nails']);
  const [selectedDate, setSelectedDate] = useState<string>('2024-10-16');

  const [loggedInStaff, setLoggedInStaff] = useState<Staff | null>(() => {
    const saved = localStorage.getItem('elara_logged_in_staff');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('elara_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('elara_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('elara_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('elara_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    if (loggedInStaff) {
      localStorage.setItem('elara_logged_in_staff', JSON.stringify(loggedInStaff));
    } else {
      localStorage.removeItem('elara_logged_in_staff');
    }
  }, [loggedInStaff]);

  // Convert "HH:MM" (or "9 AM", etc) to absolute minutes for overlap math
  const timeToMinutes = (timeStr: string): number => {
    let cleanStr = timeStr.trim();
    const ampm = cleanStr.match(/(AM|PM)/i);
    let [hourStr, minStr] = cleanStr.replace(/(AM|PM)/i, '').trim().split(':');
    let hour = parseInt(hourStr) || 0;
    let min = parseInt(minStr) || 0;

    if (ampm) {
      const isPm = ampm[0].toUpperCase() === 'PM';
      if (isPm && hour < 12) hour += 12;
      if (!isPm && hour === 12) hour = 0;
    }
    return hour * 60 + min;
  };

  const checkSlotOverlap = (staffName: string, date: string, time: string, duration: number, ignoreAptId?: string): boolean => {
    const proposedStart = timeToMinutes(time);
    const proposedEnd = proposedStart + duration;

    return appointments.some(apt => {
      if (apt.id === ignoreAptId) return false;
      if (apt.date !== date) return false;
      if (apt.staffName.toLowerCase() !== staffName.toLowerCase()) return false;
      if (apt.status === 'completed') return false;

      const aptStart = timeToMinutes(apt.time);
      const aptEnd = aptStart + apt.duration;

      // True if there is a overlap
      return proposedStart < aptEnd && proposedEnd > aptStart;
    });
  };

  const addAppointment = (aptData: Omit<Appointment, 'id'>): boolean => {
    // 1. Double check conflict detection
    if (checkSlotOverlap(aptData.staffName, aptData.date, aptData.time, aptData.duration)) {
      console.warn("Agendamento em conflito detetado!");
      return false;
    }

    // 2. Duplicate client check: check by email or phone
    const cleanPhone = aptData.clientPhone.replace(/\s+/g, '');
    let existingClient = clients.find(c =>
      c.email.toLowerCase() === aptData.clientEmail.toLowerCase() ||
      c.phone.replace(/\s+/g, '') === cleanPhone
    );

    let linkedClientId = '';
    if (existingClient) {
      linkedClientId = existingClient.id;
      // Synchronize additional notes if user filled new notes but has none before
      if (!existingClient.notes && aptData.notes) {
        setClients(prev => prev.map(c => c.id === existingClient!.id ? { ...c, notes: aptData.notes } : c));
      }
    } else {
      const newClient = addClient({
        name: aptData.clientName,
        email: aptData.clientEmail,
        phone: aptData.clientPhone,
        notes: aptData.notes
      });
      linkedClientId = newClient.id;
    }

    // 3. Create appointment linked to client
    const newApt: Appointment = {
      ...aptData,
      clientId: linkedClientId,
      clientName: existingClient ? existingClient.name : aptData.clientName,
      clientEmail: existingClient ? existingClient.email : aptData.clientEmail,
      clientPhone: existingClient ? existingClient.phone : aptData.clientPhone,
      id: `apt-${Date.now()}`
    };

    setAppointments(prev => [...prev, newApt]);
    return true;
  };

  const addClient = (clientData: Omit<Client, 'id'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now()}`
    };
    setClients(prev => [...prev, newClient]);
    return newClient;
  };

  const addService = (serviceData: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...serviceData,
      id: `srv-${Date.now()}`
    };
    setServices(prev => [...prev, newService]);
  };

  const addStaff = (memberData: Omit<Staff, 'id'>) => {
    const newMember: Staff = {
      ...memberData,
      id: `stf-${Date.now()}`
    };
    setStaff(prev => [...prev, newMember]);
  };

  const updateStaff = (updatedMember: Staff) => {
    setStaff(prev => prev.map(s => s.id === updatedMember.id ? updatedMember : s));
  };

  const deleteStaff = (id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id));
  };

  const loginAsStaff = (email: string): boolean => {
    const found = staff.find(s => s.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      setLoggedInStaff(found);
      setUserRole('staff');
      return true;
    }
    return false;
  };

  const logoutStaff = () => {
    setLoggedInStaff(null);
    setUserRole('customer');
  };

  const updateAppointmentStatus = (id: string, status: 'confirmed' | 'pending' | 'completed') => {
    setAppointments(prev =>
      prev.map(apt => (apt.id === id ? { ...apt, status } : apt))
    );
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(apt => apt.id !== id));
  };

  const toggleStaffFilter = (staffName: string) => {
    setStaffFilters(prev => {
      if (staffName === 'All') {
        const allNames = staff.map(s => s.name);
        return prev.includes('All') ? [] : ['All', ...allNames];
      }
      const filtered = prev.filter(s => s !== 'All');
      if (filtered.includes(staffName)) {
        const next = filtered.filter(s => s !== staffName);
        return next;
      } else {
        const next = [...filtered, staffName];
        if (next.length === staff.length) return ['All', ...next];
        return next;
      }
    });
  };

  const toggleServiceFilter = (category: string) => {
    setServiceFilters(prev => {
      if (category === 'All') {
        return prev.includes('All') ? [] : ['All', 'skincare', 'hair', 'massage', 'consult', 'nails'];
      }
      const filtered = prev.filter(c => c !== 'All');
      if (filtered.includes(category)) {
        const next = filtered.filter(c => c !== category);
        return next;
      } else {
        const next = [...filtered, category];
        if (next.length === 5) return ['All', ...next];
        return next;
      }
    });
  };

  return (
    <AppContext.Provider
      value={{
        services,
        clients,
        appointments,
        testimonials: INITIAL_TESTIMONIALS,
        userRole,
        adminTab,
        staffFilters,
        serviceFilters,
        selectedDate,
        staff,
        loggedInStaff,
        addAppointment,
        updateAppointmentStatus,
        deleteAppointment,
        addClient,
        addService,
        addStaff,
        updateStaff,
        deleteStaff,
        loginAsStaff,
        logoutStaff,
        setUserRole,
        setAdminTab,
        toggleStaffFilter,
        toggleServiceFilter,
        setSelectedDate,
        checkSlotOverlap
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
