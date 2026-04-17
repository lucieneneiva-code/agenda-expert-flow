import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/lib/store';
import { useState } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
}

export default function Header({ title, subtitle, showBack }: HeaderProps) {
  const navigate = useNavigate();
  const { reload, previewUnstable, loading } = useAppState();
  const [reloading, setReloading] = useState(false);

  const handleReload = async () => {
    setReloading(true);
    try {
      await reload();
    } finally {
      setReloading(false);
    }
  };

  const showReload = previewUnstable;
  const spinning = reloading || loading;

  return (
    <header className="gradient-header px-4 py-5 sm:px-6 sm:py-6">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => navigate('/')}
              className="rounded-full p-2 text-primary-foreground/80 transition hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-lg font-bold leading-tight text-primary-foreground sm:text-xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-0.5 text-sm text-primary-foreground/70">{subtitle}</p>
            )}
          </div>
          {showReload && (
            <button
              onClick={handleReload}
              disabled={spinning}
              title="Recarregar agendamentos"
              aria-label="Recarregar agendamentos"
              className="rounded-full p-2 text-primary-foreground/80 transition hover:bg-primary-foreground/10 hover:text-primary-foreground disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${spinning ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
