import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ACTIVITY_TYPES, ActivityType, Period, AgendaEntry } from '@/lib/types';
import { getSchoolsForPec } from '@/lib/data';
import { useAppState } from '@/lib/store';
import { X, Save, Trash2, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ActivityModalProps {
  open: boolean;
  onClose: () => void;
  pecId: string;
  areaId: string;
  fortnightId: string;
  dayId: string;
  period: Period;
  existingEntry?: AgendaEntry;
}

export default function ActivityModal({
  open,
  onClose,
  pecId,
  areaId,
  fortnightId,
  dayId,
  period,
  existingEntry,
}: ActivityModalProps) {
  const { addEntry, updateEntry, deleteEntry } = useAppState();
  const schools = getSchoolsForPec(pecId);

  const [activityType, setActivityType] = useState<ActivityType>(
    existingEntry?.activity_type || 'Visita à Escola'
  );
  const [schoolId, setSchoolId] = useState(existingEntry?.school_id || '');
  const [schoolOther, setSchoolOther] = useState(existingEntry?.school_other_text || '');
  const [observation, setObservation] = useState(existingEntry?.observation || '');
  const [agendaTopic, setAgendaTopic] = useState(existingEntry?.agenda_topic || '');
  const [link, setLink] = useState(existingEntry?.link || '');
  const [typeOther, setTypeOther] = useState(existingEntry?.type_other_text || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showReturn, setShowReturn] = useState(false);

  useEffect(() => {
    if (existingEntry) {
      setActivityType(existingEntry.activity_type);
      setSchoolId(existingEntry.school_id || '');
      setSchoolOther(existingEntry.school_other_text || '');
      setObservation(existingEntry.observation || '');
      setAgendaTopic(existingEntry.agenda_topic || '');
      setLink(existingEntry.link || '');
      setTypeOther(existingEntry.type_other_text || '');
    }
  }, [existingEntry]);

  const validate = (): string | null => {
    if (activityType === 'Outros' && !typeOther.trim()) {
      return 'Descreva a ação quando selecionar "Outros".';
    }
    if (schoolId === 'outros' && !schoolOther.trim()) {
      return 'Informe o nome da escola quando selecionar "Outros".';
    }
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setSaving(true);
    const data = {
      pec_id: pecId,
      area_id: areaId,
      fortnight_id: fortnightId,
      day_id: dayId,
      period,
      activity_type: activityType,
      school_id: schoolId === 'outros' ? null : schoolId || null,
      school_other_text: schoolId === 'outros' ? schoolOther : null,
      observation: observation || null,
      agenda_topic: agendaTopic || null,
      link: link || null,
      type_other_text: activityType === 'Outros' ? typeOther : null,
    };

    try {
      if (existingEntry) {
        await updateEntry(existingEntry.id, data);
        toast.success('Atividade atualizada!');
      } else {
        await addEntry(data);
        toast.success('Atividade salva!');
      }
      setSaved(true);
      setShowReturn(true);
    } catch {
      // Error already handled in store
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (existingEntry) {
      try {
        await deleteEntry(existingEntry.id);
        toast.success('Atividade excluída');
        onClose();
      } catch {
        // Error already handled in store
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={onClose}>
      <div className="fixed inset-0 bg-foreground/40" />
      <div
        className="relative z-10 w-full max-w-lg animate-slide-up rounded-t-2xl bg-card p-5 shadow-xl sm:rounded-2xl sm:m-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-card-foreground">
            {existingEntry ? 'Editar Atividade' : 'Nova Atividade'}
          </h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-muted">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Activity Type */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-card-foreground">
              Tipo de Atividade *
            </label>
            <select
              value={activityType}
              onChange={e => setActivityType(e.target.value as ActivityType)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {ACTIVITY_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {activityType === 'Outros' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-card-foreground">
                Descreva a ação *
              </label>
              <textarea
                value={typeOther}
                onChange={e => setTypeOther(e.target.value)}
                rows={3}
                placeholder="Descreva a atividade..."
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          )}

          {activityType === 'Visita à Escola' && (
            <>
              {/* School */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-card-foreground">
                  Escola
                </label>
                <select
                  value={schoolId}
                  onChange={e => setSchoolId(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Selecione...</option>
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                  <option value="outros">Outros</option>
                </select>
              </div>

              {schoolId === 'outros' && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-card-foreground">
                    Nome da escola *
                  </label>
                  <input
                    type="text"
                    value={schoolOther}
                    onChange={e => setSchoolOther(e.target.value)}
                    placeholder="Informe o nome da escola..."
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )}

              {/* Observation */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-card-foreground">
                  Observação
                </label>
                <textarea
                  value={observation}
                  onChange={e => setObservation(e.target.value)}
                  rows={2}
                  placeholder="Observações..."
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              {/* Agenda Topic */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-card-foreground">
                  Pauta
                </label>
                <input
                  type="text"
                  value={agendaTopic}
                  onChange={e => setAgendaTopic(e.target.value)}
                  placeholder="Pauta da atividade..."
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Link */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-card-foreground">
                  Link
                </label>
                <input
                  type="url"
                  value={link}
                  onChange={e => setLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-2">
          {existingEntry && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-lg border border-destructive/30 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5 transition"
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="ml-auto flex items-center gap-1.5 rounded-lg gradient-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
