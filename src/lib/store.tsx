import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { AgendaEntry, Period, ActivityType } from './types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AppState {
  entries: AgendaEntry[];
  loading: boolean;
  addEntry: (entry: Omit<AgendaEntry, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateEntry: (id: string, updates: Partial<AgendaEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getEntriesForCell: (pecId: string, fortnightId: string, dayId: string, period: Period) => AgendaEntry[];
  getEntriesForPecFortnight: (pecId: string, fortnightId: string) => AgendaEntry[];
  getAllEntries: () => AgendaEntry[];
}

const AppContext = createContext<AppState | null>(null);

function mapRow(row: any): AgendaEntry {
  return {
    id: row.id,
    pec_id: row.pec_id,
    area_id: row.area_id,
    fortnight_id: row.fortnight_id,
    day_id: row.day_id,
    period: row.period as Period,
    activity_type: row.activity_type as ActivityType,
    school_id: row.school_id,
    school_other_text: row.school_other_text,
    observation: row.observation,
    agenda_topic: row.agenda_topic,
    link: row.link,
    type_other_text: row.type_other_text,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<AgendaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Initial fetch
  useEffect(() => {
    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from('agenda_entries')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching entries:', error);
        toast.error('Erro ao carregar dados');
      } else {
        setEntries((data || []).map(mapRow));
      }
      setLoading(false);
    };

    fetchEntries();
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('agenda_entries_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agenda_entries' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newEntry = mapRow(payload.new);
            setEntries(prev => {
              if (prev.some(e => e.id === newEntry.id)) return prev;
              return [...prev, newEntry];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapRow(payload.new);
            setEntries(prev => prev.map(e => (e.id === updated.id ? updated : e)));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any).id;
            setEntries(prev => prev.filter(e => e.id !== deletedId));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addEntry = useCallback(async (entry: Omit<AgendaEntry, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await supabase.from('agenda_entries').insert({
      pec_id: entry.pec_id,
      area_id: entry.area_id,
      fortnight_id: entry.fortnight_id,
      day_id: entry.day_id,
      period: entry.period,
      activity_type: entry.activity_type,
      school_id: entry.school_id,
      school_other_text: entry.school_other_text,
      observation: entry.observation,
      agenda_topic: entry.agenda_topic,
      link: entry.link,
      type_other_text: entry.type_other_text,
    });

    if (error) {
      console.error('Error adding entry:', error);
      if (error.code === '23505') {
        toast.error('Já existe uma atividade neste período.');
      } else {
        toast.error('Erro ao salvar atividade.');
      }
      throw error;
    }
  }, []);

  const updateEntry = useCallback(async (id: string, updates: Partial<AgendaEntry>) => {
    const { id: _, created_at, updated_at, ...cleanUpdates } = updates as any;
    const { error } = await supabase
      .from('agenda_entries')
      .update(cleanUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating entry:', error);
      toast.error('Erro ao atualizar atividade.');
      throw error;
    }
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    const { error } = await supabase.from('agenda_entries').delete().eq('id', id);

    if (error) {
      console.error('Error deleting entry:', error);
      toast.error('Erro ao excluir atividade.');
      throw error;
    }
  }, []);

  const getEntriesForCell = useCallback(
    (pecId: string, fortnightId: string, dayId: string, period: Period) =>
      entries.filter(
        e => e.pec_id === pecId && e.fortnight_id === fortnightId && e.day_id === dayId && e.period === period
      ),
    [entries]
  );

  const getEntriesForPecFortnight = useCallback(
    (pecId: string, fortnightId: string) =>
      entries.filter(e => e.pec_id === pecId && e.fortnight_id === fortnightId),
    [entries]
  );

  const getAllEntries = useCallback(() => entries, [entries]);

  return (
    <AppContext.Provider
      value={{ entries, loading, addEntry, updateEntry, deleteEntry, getEntriesForCell, getEntriesForPecFortnight, getAllEntries }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
