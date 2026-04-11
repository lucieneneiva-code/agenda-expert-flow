import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import ActivityModal from '@/components/ActivityModal';
import ConfirmVisitModal from '@/components/ConfirmVisitModal';
import { AREAS, PECS, FORTNIGHTS, SCHOOLS, generateFortnightDays, getPecMeta } from '@/lib/data';
import { useAppState } from '@/lib/store';
import { Period, AgendaEntry } from '@/lib/types';
import { Plus, Check, CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'manha', label: 'Manhã' },
  { key: 'tarde', label: 'Tarde' },
];

// Q05 starts confirmation feature
const CONFIRMATION_START_FORTNIGHT_ORDER = 5;

function isConfirmationEnabled(fortnightId: string): boolean {
  const fortnight = FORTNIGHTS.find(f => f.id === fortnightId);
  return fortnight ? fortnight.order >= CONFIRMATION_START_FORTNIGHT_ORDER : false;
}

function getVisitStatusIcon(entry: AgendaEntry) {
  if (entry.activity_type !== 'Visita à Escola') return null;
  if (!isConfirmationEnabled(entry.fortnight_id)) return null;

  if (entry.status_visita === 'realizada') {
    return <CheckCircle2 className="h-3 w-3 text-success shrink-0" />;
  }
  if (entry.status_visita === 'nao_realizada') {
    return <XCircle className="h-3 w-3 text-destructive shrink-0" />;
  }
  return <Clock className="h-3 w-3 text-warning shrink-0" />;
}

