import React, { useState } from 'react';
import { useApp } from '../AppContext';

export default function AdminAnalytics() {
  const { appointments, services, staff, clients } = useApp();
  const [activeSegment, setActiveSegment] = useState<'all' | 'nails' | 'skincare' | 'hair'>('all');

  // Appointment revenue calculator helper
  const calculateAptRevenue = (apt: typeof appointments[0]) => {
    if (apt.serviceIds && apt.serviceIds.length > 0) {
      return apt.serviceIds.reduce((sum, sId) => {
        const s = services.find(srv => srv.id === sId);
        return sum + (s ? s.price : 0);
      }, 0);
    }
    const s = services.find(srv => srv.id === apt.serviceId);
    return s ? s.price : 45;
  };

  // 1. Gather confirmed & completed bookings for calculations
  const qualifyingApts = appointments.filter(
    apt => apt.status === 'confirmed' || apt.status === 'completed'
  );

  const completedAptsCount = appointments.filter(apt => apt.status === 'completed').length;
  const pendingAptsCount = appointments.filter(apt => apt.status === 'pending').length;

  // 2. Financial Logic (Dynamic + Baseline Setup)
  const BASELINE_REVENUE = 11500;
  const COMMISSION_RATE = 0.40;

  const dynamicBookingsGross = qualifyingApts.reduce((sum, apt) => sum + calculateAptRevenue(apt), 0);
  
  // Overall Gross Revenue (Baseline + Live dynamic sales)
  const totalSaloonGross = BASELINE_REVENUE + dynamicBookingsGross;

  // Overall Staff Payouts (Baseline €4,600 [40% of €11,500] + 40% of dynamic live sales)
  const totalStaffPayouts = (BASELINE_REVENUE * COMMISSION_RATE) + (dynamicBookingsGross * COMMISSION_RATE);

  // Overall Studio Net Profit (60% retained share)
  const netStudioProfit = totalSaloonGross - totalStaffPayouts;

  const totalRegisteredClients = 835 + Array.from(new Set(appointments.map(a => a.clientEmail))).length;
  const averageTicket = qualifyingApts.length > 0 ? (dynamicBookingsGross / qualifyingApts.length) : 58.50;

  // 3. Category revenue computation
  const categoryRevenue: Record<string, number> = {
    nails: 2850,
    skincare: 4200,
    hair: 3100,
    massage: 2150,
    consult: 700
  };

  // Add the dynamic bookings categorizations securely
  qualifyingApts.forEach(apt => {
    const s = services.find(srv => srv.id === apt.serviceId);
    const cat = s?.category || 'nails';
    const price = calculateAptRevenue(apt);
    categoryRevenue[cat] = (categoryRevenue[cat] || 0) + price;
  });

  const categoryLabels: Record<string, string> = {
    nails: 'Gestão de Unhas / Nails',
    skincare: 'Estética / Rosto',
    hair: 'Design Capilar / Cabelo',
    massage: 'Massagens / Relax',
    consult: 'Consultadoria Estética'
  };

  const categoryColors: Record<string, string> = {
    nails: 'bg-amber-700',
    skincare: 'bg-emerald-700',
    hair: 'bg-rose-700',
    massage: 'bg-indigo-700',
    consult: 'bg-sky-700'
  };

  const categoryTotal = Object.values(categoryRevenue).reduce((sum, v) => sum + v, 0);

  // 4. Staff Performance Rankings with relative horizontal weights
  const staffStats = staff.map(member => {
    const memberApts = appointments.filter(
      apt => apt.staffName.toLowerCase() === member.name.toLowerCase() && 
            (apt.status === 'confirmed' || apt.status === 'completed')
    );

    const gross = memberApts.reduce((sum, a) => sum + calculateAptRevenue(a), 0);
    const commission = gross * COMMISSION_RATE;

    return {
      id: member.id,
      name: member.name,
      category: member.category || 'nails',
      count: memberApts.length,
      gross,
      commission
    };
  }).sort((a, b) => b.gross - a.gross);

  const maxStaffGross = Math.max(...staffStats.map(s => s.gross), 1);

  // 5. Growth Timeline (Jan -> Jun)
  const monthlyTimeline = [
    { label: 'Jan', revenue: 9800, staffPayout: 9800 * 0.40 },
    { label: 'Fev', revenue: 10400, staffPayout: 10400 * 0.40 },
    { label: 'Mar', revenue: 11200, staffPayout: 11200 * 0.40 },
    { label: 'Abr', revenue: 10900, staffPayout: 10900 * 0.40 },
    { label: 'Mai', revenue: 11500, staffPayout: 11500 * 0.40 },
    { label: 'Jun', revenue: totalSaloonGross, staffPayout: totalStaffPayouts }
  ];

  const maxMonthlyVal = Math.max(...monthlyTimeline.map(m => m.revenue), 15000);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Introduction Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#efe0d4]/45 pb-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest text-brand-primary uppercase block mb-1">INTELIGÊNCIA DE NEGÓCIOS</span>
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-brand-primary">Módulo de Analytics & Finanças</h2>
          <p className="text-xs text-brand-on-surface-variant mt-0.5">Visão unificada das finanças de Lisboa: Faturação geral, comissão devida à staff e rentabilidade líquida.</p>
        </div>
        <div className="text-xs font-mono font-medium text-brand-primary bg-[#faebdf] px-3.5 py-2 rounded-lg border border-[#efe0d4] flex items-center gap-1.5 shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
          Conexão Ativa com Base de Agendamentos
        </div>
      </div>

      {/* Main KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 - Total Revenue */}
        <div className="bg-white p-5 rounded-xl border border-[#efe0d4] shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-brand-primary-container/5 rounded-bl-full"></div>
          <div>
            <span className="text-brand-outline font-extrabold text-[10px] tracking-wider uppercase">Faturação Bruta Total</span>
            <p className="text-[10px] text-brand-on-surface-variant mt-0.5 font-medium">Histórico + Reservas June</p>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-serif font-extrabold text-brand-on-background font-mono">
              €{totalSaloonGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="text-[10px] text-brand-secondary font-bold flex items-center gap-0.5 mt-0.5">
              <span className="material-symbols-outlined text-[13px]">trending_up</span>
              Estimativas e vendas acumuladas
            </span>
          </div>
        </div>

        {/* KPI 2 - Staff payout total */}
        <div className="bg-white p-5 rounded-xl border border-[#efe0d4] shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-55/40 rounded-bl-full"></div>
          <div>
            <span className="text-brand-outline font-extrabold text-[10px] tracking-wider uppercase font-semibold text-amber-900">Encargo Total de Comissão (40%)</span>
            <p className="text-[10px] text-brand-on-surface-variant mt-0.5 font-medium">Repassado aos Profissionais</p>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-serif font-extrabold text-amber-800 font-mono">
              €{totalStaffPayouts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="text-[10px] text-brand-on-surface-variant mt-0.5 block">Transferências para {staff.length} colaboradores</span>
          </div>
        </div>

        {/* KPI 3 - Net Margin Studio profit */}
        <div className="bg-white p-5 rounded-xl border border-[#efe0d4] shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-55/40 rounded-bl-full"></div>
          <div>
            <span className="text-brand-outline font-extrabold text-[10px] tracking-wider uppercase font-semibold text-emerald-950">Lucro Retido Líquido (60%)</span>
            <p className="text-[10px] text-brand-on-surface-variant mt-0.5 font-medium">Balanço Líquido do Salão</p>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-serif font-extrabold text-[#2a553e] font-mono">
              €{netStudioProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="text-[10px] text-[#2a553e] font-bold flex items-center gap-0.5 mt-0.5">
              <span className="material-symbols-outlined text-[13px]">verified_user</span>
              Margem livre operacional estável
            </span>
          </div>
        </div>

        {/* KPI 4 - Average visits and counts */}
        <div className="bg-white p-5 rounded-xl border border-[#efe0d4] shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-brand-primary-container/5 rounded-bl-full"></div>
          <div>
            <span className="text-brand-outline font-extrabold text-[10px] tracking-wider uppercase font-semibold">Tamanho da Operação</span>
            <p className="text-[10px] text-brand-on-surface-variant mt-0.5 font-medium">Clientes & Consultas de Lisboa</p>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-serif font-bold text-brand-on-background font-mono">
              {totalRegisteredClients} Clientes
            </h3>
            <span className="text-[10px] text-brand-on-surface-variant mt-0.5 block font-medium">
              🎟️ Média por Consulta: <strong>€{averageTicket.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Revenue Growth SVG timeline + Specialty Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Studio Growth SVG Area Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#efe0d4] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4 pb-2 border-b border-[#efe0d4]/30">
              <div>
                <h3 className="font-serif text-md lg:text-lg text-brand-primary font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined">analytics</span>
                  Trajetória Comercial do Estúdio (Janeiro a Junho)
                </h3>
                <p className="text-[10px] text-brand-outline mt-0.5">Comparativo do Faturamento Bruto total vs. Investimento de Comissões da Staff.</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold select-none">
                <span className="flex items-center gap-1 text-brand-primary">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-primary block"></span>
                  Bruto Salão
                </span>
                <span className="flex items-center gap-1 text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600 block"></span>
                  Ganhos Staff
                </span>
              </div>
            </div>

            {/* SVG line and area layout */}
            <div className="h-60 w-full relative flex items-end pt-4">
              
              {/* Guidelines */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-[#efe0d4]/25 border-t border-dashed"></div>
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[#efe0d4]/20 border-t border-dashed"></div>
              
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="saloonGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ac6c4b" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#ac6c4b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Draw Areas for gross saloon and staff commission payouts */}
                {(() => {
                  const pointsCount = monthlyTimeline.length;

                  // High-quality lines plotting
                  const saloonPathPts = monthlyTimeline.map((m, idx) => {
                    const x = (idx / (pointsCount - 1)) * 100;
                    const y = 100 - ((m.revenue / maxMonthlyVal) * 80);
                    return `${x}%,${y}%`;
                  });

                  const staffPathPts = monthlyTimeline.map((m, idx) => {
                    const x = (idx / (pointsCount - 1)) * 100;
                    const y = 100 - ((m.staffPayout / maxMonthlyVal) * 80);
                    return `${x}%,${y}%`;
                  });

                  return (
                    <>
                      {/* Saloon Area */}
                      <polygon
                        points={`0%,100% ${saloonPathPts.join(' ')} 100%,100%`}
                        style={{ transformBox: 'fill-box', fill: 'url(#saloonGlow)' }}
                      />

                      {/* Saloon curve line */}
                      <polyline
                        fill="none"
                        stroke="#ac6c4b"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={saloonPathPts.map(p => p.replace(/%/g, '')).join(' ')}
                      />

                      {/* Staff curve line */}
                      <polyline
                        fill="none"
                        stroke="#b45309"
                        strokeWidth="2"
                        strokeDasharray="4 3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={staffPathPts.map(p => p.replace(/%/g, '')).join(' ')}
                      />
                    </>
                  );
                })()}
              </svg>

              {/* Bottom Labels Row */}
              <div className="absolute left-0 right-0 -bottom-6 flex justify-between pr-2 border-t border-[#efe0d4]/40 pt-2 font-mono">
                {monthlyTimeline.map((m, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="text-[10px] font-extrabold text-brand-on-background block">{m.label}</span>
                    <span className="text-[9.5px] font-bold text-brand-primary block">€{Math.round(m.revenue).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Category Performance Breakdown */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#efe0d4] shadow-xs space-y-4">
          <div>
            <h3 className="font-serif text-md lg:text-lg text-brand-primary font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined">pie_chart</span>
              Menu de Faturação por Categoria
            </h3>
            <p className="text-[10px] text-brand-outline mt-0.5">Proporção individual de rendimento bruto do salão.</p>
          </div>

          <div className="space-y-3.5 pr-1 max-h-[300px] overflow-y-auto">
            {Object.entries(categoryRevenue).map(([cat, val]) => {
              const proportion = Math.round((val / (categoryTotal || 1)) * 100);
              const color = categoryColors[cat] || 'bg-brand-primary';

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-brand-on-background line-clamp-1">{categoryLabels[cat] || cat}</span>
                    <strong className="text-brand-primary font-mono font-bold">{proportion}%</strong>
                  </div>
                  
                  {/* Progress segment indicator */}
                  <div className="h-2 w-full bg-[#faebdf] rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${color} rounded-full transition-all duration-700`}
                      style={{ width: `${proportion}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-[9px] font-mono text-brand-outline">
                    <span>Bruto: €{val.toLocaleString()}</span>
                    <span className="text-brand-primary">Payout Proporcional: €{(val * COMMISSION_RATE).toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Staff Financials Matrix Ranking with Relative bars */}
      <div className="bg-white rounded-2xl border border-[#efe0d4] p-5 shadow-xs">
        <div className="border-b border-[#efe0d4]/45 pb-3 mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h3 className="font-serif text-lg font-bold text-brand-primary flex items-center gap-2">
              <span className="material-symbols-outlined">query_stats</span>
              Tabela de Rankings, Comissões & Eficiência da Staff ({staff.length} Membros)
            </h3>
            <p className="text-[11.5px] text-brand-on-surface-variant mt-0.5">Lista de rentabilidade individual gerada por cada membro de Staff e margem retida líquida do salão.</p>
          </div>
          <span className="self-start sm:self-auto text-[9.5px] uppercase font-bold tracking-widest text-brand-primary bg-[#faebdf] px-3.5 py-1 rounded-full border border-brand-primary/10 select-none">Comissão Estável (40%)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-brand-on-background">
            <thead>
              <tr className="bg-brand-background/50 border-b border-[#efe0d4]/55 uppercase text-[9.5px] font-extrabold text-brand-outline select-none">
                <th className="py-2.5 px-3">Profissional</th>
                <th className="py-2.5 px-3">Categoria Principal</th>
                <th className="py-2.5 px-3 text-center">Consultas Atendidas (Sessões)</th>
                <th className="py-2.5 px-3 text-right">Faturação Bruta Gerada</th>
                <th className="py-2.5 px-3 text-right text-amber-700">Comissão Staff (40%)</th>
                <th className="py-2.5 px-3 text-right text-emerald-800">Lucro Conservado Estúdio (60%)</th>
                <th className="py-2.5 px-3 text-center w-1/5">Nível de Faturação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efe0d4]/20">
              {staffStats.map((member, index) => {
                const efficiencyPercent = maxStaffGross > 0 ? Math.round((member.gross / maxStaffGross) * 100) : 0;
                const salonShare = member.gross * (1 - COMMISSION_RATE);

                return (
                  <tr key={member.id} className="hover:bg-brand-background/20 transition-all">
                    {/* Member name */}
                    <td className="py-3 px-3 flex items-center gap-2.5 font-bold text-brand-on-background">
                      <div className="w-7 h-7 bg-brand-primary text-white font-serif rounded-full flex items-center justify-center text-[11px] font-bold uppercase shrink-0 select-none shadow-xs">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <span>{member.name}</span>
                        {index === 0 && <span className="block text-[9px] uppercase tracking-wider font-extrabold text-[#386b52] font-semibold">★ Maior Faturador</span>}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 capitalize font-medium text-brand-outline">
                      {member.category === 'hair' ? 'Cabelo' 
                        : member.category === 'skincare' ? 'Estética' 
                        : member.category === 'massage' ? 'Massagem' 
                        : member.category === 'consult' ? 'Consulta' 
                        : 'Unhas'}
                    </td>

                    {/* Bookings Count */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-brand-on-background">
                      {member.count}
                    </td>

                    {/* Gross Earnings */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-brand-on-background">
                      €{member.gross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Staff Payout */}
                    <td className="py-3 px-3 text-right font-mono text-amber-900 font-bold">
                      €{member.commission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Salon Retained Margin */}
                    <td className="py-3 px-3 text-right font-mono text-[#2a553e] font-extrabold">
                      €{salonShare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Efficiency progress bar */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-24 bg-[#faebdf] h-1.5 rounded-full overflow-hidden shrink-0">
                          <div 
                            className="bg-brand-primary h-full rounded-full transition-all duration-500"
                            style={{ width: `${efficiencyPercent}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-brand-outline shrink-0">{efficiencyPercent}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
