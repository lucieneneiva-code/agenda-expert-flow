import { useState } from 'react';
import Header from '@/components/Header';
import { AREAS, PECS, FORTNIGHTS, SCHOOLS, getPecMeta, getDayDate } from '@/lib/data';
import { useAppState } from '@/lib/store';
import { format } from 'date-fns';
import { BarChart3, Users, School, AlertTriangle, FileDown, FileText, Filter, Loader2, Lock, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import * as XLSX from 'xlsx';

const COORD_PASSWORD = 'Gata@9237';

export default function Dashboard() {
  const { entries, loading, deleteEntry } = useAppState();
  const [selectedFortnight, setSelectedFortnight] = useState('');
  const [authenticated, setAuthenticated] = useState(() => {
    return sessionStorage.getItem('coord_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === COORD_PASSWORD) {
      setAuthenticated(true);
      setPasswordError('');
      sessionStorage.setItem('coord_auth', 'true');
    } else {
      setPasswordError('Senha incorreta. Tente novamente.');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Painel da Coordenação" subtitle="Acesso restrito" showBack />
        <main className="container mx-auto max-w-sm px-4 py-12">
          <div className="rounded-xl bg-card p-6 shadow-card text-center">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-card-foreground mb-1">Área Restrita</h2>
            <p className="text-sm text-muted-foreground mb-5">Digite a senha para acessar o painel</p>
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <input
                type="password"
                value={passwordInput}
                onChange={e => { setPasswordInput(e.target.value); setPasswordError(''); }}
                placeholder="Senha de acesso"
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
              <button
                type="submit"
                className="w-full rounded-lg gradient-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition"
              >
                Acessar Painel
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Painel da Coordenação" subtitle="Indicadores e relatórios" showBack />
        <main className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  const filteredEntries = selectedFortnight
    ? entries.filter(e => e.fortnight_id === selectedFortnight)
    : entries;

  const visits = filteredEntries.filter(e => e.activity_type === 'Visita à Escola');
  const visitedSchoolIds = new Set(visits.map(e => e.school_id).filter(Boolean));
  const totalSchools = SCHOOLS.length;
  const schoolsVisited = visitedSchoolIds.size;
  const schoolsNotVisited = totalSchools - schoolsVisited;

  const pecsWithEntries = new Set(filteredEntries.map(e => e.pec_id));
  const pecsWithoutAgenda = PECS.filter(p => p.active && !pecsWithEntries.has(p.id));

  const pecsBelowMeta = PECS.filter(p => {
    const area = AREAS.find(a => a.id === p.area_id);
    if (!area) return false;
    const meta = getPecMeta(p, area);
    if (meta === null) return false;
    const pecVisits = visits.filter(e => e.pec_id === p.id).length;
    return pecVisits < meta;
  });

  const schoolsNotVisitedList = SCHOOLS.filter(s => !visitedSchoolIds.has(s.id));

  const totalActions = filteredEntries.length;

  const stats = [
    { label: 'Total de Visitas', value: visits.length, icon: BarChart3, color: 'text-primary' },
    { label: 'Total de Ações', value: totalActions, icon: BarChart3, color: 'text-accent' },
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
        Tipo: e.activity_type === 'Outros' && e.type_other_text ? e.type_other_text : e.activity_type,
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 mb-6">
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
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Data da Ação</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Tipo</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Preenchido em</th>
                    <th className="px-4 py-2 text-center font-medium text-muted-foreground">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.slice(0, 50).map(e => {
                    const pec = PECS.find(p => p.id === e.pec_id);
                    const area = AREAS.find(a => a.id === e.area_id);
                    const school = SCHOOLS.find(s => s.id === e.school_id);
                    const createdDate = e.created_at ? format(new Date(e.created_at), 'dd/MM/yyyy') : '—';
                    const actionDateRaw = getDayDate(e.day_id);
                    const actionDate = actionDateRaw ? actionDateRaw.split('-').reverse().join('/') : '—';
                    const createdTime = e.created_at ? format(new Date(e.created_at), 'HH:mm') : '';
                    return (
                      <tr key={e.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="px-4 py-2 text-card-foreground">{pec?.name}</td>
                        <td className="px-4 py-2 text-card-foreground">{area?.name}</td>
                        <td className="px-4 py-2 text-card-foreground">{school?.name || e.school_other_text || '—'}</td>
                        <td className="px-4 py-2 text-card-foreground">{e.period === 'manha' ? 'Manhã' : 'Tarde'}</td>
                        <td className="px-4 py-2 text-card-foreground">{e.activity_type === 'Outros' && e.type_other_text ? e.type_other_text : e.activity_type}</td>
                        <td className="px-4 py-2 text-muted-foreground text-xs whitespace-nowrap">{createdDate}{createdTime ? ` às ${createdTime}` : ''}</td>
                        <td className="px-4 py-2 text-center">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="inline-flex items-center justify-center rounded p-1 text-destructive hover:bg-destructive/10 transition" title="Apagar agendamento">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Apagar agendamento</AlertDialogTitle>
                                <AlertDialogDescription>Deseja realmente apagar este agendamento? Esta ação não pode ser desfeita.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteEntry(e.id)}>Apagar</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
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
