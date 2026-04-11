import { useMemo } from 'react';
import { AgendaEntry } from '@/lib/types';
import { PECS, SCHOOLS, FORTNIGHTS, getDayDate } from '@/lib/data';
import { CheckCircle2, XCircle, Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const CONFIRMATION_START_FORTNIGHT_ORDER = 5;
const COLORS = { realizada: '#22c55e', nao_realizada: '#ef4444', pendente: '#f59e0b' };

interface Props {
  entries: AgendaEntry[];
  areaId: string;
  selectedFortnight: string;
}

export default function VisitConfirmationBI({ entries, areaId, selectedFortnight }: Props) {
  const confirmableFortnights = useMemo(() =>
    FORTNIGHTS.filter(f => f.order >= CONFIRMATION_START_FORTNIGHT_ORDER),
  []);

  const relevantEntries = useMemo(() => {
    const confirmableIds = new Set(confirmableFortnights.map(f => f.id));
    let result = entries.filter(e =>
      e.area_id === areaId &&
      e.activity_type === 'Visita à Escola' &&
      confirmableIds.has(e.fortnight_id)
    );
    if (selectedFortnight && confirmableIds.has(selectedFortnight)) {
      result = result.filter(e => e.fortnight_id === selectedFortnight);
    }
    return result;
  }, [entries, areaId, selectedFortnight, confirmableFortnights]);

  // Check if selected fortnight is before Q05
  const isBeforeQ5 = useMemo(() => {
    if (!selectedFortnight) return false;
    const f = FORTNIGHTS.find(fn => fn.id === selectedFortnight);
    return f ? f.order < CONFIRMATION_START_FORTNIGHT_ORDER : false;
  }, [selectedFortnight]);

  if (isBeforeQ5) return null;
  if (relevantEntries.length === 0) return null;

  const agendadas = relevantEntries.length;
  const realizadas = relevantEntries.filter(e => e.status_visita === 'realizada').length;
  const naoRealizadas = relevantEntries.filter(e => e.status_visita === 'nao_realizada').length;
  const pendentes = agendadas - realizadas - naoRealizadas;
  const pctExecucao = agendadas > 0 ? Math.round((realizadas / agendadas) * 100) : 0;

  // Visits without evidence
  const semEvidencia = relevantEntries.filter(e =>
    e.status_visita === 'realizada' && !e.link_termo
  );
  const naoConfirmadas = relevantEntries.filter(e => !e.status_visita);

  // Per-PEC execution
  const pecIds = [...new Set(relevantEntries.map(e => e.pec_id))];
  const pecExecucao = pecIds.map(pecId => {
    const pec = PECS.find(p => p.id === pecId);
    const pecEntries = relevantEntries.filter(e => e.pec_id === pecId);
    const pecRealizadas = pecEntries.filter(e => e.status_visita === 'realizada').length;
    return {
      name: pec?.name || pecId,
      agendadas: pecEntries.length,
      realizadas: pecRealizadas,
      pct: pecEntries.length > 0 ? Math.round((pecRealizadas / pecEntries.length) * 100) : 0,
    };
  }).sort((a, b) => a.pct - b.pct);

  // Status chart data
  const statusData = [
    { name: 'Realizadas', value: realizadas, color: COLORS.realizada },
    { name: 'Não realizadas', value: naoRealizadas, color: COLORS.nao_realizada },
    { name: 'Pendentes', value: pendentes, color: COLORS.pendente },
  ].filter(d => d.value > 0);

  // Status details table
  const statusDetails = relevantEntries.map(e => {
    const pec = PECS.find(p => p.id === e.pec_id);
    const school = SCHOOLS.find(s => s.id === e.school_id);
    const dateRaw = getDayDate(e.day_id);
    const dateStr = dateRaw ? dateRaw.split('-').reverse().join('/') : '—';
    return {
      id: e.id,
      pec: pec?.name || '',
      escola: school?.name || e.school_other_text || '—',
      data: dateStr,
      status: e.status_visita || 'pendente',
      link: e.link_termo,
    };
  });

  return (
    <div className="space-y-4">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-card-foreground flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          Confirmação de Visitas (a partir da Q05)
        </h3>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 px-4">
        {[
          { label: 'Agendadas', value: agendadas, icon: Clock, color: 'text-muted-foreground' },
          { label: 'Confirmadas', value: realizadas, icon: CheckCircle2, color: 'text-success' },
          { label: 'Não confirmadas', value: pendentes, icon: Clock, color: 'text-warning' },
          { label: 'Não realizadas', value: naoRealizadas, icon: XCircle, color: 'text-destructive' },
          { label: '% Execução', value: `${pctExecucao}%`, icon: CheckCircle2, color: pctExecucao >= 80 ? 'text-success' : pctExecucao >= 50 ? 'text-warning' : 'text-destructive' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl bg-muted/50 p-3 text-center">
            <s.icon className={`h-4 w-4 mx-auto ${s.color}`} />
            <p className="mt-1 text-xl font-bold text-card-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
        {/* Execution bar chart */}
        {pecExecucao.length > 0 && (
          <div className="rounded-xl bg-muted/30 p-3">
            <h4 className="text-xs font-semibold text-card-foreground mb-2">Execução Real por PEC</h4>
            <ResponsiveContainer width="100%" height={Math.max(150, pecExecucao.length * 30)}>
              <BarChart data={pecExecucao} layout="vertical" margin={{ left: 60, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="name" width={55} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="pct" name="% Execução" radius={[0, 4, 4, 0]}>
                  {pecExecucao.map((item, i) => (
                    <Cell key={i} fill={item.pct >= 80 ? COLORS.realizada : item.pct >= 50 ? COLORS.pendente : COLORS.nao_realizada} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Status pie */}
        {statusData.length > 0 && (
          <div className="rounded-xl bg-muted/30 p-3">
            <h4 className="text-xs font-semibold text-card-foreground mb-2">Status das Visitas</h4>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Visits without evidence */}
      {(semEvidencia.length > 0 || naoConfirmadas.length > 0) && (
        <div className="mx-4 rounded-xl bg-destructive/5 border border-destructive/20 p-3">
          <h4 className="text-xs font-semibold text-destructive flex items-center gap-1 mb-2">
            <AlertTriangle className="h-3.5 w-3.5" /> Visitas sem Evidência
          </h4>
          {semEvidencia.length > 0 && (
            <p className="text-xs text-destructive/80 mb-1">
              {semEvidencia.length} visita(s) marcada(s) como realizada(s) sem link do termo
            </p>
          )}
          {naoConfirmadas.length > 0 && (
            <p className="text-xs text-warning mb-1">
              {naoConfirmadas.length} visita(s) não confirmada(s)
            </p>
          )}
        </div>
      )}

      {/* Execution table */}
      {pecExecucao.length > 0 && (
        <div className="mx-4 rounded-xl bg-card border border-border overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-muted/30">
            <h4 className="text-xs font-semibold text-card-foreground">Execução Real por PEC</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">PEC</th>
                  <th className="px-3 py-1.5 text-center font-medium text-muted-foreground">Agendadas</th>
                  <th className="px-3 py-1.5 text-center font-medium text-muted-foreground">Realizadas</th>
                  <th className="px-3 py-1.5 text-center font-medium text-muted-foreground">% Execução</th>
                </tr>
              </thead>
              <tbody>
                {pecExecucao.map(p => (
                  <tr key={p.name} className="border-b border-border/50">
                    <td className="px-3 py-1.5 font-medium text-card-foreground">{p.name}</td>
                    <td className="px-3 py-1.5 text-center">{p.agendadas}</td>
                    <td className="px-3 py-1.5 text-center">{p.realizadas}</td>
                    <td className="px-3 py-1.5 text-center">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        p.pct >= 80 ? 'bg-success/10 text-success' : p.pct >= 50 ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {p.pct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status details table */}
      {statusDetails.length > 0 && (
        <div className="mx-4 rounded-xl bg-card border border-border overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-muted/30">
            <h4 className="text-xs font-semibold text-card-foreground">Status das Visitas</h4>
          </div>
          <div className="overflow-x-auto max-h-60 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border bg-muted/20">
                  <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">PEC</th>
                  <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">Escola</th>
                  <th className="px-3 py-1.5 text-center font-medium text-muted-foreground">Data</th>
                  <th className="px-3 py-1.5 text-center font-medium text-muted-foreground">Status</th>
                  <th className="px-3 py-1.5 text-center font-medium text-muted-foreground">Termo</th>
                </tr>
              </thead>
              <tbody>
                {statusDetails.map(d => (
                  <tr key={d.id} className="border-b border-border/50">
                    <td className="px-3 py-1.5 text-card-foreground">{d.pec}</td>
                    <td className="px-3 py-1.5 text-card-foreground">{d.escola}</td>
                    <td className="px-3 py-1.5 text-center">{d.data}</td>
                    <td className="px-3 py-1.5 text-center">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        d.status === 'realizada' ? 'bg-success/10 text-success' :
                        d.status === 'nao_realizada' ? 'bg-destructive/10 text-destructive' :
                        'bg-warning/10 text-warning'
                      }`}>
                        {d.status === 'realizada' ? 'Realizada' : d.status === 'nao_realizada' ? 'Não realizada' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      {d.link ? (
                        <a href={d.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                          <ExternalLink className="h-3 w-3" /> Ver
                        </a>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
