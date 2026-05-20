import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Service, Appointment } from '../types';

interface BookingFlowProps {
  initialServiceId?: string | null;
  onClose: () => void;
}

export default function BookingFlow({ initialServiceId, onClose }: BookingFlowProps) {
  const { services, addAppointment, checkSlotOverlap, staff } = useApp();
  const [step, setStep] = useState<number>(1);
  const [selectedServices, setSelectedServices] = useState<Service[]>(() => {
    if (initialServiceId) {
      const found = services.find(s => s.id === initialServiceId);
      return found ? [found] : [];
    }
    return [];
  });
  
  // Default to October 16, 2024
  const [selectedDay, setSelectedDay] = useState<number | null>(16);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  const handleToggleService = (service: Service) => {
    setErrorMessage(null);
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleDateSelect = (day: number) => {
    setSelectedDay(day);
    setSelectedTime(null);
    setErrorMessage(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setErrorMessage(null);

    // Dynamic conflict check during selection
    if (selectedServices.length === 0) return;
    const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
    const primaryService = selectedServices[0];
    
    // Choose appropriate staff
    let staffName = 'Sarah';
    if (primaryService.category === 'hair') {
      staffName = 'Maya';
    } else if (primaryService.category === 'massage') {
      staffName = 'Alex';
    } else if (primaryService.category === 'consult') {
      staffName = 'Elena';
    }

    const formattedDate = `2024-10-${selectedDay && selectedDay < 10 ? '0' + selectedDay : selectedDay}`;
    const overlap = checkSlotOverlap(staffName, formattedDate, time, totalDuration);
    
    if (overlap) {
      setErrorMessage(`O horário das ${time} está indisponível para os serviços selecionados (${totalDuration} min no total). Outro cliente já tem um agendamento neste período.`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0 || !selectedDay || !selectedTime) return;

    const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
    const primaryService = selectedServices[0];

    // Determine staff depending on primary category
    let staffName = 'Sarah';
    if (primaryService.category === 'hair') {
      staffName = 'Maya';
    } else if (primaryService.category === 'massage') {
      staffName = 'Alex';
    } else if (primaryService.category === 'consult') {
      staffName = 'Elena';
    }

    const formattedDate = `2024-10-${selectedDay < 10 ? '0' + selectedDay : selectedDay}`;

    // Overlap check defense
    const isOverlap = checkSlotOverlap(staffName, formattedDate, selectedTime, totalDuration);
    if (isOverlap) {
      setErrorMessage(`O horário escolhido (${selectedTime}) não está disponível para a duração total deste agendamento (${totalDuration} min) devido a um conflito com outro cliente.`);
      setStep(3); // push back to select time step
      return;
    }

    const serviceNamesText = selectedServices.map(s => s.name).join(' + ');

    // Add to state
    const success = addAppointment({
      clientName: formData.name,
      clientEmail: formData.email,
      clientPhone: formData.phone,
      serviceId: primaryService.id,
      serviceIds: selectedServices.map(s => s.id),
      date: formattedDate,
      time: selectedTime,
      duration: totalDuration,
      staffName,
      status: 'confirmed',
      notes: formData.notes ? `${formData.notes} (${serviceNamesText})` : serviceNamesText
    });

    if (success) {
      setIsConfirmed(true);
    } else {
      setErrorMessage("Erro ao criar agendamento. Conflito de horário de última hora detetado.");
      setStep(3);
    }
  };

  const getStepProgressWidth = () => {
    return `${((step - 1) / 3) * 100}%`;
  };

  const totalSelectedPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalSelectedDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

  if (isConfirmed) {
    return (
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg border border-[#efe0d4] overflow-hidden text-center p-8 md:p-12">
        <div className="w-20 h-20 rounded-full bg-brand-primary-container/20 text-brand-primary flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-4xl fill">check_circle</span>
        </div>
        <h1 className="font-serif text-3xl font-semibold text-brand-primary mb-4">Agendamento Confirmado!</h1>
        <p className="text-brand-on-surface-variant max-w-md mx-auto mb-8 leading-relaxed">
          Obrigado, <strong className="text-brand-on-background">{formData.name}</strong>. O seu agendamento de <strong className="text-brand-on-background">{selectedServices.map(s => s.name).join(', ')}</strong> foi realizado com sucesso para o dia <strong className="text-brand-on-background">{selectedDay} de Outubro de 2024</strong> às <strong className="text-brand-on-background">{selectedTime}</strong>.
        </p>
        <div className="bg-brand-surface-container-low/50 p-4 rounded-lg max-w-md mx-auto mb-6 border border-[#efe0d4]/60 text-xs text-left">
          <p className="mb-1"><strong>Duração Total:</strong> {totalSelectedDuration} minutos</p>
          <p className="mb-1"><strong>Valor Total:</strong> €{totalSelectedPrice}</p>
          <p><strong>Profissional:</strong> {
            selectedServices[0]?.category === 'hair' ? 'Maya (Cabelo)' 
            : selectedServices[0]?.category === 'massage' ? 'Alex (Massagem)' 
            : selectedServices[0]?.category === 'consult' ? 'Elena (Consulta)' 
            : 'Sarah (Estética)'
          }</p>
        </div>
        <div className="border-t border-[#D2B48C]/30 pt-6 max-w-sm mx-auto">
          <button
            onClick={onClose}
            className="w-full bg-brand-primary text-white border-0 rounded-full py-3 font-semibold hover:bg-brand-surface-tint hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
          >
            Voltar para o Início
          </button>
        </div>
      </div>
    );
  }

  // Pre-configured times for demo
  const morningTimes = ['09:00 AM', '09:30 AM', '10:00 AM', '11:15 AM'];
  const afternoonTimes = ['01:00 PM', '02:30 PM', '03:45 PM', '04:30 PM'];

  return (
    <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg border border-[#efe0d4] overflow-hidden relative">
      {/* Form Header / Stepper Progress Indicator */}
      <div className="bg-[#fff1e7] px-6 py-4 md:px-8 md:py-6 border-b border-[#efe0d4]/50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left flex-1">
          <h1 className="font-serif text-2xl md:text-3xl text-brand-primary font-semibold tracking-tight">Marque a Sua Consulta</h1>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-brand-on-surface-variant hover:bg-[#efe0d4] rounded-full transition-colors self-end sm:self-center cursor-pointer"
          title="Fechar"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="bg-[#fff1e7]/40 px-6 py-4 border-b border-[#efe0d4]/30">
        <div className="flex items-center justify-between relative max-w-md mx-auto">
          {/* Progress Line Base */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#efe0d4] -z-10 -translate-y-[50%]"></div>
          {/* Progress Line Fill */}
          <div 
            className="absolute top-1/2 left-0 h-[2px] bg-brand-primary -z-10 -translate-y-[50%] transition-all duration-500"
            style={{ width: getStepProgressWidth() }}
          ></div>

          {/* Steps */}
          <div className="flex flex-col items-center gap-1 bg-transparent">
            <button 
              onClick={() => step > 1 && setStep(1)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shadow-sm transition-all cursor-pointer ${
                step >= 1 ? 'bg-brand-primary text-white' : 'bg-[#efe0d4] text-brand-on-surface-variant'
              }`}
            >
              1
            </button>
            <span className="text-[11px] font-semibold text-brand-on-surface-variant">Serviços</span>
          </div>

          <div className="flex flex-col items-center gap-1 bg-transparent">
            <button 
              onClick={() => step > 2 && setStep(2)}
              disabled={step < 2}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shadow-sm transition-all cursor-pointer ${
                step >= 2 ? 'bg-brand-primary text-white' : 'bg-[#efe0d4] text-brand-on-surface-variant'
              } disabled:opacity-55 disabled:cursor-not-allowed`}
            >
              2
            </button>
            <span className="text-[11px] font-semibold text-brand-on-surface-variant">Data</span>
          </div>

          <div className="flex flex-col items-center gap-1 bg-transparent">
            <button 
              onClick={() => step > 3 && setStep(3)}
              disabled={step < 3 || selectedServices.length === 0}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shadow-sm transition-all cursor-pointer ${
                step >= 3 ? 'bg-brand-primary text-white' : 'bg-[#efe0d4] text-brand-on-surface-variant'
              } disabled:opacity-55 disabled:cursor-not-allowed`}
            >
              3
            </button>
            <span className="text-[11px] font-semibold text-brand-on-surface-variant">Hora</span>
          </div>

          <div className="flex flex-col items-center gap-1 bg-transparent">
            <span 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shadow-sm transition-all ${
                step >= 4 ? 'bg-brand-primary text-white' : 'bg-[#efe0d4] text-brand-on-surface-variant'
              }`}
            >
              4
            </span>
            <span className="text-[11px] font-semibold text-brand-on-surface-variant">Confirmar</span>
          </div>
        </div>
      </div>

      {/* Steps Container */}
      <div className="p-6 md:p-8 min-h-[420px] flex flex-col justify-between">
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-lg animate-pulse flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Choose Services (Multiple selection supported!) */}
        {step === 1 && (
          <div className="w-full">
            <h2 className="font-serif text-xl md:text-2xl text-brand-on-background mb-1 text-center font-medium">Selecione um ou mais Serviços</h2>
            <p className="text-[11px] text-brand-on-surface-variant text-center mb-6">Pode realizar múltiplos tratamentos no mesmo agendamento.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto p-1">
              {services.map(service => {
                const isSelected = selectedServices.some(s => s.id === service.id);
                return (
                  <button
                    key={service.id}
                    onClick={() => handleToggleService(service)}
                    type="button"
                    className={`group relative flex items-start gap-4 p-4 rounded-lg border text-left cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? 'border-brand-primary bg-brand-surface-container-low shadow-sm ring-1 ring-brand-primary'
                        : 'border-brand-outline-variant/50 hover:border-brand-primary bg-white hover:bg-[#fff7f2]'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-brand-primary/20' : 'bg-brand-surface-container group-hover:bg-brand-primary/20'
                    }`}>
                      <span className="material-symbols-outlined text-brand-primary">{service.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-brand-on-background group-hover:text-brand-primary text-xs transition-colors truncate">
                          {service.name}
                        </h3>
                        {isSelected && (
                          <span className="material-symbols-outlined text-brand-primary text-[16px] font-bold">check_box</span>
                        )}
                      </div>
                      <p className="text-[10px] text-brand-on-surface-variant leading-relaxed line-clamp-2 mt-0.5">
                        {service.description}
                      </p>
                      <span className="text-[11px] font-bold text-brand-secondary block mt-2">
                        {service.duration} min • €{service.price}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selection bottom bar */}
            <div className="mt-6 pt-4 border-t border-[#efe0d4]/40 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-center sm:text-left">
                <p className="text-xs text-brand-on-surface-variant">
                  Selecionados: <strong className="text-brand-primary text-sm font-serif">{selectedServices.length}</strong> tratamento(s)
                </p>
                {selectedServices.length > 0 && (
                  <p className="text-[10px] text-brand-outline font-semibold uppercase tracking-wider">
                    Total: {totalSelectedDuration} min • €{totalSelectedPrice}
                  </p>
                )}
              </div>
              <button
                type="button"
                disabled={selectedServices.length === 0}
                onClick={() => setStep(2)}
                className={`w-full sm:w-auto px-8 py-2.5 rounded-full text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm ${
                  selectedServices.length > 0 
                    ? 'bg-brand-primary hover:bg-brand-surface-tint active:scale-97 cursor-pointer' 
                    : 'bg-brand-outline-variant/50 cursor-not-allowed opacity-50'
                }`}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Choose Date */}
        {step === 2 && (
          <div className="w-full">
            <h2 className="font-serif text-xl md:text-2xl text-brand-on-background mb-4 text-center">Selecione o Dia</h2>
            <div className="max-w-md mx-auto bg-white p-4 rounded-xl border border-brand-outline-variant/30">
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="material-symbols-outlined text-brand-outline cursor-not-allowed">chevron_left</span>
                <span className="font-semibold text-brand-on-background">Outubro 2024</span>
                <span className="material-symbols-outlined text-brand-outline cursor-not-allowed">chevron_right</span>
              </div>
              
              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                  <span key={i} className="text-xs font-semibold text-brand-on-surface-variant/60">{day}</span>
                ))}
              </div>

              {/* Calendar Days Oct 2024 */}
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                <div className="py-2 opacity-0"></div>
                <div className="py-2 opacity-0"></div>

                {Array.from({ length: 31 }, (_, i) => {
                  const dayNum = i + 1;
                  const isPast = dayNum < 14; 
                  const isSelected = selectedDay === dayNum;

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      disabled={isPast}
                      onClick={() => handleDateSelect(dayNum)}
                      className={`py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-brand-primary text-white scale-110 shadow-sm font-bold'
                          : isPast 
                            ? 'text-brand-on-surface-variant/20 cursor-not-allowed'
                            : 'hover:bg-brand-surface-container text-brand-on-background hover:scale-105'
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2 rounded-full border border-brand-outline-variant text-brand-on-surface-variant font-semibold hover:bg-[#fff1e7] active:scale-95 transition-all text-xs cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2 rounded-full bg-brand-primary text-white font-semibold hover:bg-brand-surface-tint active:scale-95 transition-all text-xs shadow-sm cursor-pointer"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Choose Time with Overlap and Duration Warning */}
        {step === 3 && (
          <div className="w-full">
            <h2 className="font-serif text-xl md:text-2xl text-brand-on-background mb-2 text-center">
              Horários Disponíveis (Out {selectedDay}, 2024)
            </h2>
            <p className="text-[11px] text-brand-on-surface-variant text-center mb-6">
              O agendamento requer um bloco livre consecutivo de <strong className="text-brand-primary">{totalSelectedDuration} min</strong>.
            </p>
            
            <div className="max-w-xl mx-auto space-y-6">
              <div>
                <h3 className="text-xs uppercase tracking-wider font-bold text-brand-outline mb-2 border-b border-[#efe0d4]/40 pb-1">Período da Manhã</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {morningTimes.map(time => {
                    // Extract clean HH:MM string to map
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        onClick={() => handleTimeSelect(time)}
                        type="button"
                        className={`py-2.5 px-2 border rounded text-xs text-center font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-brand-primary text-white border-brand-primary shadow-sm scale-103'
                            : 'border-brand-outline-variant/40 hover:border-brand-primary hover:bg-[#fffaf6] text-brand-on-background bg-white'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-wider font-bold text-brand-outline mb-2 border-b border-[#efe0d4]/40 pb-1">Período da Tarde</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {afternoonTimes.map(time => {
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        onClick={() => handleTimeSelect(time)}
                        type="button"
                        className={`py-2.5 px-2 border rounded text-xs text-center font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-brand-primary text-white border-brand-primary shadow-sm scale-103'
                            : 'border-brand-outline-variant/40 hover:border-brand-primary hover:bg-[#fffaf6] text-brand-on-background bg-white'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between max-w-xl mx-auto">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2 rounded-full border border-brand-outline-variant text-brand-on-surface-variant font-semibold hover:bg-[#fff1e7] active:scale-95 transition-all text-xs cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={!selectedTime || !!errorMessage}
                onClick={() => setStep(4)}
                className={`px-6 py-2 rounded-full bg-brand-primary text-white font-semibold transition-all text-xs shadow-sm ${
                  selectedTime && !errorMessage ? 'hover:bg-brand-surface-tint active:scale-95 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Personal Info & Confirm */}
        {step === 4 && (
          <div className="w-full">
            <h2 className="font-serif text-xl md:text-2xl text-brand-on-background mb-4 text-center">Confirmar o Agendamento</h2>
            
            <div className="max-w-xl mx-auto flex flex-col md:flex-row gap-6">
              {/* Summary card */}
              <div className="md:w-1/3 bg-[#fff1e7]/80 p-4 rounded-lg border border-[#efe0d4] h-fit shrink-0">
                <h3 className="text-[10px] uppercase tracking-widest font-extrabold text-brand-primary mb-3">Serviços ({selectedServices.length})</h3>
                
                <div className="max-h-[150px] overflow-y-auto space-y-2 mb-3 border-b border-[#D2B48C]/20 pb-3">
                  {selectedServices.map(s => (
                    <div key={s.id} className="text-left">
                      <p className="text-[11px] font-bold text-brand-on-background truncate" title={s.name}>• {s.name}</p>
                      <p className="text-[10px] text-brand-on-surface-variant pl-2 font-mono">{s.duration} min • €{s.price}</p>
                    </div>
                  ))}
                </div>

                <ul className="space-y-3 text-xs text-brand-on-surface-variant">
                  <li className="flex justify-between border-b border-[#D2B48C]/20 pb-1.5">
                    <span>Data:</span> 
                    <span className="font-bold text-brand-on-background">{selectedDay}/10/2024</span>
                  </li>
                  <li className="flex justify-between border-b border-[#D2B48C]/20 pb-1.5">
                    <span>Hora:</span> 
                    <span className="font-bold text-brand-on-background">{selectedTime}</span>
                  </li>
                  <li className="flex justify-between border-b border-[#D2B48C]/20 pb-1.5">
                    <span>Duração:</span> 
                    <span className="font-bold text-brand-on-background">{totalSelectedDuration} min</span>
                  </li>
                  <li className="flex justify-between pt-2 text-sm font-bold">
                    <span className="text-brand-on-background">Total:</span> 
                    <span className="text-brand-primary font-serif font-bold text-sm">€{totalSelectedPrice}</span>
                  </li>
                </ul>
              </div>

              {/* Personal Details Form */}
              <form onSubmit={handleConfirmBooking} className="md:w-2/3 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-on-surface-variant mb-1" htmlFor="name">
                    Nome Completo
                  </label>
                  <input
                    required
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Clara Lima"
                    className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs text-brand-on-background placeholder-brand-outline-variant focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-on-surface-variant mb-1" htmlFor="email">
                      E-mail
                    </label>
                    <input
                      required
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Ex: clara.lima@email.pt"
                      className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs text-brand-on-background placeholder-brand-outline-variant focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-on-surface-variant mb-1" htmlFor="phone">
                      Telemóvel
                    </label>
                    <input
                      required
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Ex: 912 345 678"
                      className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-2 text-xs text-brand-on-background placeholder-brand-outline-variant focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-on-surface-variant mb-1" htmlFor="notes">
                    Notas de preferência / Detalhes de pele ou cabelo
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Ex: Prefiro verniz nude, pele seca e sensível..."
                    className="w-full bg-white border border-[#efe0d4] rounded-md px-3 py-1.5 text-xs text-brand-on-background placeholder-brand-outline-variant focus:ring-4 focus:ring-brand-primary-container/20 focus:border-brand-primary outline-none resize-none transition-all"
                  />
                </div>

                <div className="mt-6 flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-5 py-2 rounded-full border border-brand-outline-variant text-brand-on-surface-variant font-semibold hover:bg-[#fff1e7] active:scale-95 transition-all text-xs cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-full bg-brand-primary text-white font-semibold hover:bg-brand-surface-tint active:scale-[0.98] transition-all text-xs shadow-md cursor-pointer"
                  >
                    Confirmar Agendamento
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
