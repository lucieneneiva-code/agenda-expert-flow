import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { AREAS, PECS, FORTNIGHTS } from '@/lib/data';
import { Calendar } from 'lucide-react';

export default function FortnightSelect() {
  const { areaId, pecId } = useParams<{ areaId: string; pecId: string }>();
  const navigate = useNavigate();
  const area = AREAS.find(a => a.id === areaId);
  const pec = PECS.find(p => p.id === pecId);

  if (!area || !pec) return <div className="p-8 text-center text-muted-foreground">Não encontrado</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header title={pec.name} subtitle={`${area.name} · Selecione a quinzena`} showBack />
      <main className="container mx-auto max-w-5xl px-4 py-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {FORTNIGHTS.map((f, i) => (
            <button
              key={f.id}
              onClick={() => navigate(`/area/${areaId}/pec/${pecId}/fortnight/${f.id}`)}
              className="animate-slide-up rounded-xl bg-card p-4 shadow-card transition-all hover:shadow-card-hover text-center"
              style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'both' }}
            >
              <Calendar className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-2 font-bold text-card-foreground">{f.code}</p>
              <p className="text-xs text-muted-foreground">{f.label}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
