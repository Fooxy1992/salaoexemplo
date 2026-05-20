import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Appointment, Service } from '../types';

export default function AdminSchedule() {
  const { 
    appointments, 
    services, 
    staffFilters, 
    toggleStaffFilter, 
    serviceFilters, 
    toggleServiceFilter,
    updateAppointmentStatus,
    deleteAppointment,
    addAppointment,
    staff
  } = useApp();

  const [selectedWeekApt, setSelectedWeekApt] = useState<Appointment | null>(null);
  const [showCreateAptModal, setShowCreateAptModal] = useState(false);
  
  // New appointment creator states
  const [newApt, setNewApt] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    serviceId: services[0].id,
    date: '2024-10-16',
    time: '12:00',
    staffName: 'Sarah',
    notes: ''
  });

  // Week configuration mapping
  const weekdays = [
    { name: 'Mon', day: '14', dateStr: '2024-10-14' },
    { name: 'Tue', day: '15', dateStr: '2024-10-15' },
    { name: 'Wed', day: '16', dateStr: '2024-10-16', isToday: true },
    { name: 'Thu', day: '17', dateStr: '2024-10-17' },
    { name: 'Fri', day: '18', dateStr: '2024-10-18' },
    { name: 'Sat', day: '19', dateStr: '2024-10-19', isWeekend: true },
    { name: 'Sun', day: '20', dateStr: '2024-10-20', isWeekend: true, isClosed: true }
  ];

  const hoursList = [
    { label: '9 AM', decVal: 9 },
    { label: '10 AM', decVal: 10 },
    { label: '11 AM', decVal: 11 },
    { label: '12 PM', decVal: 12 },
    { label: '1 PM', decVal: 13 },
    { label: '2 PM', decVal: 14 },
    { label: '3 PM', decVal: 15 },
    { label: '4 PM', decVal: 16 },
    { label: '5 PM', decVal: 17 }
  ];

  // Filters application
  const filteredAppointments = appointments.filter(apt => {
    // Staff filter
    const staffMatches = staffFilters.includes('All') || staffFilters.includes(apt.staffName);
    
    // Service Category filter
    const service = services.find(s => s.id === apt.serviceId);
    const categoryMatches = serviceFilters.includes('All') || (service && serviceFilters.includes(service.category));
    
    return staffMatches && categoryMatches;
  });

  // Plot mathematics calculation
  const getPositionStyles = (time: string, duration: number) => {
    const [hourStr, minStr] = time.split(':');
    let hour = parseInt(hourStr);
    const min = parseInt(minStr);
    
    // Handle 12-hour AM/PM issues in strings if any, our inputs are 24h
    const baseHour = 9; // Base hour starts at 9 AM representation
    const timeDecimal = hour + min / 60;
    const offsetHours = timeDecimal - baseHour;

    // Hour row is of height 80px
    const topPx = offsetHours * 80;
    const heightPx = (duration / 60) * 80;

    return {
      top: `${topPx}px`,
      height: `${heightPx}px`
    };
  };

  const handleAddNewBooking = (e: React.FormEvent) => {
    e.preventDefault();
    addAppointment({
      clientName: newApt.clientName,
      clientEmail: newApt.clientEmail || `${newApt.clientName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      clientPhone: newApt.clientPhone || '912 345 678',
      serviceId: newApt.serviceId,
      date: newApt.date,
      time: newApt.time,
      duration: services.find(s => s.id === newApt.serviceId)?.duration || 60,
      staffName: newApt.staffName,
      status: 'confirmed',
      notes: newApt.notes || 'Created from Calendar'
    });
    setShowCreateAptModal(false);
  };

  const handleAptDelete = (id: string) => {
    deleteAppointment(id);
    setSelectedWeekApt(null);
  };

  const handleAptComplete = (id: string) => {
    updateAppointmentStatus(id, 'completed');
    setSelectedWeekApt(null);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full h-full relative">
      
      {/* Sidebar Filter panel layout identical to Navigation filters */}
      <div className="w-full md:w-64 bg-white/70 p-5 rounded-xl border border-[#efe0d4] flex flex-col gap-6 shrink-0 h-fit">
        <div>
          <h3 className="text-xs uppercase tracking-wider font-extrabold text-brand-primary mb-3">Filtros do Staff</h3>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input 
                checked={staffFilters.includes('All')} 
                onChange={() => toggleStaffFilter('All')}
                type="checkbox" 
                className="rounded text-brand-primary focus:ring-brand-primary border-brand-outline-variant w-4 h-4"
              />
              <span className="text-xs font-semibold text-brand-on-background group-hover:text-brand-primary transition-colors">Todos</span>
            </label>

            {staff.map(member => (
              <label key={member.id} className="flex items-center gap-2.5 cursor-pointer group">
                <input 
                  checked={staffFilters.includes(member.name)} 
                  onChange={() => toggleStaffFilter(member.name)}
                  type="checkbox" 
                  className="rounded text-brand-primary focus:ring-brand-primary border-brand-outline-variant w-4 h-4"
                />
                <div className="w-5 h-5 rounded-full bg-brand-primary-container text-[10px] uppercase font-bold flex items-center justify-center text-white">
                  {member.name.charAt(0)}
                </div>
                <span className="text-xs font-semibold text-brand-on-background group-hover:text-brand-primary transition-colors">
                  {member.name} ({
                    member.category === 'hair' ? 'Cabelo' 
                    : member.category === 'skincare' ? 'Estética' 
                    : member.category === 'massage' ? 'Massagem' 
                    : member.category === 'consult' ? 'Consulta' 
                    : 'Unhas'
                  })
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-wider font-extrabold text-brand-primary mb-3">Categorias</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'skincare', label: 'Estética', color: 'bg-[#FADADD] text-[#574144]' },
              { id: 'hair', label: 'Cabelo', color: 'bg-[#fbdbb0] text-[#584324]' },
              { id: 'massage', label: 'Massagem', color: 'bg-[#faebdf] text-[#4e3700]' },
              { id: 'consult', label: 'Consulta', color: 'bg-[#fff1e7] text-[#211a13]' },
              { id: 'nails', label: 'Nails', color: 'bg-brand-secondary-container text-[#5d4201]' }
            ].map(cat => {
              const isActive = serviceFilters.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleServiceFilter(cat.id)}
                  type="button"
                  className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                    isActive ? cat.color : 'bg-brand-surface-container-high text-brand-outline hover:bg-brand-[#efe0d4]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => setShowCreateAptModal(true)}
          className="w-full bg-brand-primary-container text-white py-2.5 rounded-lg text-xs font-bold shadow-xs hover:bg-brand-primary active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Novo Agendamento
        </button>
      </div>

      {/* Main Weekly Calendar Panel */}
      <div className="flex-1 bg-white rounded-xl border border-[#efe0d4] overflow-hidden flex flex-col shadow-sm">
        
        {/* Calendar Day Header */}
        <div className="grid grid-cols-7 border-b border-[#efe0d4]/40 bg-brand-surface-dim/35 pt-3 pb-3 ml-14">
          {weekdays.map(wd => (
            <div 
              key={wd.name} 
              className={`text-center relative ${wd.isToday ? 'border-brand-primary/20' : ''}`}
            >
              {wd.isToday && (
                <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand-primary-container animate-ping"></div>
              )}
              <p className={`text-[10px] uppercase font-semibold select-none ${wd.isToday ? 'text-brand-primary font-extrabold' : 'text-brand-outline-variant'}`}>
                {wd.name}
              </p>
              <p className={`font-serif text-lg leading-none mt-1.5 ${wd.isToday ? 'text-brand-primary font-extrabold underline decoration-2 underline-offset-4' : 'text-brand-on-background font-medium'}`}>
                {wd.day}
              </p>
            </div>
          ))}
        </div>

        {/* Scrollable Timeline Grid Container */}
        <div className="flex-1 overflow-y-auto relative min-h-[580px]" style={{ height: 'calc(100vh - 350px)' }}>
          
          {/* Hour Marks labels sidebar column */}
          <div className="absolute top-0 left-0 w-14 h-full bg-[#fffcfa] border-r border-[#efe0d4]/30 z-25">
            {hoursList.map(h => (
              <div key={h.label} className="h-20 relative select-none">
                <span className="absolute top-[-7px] right-2.5 text-[9px] font-bold text-brand-outline tracking-tight leading-none uppercase">
                  {h.label}
                </span>
              </div>
            ))}
          </div>

          {/* Actual grid matrix cells area */}
          <div className="absolute top-0 left-14 right-0 bottom-0 flex">
            
            {/* Draw 7 Column Layers */}
            {weekdays.map(dayCol => {
              // Get appointments scheduled on this column's date
              const colApts = filteredAppointments.filter(apt => apt.date === dayCol.dateStr);

              return (
                <div 
                  key={dayCol.dateStr} 
                  className={`flex-1 relative border-l border-[#efe0d4]/20 ${dayCol.isClosed ? 'bg-brand-surface-container-low/30' : ''}`}
                >
                  {/* Grid Lines rows background */}
                  {hoursList.map((hour, i) => (
                    <div key={i} className="h-20 time-grid-line w-full"></div>
                  ))}

                  {/* Sunday Closed banner overlay identical to HTML layout */}
                  {dayCol.isClosed && (
                    <div className="absolute inset-0 flex items-center justify-center bg-transparent z-0 select-none">
                      <div className="bg-white/85 px-3 py-1.5 rounded-full border border-[#efe0d4] shadow-xs backdrop-blur-xs select-none">
                        <p className="text-[10px] font-bold text-brand-outline uppercase tracking-wider">Fechado</p>
                      </div>
                    </div>
                  )}

                  {/* Wedge/Current Time gold horizontal line placed absolute inside WED column */}
                  {dayCol.isToday && (
                    <div 
                      className="absolute left-0 right-0 h-[2px] bg-brand-primary-container z-25 pointer-events-none flex items-center"
                      style={{ top: '260px' }} // Maps exactly to 12PM noon area
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-primary-container -ml-1 border-2 border-white shadow-xs"></div>
                    </div>
                  )}

                  {/* Dynamic mapped plotted events card block layer */}
                  {colApts.map(apt => {
                    const service = services.find(s => s.id === apt.serviceId);
                    const position = getPositionStyles(apt.time, apt.duration);
                    
                    // Determine styling profile
                    // categories: skincare, hair, massage, consult, nails
                    let eventCatClass = 'event-skincare';
                    if (service?.category === 'hair') eventCatClass = 'event-hair';
                    if (service?.category === 'massage') eventCatClass = 'event-massage';
                    if (service?.category === 'consult') eventCatClass = 'event-consult';
                    if (service?.category === 'nails') eventCatClass = 'event-nails';

                    const isConfirmed = apt.status === 'confirmed';
                    const isCompleted = apt.status === 'completed';

                    return (
                      <div
                        key={apt.id}
                        onClick={() => setSelectedWeekApt(apt)}
                        style={position}
                        className={`absolute left-1 right-1 rounded-md p-2 shadow-xs hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer overflow-hidden z-20 flex flex-col justify-between ${eventCatClass} border-l-3`}
                      >
                        <div className="h-full flex flex-col justify-between">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wide truncate leading-tight flex items-center gap-1">
                              {service?.name || 'Consulta'}
                              {isCompleted && (
                                <span className="material-symbols-outlined text-[10px] font-bold text-[#548235]">check</span>
                              )}
                            </p>
                            <p className="text-[9px] opacity-80 leading-none mt-1 truncate">
                              {apt.staffName} | {apt.clientName}
                            </p>
                          </div>
                          
                          <div className="flex justify-between items-center text-[8px] opacity-75 mt-auto leading-none">
                            <span>{apt.time}</span>
                            <span className="material-symbols-outlined text-[12px]">info</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

          </div>

        </div>

      </div>

      {/* Appointment Detail Popup Overlay */}
      {selectedWeekApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-lg border border-[#efe0d4] p-6 text-left">
            <div className="flex justify-between items-center mb-5 border-b border-[#efe0d4]/40 pb-3">
              <span className="font-serif text-md font-semibold text-brand-primary">Detalhes da Consulta</span>
              <button 
                onClick={() => setSelectedWeekApt(null)}
                className="p-1 text-brand-outline hover:bg-brand-surface-variant rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs text-brand-on-background">
              <div>
                <p className="text-[10px] font-bold text-brand-outline uppercase tracking-wider mb-0.5">Cliente</p>
                <p className="font-bold text-sm text-brand-on-background">{selectedWeekApt.clientName}</p>
                <p className="text-[11px] text-brand-on-surface-variant mt-0.5">{selectedWeekApt.clientEmail} • {selectedWeekApt.clientPhone}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[#efe0d4]/30 pt-3">
                <div>
                  <p className="text-[10px] font-bold text-brand-outline uppercase tracking-wider mb-0.5">Serviço</p>
                  <p className="font-semibold">{services.find(s => s.id === selectedWeekApt.serviceId)?.name || selectedWeekApt.notes}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-brand-outline uppercase tracking-wider mb-0.5">Estética/Especialista</p>
                  <p className="font-semibold">{selectedWeekApt.staffName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[#efe0d4]/30 pt-3">
                <div>
                  <p className="text-[10px] font-bold text-brand-outline uppercase tracking-wider mb-0.5">Data &amp; Hora</p>
                  <p className="font-semibold">{selectedWeekApt.date} às {selectedWeekApt.time}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-brand-outline uppercase tracking-wider mb-0.5">Status</p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                    selectedWeekApt.status === 'completed' 
                      ? 'bg-[#e2f0d9] text-[#548235]' 
                      : selectedWeekApt.status === 'confirmed' 
                        ? 'bg-[#FADADD] text-[#b0636d]' 
                        : 'bg-brand-surface-variant text-brand-on-surface-variant'
                  }`}>
                    {selectedWeekApt.status}
                  </span>
                </div>
              </div>

              {selectedWeekApt.notes && (
                <div className="border-t border-[#efe0d4]/30 pt-3">
                  <p className="text-[10px] font-bold text-brand-outline uppercase tracking-wider mb-0.5">Observações / Notas</p>
                  <p className="text-[11px] bg-brand-surface-container-low/60 p-2 rounded border border-[#efe0d4]/50 leading-relaxed italic text-brand-on-surface-variant">
                    {selectedWeekApt.notes}
                  </p>
                </div>
              )}

              <div className="mt-6 flex gap-3 pt-3 border-t border-[#efe0d4]/40">
                <button
                  onClick={() => handleAptDelete(selectedWeekApt.id)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2 rounded-lg font-bold text-xs"
                >
                  Cancelar
                </button>
                {selectedWeekApt.status !== 'completed' && (
                  <button
                    onClick={() => handleAptComplete(selectedWeekApt.id)}
                    className="flex-1 bg-brand-primary text-white hover:bg-brand-surface-tint py-2 rounded-lg font-bold text-xs shadow-xs"
                  >
                    Concluir
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Appointment Creation Modal */}
      {showCreateAptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-[#efe0d4] p-6 text-left">
            <div className="flex justify-between items-center mb-6 border-b border-[#efe0d4]/40 pb-3">
              <h3 className="font-serif text-lg font-semibold text-brand-primary">Novo Agendamento</h3>
              <button 
                onClick={() => setShowCreateAptModal(false)}
                className="p-1 text-brand-outline hover:bg-brand-surface-variant rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddNewBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-on-surface-variant mb-1">Nome do Cliente</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Ana Sofia"
                  value={newApt.clientName}
                  onChange={e => setNewApt(prev => ({ ...prev, clientName: e.target.value }))}
                  className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-on-surface-variant mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="ana@email.com"
                    value={newApt.clientEmail}
                    onChange={e => setNewApt(prev => ({ ...prev, clientEmail: e.target.value }))}
                    className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-on-surface-variant mb-1">Telemóvel</label>
                  <input
                    type="tel"
                    placeholder="912 345 678"
                    value={newApt.clientPhone}
                    onChange={e => setNewApt(prev => ({ ...prev, clientPhone: e.target.value }))}
                    className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-on-surface-variant mb-1">Serviço da Elara</label>
                <select
                  value={newApt.serviceId}
                  onChange={e => setNewApt(prev => ({ ...prev, serviceId: e.target.value }))}
                  className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none"
                >
                  {services.map(svc => (
                    <option key={svc.id} value={svc.id}>{svc.name} (€{svc.price})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-on-surface-variant mb-1">Data</label>
                  <input
                    required
                    type="date"
                    value={newApt.date}
                    onChange={e => setNewApt(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none border-[#efe0d4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-on-surface-variant mb-1">Hora</label>
                  <input
                    required
                    type="time"
                    value={newApt.time}
                    onChange={e => setNewApt(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none border-[#efe0d4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-on-surface-variant mb-1">Estética Responsável</label>
                  <select
                    value={newApt.staffName}
                    onChange={e => setNewApt(prev => ({ ...prev, staffName: e.target.value }))}
                    className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none border-[#efe0d4]"
                  >
                    <option value="Sarah">Sarah (Estética)</option>
                    <option value="Maya">Maya (Capilar)</option>
                    <option value="Alex">Alex (Massagem)</option>
                    <option value="Elena">Elena (Consultation)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-on-surface-variant mb-1">Alergias / Notas</label>
                  <input
                    type="text"
                    placeholder="Sem amônia, pele sensível..."
                    value={newApt.notes}
                    onChange={e => setNewApt(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none border-[#efe0d4]"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-4 pt-3 border-t border-[#efe0d4]/40">
                <button
                  type="button"
                  onClick={() => setShowCreateAptModal(false)}
                  className="flex-1 py-2 rounded-lg border border-[#efe0d4] text-brand-outline font-semibold text-xs active:scale-95 transition-all text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-primary text-white py-2 rounded-lg font-semibold text-xs hover:bg-brand-surface-tint active:scale-95 transition-all text-center shadow-xs"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
