import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { AREAS, HOME_AREA_IDS } from '@/lib/data';
import { BarChart3 } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const homeAreas = AREAS.filter(a => HOME_AREA_IDS.includes(a.id));

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Agenda da Equipe de Especialistas em Currículo"
        subtitle="Unidade Regional Sul 3"
      />
      <main className="container mx-auto max-w-2xl px-4 py-6 sm:py-8">
        {/* BLOCO 1 – PASTAS PEDAGÓGICAS */}
        <div className="mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            📂 Pastas Pedagógicas
          </h2>
          <div className="flex flex-col gap-3">
            {homeAreas.map((area, i) => (
              <button
                key={area.id}
                onClick={() => navigate(`/area/${area.id}`)}
                className="group animate-slide-up rounded-xl bg-card p-5 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5 text-center"
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
              >
                <div className={`mx-auto inline-flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br ${area.color} text-2xl shadow-sm`}>
                  {area.icon}
                </div>
                <h3 className="mt-3 text-base font-semibold text-card-foreground">
                  {area.name}
                </h3>
              </button>
            ))}
          </div>
        </div>

        {/* BLOCO 2 – MONITORAMENTO DA COORDENAÇÃO */}
        <div className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            📊 Monitoramento
          </h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="group animate-slide-up w-full rounded-xl bg-primary p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 text-center"
            style={{ animationDelay: `${homeAreas.length * 60}ms`, animationFillMode: 'both' }}
          >
            <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/20 shadow-sm">
              <BarChart3 className="h-7 w-7 text-primary-foreground" />
            </div>
            <h3 className="mt-3 text-lg font-bold text-primary-foreground">
              Painel da Coordenação
            </h3>
            <p className="mt-1 text-sm text-primary-foreground/70">
              Visão geral · Metas · Indicadores
            </p>
          </button>
        </div>
      </main>
    </div>
  );
}
