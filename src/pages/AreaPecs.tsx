import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { AREAS, PECS, getPecMeta } from '@/lib/data';
import { useAppState } from '@/lib/store';
import { User } from 'lucide-react';

export default function AreaPecs() {
  const { areaId } = useParams<{ areaId: string }>();
  const navigate = useNavigate();
  const { entries } = useAppState();
  const area = AREAS.find(a => a.id === areaId);
  const pecs = PECS.filter(p => p.area_id === areaId && p.active);

  if (!area) return <div className="p-8 text-center text-muted-foreground">Área não encontrada</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header title={area.name} subtitle="Selecione um PEC" showBack />
      <main className="container mx-auto max-w-5xl px-4 py-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pecs.map((pec, i) => {
            const meta = getPecMeta(pec, area);
            const pecEntries = entries.filter(
              e => e.pec_id === pec.id && e.activity_type === 'Visita à Escola'
            );
            return (
              <button
                key={pec.id}
                onClick={() => navigate(`/area/${areaId}/pec/${pec.id}`)}
                className="group animate-slide-up rounded-xl bg-card p-4 shadow-card transition-all hover:shadow-card-hover text-left"
                style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${area.color}`}>
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-card-foreground truncate">{pec.name}</h3>
                    {meta !== null ? (
                      <p className="text-xs text-muted-foreground">
                        Meta: {meta} · Visitas: {pecEntries.length}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Sem meta definida</p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {pecs.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">
            Nenhum PEC cadastrado nesta área.
          </p>
        )}
      </main>
    </div>
  );
}
