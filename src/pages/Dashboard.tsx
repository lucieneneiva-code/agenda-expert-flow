import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { AREAS, PECS, FORTNIGHTS, SCHOOLS, getPecMeta } from '@/lib/data';
import { useAppState } from '@/lib/store';
import { BarChart3, Users, School, AlertTriangle, FileDown, FileText, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function Dashboard() {
  const { entries } = useAppState();
  const [selectedFortnight, setSelectedFortnight] = useState('');

  const filteredEntries = selectedFortnight
    ? entries.filter(e => e.fortnight_id === selectedFortnight)
    : entries;

  const visits = filteredEntries.filter(e => e.activity_type === 'Visita à Escola');
  const visitedSchoolIds = new Set(visits.map(e => e.school_id).filter(Boolean));
  const totalSchools = SCHOOLS.length;
  const schoolsVisited = visitedSchoolIds.size;
  const schoolsNotVisited = totalSchools - schoolsVisited;

  // PECs without any agenda entry
  const pecsWithEntries = new Set(filteredEntries.map(e => e.pec_id));
  const pecsWithoutAgenda = PECS.filter(p => p.active && !pecsWithEntries.has(p.id));

  // PECs below meta
  const pecsBelowMeta = PECS.filter(p => {
    const area = AREAS.find(a => a.id === p.area_id);
    if (!area) return false;
    const meta = getPecMeta(p, area);
    if (meta === null) return false;
    const pecVisits = visits.filter(e => e.pec_id === p.id).length;
    return pecVisits < meta;
  });

  // Schools without visit
  const schoolsNotVisitedList = SCHOOLS.filter(s => !visitedSchoolIds.has(s.id));

  const stats = [
    { label: 'Total de Visitas', value: visits.length, icon: BarChart3, color: 'text-primary' },
    { label: 'Escolas Visitadas', value: schoolsVisited, icon: School, color: 'text-success' },
    { label: 'Escolas Não Visitadas', value: schoolsNotVisited, icon: School, color: 'text-warning' },
    { label: 'PEC sem Agenda', value: pecsWithoutAgenda.length, icon: Users, color: 'text-destructive' },
    { label: 'PEC Abaixo da Meta', value: pecsBelowMeta.length, icon: AlertTriangle, color: 'text-warning' },
  ];

  const exportExcel = () => {
    const data = filteredEntries.map(e => {
      const pec = PECS.find(p => p.id === e.pec_id);
      const area = AREAS.find(a => a.id === e.area_id);
      const school = SCHOOLS.find(s => s.id === e.school_id);
      return {
        PEC: pec?.name || '',
        Área: area?.name || '',
        Escola: school?.name || e.school_other_text || '',
        Período: e.period === 'manha' ? 'Manhã' : 'Tarde',
        Tipo: e.activity_type,
        Observação: e.observation || '',
        Pauta: e.agenda_topic || '',
        Link: e.link || '',
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Agenda');
    XLSX.writeFile(wb, 'relatorio-agenda.xlsx');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Painel da Coordenação" subtitle="Indicadores e relatórios" showBack />
      <main className="container mx-auto max-w-5xl px-4 py-6">
        {/* Filter */}
        <div className="mb-6 flex items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedFortnight}
            onChange={e => setSelectedFortnight(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Todas as quinzenas</option>
            {FORTNIGHTS.map(f => (
              <option key={f.id} value={f.id}>{f.code} – {f.label}</option>
            ))}
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 mb-6">
          {stats.map((s, i) => (
            <div
              key={i}
              className="animate-slide-up rounded-xl bg-card p-4 shadow-card"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
            >
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <p className="mt-2 text-2xl font-bold text-card-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={exportExcel}
            className="flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition"
          >
            <FileDown className="h-4 w-4" />
            Exportar Excel
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg border border-primary/30 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition"
          >
            <FileText className="h-4 w-4" />
            Gerar Relatório
          </button>
        </div>

        {/* Analytical table */}
        {filteredEntries.length > 0 && (
          <div className="mb-6 rounded-xl bg-card shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-card-foreground">Tabela Analítica</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">PEC</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Área</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Escola</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Período</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.slice(0, 50).map(e => {
                    const pec = PECS.find(p => p.id === e.pec_id);
                    const area = AREAS.find(a => a.id === e.area_id);
                    const school = SCHOOLS.find(s => s.id === e.school_id);
                    return (
                      <tr key={e.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="px-4 py-2 text-card-foreground">{pec?.name}</td>
                        <td className="px-4 py-2 text-card-foreground">{area?.name}</td>
                        <td className="px-4 py-2 text-card-foreground">{school?.name || e.school_other_text || '—'}</td>
                        <td className="px-4 py-2 text-card-foreground">{e.period === 'manha' ? 'Manhã' : 'Tarde'}</td>
                        <td className="px-4 py-2 text-card-foreground">{e.activity_type}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PECs without agenda */}
        {pecsWithoutAgenda.length > 0 && (
          <div className="mb-4 rounded-xl bg-card shadow-card p-4">
            <h3 className="font-semibold text-card-foreground mb-2">PECs sem Agenda</h3>
            <div className="flex flex-wrap gap-2">
              {pecsWithoutAgenda.map(p => (
                <span key={p.id} className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* PECs below meta */}
        {pecsBelowMeta.length > 0 && (
          <div className="mb-4 rounded-xl bg-card shadow-card p-4">
            <h3 className="font-semibold text-card-foreground mb-2">PECs Abaixo da Meta</h3>
            <div className="flex flex-wrap gap-2">
              {pecsBelowMeta.map(p => {
                const area = AREAS.find(a => a.id === p.area_id);
                const meta = area ? getPecMeta(p, area) : null;
                const v = visits.filter(e => e.pec_id === p.id).length;
                return (
                  <span key={p.id} className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                    {p.name} ({v}/{meta})
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Schools not visited */}
        {schoolsNotVisitedList.length > 0 && (
          <div className="rounded-xl bg-card shadow-card p-4">
            <h3 className="font-semibold text-card-foreground mb-2">
              Escolas sem Visita ({schoolsNotVisitedList.length})
            </h3>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
              {schoolsNotVisitedList.map(s => (
                <span key={s.id} className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
