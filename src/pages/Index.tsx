import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { AREAS } from '@/lib/data';
import { BarChart3 } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Agenda da Equipe de Especialistas em Currículo"
        subtitle="Unidade Regional Sul 3"
      />
      <main className="container mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AREAS.map((area, i) => (
            <button
              key={area.id}
              onClick={() => navigate(`/area/${area.id}`)}
              className="group animate-slide-up rounded-xl bg-card p-5 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5 text-left"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${area.color} text-2xl shadow-sm`}>
                {area.icon}
              </div>
              <h2 className="mt-3 text-base font-semibold text-card-foreground">
                {area.name}
              </h2>
              {area.default_meta !== null && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Meta padrão: {area.default_meta} visitas
                </p>
              )}
            </button>
          ))}

          <button
            onClick={() => navigate('/dashboard')}
            className="group animate-slide-up rounded-xl bg-card p-5 shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5 text-left border-2 border-primary/20"
            style={{ animationDelay: `${AREAS.length * 60}ms`, animationFillMode: 'both' }}
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg gradient-primary shadow-sm">
              <BarChart3 className="h-6 w-6 text-primary-foreground" />
            </div>
            <h2 className="mt-3 text-base font-semibold text-card-foreground">
              Painel da Coordenação
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Indicadores, filtros e relatórios
            </p>
          </button>
        </div>
      </main>
    </div>
  );
}
