import { useState } from 'react';
import { AgendaEntry } from '@/lib/types';
import { useAppState } from '@/lib/store';
import { X, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface ConfirmVisitModalProps {
  open: boolean;
  onClose: () => void;
  entry: AgendaEntry;
}

export default function ConfirmVisitModal({ open, onClose, entry }: ConfirmVisitModalProps) {
  const { updateEntry } = useAppState();
  const [status, setStatus] = useState<string>(entry.status_visita || '');
  const [linkTermo, setLinkTermo] = useState(entry.link_termo || '');
  const [obs, setObs] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    if (!status) {
      toast.error('Selecione o status da visita.');
      return;
    }
    if (status === 'realizada' && !linkTermo.trim()) {
      toast.error('Informe o link do Termo de Visita para confirmar como realizada.');
      return;
    }
    if (status === 'realizada' && !isValidUrl(linkTermo.trim())) {
      toast.error('Informe um link válido (ex: https://...)');
      return;
    }

    setSaving(true);
    try {
      const currentObs = entry.observation || '';
      const newObs = obs.trim()
        ? currentObs ? `${currentObs}\n[Confirmação] ${obs.trim()}` : `[Confirmação] ${obs.trim()}`
        : currentObs;

      await updateEntry(entry.id, {
        status_visita: status,
        link_termo: status === 'realizada' ? linkTermo.trim() : null,
        data_confirmacao: new Date().toISOString(),
        observation: newObs || null,
      } as any);
      toast.success(status === 'realizada' ? 'Visita confirmada como realizada!' : 'Visita registrada como não realizada.');
      onClose();
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={onClose}>
      <div className="fixed inset-0 bg-foreground/40" />
      <div
        className="relative z-10 w-full max-w-md animate-slide-up rounded-t-2xl bg-card p-5 shadow-xl sm:rounded-2xl sm:m-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Confirmar Visita
          </h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-muted">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {entry.status_visita && (
          <div className={`mb-4 rounded-lg p-3 text-sm ${
            entry.status_visita === 'realizada' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
          }`}>
            <p className="font-medium">
              Status atual: {entry.status_visita === 'realizada' ? '✅ Realizada' : '❌ Não realizada'}
            </p>
            {entry.link_termo && (
              <a href={entry.link_termo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-1 underline text-xs">
                <ExternalLink className="h-3 w-3" /> Ver termo
              </a>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-card-foreground">
              Status da Visita *
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Selecione...</option>
              <option value="realizada">Realizada</option>
              <option value="nao_realizada">Não realizada</option>
            </select>
          </div>

          {status === 'realizada' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-card-foreground">
                Link do Termo de Visita *
              </label>
              <input
                type="url"
                value={linkTermo}
                onChange={e => setLinkTermo(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="mt-1 text-xs text-muted-foreground">Cole o link do Drive, SEI ou outro repositório</p>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-card-foreground">
              Observação (opcional)
            </label>
            <textarea
              value={obs}
              onChange={e => setObs(e.target.value)}
              rows={2}
              placeholder="Observação sobre a confirmação..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
        </div>

        <div className="mt-5 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-input px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg gradient-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {saving ? 'Salvando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