export default function AgendaView() {
  const { areaId, pecId, fortnightId } = useParams<{
    areaId: string;
    pecId: string;
    fortnightId: string;
  }>();
  const { getEntriesForCell } = useAppState();
  const area = AREAS.find(a => a.id === areaId);
  const pec = PECS.find(p => p.id === pecId);
  const fortnight = FORTNIGHTS.find(f => f.id === fortnightId);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    dayId: string;
    period: Period;
    entry?: AgendaEntry;
  } | null>(null);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmEntry, setConfirmEntry] = useState<AgendaEntry | null>(null);

  if (!area || !pec || !fortnight)
    return <div className="p-8 text-center text-muted-foreground">Não encontrado</div>;

  const days = generateFortnightDays(fortnightId!, fortnight.order);
  const meta = getPecMeta(pec, area);
  const allVisits = days.flatMap(d =>
    PERIODS.flatMap(p =>
      getEntriesForCell(pec.id, fortnight.id, d.id, p.key).filter(
        e => e.activity_type === 'Visita à Escola'
      )
    )
  );

  const confirmEnabled = isConfirmationEnabled(fortnight.id);

  const openCell = (dayId: string, period: Period) => {
    const cellEntries = getEntriesForCell(pec.id, fortnight.id, dayId, period);
    setSelectedCell({
      dayId,
      period,
      entry: cellEntries[0],
    });
    setModalOpen(true);
  };

  const openConfirm = (entry: AgendaEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmEntry(entry);
    setConfirmModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        title={`${pec.name} · ${fortnight.code}`}
        subtitle={`${area.name}${meta !== null ? ` · Meta: ${meta} visitas · Realizadas: ${allVisits.length}` : ''}`}
        showBack
      />
      <main className="container mx-auto max-w-5xl px-2 py-4 sm:px-4 sm:py-6">
        {/* Progress bar */}
        {meta !== null && (
          <div className="mb-4 rounded-lg bg-card p-3 shadow-card">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-card-foreground">Progresso de visitas</span>
              <span className="font-bold text-primary">
                {allVisits.length}/{meta}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full gradient-primary transition-all duration-500"
                style={{ width: `${Math.min(100, (allVisits.length / meta) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Confirmation legend for Q05+ */}
        {confirmEnabled && (
          <div className="mb-4 rounded-lg bg-card p-3 shadow-card">
            <p className="text-xs font-medium text-card-foreground mb-2">Legenda de confirmação:</p>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-success" /> Realizada</span>
              <span className="flex items-center gap-1"><XCircle className="h-3 w-3 text-destructive" /> Não realizada</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-warning" /> Pendente de confirmação</span>
            </div>
          </div>
        )}

        {/* Agenda Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Header row */}
            <div className="grid grid-cols-[100px_1fr_1fr] gap-1 mb-1">
              <div className="rounded-lg bg-muted p-2 text-center text-xs font-semibold text-muted-foreground">
                Dia
              </div>
              {PERIODS.map(p => (
                <div
                  key={p.key}
                  className="rounded-lg bg-muted p-2 text-center text-xs font-semibold text-muted-foreground"
                >
                  {p.label}
                </div>
              ))}
            </div>

            {/* Day rows */}
            {days.map(day => (
              <div key={day.id} className="grid grid-cols-[100px_1fr_1fr] gap-1 mb-1">
                <div className="flex flex-col items-center justify-center rounded-lg bg-card p-2 shadow-card">
                  <span className="text-xs font-bold text-card-foreground">
                    Dia {day.day_order}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {format(parseISO(day.date), 'dd/MM', { locale: ptBR })}
                  </span>
                  <span className="text-[10px] text-muted-foreground capitalize">
                    {format(parseISO(day.date), 'EEE', { locale: ptBR })}
                  </span>
                </div>
                {PERIODS.map(period => {
                  const cellEntries = getEntriesForCell(pec.id, fortnight.id, day.id, period.key);
                  const hasEntry = cellEntries.length > 0;
                  const entry = cellEntries[0];
                  const statusIcon = entry ? getVisitStatusIcon(entry) : null;
                  const isVisit = entry?.activity_type === 'Visita à Escola';
                  const canConfirm = confirmEnabled && isVisit && hasEntry;

                  return (
                    <button
                      key={period.key}
                      onClick={() => openCell(day.id, period.key)}
                      className={`group min-h-[64px] rounded-lg border-2 border-dashed p-2 text-left transition-all ${
                        hasEntry
                          ? entry?.status_visita === 'realizada'
                            ? 'border-success/30 bg-success/5 hover:border-success/50'
                            : entry?.status_visita === 'nao_realizada'
                              ? 'border-destructive/30 bg-destructive/5 hover:border-destructive/50'
                              : 'border-primary/30 bg-primary/5 hover:border-primary/50'
                          : 'border-border hover:border-primary/30 hover:bg-muted/50'
                      }`}
                    >
                      {hasEntry && entry ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-start gap-1.5">
                            {statusIcon || <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium text-card-foreground">
                                {entry.activity_type === 'Outros' && entry.type_other_text
                                  ? entry.type_other_text
                                  : entry.activity_type}
                              </p>
                              {entry.activity_type === 'Visita à Escola' && (entry.school_id || entry.school_other_text) && (
                                <p className="truncate text-[10px] text-muted-foreground">
                                  {entry.school_other_text || SCHOOLS.find(s => s.id === entry.school_id)?.name || 'Escola'}
                                </p>
                              )}
                            </div>
                          </div>
                          {/* Confirmation actions for Q05+ visits */}
                          {canConfirm && (
                            <div className="flex items-center gap-1 mt-0.5">
                              {entry.status_visita === 'realizada' && entry.link_termo ? (
                                <a
                                  href={entry.link_termo}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  className="inline-flex items-center gap-0.5 rounded bg-success/10 px-1.5 py-0.5 text-[9px] font-medium text-success hover:bg-success/20 transition"
                                >
                                  <ExternalLink className="h-2.5 w-2.5" /> Ver Termo
                                </a>
                              ) : (
                                <span
                                  onClick={e => openConfirm(entry, e)}
                                  className="inline-flex items-center gap-0.5 rounded bg-warning/10 px-1.5 py-0.5 text-[9px] font-medium text-warning hover:bg-warning/20 transition cursor-pointer"
                                >
                                  <CheckCircle2 className="h-2.5 w-2.5" />
                                  {entry.status_visita === 'nao_realizada' ? 'Alterar' : 'Confirmar'}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Plus className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </main>

      {modalOpen && selectedCell && (
        <ActivityModal
          key={`${selectedCell.dayId}-${selectedCell.period}`}
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedCell(null);
          }}
          pecId={pec.id}
          areaId={area.id}
          fortnightId={fortnight.id}
          dayId={selectedCell.dayId}
          period={selectedCell.period}
          existingEntry={selectedCell.entry}
        />
      )}

      {confirmModalOpen && confirmEntry && (
        <ConfirmVisitModal
          open={confirmModalOpen}
          onClose={() => {
            setConfirmModalOpen(false);
            setConfirmEntry(null);
          }}
          entry={confirmEntry}
        />
      )}
    </div>
  );
}
