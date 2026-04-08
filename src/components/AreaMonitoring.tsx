import { useState, useMemo } from 'react';
import { AREAS, PECS, FORTNIGHTS, SCHOOLS, getSchoolsForPec, getDayDate } from '@/lib/data';
import { useAppState } from '@/lib/store';
import { BarChart3, School, AlertTriangle, CheckCircle2, XCircle, Filter, TrendingUp, FileDown, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import * as XLSX from 'xlsx';

const PIE_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
  'hsl(var(--accent))',
  'hsl(210, 70%, 50%)',
  'hsl(280, 60%, 55%)',
  'hsl(var(--muted-foreground))',
];

interface AreaMonitoringProps {
  areaId: string;
  areaLabel: string;
  /** If true, show year-based "not visited" instead of fortnight-based */
  yearBasedCoverage?: boolean;
  /** If true, show cross-PEC conflict detection */
  showConflicts?: boolean;
}

export default function AreaMonitoring({ areaId, areaLabel, yearBasedCoverage, showConflicts }: AreaMonitoringProps) {
  const { entries } = useAppState();
  const [selectedFortnight, setSelectedFortnight] = useState('');
  const [selectedPec, setSelectedPec] = useState('');
  const [selectedActionType, setSelectedActionType] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');

  const areaPecs = useMemo(() => PECS.filter(p => p.area_id === areaId && p.active), [areaId]);
  const areaEntries = useMemo(() => entries.filter(e => e.area_id === areaId), [entries, areaId]);

  const filteredEntries = useMemo(() => {
    let result = areaEntries;
    if (selectedFortnight) result = result.filter(e => e.fortnight_id === selectedFortnight);
    if (selectedPec) result = result.filter(e => e.pec_id === selectedPec);
    if (selectedActionType) result = result.filter(e => e.activity_type === selectedActionType);
    if (selectedSchool) result = result.filter(e => e.school_id === selectedSchool);
    return result;
  }, [areaEntries, selectedFortnight, selectedPec, selectedActionType, selectedSchool]);

  // Per-PEC monitoring
  const pecMonitoring = useMemo(() => {
    const pecsToShow = selectedPec ? areaPecs.filter(p => p.id === selectedPec) : areaPecs;
    return pecsToShow.map(pec => {
      const pecEntries = filteredEntries.filter(e => e.pec_id === pec.id);
      const visits = pecEntries.filter(e => e.activity_type === 'Visita à Escola').length;
      const schoolsAttended = new Set(pecEntries.map(e => e.school_id).filter(Boolean)).size;
      return { pec, total: pecEntries.length, visits, schoolsAttended };
    });
  }, [areaPecs, filteredEntries, selectedPec]);

  // KPIs
  const totalPecs = areaPecs.length;
  const totalActions = filteredEntries.length;
  const totalVisits = filteredEntries.filter(e => e.activity_type === 'Visita à Escola').length;
  const schoolsAttendedSet = new Set(filteredEntries.map(e => e.school_id).filter(Boolean));
  const totalSchoolsAttended = schoolsAttendedSet.size;
  const avgPerPec = totalPecs > 0 ? (totalActions / totalPecs).toFixed(1) : '0';

  // Action type analysis
  const actionAnalysis = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredEntries.forEach(e => {
      counts[e.activity_type] = (counts[e.activity_type] || 0) + 1;
    });
    const total = filteredEntries.length || 1;
    return Object.entries(counts)
      .map(([type, count]) => ({ type, count, pct: ((count / total) * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count);
  }, [filteredEntries]);

  // Schools attended table
  const schoolsAttendedList = useMemo(() => {
    return filteredEntries
      .filter(e => e.school_id)
      .map(e => {
        const school = SCHOOLS.find(s => s.id === e.school_id);
        const pec = PECS.find(p => p.id === e.pec_id);
        const date = getDayDate(e.day_id);
        return { school: school?.name || '', pec: pec?.name || '', type: e.activity_type, date: date ? date.split('-').reverse().join('/') : '—' };
      });
  }, [filteredEntries]);

  // Schools not attended
  const schoolsNotAttended = useMemo(() => {
    if (yearBasedCoverage) {
      // For Conviva/Multiplica: consider ALL entries in the year, not just filtered fortnight
      const yearEntries = areaEntries;
      const attendedIds = new Set(yearEntries.map(e => e.school_id).filter(Boolean));
      return SCHOOLS.filter(s => !attendedIds.has(s.id)).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    }
    return SCHOOLS.filter(s => !schoolsAttendedSet.has(s.id)).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [areaEntries, schoolsAttendedSet, yearBasedCoverage]);

  // Cross-PEC conflicts (Multiplica)
  const conflicts = useMemo(() => {
    if (!showConflicts) return [];
    const schoolPecMap: Record<string, Set<string>> = {};
    areaEntries.forEach(e => {
      if (e.school_id) {
        if (!schoolPecMap[e.school_id]) schoolPecMap[e.school_id] = new Set();
        schoolPecMap[e.school_id].add(e.pec_id);
      }
    });
    return Object.entries(schoolPecMap)
      .filter(([, pecs]) => pecs.size > 1)
      .map(([schoolId, pecIds]) => {
        const school = SCHOOLS.find(s => s.id === schoolId);
        const pecNames = Array.from(pecIds).map(id => PECS.find(p => p.id === id)?.name || id);
        return { school: school?.name || '', pecs: pecNames };
      });
  }, [areaEntries, showConflicts]);

  // Alerts
  const alerts = useMemo(() => {
    const pecsNoRecord = areaPecs.filter(p => !filteredEntries.some(e => e.pec_id === p.id));
    const pecActionCounts = areaPecs.map(p => ({
      pec: p,
      count: filteredEntries.filter(e => e.pec_id === p.id).length,
    }));
    const avgActions = totalPecs > 0 ? totalActions / totalPecs : 0;
    const lowActivity = pecActionCounts.filter(x => x.count > 0 && x.count < avgActions * 0.5);
    const highActivity = pecActionCounts.filter(x => x.count > avgActions * 1.5 && x.count > 0);
    return { pecsNoRecord, lowActivity, highActivity };
  }, [areaPecs, filteredEntries, totalActions, totalPecs]);

  // Chart data
  const barData = pecMonitoring.map(pm => ({ name: pm.pec.name, total: pm.total }));
  const pieData = actionAnalysis.map((a, i) => ({ name: a.type, value: a.count, fill: PIE_COLORS[i % PIE_COLORS.length] }));

  // Action types for filter
  const actionTypes = useMemo(() => {
    const types = new Set(areaEntries.map(e => e.activity_type));
    return Array.from(types).sort();
  }, [areaEntries]);

  const exportExcel = () => {
    const data = filteredEntries.map(e => {
      const pec = PECS.find(p => p.id === e.pec_id);
      const area = AREAS.find(a => a.id === e.area_id);
      const school = SCHOOLS.find(s => s.id === e.school_id);
      const date = getDayDate(e.day_id);
      return {
        'Área': area?.name || '',
        'PEC': pec?.name || '',
        'Escola': school?.name || e.school_other_text || '',
        'Tipo de ação': e.activity_type,
        'Data': date ? date.split('-').reverse().join('/') : '',
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, areaLabel);
    XLSX.writeFile(wb, `relatorio-${areaId}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-card p-4 shadow-card">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select value={selectedFortnight} onChange={e => setSelectedFortnight(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Todas as quinzenas</option>
          {FORTNIGHTS.map(f => <option key={f.id} value={f.id}>{f.code} – {f.label}</option>)}
        </select>
        <select value={selectedPec} onChange={e => setSelectedPec(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Todos os PECs</option>
          {areaPecs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={selectedActionType} onChange={e => setSelectedActionType(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Todos os tipos</option>
          {actionTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={selectedSchool} onChange={e => setSelectedSchool(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Todas as escolas</option>
          {SCHOOLS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: 'Total de PECs', value: totalPecs, icon: BarChart3, color: 'text-primary' },
          { label: 'Ações Realizadas', value: totalActions, icon: Activity, color: 'text-accent' },
          { label: 'Visitas Realizadas', value: totalVisits, icon: School, color: 'text-success' },
          { label: 'Escolas Atendidas', value: totalSchoolsAttended, icon: CheckCircle2, color: 'text-primary' },
          { label: 'Média por PEC', value: avgPerPec, icon: TrendingUp, color: 'text-warning' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl bg-card p-4 shadow-card animate-slide-up" style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}>
            <s.icon className={`h-5 w-5 ${s.color}`} />
            <p className="mt-2 text-2xl font-bold text-card-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {filteredEntries.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-card p-4 shadow-card">
            <h3 className="font-semibold text-card-foreground mb-3">Ações por PEC</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                  {barData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl bg-card p-4 shadow-card">
            <h3 className="font-semibold text-card-foreground mb-3">Distribuição por Tipo de Ação</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Per-PEC table */}
      <div className="rounded-xl bg-card shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-card-foreground">Monitoramento por PEC</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">PEC</th>
                <th className="px-4 py-2 text-center font-medium text-muted-foreground">Total de ações</th>
                <th className="px-4 py-2 text-center font-medium text-muted-foreground">Visitas</th>
                <th className="px-4 py-2 text-center font-medium text-muted-foreground">Escolas atendidas</th>
              </tr>
            </thead>
            <tbody>
              {pecMonitoring.map(pm => (
                <tr key={pm.pec.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-2 font-medium text-card-foreground">{pm.pec.name}</td>
                  <td className="px-4 py-2 text-center text-card-foreground">{pm.total}</td>
                  <td className="px-4 py-2 text-center text-card-foreground">{pm.visits}</td>
                  <td className="px-4 py-2 text-center text-card-foreground">{pm.schoolsAttended}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action analysis */}
      {actionAnalysis.length > 0 && (
        <div className="rounded-xl bg-card shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-card-foreground">Análise de Ações / Esforço</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Tipo de Ação</th>
                  <th className="px-4 py-2 text-center font-medium text-muted-foreground">Quantidade</th>
                  <th className="px-4 py-2 text-center font-medium text-muted-foreground">% do total</th>
                </tr>
              </thead>
              <tbody>
                {actionAnalysis.map(a => (
                  <tr key={a.type} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="px-4 py-2 text-card-foreground">{a.type}</td>
                    <td className="px-4 py-2 text-center font-semibold text-card-foreground">{a.count}</td>
                    <td className="px-4 py-2 text-center text-muted-foreground">{a.pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {actionAnalysis.length > 0 && (
            <div className="px-4 py-3 border-t border-border bg-muted/30">
              <p className="text-xs text-muted-foreground">
                <strong>Ação predominante:</strong> {actionAnalysis[0].type} ({actionAnalysis[0].count} registros – {actionAnalysis[0].pct}%)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Schools attended */}
      {schoolsAttendedList.length > 0 && (
        <div className="rounded-xl bg-card shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-card-foreground">Escolas Atendidas</h3>
          </div>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Escola</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">PEC</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Tipo de ação</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Data</th>
                </tr>
              </thead>
              <tbody>
                {schoolsAttendedList.map((s, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="px-4 py-2 text-card-foreground">{s.school}</td>
                    <td className="px-4 py-2 text-card-foreground">{s.pec}</td>
                    <td className="px-4 py-2 text-card-foreground">{s.type}</td>
                    <td className="px-4 py-2 text-card-foreground">{s.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schools NOT attended */}
      <div className="rounded-xl bg-card shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <XCircle className="h-4 w-4 text-destructive" />
          <h3 className="font-semibold text-card-foreground">
            Escolas Não Atendidas {yearBasedCoverage ? '(no ano)' : '(na quinzena)'}
          </h3>
          <span className="ml-auto rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">{schoolsNotAttended.length}</span>
        </div>
        {schoolsNotAttended.length > 0 ? (
          <div className="max-h-48 overflow-y-auto p-4">
            <div className="flex flex-wrap gap-2">
              {schoolsNotAttended.map(s => (
                <span key={s.id} className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">{s.name}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-success">Todas as 104 escolas foram atendidas! ✅</div>
        )}
      </div>

      {/* Conflicts (Multiplica) */}
      {showConflicts && conflicts.length > 0 && (
        <div className="rounded-xl bg-card shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="font-semibold text-card-foreground">Conflitos entre PECs (mesma escola)</h3>
          </div>
          <div className="p-4 space-y-2">
            {conflicts.map((c, i) => (
              <div key={i} className="rounded-lg bg-warning/10 px-3 py-2 text-sm">
                <span className="font-semibold text-warning">{c.school}</span>
                <span className="text-muted-foreground"> → PECs: {c.pecs.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-4 w-4 text-destructive" />
            <h4 className="text-sm font-semibold text-card-foreground">Sem registro</h4>
          </div>
          {alerts.pecsNoRecord.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {alerts.pecsNoRecord.map(p => (
                <span key={p.id} className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">{p.name}</span>
              ))}
            </div>
          ) : <p className="text-xs text-success">Todos com registro ✅</p>}
        </div>
        <div className="rounded-xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h4 className="text-sm font-semibold text-card-foreground">Baixa atuação</h4>
          </div>
          {alerts.lowActivity.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {alerts.lowActivity.map(x => (
                <span key={x.pec.id} className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">{x.pec.name} ({x.count})</span>
              ))}
            </div>
          ) : <p className="text-xs text-success">Nenhum PEC com baixa atuação ✅</p>}
        </div>
        <div className="rounded-xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <h4 className="text-sm font-semibold text-card-foreground">Alta atuação</h4>
          </div>
          {alerts.highActivity.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {alerts.highActivity.map(x => (
                <span key={x.pec.id} className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">{x.pec.name} ({x.count})</span>
              ))}
            </div>
          ) : <p className="text-xs text-muted-foreground">—</p>}
        </div>
      </div>

      {/* Export */}
      <button onClick={exportExcel} className="flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition">
        <FileDown className="h-4 w-4" />
        Exportar relatório {areaLabel}
      </button>
    </div>
  );
}
