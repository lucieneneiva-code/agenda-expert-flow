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
        <div className="flex flex-col gap-4">
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
              <h2 className="mt-3 text-base font-semibold text-card-foreground">
                {area.name}
              </h2>
            </button>
          ))}

          <button
            onClick={() => navigate('/dashboard')}
            className="group animate-slide-up rounded-xl bg-card p-5 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5 text-center border-2 border-primary/20"
            style={{ animationDelay: `${homeAreas.length * 60}ms`, animationFillMode: 'both' }}
          >
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-lg gradient-primary shadow-sm">
              <BarChart3 className="h-6 w-6 text-primary-foreground" />
            </div>
            <h2 className="mt-3 text-base font-semibold text-card-foreground">
              Coordenação
            </h2>
          </button>
        </div>
      </main>
    </div>
  );
}