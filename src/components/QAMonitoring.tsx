import { useState, useMemo } from 'react';
import { AREAS, PECS, FORTNIGHTS, SCHOOLS, getPecMeta, getSchoolsForPec, getDayDate, PEC_SCHOOL_ACCESS } from '@/lib/data';
import { useAppState } from '@/lib/store';
import { BarChart3, School, AlertTriangle, CheckCircle2, XCircle, Clock, FileDown, Filter, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import VisitConfirmationBI from './VisitConfirmationBI';
import * as XLSX from 'xlsx';

const QA_AREA_ID = 'qualidade';

export default function QAMonitoring() {
  const { entries } = useAppState();
  const [selectedFortnight, setSelectedFortnight] = useState('');
  const [selectedPec, setSelectedPec] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');

  const qaPecs = useMemo(() => PECS.filter(p => p.area_id === QA_AREA_ID && p.active), []);
  const qaArea = AREAS.find(a => a.id === QA_AREA_ID)!;

  const qaEntries = useMemo(() =>
    entries.filter(e => e.area_id === QA_AREA_ID),
  [entries]);

  const filteredEntries = useMemo(() => {
    let result = qaEntries;
    if (selectedFortnight) result = result.filter(e => e.fortnight_id === selectedFortnight);
    if (selectedPec) result = result.filter(e => e.pec_id === selectedPec);
    if (selectedSchool) result = result.filter(e => e.school_id === selectedSchool);
    return result;
  }, [qaEntries, selectedFortnight, selectedPec, selectedSchool]);

  const visits = useMemo(() => filteredEntries.filter(e => e.activity_type === 'Visita à Escola'), [filteredEntries]);

  // Fortnights to evaluate
  const fortnightsToCheck = useMemo(() =>
    selectedFortnight
      ? FORTNIGHTS.filter(f => f.id === selectedFortnight)
      : FORTNIGHTS.filter(f => qaEntries.some(e => e.fortnight_id === f.id)),
  [selectedFortnight, qaEntries]);

  // Per-PEC monitoring data
  const pecMonitoring = useMemo(() => {
    return qaPecs.map(pec => {
      const meta = getPecMeta(pec, qaArea);
      const pecSchools = getSchoolsForPec(pec.id);
      let totalVisits = 0;
      let totalExpected = 0;
      const visitedSchoolIds = new Set<string>();
      const fortnightDetails: { fortnightId: string; label: string; visits: number; meta: number; status: string }[] = [];

      fortnightsToCheck.forEach(f => {
        const fVisits = entries.filter(
          e => e.pec_id === pec.id && e.fortnight_id === f.id && e.activity_type === 'Visita à Escola' && e.area_id === QA_AREA_ID
        );
        const count = fVisits.length;
        fVisits.forEach(v => { if (v.school_id) visitedSchoolIds.add(v.school_id); });
        const m = meta ?? 0;
        totalVisits += count;
        totalExpected += m;
        fortnightDetails.push({
          fortnightId: f.id,
          label: f.code,
          visits: count,
          meta: m,
          status: m === 0 ? '—' : count >= m ? (count > m ? 'Acima' : 'Atingida') : 'Pendente',
        });
      });

      const notVisitedSchools = pecSchools.filter(s => !visitedSchoolIds.has(s.id));
      const pct = totalExpected > 0 ? Math.round((totalVisits / totalExpected) * 100) : 0;

      return {
        pec,
        meta: meta ?? 0,
        totalVisits,
        totalExpected,
        pct,
        pending: Math.max(0, totalExpected - totalVisits),
        visitedSchoolIds,
        notVisitedSchools,
        pecSchools,
        fortnightDetails,
      };
    });
  }, [qaPecs, qaArea, fortnightsToCheck, entries]);

  // Filter by selected PEC
  const displayPecs = selectedPec ? pecMonitoring.filter(p => p.pec.id === selectedPec) : pecMonitoring;

  // Global KPIs
  const totalPecs = qaPecs.length;
  const totalVisitsGlobal = displayPecs.reduce((s, p) => s + p.totalVisits, 0);
  const totalExpectedGlobal = displayPecs.reduce((s, p) => s + p.totalExpected, 0);
  const pctGlobal = totalExpectedGlobal > 0 ? Math.round((totalVisitsGlobal / totalExpectedGlobal) * 100) : 0;

  // Visited schools in scope
  const allVisitedSchoolIds = new Set<string>();
  visits.forEach(v => { if (v.school_id) allVisitedSchoolIds.add(v.school_id); });

  // Alerts
  const pecsNoAgenda = qaPecs.filter(p => !qaEntries.some(e => e.pec_id === p.id && (selectedFortnight ? e.fortnight_id === selectedFortnight : true)));
  const pecsBelowMeta = displayPecs.filter(p => p.meta > 0 && p.totalVisits < p.totalExpected);
  const pecsAtRisk = displayPecs.filter(p => p.meta > 0 && p.pct > 0 && p.pct < 50);
  const pecsComplete = displayPecs.filter(p => p.meta > 0 && p.totalVisits >= p.totalExpected);

  // Chart data
  const chartData = displayPecs.filter(p => p.meta > 0).map(p => ({
    name: p.pec.name,
    visitas: p.totalVisits,
    meta: p.totalExpected,
    pct: p.pct,
  }));

  // Visited schools table
  const visitedSchoolsList = useMemo(() => {
    const list: { school: string; pec: string; date: string; status: string }[] = [];
    visits.forEach(v => {
      const school = SCHOOLS.find(s => s.id === v.school_id);
      const pec = PECS.find(p => p.id === v.pec_id);
      const dateRaw = getDayDate(v.day_id);
      const date = dateRaw ? dateRaw.split('-').reverse().join('/') : '—';
      list.push({
        school: school?.name || v.school_other_text || '—',
        pec: pec?.name || '—',
        date,
        status: 'Visitada',
      });
    });
    if (selectedSchool) return list.filter(l => {
      const s = SCHOOLS.find(sc => sc.name === l.school);
      return s?.id === selectedSchool;
    });
    return list;
  }, [visits, selectedSchool]);

  const exportQAExcel = () => {
    const rows = displayPecs.flatMap(p =>
      p.pecSchools.map(s => ({
        PEC: p.pec.name,
        Escola: s.name,
        'Meta Total': p.totalExpected,
        'Visitas Realizadas': p.totalVisits,
        'Cumprimento (%)': p.pct,
        Status: p.visitedSchoolIds.has(s.id) ? 'Visitada' : 'Não visitada',
      }))
    );
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'QA Monitoramento');
    XLSX.writeFile(wb, 'relatorio-pec-qualidade.xlsx');
  };

  const getBarColor = (pct: number) => pct >= 100 ? 'hsl(var(--success))' : pct >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))';

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select value={selectedFortnight} onChange={e => setSelectedFortnight(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Todas as quinzenas</option>
          {FORTNIGHTS.map(f => <option key={f.id} value={f.id}>{f.code} – {f.label}</option>)}
        </select>
        <select value={selectedPec} onChange={e => setSelectedPec(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Todos os PECs</option>
          {qaPecs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={selectedSchool} onChange={e => setSelectedSchool(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Todas as escolas</option>
          {SCHOOLS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total de PECs QA', value: totalPecs, icon: BarChart3, color: 'text-primary' },
          { label: 'Visitas Realizadas', value: totalVisitsGlobal, icon: School, color: 'text-success' },
          { label: 'Visitas Esperadas', value: totalExpectedGlobal, icon: TrendingUp, color: 'text-accent' },
          { label: 'Cumprimento Geral', value: `${pctGlobal}%`, icon: CheckCircle2, color: pctGlobal >= 100 ? 'text-success' : pctGlobal >= 50 ? 'text-warning' : 'text-destructive' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl bg-card p-4 shadow-card animate-slide-up" style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}>
            <s.icon className={`h-5 w-5 ${s.color}`} />
            <p className="mt-2 text-2xl font-bold text-card-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      {chartData.length > 0 && (
        <div className="rounded-xl bg-card shadow-card p-4">
          <h3 className="font-semibold text-card-foreground mb-3">Visitas por PEC (com meta)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value: number, name: string) => [value, name === 'visitas' ? 'Realizadas' : 'Meta']}
                />
                <Bar dataKey="meta" fill="hsl(var(--muted-foreground))" opacity={0.3} radius={[4, 4, 0, 0]} name="Meta" />
                <Bar dataKey="visitas" radius={[4, 4, 0, 0]} name="Realizadas">
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={getBarColor(entry.pct)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Monitoring Table */}
      <div className="rounded-xl bg-card shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-card-foreground">Monitoramento por PEC</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">PEC</th>
                <th className="px-4 py-2 text-center font-medium text-muted-foreground">Meta</th>
                <th className="px-4 py-2 text-center font-medium text-muted-foreground">Realizadas</th>
                <th className="px-4 py-2 text-center font-medium text-muted-foreground">Pendentes</th>
                <th className="px-4 py-2 text-center font-medium text-muted-foreground">% Cumprimento</th>
              </tr>
            </thead>
            <tbody>
              {displayPecs.map(p => {
                const statusClass = p.meta === 0 ? 'text-muted-foreground' : p.pct >= 100 ? 'text-success' : p.pct >= 50 ? 'text-warning' : 'text-destructive';
                return (
                  <tr key={p.pec.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="px-4 py-2 text-card-foreground font-medium">{p.pec.name}</td>
                    <td className="px-4 py-2 text-center text-card-foreground">{p.meta || '—'}</td>
                    <td className="px-4 py-2 text-center text-card-foreground font-semibold">{p.totalVisits}</td>
                    <td className="px-4 py-2 text-center text-card-foreground">{p.meta > 0 ? p.pending : '—'}</td>
                    <td className={`px-4 py-2 text-center font-semibold ${statusClass}`}>
                      {p.meta > 0 ? `${p.pct}%` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visited Schools */}
      {visitedSchoolsList.length > 0 && (
        <div className="rounded-xl bg-card shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-card-foreground">Escolas Visitadas ({visitedSchoolsList.length})</h3>
          </div>
          <div className="overflow-x-auto max-h-60 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/80">
                <tr className="border-b border-border">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Escola</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">PEC</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Data</th>
                  <th className="px-4 py-2 text-center font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {visitedSchoolsList.map((item, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="px-4 py-2 text-card-foreground">{item.school}</td>
                    <td className="px-4 py-2 text-card-foreground">{item.pec}</td>
                    <td className="px-4 py-2 text-card-foreground">{item.date}</td>
                    <td className="px-4 py-2 text-center">
                      <span className="inline-block rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">Visitada</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Not Visited Schools (Critical) */}
      <div className="rounded-xl bg-card shadow-card p-4">
        <h3 className="font-semibold text-card-foreground mb-3 flex items-center gap-2">
          <XCircle className="h-4 w-4 text-destructive" />
          Escolas Não Visitadas (Ponto Crítico)
        </h3>
        <div className="space-y-3">
          {displayPecs.filter(p => p.notVisitedSchools.length > 0).map(p => (
            <div key={p.pec.id} className="rounded-lg border border-border p-3">
              <p className="text-sm font-semibold text-card-foreground mb-1.5">PEC: {p.pec.name}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.notVisitedSchools.map(s => (
                  <span key={s.id} className="rounded bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {displayPecs.every(p => p.notVisitedSchools.length === 0) && (
            <p className="text-sm text-success">Todas as escolas foram visitadas!</p>
          )}
        </div>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl bg-card shadow-card p-4">
          <h3 className="font-semibold text-card-foreground mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            PECs sem Agenda ({pecsNoAgenda.length})
          </h3>
          {pecsNoAgenda.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {pecsNoAgenda.map(p => (
                <span key={p.id} className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">{p.name}</span>
              ))}
            </div>
          ) : <p className="text-xs text-success">Todos os PECs possuem agenda</p>}
        </div>

        <div className="rounded-xl bg-card shadow-card p-4">
          <h3 className="font-semibold text-card-foreground mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4 text-warning" />
            Abaixo da Meta ({pecsBelowMeta.length})
          </h3>
          {pecsBelowMeta.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {pecsBelowMeta.map(p => (
                <span key={p.pec.id} className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                  {p.pec.name} ({p.totalVisits}/{p.totalExpected})
                </span>
              ))}
            </div>
          ) : <p className="text-xs text-success">Nenhum PEC abaixo da meta</p>}
        </div>

        <div className="rounded-xl bg-card shadow-card p-4">
          <h3 className="font-semibold text-card-foreground mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Risco de não cumprir ({pecsAtRisk.length})
          </h3>
          {pecsAtRisk.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {pecsAtRisk.map(p => (
                <span key={p.pec.id} className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                  {p.pec.name} ({p.pct}%)
                </span>
              ))}
            </div>
          ) : <p className="text-xs text-success">Nenhum PEC em risco</p>}
        </div>

        <div className="rounded-xl bg-card shadow-card p-4">
          <h3 className="font-semibold text-card-foreground mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            Agenda Completa ({pecsComplete.length})
          </h3>
          {pecsComplete.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {pecsComplete.map(p => (
                <span key={p.pec.id} className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                  {p.pec.name} ✓
                </span>
              ))}
            </div>
          ) : <p className="text-xs text-muted-foreground">Nenhum PEC completou a meta ainda</p>}
        </div>
      </div>

      {/* Visit Confirmation BI */}
      <div className="rounded-xl bg-card shadow-card overflow-hidden">
        <VisitConfirmationBI entries={entries} areaId={QA_AREA_ID} selectedFortnight={selectedFortnight} />
      </div>

      {/* Export */}
      <div className="flex gap-3">
        <button onClick={exportQAExcel}
          className="flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition">
          <FileDown className="h-4 w-4" />
          Exportar relatório PEC Qualidade da Aula
        </button>
      </div>
    </div>
  );
}
