/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './AppContext';
import CustomerSite from './components/CustomerSite';
import AdminDashboard from './components/AdminDashboard';
import AdminSchedule from './components/AdminSchedule';
import RoleToggle from './components/RoleToggle';
import { Staff } from './types';
import StaffAnalytics from './components/StaffAnalytics';
import AdminAnalytics from './components/AdminAnalytics';

function MainAppContent() {
  const { 
    userRole, 
    setUserRole,
    adminTab, 
    setAdminTab, 
    services, 
    clients, 
    appointments,
    staff,
    loggedInStaff,
    addClient, 
    addService,
    addStaff,
    deleteStaff,
    updateAppointmentStatus,
    deleteAppointment,
    loginAsStaff,
    logoutStaff,
    addAppointment
  } = useApp();

  const [mobileAdminMenuOpen, setMobileAdminMenuOpen] = useState(false);
  const [dummyTab, setDummyTab] = useState<'clients' | 'services' | 'settings' | 'staff' | 'analytics' | null>(null);
  const [staffTab, setStaffTab] = useState<'schedule' | 'analytics'>('schedule');

  // New Client form states
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');
  const [clientSuccessMsg, setClientSuccessMsg] = useState('');

  // New Service form states
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('skincare');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServiceIcon, setNewServiceIcon] = useState('spa');
  const [serviceSuccessMsg, setServiceSuccessMsg] = useState('');

  // New Staff form states
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffCategory, setNewStaffCategory] = useState('skincare');
  const [staffSuccessMsg, setStaffSuccessMsg] = useState('');

  // Staff Login inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Local state for editing client notes inside staff portal
  const [editingClientNotesId, setEditingClientNotesId] = useState<string | null>(null);
  const [tempNotesVal, setTempNotesVal] = useState('');

  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientEmail) return;
    addClient({
      name: newClientName,
      email: newClientEmail,
      phone: newClientPhone || '912 345 678',
      notes: newClientNotes
    });
    setNewClientName('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientNotes('');
    setClientSuccessMsg('Cliente adicionado com sucesso!');
    setTimeout(() => setClientSuccessMsg(''), 3000);
  };

  const handleAddServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName || !newServicePrice || !newServiceDuration) return;
    addService({
      name: newServiceName,
      category: newServiceCategory,
      price: Number(newServicePrice),
      duration: Number(newServiceDuration),
      description: newServiceDesc || 'Sem descrição.',
      icon: newServiceIcon
    });
    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceDuration('');
    setNewServiceDesc('');
    setNewServiceIcon('spa');
    setServiceSuccessMsg('Serviço adicionado com sucesso!');
    setTimeout(() => setServiceSuccessMsg(''), 3000);
  };

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffRole || !newStaffEmail) return;
    addStaff({
      name: newStaffName,
      role: newStaffRole,
      email: newStaffEmail,
      phone: newStaffPhone || '912 345 611',
      category: newStaffCategory,
      services: []
    });
    setNewStaffName('');
    setNewStaffRole('');
    setNewStaffEmail('');
    setNewStaffPhone('');
    setNewStaffCategory('skincare');
    setStaffSuccessMsg('Profissional de Staff adicionado com sucesso!');
    setTimeout(() => setStaffSuccessMsg(''), 3000);
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;
    
    // Any password passes for mock convenience in testing
    const success = loginAsStaff(loginEmail);
    if (success) {
      setLoginError('');
      setLoginEmail('');
      setLoginPass('');
    } else {
      setLoginError('E-mail não registado no sistema de Staff.');
    }
  };

  const saveEditedClientNotes = (clientId: string) => {
    const existing = clients.find(c => c.id === clientId);
    if (existing) {
      existing.notes = tempNotesVal;
      // Triggers state synchronization inside context locally
      addClient(existing); // dummy add effectively updates the existing (due to context setClients triggers)
    }
    setEditingClientNotesId(null);
  };

  // Switch helper
  const navigateToScheduleTab = () => {
    setAdminTab('schedule');
    setDummyTab(null);
  };

  // 1. CUSTOMER PORTAL
  if (userRole === 'customer') {
    return (
      <div className="relative min-h-screen">
        <CustomerSite />
        <RoleToggle />
      </div>
    );
  }

  // 2. STAFF WORKSPACE / LOGIN
  if (userRole === 'staff') {
    // 2.1 Staff is NOT Logged In: Render Login Panel
    if (!loggedInStaff) {
      return (
        <div className="min-h-screen bg-brand-background text-brand-on-background flex flex-col items-center justify-center p-4 relative pb-20">
          <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-[#efe0d4] shadow-lg text-center">
            <span className="font-serif text-sm tracking-[0.2em] text-brand-primary block mb-1 uppercase font-bold">Sabrina Bicalho Beauty</span>
            <h2 className="font-serif text-2xl font-semibold text-brand-primary mb-6">Acesso do Profissional</h2>

            {loginError && (
              <div className="p-3 mb-4 text-xs font-semibold text-red-800 bg-red-50 border border-red-200 rounded-lg animate-pulse">
                ✕ {loginError}
              </div>
            )}

            <form onSubmit={handleStaffLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">E-mail Profissional</label>
                <select
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                >
                  <option value="">Selecione seu e-mail...</option>
                  {staff.map(m => (
                    <option key={m.id} value={m.email}>{m.name} ({m.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Palavra-passe (Senha)</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPass}
                  onChange={e => setLoginPass(e.target.value)}
                  className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                />
                <span className="text-[10px] text-brand-outline mt-1 block font-mono">Dica de mockup: Escolha um e-mail acima, passe livre.</span>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-primary text-white py-2.5 rounded-full text-xs font-bold tracking-wider uppercase hover:bg-brand-surface-tint hover:scale-102 active:scale-98 transition-all cursor-pointer shadow-sm mt-4"
              >
                Iniciar Sessão
              </button>
            </form>
          </div>
          <RoleToggle />
        </div>
      );
    }

    // 2.2 Staff IS Logged In: Render Customized Staff Area
    const myAppointments = appointments.filter(
      apt => apt.staffName.toLowerCase() === loggedInStaff.name.toLowerCase()
    );

    const activeAppointments = myAppointments.filter(apt => apt.status !== 'completed');
    const completedAppointments = myAppointments.filter(apt => apt.status === 'completed');

    // Extract unique clients
    const myClientEmails = Array.from(new Set(myAppointments.map(a => a.clientEmail.toLowerCase())));
    const myClients = clients.filter(c => myClientEmails.includes(c.email.toLowerCase()));

    return (
      <div className="min-h-screen bg-brand-background text-brand-on-background p-4 md:p-8 relative pb-24">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Portal Profile bar */}
          <div className="bg-[#fff1e7] p-6 rounded-2xl border border-[#efe0d4] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-brand-primary text-white font-serif font-extrabold text-2xl flex items-center justify-center uppercase shadow-sm">
                {loggedInStaff.name.charAt(0)}
              </div>
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-brand-primary uppercase">Portal do Profissional</span>
                <h1 className="font-serif text-2xl font-bold text-brand-primary mt-0.5">Olá, {loggedInStaff.name}!</h1>
                <p className="text-xs text-brand-on-surface-variant font-medium">{loggedInStaff.role} • 🟢 Sessão Ativa</p>
              </div>
            </div>

            <button
              onClick={logoutStaff}
              className="px-5 py-2.5 rounded-full bg-brand-primary border border-transparent text-white font-bold text-xs uppercase tracking-wider hover:bg-brand-surface-tint active:scale-97 cursor-pointer transition-all flex items-center gap-1 shadow-xs"
            >
              <span className="material-symbols-outlined text-[14px]">logout</span>
              Sair do Portal
            </button>
          </div>

          {/* Quick Metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[#efe0d4] shadow-xs">
              <span className="material-symbols-outlined text-brand-primary text-2xl mb-1">calendar_month</span>
              <p className="text-brand-outline uppercase text-[10px] tracking-widest font-bold">Meus Agendamentos Ativos</p>
              <h3 className="text-2xl font-serif font-bold text-brand-on-background mt-1">{activeAppointments.length}</h3>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#efe0d4] shadow-xs">
              <span className="material-symbols-outlined text-brand-primary text-2xl mb-1">done_all</span>
              <p className="text-brand-outline uppercase text-[10px] tracking-widest font-bold">Serviços Concluídos</p>
              <h3 className="text-2xl font-serif font-bold text-brand-on-background mt-1">{completedAppointments.length}</h3>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#efe0d4] shadow-xs">
              <span className="material-symbols-outlined text-brand-primary text-2xl mb-1">face</span>
              <p className="text-brand-outline uppercase text-[10px] tracking-widest font-bold">Os Meus Clientes Diferentes</p>
              <h3 className="text-2xl font-serif font-bold text-brand-on-background mt-1">{myClients.length}</h3>
            </div>
          </div>

          {/* Staff Mode Tab Selector Bar */}
          <div className="flex border-b border-[#efe0d4]/60 pb-1.5 gap-6 w-full mt-2">
            <button
              onClick={() => setStaffTab('schedule')}
              className={`pb-2.5 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border-b-2 outline-none ${
                staffTab === 'schedule'
                  ? 'border-brand-primary text-brand-primary font-bold'
                  : 'border-transparent text-brand-on-surface-variant hover:text-brand-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">event_note</span>
              Minha Agenda & Clientes
            </button>
            <button
              onClick={() => setStaffTab('analytics')}
              className={`pb-2.5 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border-b-2 outline-none ${
                staffTab === 'analytics'
                  ? 'border-brand-primary text-brand-primary font-bold'
                  : 'border-transparent text-brand-on-surface-variant hover:text-brand-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">query_stats</span>
              Finanças & Analytics
            </button>
          </div>

          {/* Dynamic Lists OR Analytics Panel */}
          {staffTab === 'schedule' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Appointments Section */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-[#efe0d4] shadow-xs space-y-4">
              <div className="border-b border-[#efe0d4]/60 pb-3 flex justify-between items-center">
                <h3 className="font-serif text-lg font-bold text-brand-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">schedule</span>
                  Próximos Agendamentos
                </h3>
                <span className="bg-[#faebdf] text-brand-primary px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider font-semibold">HOJE / FUTURO</span>
              </div>

              {activeAppointments.length === 0 ? (
                <div className="p-8 text-center text-brand-on-surface-variant/70 text-xs">
                  Não possui agendamentos marcados.
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {activeAppointments.map(apt => {
                    const primarySrv = services.find(s => s.id === apt.serviceId);
                    return (
                      <div key={apt.id} className="p-4 rounded-xl bg-[#fffbfa] border border-[#efe0d4]/50 hover:border-brand-primary/20 transition-all flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-brand-on-background">{apt.clientName}</h4>
                            <span className="text-[10px] bg-brand-primary-container text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-wider shrink-0 font-semibold">{apt.status}</span>
                          </div>
                          <p className="text-[11px] text-brand-on-surface-variant">
                            📅 {apt.date} às <strong className="text-brand-primary font-serif font-medium text-xs">{apt.time}</strong> ({apt.duration} min)
                          </p>
                          <p className="text-[11px] text-brand-on-background">
                            💇 <strong>Serviço:</strong> {primarySrv?.name || 'Tratamento'}
                          </p>
                          {apt.notes && (
                            <p className="text-[11px] text-brand-outline bg-[#faebdf]/50 p-2 rounded mt-2 border border-[#efe0d4]/30 leading-relaxed">
                              <strong>Instruções/Notas:</strong> {apt.notes}
                            </p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col gap-2 shrink-0">
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow-xs transition-colors"
                            title="Concluir Serviço"
                          >
                            <span className="material-symbols-outlined text-[16px] block">done_outline</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
                                deleteAppointment(apt.id);
                              }
                            }}
                            className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow-xs transition-colors"
                            title="Desmarcar / Cancelar"
                          >
                            <span className="material-symbols-outlined text-[16px] block">close</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Clients Index Section */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#efe0d4] shadow-xs space-y-4">
              <div className="border-b border-[#efe0d4]/60 pb-3">
                <h3 className="font-serif text-lg font-bold text-brand-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">group</span>
                  Fichas dos Meus Clientes
                </h3>
              </div>

              {myClients.length === 0 ? (
                <div className="p-8 text-center text-brand-on-surface-variant/70 text-xs">
                  Sem fichas de clientes associados de momento.
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {myClients.map(client => (
                    <div key={client.id} className="p-3.5 rounded-xl border border-[#efe0d4]/50 bg-white shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-primary text-white font-serif font-bold text-xs flex items-center justify-center uppercase shrink-0">
                          {client.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-brand-on-background truncate">{client.name}</h4>
                          <p className="text-[10px] text-brand-on-surface-variant truncate font-mono">{client.email}</p>
                          <p className="text-[10px] text-brand-on-surface-variant font-mono">{client.phone}</p>
                        </div>
                      </div>

                      {/* Observations / Preferences card editable by the staff */}
                      <div className="mt-3 bg-[#fffaf5] p-3 rounded-lg border border-[#efe0d4]/50">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-extrabold tracking-widest uppercase text-brand-primary">Ficha de Observações</span>
                          
                          {editingClientNotesId !== client.id ? (
                            <button
                              onClick={() => {
                                setEditingClientNotesId(client.id);
                                setTempNotesVal(client.notes || '');
                              }}
                              className="text-brand-primary hover:underline text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[10px]">edit</span>
                              Editar
                            </button>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveEditedClientNotes(client.id)}
                                className="text-emerald-700 hover:text-emerald-900 text-[10px] font-bold cursor-pointer"
                              >
                                Gravar
                              </button>
                              <button
                                onClick={() => setEditingClientNotesId(null)}
                                className="text-gray-500 hover:text-gray-700 text-[10px] font-bold cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </div>
                          )}
                        </div>

                        {editingClientNotesId === client.id ? (
                          <textarea
                            rows={3}
                            value={tempNotesVal}
                            onChange={e => setTempNotesVal(e.target.value)}
                            className="w-full bg-white border border-[#efe0d4] rounded p-2 text-[10px] outline-none resize-none focus:border-brand-primary"
                            placeholder="Adicione preferências de unhas, alergias de pele, tonalidades favoritas, etc..."
                          />
                        ) : (
                          <p className="text-[10px] text-brand-on-background leading-relaxed">
                            {client.notes ? client.notes : <span className="text-gray-400 italic">Sem observações ainda. Toque em Editar para registar preferências.</span>}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
          ) : (
            <StaffAnalytics staffName={loggedInStaff.name} />
          )}
        </div>
        <RoleToggle />
      </div>
    );
  }

  // 3. ADMIN PORTAL PANEL
  return (
    <div className="min-h-screen bg-brand-background text-brand-on-background flex overflow-x-hidden relative pb-16">
      
      {/* Admin Mobile Top bar */}
      <div className="md:hidden fixed top-0 left-0 w-full z-45 bg-white/90 backdrop-blur-md shadow-xs h-16 flex justify-between items-center px-4 border-b border-[#efe0d4]">
        <div className="flex items-center gap-2">
          <span className="font-serif text-md tracking-wider text-brand-primary font-bold">SABRINA BICALHO</span>
        </div>
        <button 
          onClick={() => setMobileAdminMenuOpen(true)}
          className="text-brand-primary p-1.5 hover:bg-[#efe0d4]/30 rounded-full transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {/* Admin Mobile Menu Bar Drawer */}
      {mobileAdminMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            onClick={() => setMobileAdminMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          ></div>

          <div className="relative flex flex-col w-72 h-full bg-[#faebdf] shadow-2xl p-5 z-10 py-6 pointer-events-auto">
            <div className="flex items-center justify-between mb-8 border-b border-[#efe0d4] pb-4">
              <span className="font-serif text-sm tracking-widest text-brand-primary uppercase">Elena Rossi</span>
              <button 
                onClick={() => setMobileAdminMenuOpen(false)}
                className="p-1 text-brand-on-surface-variant hover:bg-brand-surface-variant rounded-full cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setAdminTab('dashboard');
                  setDummyTab(null);
                  setMobileAdminMenuOpen(false);
                }}
                className={`w-full py-2.5 px-4 rounded-full flex items-center gap-3 font-semibold text-xs uppercase cursor-pointer ${
                  adminTab === 'dashboard' && !dummyTab
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-brand-on-surface-variant hover:bg-[#efe0d4]/50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">dashboard</span>
                Dashboard
              </button>

              <button
                onClick={() => {
                  setAdminTab('schedule');
                  setDummyTab(null);
                  setMobileAdminMenuOpen(false);
                }}
                className={`w-full py-2.5 px-4 rounded-full flex items-center gap-3 font-semibold text-xs uppercase cursor-pointer ${
                  adminTab === 'schedule' && !dummyTab
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-brand-on-surface-variant hover:bg-[#efe0d4]/50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                Calendário
              </button>

              <button
                onClick={() => {
                  setDummyTab('clients');
                  setMobileAdminMenuOpen(false);
                }}
                className={`w-full py-2.5 px-4 rounded-full flex items-center gap-3 font-semibold text-xs uppercase cursor-pointer ${
                  dummyTab === 'clients' ? 'bg-brand-primary text-white' : 'text-brand-on-surface-variant hover:bg-[#efe0d4]/50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">group</span>
                Clientes
              </button>

              <button
                onClick={() => {
                  setDummyTab('services');
                  setMobileAdminMenuOpen(false);
                }}
                className={`w-full py-2.5 px-4 rounded-full flex items-center gap-3 font-semibold text-xs uppercase cursor-pointer ${
                  dummyTab === 'services' ? 'bg-brand-primary text-white' : 'text-brand-on-surface-variant hover:bg-[#efe0d4]/50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">content_cut</span>
                Serviços
              </button>

              {/* Staff and Settings on Mobile Drawer */}
              <button
                onClick={() => {
                  setDummyTab('staff');
                  setMobileAdminMenuOpen(false);
                }}
                className={`w-full py-2.5 px-4 rounded-full flex items-center gap-3 font-semibold text-xs uppercase cursor-pointer ${
                  dummyTab === 'staff' ? 'bg-brand-primary text-white' : 'text-brand-on-surface-variant hover:bg-[#efe0d4]/50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">badge</span>
                Gestão Staff
              </button>

              <button
                onClick={() => {
                  setDummyTab('analytics');
                  setMobileAdminMenuOpen(false);
                }}
                className={`w-full py-2.5 px-4 rounded-full flex items-center gap-3 font-semibold text-xs uppercase cursor-pointer ${
                  dummyTab === 'analytics' ? 'bg-brand-primary text-white' : 'text-brand-on-surface-variant hover:bg-[#efe0d4]/50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">insights</span>
                Analytics & Finanças
              </button>

              <button
                onClick={() => {
                  setDummyTab('settings');
                  setMobileAdminMenuOpen(false);
                }}
                className={`w-full py-2.5 px-4 rounded-full flex items-center gap-3 font-semibold text-xs uppercase cursor-pointer ${
                  dummyTab === 'settings' ? 'bg-brand-primary text-white' : 'text-brand-on-surface-variant hover:bg-[#efe0d4]/50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">settings</span>
                Settings
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Admin Desktop Sidebar Frame */}
      <nav className="hidden md:flex flex-col bg-brand-surface-container h-screen w-72 rounded-r-xl shadow-xl fixed inset-y-0 left-0 z-40 py-6 border-r border-[#efe0d4]/45">
        <div className="px-6 mb-6 flex flex-col items-start border-b border-[#efe0d4]/20 pb-5">
          <span className="font-serif text-lg tracking-[0.2em] text-brand-primary mb-4 leading-tight select-none font-bold">
            SABRINA BICALHO
          </span>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-primary-container text-white font-serif uppercase flex items-center justify-center font-bold text-md">
              ER
            </div>
            <div>
              <h3 className="text-xs font-bold text-brand-on-surface">Elena Rossi</h3>
              <p className="text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider">Studio Manager</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-1.5 px-2">
          <button
            onClick={() => {
              setAdminTab('dashboard');
              setDummyTab(null);
            }}
            className={`w-full px-4 py-2.5 rounded-full font-bold text-xs uppercase transition-all flex items-center gap-3 tracking-wider cursor-pointer ${
              adminTab === 'dashboard' && !dummyTab
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-brand-on-surface-variant hover:bg-brand-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">dashboard</span>
            Dashboard
          </button>

          <button
            onClick={() => {
              setAdminTab('schedule');
              setDummyTab(null);
            }}
            className={`w-full px-4 py-2.5 rounded-full font-bold text-xs uppercase transition-all flex items-center gap-3 tracking-wider cursor-pointer ${
              adminTab === 'schedule' && !dummyTab
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-brand-on-surface-variant hover:bg-brand-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
            Calendário
          </button>

          <button
            onClick={() => setDummyTab('clients')}
            className={`w-full px-4 py-2.5 rounded-full font-bold text-xs uppercase transition-all flex items-center gap-3 tracking-wider cursor-pointer ${
              dummyTab === 'clients'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-brand-on-surface-variant hover:bg-brand-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">group</span>
            Clientes
          </button>

          <button
            onClick={() => setDummyTab('services')}
            className={`w-full px-4 py-2.5 rounded-full font-bold text-xs uppercase transition-all flex items-center gap-3 tracking-wider cursor-pointer ${
              dummyTab === 'services'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-brand-on-surface-variant hover:bg-brand-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">content_cut</span>
            Serviços
          </button>

          {/* New Gestao de Staff Admin Sidebar item */}
          <button
            onClick={() => setDummyTab('staff')}
            className={`w-full px-4 py-2.5 rounded-full font-bold text-xs uppercase transition-all flex items-center gap-3 tracking-wider cursor-pointer ${
              dummyTab === 'staff'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-brand-on-surface-variant hover:bg-brand-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">badge</span>
            Gestão Staff
          </button>

          <button
            onClick={() => setDummyTab('analytics')}
            className={`w-full px-4 py-2.5 rounded-full font-bold text-xs uppercase transition-all flex items-center gap-3 tracking-wider cursor-pointer ${
              dummyTab === 'analytics'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-brand-on-surface-variant hover:bg-brand-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">insights</span>
            Analytics & Finanças
          </button>

          <div className="mt-auto">
            <button
              onClick={() => setDummyTab('settings')}
              className={`w-full px-4 py-2.5 rounded-full font-bold text-xs uppercase transition-all flex items-center gap-3 tracking-wider cursor-pointer ${
                dummyTab === 'settings'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-brand-on-surface-variant hover:bg-brand-surface-variant mb-2'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">settings</span>
              Configurações
            </button>
          </div>
        </div>
      </nav>

      {/* Main Panel Content Container Frame */}
      <main className="flex-1 ml-0 md:ml-72 pt-24 md:pt-12 px-4 md:px-gutter max-w-brand-container-max mx-auto w-full">
        
        {/* Gestão de Staff layout */}
        {dummyTab === 'staff' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-brand-primary">Gestão de Staff</h2>
                <p className="text-xs text-brand-on-surface-variant mt-1">Registe, consulte e remova profissionais do Sabrina Bicalho Beauty.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Staff database column */}
              <div className="lg:col-span-7 bg-white/70 backdrop-blur-md rounded-xl p-5 border border-[#efe0d4]">
                <strong className="block mb-4 uppercase text-[10px] tracking-widest text-brand-outline font-extrabold">Membros Ativos ({staff.length})</strong>
                
                <div className="divide-y divide-[#efe0d4]/40 max-h-[500px] overflow-y-auto pr-2 space-y-3">
                  {staff.map(member => (
                    <div key={member.id} className="pt-3 pb-3 first:pt-0 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-brand-primary text-white font-serif font-bold text-sm flex items-center justify-center uppercase shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-xs text-brand-on-background">{member.name}</h4>
                          <span className="bg-[#faebdf] text-brand-primary text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full shrink-0">
                            {member.category}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-brand-outline mt-0.5">{member.role}</p>
                        <p className="text-[10px] text-brand-on-surface-variant leading-relaxed font-mono mt-1">E-mail: {member.email}</p>
                        <p className="text-[10px] text-brand-on-surface-variant font-mono">Telemóvel: {member.phone}</p>
                      </div>

                      {/* Delete Action button for customized members */}
                      <button
                        onClick={() => {
                          if (confirm(`Tem certeza que deseja apagar ${member.name} da base de profissionais?`)) {
                            deleteStaff(member.id);
                          }
                        }}
                        className="p-1 px-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-[10px] font-bold cursor-pointer shrink-0 transition-colors"
                        title="Remover"
                      >
                        Apagar
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Staff workspace Form */}
              <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-[#efe0d4] shadow-xs">
                <h3 className="font-serif text-lg text-brand-primary mb-4">Registar Novo Profissional</h3>
                
                {staffSuccessMsg && (
                  <div className="p-3 mb-4 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg animate-fade-in">
                    ✓ {staffSuccessMsg}
                  </div>
                )}

                <form onSubmit={handleAddStaffSubmit} className="space-y-4 text-left">
                  <div>
                    <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Nome Completo</label>
                    <input
                      required
                      type="text"
                      placeholder="Ex: Clara Lima"
                      value={newStaffName}
                      onChange={e => setNewStaffName(e.target.value)}
                      className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Cargo / Especialidade</label>
                    <input
                      required
                      type="text"
                      placeholder="Ex: Designer de Unhas / Esteticista"
                      value={newStaffRole}
                      onChange={e => setNewStaffRole(e.target.value)}
                      className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">E-mail Profissional</label>
                    <input
                      required
                      type="email"
                      placeholder="Ex: clara@sabinabicalho.pt"
                      value={newStaffEmail}
                      onChange={e => setNewStaffEmail(e.target.value)}
                      className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Telemóvel</label>
                      <input
                        type="tel"
                        placeholder="Ex: 912 345 611"
                        value={newStaffPhone}
                        onChange={e => setNewStaffPhone(e.target.value)}
                        className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Categoria Principal</label>
                      <select
                        value={newStaffCategory}
                        onChange={e => setNewStaffCategory(e.target.value)}
                        className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                      >
                        <option value="skincare">Estética</option>
                        <option value="hair">Cabelo</option>
                        <option value="massage">Massagem</option>
                        <option value="consult">Consulta</option>
                        <option value="nails">Nails / Unhas</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-primary text-white py-2.5 rounded-full text-xs font-bold tracking-wider uppercase hover:bg-brand-surface-tint hover:scale-103 active:scale-97 transition-all cursor-pointer shadow-sm mt-3"
                  >
                    Guardar Profissional
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Existing Admin Tabs */}
        {dummyTab === 'clients' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-brand-primary">Gestão de Clientes</h2>
                <p className="text-xs text-brand-on-surface-variant mt-1">Registe e consulte o cadastro de clientes da Sabrina Bicalho Beauty.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Clients database list */}
              <div className="md:col-span-7 bg-white/70 backdrop-blur-md rounded-xl p-5 border border-[#efe0d4]">
                <strong className="block mb-4 uppercase text-[10px] tracking-widest text-brand-outline font-extrabold">Clientes Cadastrados ({clients.length})</strong>
                
                <div className="divide-y divide-[#efe0d4]/40 max-h-[500px] overflow-y-auto pr-2 space-y-2">
                  {clients.map(client => (
                    <div key={client.id} className="pt-3 pb-3 first:pt-0 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-brand-primary-container text-white font-serif font-bold text-sm flex items-center justify-center uppercase shrink-0">
                        {client.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-brand-on-background">{client.name}</h4>
                        <p className="text-[11px] text-brand-on-surface-variant leading-relaxed mt-0.5">{client.email} • {client.phone}</p>
                        {client.notes && (
                          <div className="mt-1.5 p-2 bg-[#faebdf] border border-[#efe0d4]/50 rounded text-[10px] text-brand-primary leading-relaxed">
                            <span className="font-bold">Observações:</span> {client.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Client Column */}
              <div className="md:col-span-5 bg-white rounded-xl p-5 border border-[#efe0d4] shadow-sm">
                <h3 className="font-serif text-lg text-brand-primary mb-4">Adicionar Novo Cliente</h3>
                
                {clientSuccessMsg && (
                  <div className="p-3 mb-4 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg animate-fade-in">
                    ✓ {clientSuccessMsg}
                  </div>
                )}

                <form onSubmit={handleAddClientSubmit} className="space-y-4 text-left">
                  <div>
                    <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Nome Completo</label>
                    <input
                      required
                      type="text"
                      placeholder="Ex: Clara Lima"
                      value={newClientName}
                      onChange={e => setNewClientName(e.target.value)}
                      className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">E-mail</label>
                    <input
                      required
                      type="email"
                      placeholder="Ex: clara.lima@email.pt"
                      value={newClientEmail}
                      onChange={e => setNewClientEmail(e.target.value)}
                      className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Telemóvel / Telefone</label>
                    <input
                      type="tel"
                      placeholder="Ex: 912 345 678"
                      value={newClientPhone}
                      onChange={e => setNewClientPhone(e.target.value)}
                      className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Notas / Alergias de Preferência</label>
                    <textarea
                      rows={3}
                      placeholder="Ex: Alergia a cosméticos com amônia, prefere manicure com tons nude."
                      value={newClientNotes}
                      onChange={e => setNewClientNotes(e.target.value)}
                      className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-primary text-white py-2.5 rounded-full text-xs font-bold tracking-wider uppercase hover:bg-brand-surface-tint hover:scale-103 active:scale-97 transition-all cursor-pointer shadow-sm mt-2"
                  >
                    Registar Cliente
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {dummyTab === 'services' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-brand-primary">Menu de Serviços</h2>
                <p className="text-xs text-brand-on-surface-variant mt-1">Gerencie os tratamentos disponíveis na Sabrina Bicalho Beauty de Lisboa.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Existing Services list Grid */}
              <div className="md:col-span-7 bg-white/70 backdrop-blur-md rounded-xl p-5 border border-[#efe0d4]">
                <strong className="block mb-4 uppercase text-[10px] tracking-widest text-brand-outline font-extrabold">Tratamentos Registados ({services.length})</strong>
                
                <div className="grid grid-cols-1 gap-4 max-h-[550px] overflow-y-auto pr-2">
                  {services.map(s => (
                    <div key={s.id} className="p-4 rounded-lg bg-white border border-[#efe0d4]/60 flex items-start gap-3.5 hover:shadow-xs hover:border-brand-primary/20 transition-all">
                      <div className="w-9 h-9 rounded-full bg-brand-primary-fixed flex items-center justify-center text-brand-primary shrink-0">
                        <span className="material-symbols-outlined text-[18px]">{s.icon || 'spa'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="font-bold text-xs text-brand-on-background truncate">{s.name}</h4>
                          <span className="shrink-0 bg-brand-tertiary-fixed text-brand-tertiary px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase">
                            {s.category === 'nails' ? 'Nails' 
                              : s.category === 'skincare' ? 'Estética' 
                              : s.category === 'hair' ? 'Cabelo' 
                              : s.category === 'massage' ? 'Massagem' 
                              : 'Consulta'}
                          </span>
                        </div>
                        <p className="text-[11px] text-brand-on-surface-variant leading-relaxed mt-1">{s.description}</p>
                        <span className="text-[10px] font-extrabold text-brand-primary block mt-2">🕒 {s.duration} min • €{s.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Service form Column */}
              <div className="md:col-span-5 bg-white rounded-xl p-5 border border-[#efe0d4] shadow-sm">
                <h3 className="font-serif text-lg text-brand-primary mb-4">Criar Novo Serviço</h3>

                {serviceSuccessMsg && (
                  <div className="p-3 mb-4 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg animate-fade-in animate-pulse">
                    ✓ {serviceSuccessMsg}
                  </div>
                )}

                <form onSubmit={handleAddServiceSubmit} className="space-y-4 text-left">
                  <div>
                    <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Nome do Tratamento / Serviço</label>
                    <input
                      required
                      type="text"
                      placeholder="Ex: Escova Orgânica Alisadora"
                      value={newServiceName}
                      onChange={e => setNewServiceName(e.target.value)}
                      className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Categoria</label>
                      <select
                        value={newServiceCategory}
                        onChange={e => setNewServiceCategory(e.target.value)}
                        className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                      >
                        <option value="skincare">Estética</option>
                        <option value="hair">Cabelo</option>
                        <option value="massage">Massagem</option>
                        <option value="consult">Consulta</option>
                        <option value="nails">Nails / Unhas</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Ícone</label>
                      <select
                        value={newServiceIcon}
                        onChange={e => setNewServiceIcon(e.target.value)}
                        className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                      >
                        <option value="spa">Wellness / Spa</option>
                        <option value="face">Rosto / Estética</option>
                        <option value="content_cut">Tesoura / Cabelo</option>
                        <option value="pan_tool">Mão / Nails</option>
                        <option value="chat">Conversa / Consulta</option>
                        <option value="brush">Beleza / Maquiagem</option>
                        <option value="healing">Cuidado / Terapia</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Preço (€)</label>
                      <input
                        required
                        type="number"
                        min="1"
                        placeholder="Ex: 50"
                        value={newServicePrice}
                        onChange={e => setNewServicePrice(e.target.value)}
                        className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Duração (minutos)</label>
                      <input
                        required
                        type="number"
                        min="5"
                        step="5"
                        placeholder="Ex: 60"
                        value={newServiceDuration}
                        onChange={e => setNewServiceDuration(e.target.value)}
                        className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-brand-outline uppercase tracking-wider mb-1">Descrição Curta</label>
                    <textarea
                      rows={3}
                      placeholder="Ex: Escovagem de hidratação e alinhamento capilar térmico com selagem orgânica."
                      value={newServiceDesc}
                      onChange={e => setNewServiceDesc(e.target.value)}
                      className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-primary text-white py-2.5 rounded-full text-xs font-bold tracking-wider uppercase hover:bg-brand-surface-tint hover:scale-103 active:scale-97 transition-all cursor-pointer shadow-sm mt-2"
                  >
                    Guardar Serviço
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {dummyTab === 'settings' && (
          <div className="glass-card rounded-xl p-6 text-center">
            <h2 className="font-serif text-2xl text-brand-primary mb-3">Configurações do Estúdio</h2>
            <p className="text-xs text-brand-on-surface-variant max-w-lg mx-auto leading-relaxed mb-6">
              Configure o horário de funcionamento, alergénios padrão, staff responsável, moedas (€ / $) e notificações automáticas de confirmação.
            </p>
            <div className="p-4 bg-brand-surface-container-low/40 rounded border border-[#efe0d4] text-[11px] text-left max-w-md mx-auto space-y-2 font-mono">
              <p>📍 Morada: Av. da Liberdade 123, Lisboa</p>
              <p>🕒 Horário: Seg-Sáb (9h - 18h) / Dom (Fechado)</p>
              <p>💬 Alerta padrão: Notificação automática via WhatsApp ativa</p>
              <p>🌿 Tema Visual: Nude - discrete luxury minimal</p>
            </div>
          </div>
        )}

        {dummyTab === 'analytics' && (
          <AdminAnalytics />
        )}

        {!dummyTab && adminTab === 'dashboard' && (
          <AdminDashboard onNavigateToSchedule={navigateToScheduleTab} />
        )}

        {!dummyTab && adminTab === 'schedule' && (
          <AdminSchedule />
        )}
      </main>

      <RoleToggle />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
