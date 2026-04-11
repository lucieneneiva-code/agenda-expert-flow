import { useState, useMemo } from 'react';
import { AREAS, PECS, FORTNIGHTS, SCHOOLS, getSchoolsForPec, getDayDate } from '@/lib/data';
import { useAppState } from '@/lib/store';
import { BarChart3, School, AlertTriangle, CheckCircle2, XCircle, Filter, TrendingUp, FileDown, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import VisitConfirmationBI from './VisitConfirmationBI';
import * as XLSX from 'xlsx';

const DC_AREA_ID = 'curricular';

const DC_ACTION_TYPES = [
  'Construção de Formação',
  'Apoio à Formação',
  'Formação Multiplica',
  'Reunião Pedagógica',
  'Convocação',
  'Acompanhamento de Projeto',
  'Visita à Escola',
  'Outros',
];

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

export default function DCMonitoring() {
  const { entries } = useAppState();
  const [selectedFortnight, setSelectedFortnight] = useState('');
  const [selectedPec, setSelectedPec] = useState('');
  const [selectedActionType, setSelectedActionType] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');

  const dcPecs = useMemo(() => PECS.filter(p => p.area_id === DC_AREA_ID && p.active), []);

  const dcEntries = useMemo(() => entries.filter(e => e.area_id === DC_AREA_ID), [entries]);

  const filteredEntries = useMemo(() => {
    let result = dcEntries;
    if (selectedFortnight) result = result.filter(e => e.fortnight_id === selectedFortnight);
    if (selectedPec) result = result.filter(e => e.pec_id === selectedPec);
    if (selectedActionType) result = result.filter(e => e.activity_type === selectedActionType);
    if (selectedSchool) result = result.filter(e => e.school_id === selectedSchool);
    return result;
  }, [dcEntries, selectedFortnight, selectedPec, selectedActionType, selectedSchool]);

  // Per-PEC monitoring
  const pecMonitoring = useMemo(() => {
    const pecsToShow = selectedPec ? dcPecs.filter(p => p.id === selectedPec) : dcPecs;
    return pecsToShow.map(pec => {
      const pecEntries = filteredEntries.filter(e => e.pec_id === pec.id);
      const formations = pecEntries.filter(e =>
        ['Construção de Formação', 'Apoio à Formação', 'Formação Multiplica'].includes(e.activity_type)
      ).length;
      return { pec, total: pecEntries.length, formations };
    });
  }, [dcPecs, filteredEntries, selectedPec]);

  // KPIs
  const totalPecs = dcPecs.length;
  const totalActions = filteredEntries.length;
  const totalFormations = filteredEntries.filter(e =>
    ['Construção de Formação', 'Apoio à Formação', 'Formação Multiplica'].includes(e.activity_type)
  ).length;
  const avgPerPec = totalPecs > 0 ? (totalActions / totalPecs).toFixed(1) : '0';

  // Action type analysis
  const actionAnalysis = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredEntries.forEach(e => {
      const type = e.activity_type;
      counts[type] = (counts[type] || 0) + 1;
    });
    const total = filteredEntries.length || 1;
    return Object.entries(counts)
      .map(([type, qty]) => ({ type, qty, pct: Math.round((qty / total) * 100) }))
      .sort((a, b) => b.qty - a.qty);
  }, [filteredEntries]);

  // Pie chart data
  const pieData = useMemo(() =>
    actionAnalysis.map((a, i) => ({ name: a.type, value: a.qty, fill: PIE_COLORS[i % PIE_COLORS.length] })),
  [actionAnalysis]);

  // Bar chart data (actions per PEC)
  const barData = useMemo(() =>
    pecMonitoring.map(p => ({ name: p.pec.name, acoes: p.total, formacoes: p.formations })),
  [pecMonitoring]);

  // Schools not attended
  const schoolsNotAttended = useMemo(() => {
    const attendedIds = new Set(filteredEntries.map(e => e.school_id).filter(Boolean));
    return SCHOOLS.filter(s => !attendedIds.has(s.id));
  }, [filteredEntries]);

  // Alerts
  const pecsNoRecords = useMemo(() =>
    dcPecs.filter(p => !dcEntries.some(e => e.pec_id === p.id && (selectedFortnight ? e.fortnight_id === selectedFortnight : true))),
  [dcPecs, dcEntries, selectedFortnight]);

  const getActivityLevel = (total: number) => {
    if (total === 0) return 'none';
    if (total <= 2) return 'low';
    if (total <= 5) return 'medium';
    return 'high';
  };

  const pecsLowActivity = pecMonitoring.filter(p => getActivityLevel(p.total) === 'low');
  const pecsHighActivity = pecMonitoring.filter(p => getActivityLevel(p.total) === 'high');

  const getBarColor = (total: number) => {
    const level = getActivityLevel(total);
    if (level === 'high') return 'hsl(var(--success))';
    if (level === 'medium') return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  const exportDCExcel = () => {
    const rows = filteredEntries.map(e => {
      const pec = PECS.find(p => p.id === e.pec_id);
      const school = SCHOOLS.find(s => s.id === e.school_id);
      const dateRaw = getDayDate(e.day_id);
      const date = dateRaw ? dateRaw.split('-').reverse().join('/') : '';
      return {
        PEC: pec?.name || '',
        Escola: school?.name || e.school_other_text || '',
        'Tipo de Ação': e.activity_type === 'Outros' && e.type_other_text ? e.type_other_text : e.activity_type,
        Data: date,
        Período: e.period === 'manha' ? 'Manhã' : 'Tarde',
        Observação: e.observation || '',
        Pauta: e.agenda_topic || '',
        'Status Visita': e.status_visita === 'realizada' ? 'Realizada' : e.status_visita === 'nao_realizada' ? 'Não realizada' : '',
        'Link do Termo de Visita': e.link_termo || '',
        'Data Confirmação': e.data_confirmacao ? new Date(e.data_confirmacao).toLocaleString('pt-BR') : '',
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DC Monitoramento');
    XLSX.writeFile(wb, 'relatorio-pec-desenvolvimento-curricular.xlsx');
  };

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
          {dcPecs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={selectedActionType} onChange={e => setSelectedActionType(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Todos os tipos</option>
          {DC_ACTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
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
          { label: 'Total de PECs DC', value: totalPecs, icon: BarChart3, color: 'text-primary' },
          { label: 'Ações Realizadas', value: totalActions, icon: Activity, color: 'text-success' },
          { label: 'Formações Realizadas', value: totalFormations, icon: TrendingUp, color: 'text-accent' },
          { label: 'Média por PEC', value: avgPerPec, icon: BarChart3, color: 'text-primary' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl bg-card p-4 shadow-card animate-slide-up" style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}>
            <s.icon className={`h-5 w-5 ${s.color}`} />
            <p className="mt-2 text-2xl font-bold text-card-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart - Actions per PEC */}
        {barData.length > 0 && (
          <div className="rounded-xl bg-card shadow-card p-4">
            <h3 className="font-semibold text-card-foreground mb-3">Ações por PEC</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} className="fill-muted-foreground" angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: number, name: string) => [value, name === 'acoes' ? 'Total Ações' : 'Formações']}
                  />
                  <Bar dataKey="acoes" radius={[4, 4, 0, 0]} name="Ações">
                    {barData.map((entry, idx) => (
                      <Cell key={idx} fill={getBarColor(entry.acoes)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Pie Chart - Distribution by action type */}
        {pieData.length > 0 && (
          <div className="rounded-xl bg-card shadow-card p-4">
            <h3 className="font-semibold text-card-foreground mb-3">Distribuição por Tipo de Ação</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name.substring(0, 15)}${name.length > 15 ? '…' : ''} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

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
                <th className="px-4 py-2 text-center font-medium text-muted-foreground">Total de Ações</th>
                <th className="px-4 py-2 text-center font-medium text-muted-foreground">Formações</th>
              </tr>
            </thead>
            <tbody>
              {pecMonitoring.map(p => {
                const level = getActivityLevel(p.total);
                const statusClass = level === 'high' ? 'text-success' : level === 'medium' ? 'text-warning' : level === 'low' ? 'text-destructive' : 'text-muted-foreground';
                return (
                  <tr key={p.pec.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="px-4 py-2 text-card-foreground font-medium">{p.pec.name}</td>
                    <td className={`px-4 py-2 text-center font-semibold ${statusClass}`}>{p.total}</td>
                    <td className="px-4 py-2 text-center text-card-foreground">{p.formations}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Type Analysis */}
      <div className="rounded-xl bg-card shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-card-foreground">Análise de Ações</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Tipo de Ação</th>
                <th className="px-4 py-2 text-center font-medium text-muted-foreground">Quantidade</th>
                <th className="px-4 py-2 text-center font-medium text-muted-foreground">% do Total</th>
                <th className="px-4 py-2 text-center font-medium text-muted-foreground">Representatividade</th>
              </tr>
            </thead>
            <tbody>
              {actionAnalysis.length > 0 ? actionAnalysis.map((a, i) => (
                <tr key={a.type} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-2 text-card-foreground font-medium">{a.type}</td>
                  <td className="px-4 py-2 text-center text-card-foreground font-semibold">{a.qty}</td>
                  <td className="px-4 py-2 text-center text-card-foreground">{a.pct}%</td>
                  <td className="px-4 py-2 text-center">
                    <div className="mx-auto h-2 w-full max-w-[120px] rounded-full bg-muted">
                      <div className="h-2 rounded-full" style={{ width: `${a.pct}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="px-4 py-4 text-center text-muted-foreground">Nenhuma ação registrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schools Not Attended */}
      <div className="rounded-xl bg-card shadow-card p-4">
        <h3 className="font-semibold text-card-foreground mb-3 flex items-center gap-2">
          <XCircle className="h-4 w-4 text-destructive" />
          Escolas Não Atendidas ({schoolsNotAttended.length} de {SCHOOLS.length})
        </h3>
        {schoolsNotAttended.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
            {schoolsNotAttended.map(s => (
              <span key={s.id} className="rounded bg-destructive/10 px-2 py-0.5 text-xs text-destructive">{s.name}</span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-success">Todas as escolas foram atendidas!</p>
        )}
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-card shadow-card p-4">
          <h3 className="font-semibold text-card-foreground mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Sem Registros ({pecsNoRecords.length})
          </h3>
          {pecsNoRecords.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {pecsNoRecords.map(p => (
                <span key={p.id} className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">{p.name}</span>
              ))}
            </div>
          ) : <p className="text-xs text-success">Todos os PECs possuem registros</p>}
        </div>

        <div className="rounded-xl bg-card shadow-card p-4">
          <h3 className="font-semibold text-card-foreground mb-2 flex items-center gap-2">
            <School className="h-4 w-4 text-warning" />
            Baixa Atuação ({pecsLowActivity.length})
          </h3>
          {pecsLowActivity.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {pecsLowActivity.map(p => (
                <span key={p.pec.id} className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                  {p.pec.name} ({p.total})
                </span>
              ))}
            </div>
          ) : <p className="text-xs text-success">Nenhum PEC com baixa atuação</p>}
        </div>

        <div className="rounded-xl bg-card shadow-card p-4">
          <h3 className="font-semibold text-card-foreground mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            Alta Atuação ({pecsHighActivity.length})
          </h3>
          {pecsHighActivity.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {pecsHighActivity.map(p => (
                <span key={p.pec.id} className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                  {p.pec.name} ({p.total}) ✓
                </span>
              ))}
            </div>
          ) : <p className="text-xs text-muted-foreground">Nenhum PEC com alta atuação ainda</p>}
        </div>
      </div>

      {/* Visit Confirmation BI */}
      <div className="rounded-xl bg-card shadow-card overflow-hidden">
        <VisitConfirmationBI entries={entries} areaId={DC_AREA_ID} selectedFortnight={selectedFortnight} />
      </div>

      {/* Export */}
      <div className="flex gap-3">
        <button onClick={exportDCExcel}
          className="flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition">
          <FileDown className="h-4 w-4" />
          Exportar relatório Desenvolvimento Curricular
        </button>
      </div>
    </div>
  );
}
