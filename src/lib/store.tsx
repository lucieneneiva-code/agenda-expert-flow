import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AgendaEntry, Period, ActivityType } from './types';

interface AppState {
  entries: AgendaEntry[];
  addEntry: (entry: Omit<AgendaEntry, 'id' | 'created_at' | 'updated_at'>) => void;
  updateEntry: (id: string, updates: Partial<AgendaEntry>) => void;
  deleteEntry: (id: string) => void;
  getEntriesForCell: (pecId: string, fortnightId: string, dayId: string, period: Period) => AgendaEntry[];
  getEntriesForPecFortnight: (pecId: string, fortnightId: string) => AgendaEntry[];
  getAllEntries: () => AgendaEntry[];
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<AgendaEntry[]>([]);

  const addEntry = useCallback((entry: Omit<AgendaEntry, 'id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const newEntry: AgendaEntry = {
      ...entry,
      id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      created_at: now,
      updated_at: now,
    };
    setEntries(prev => [...prev, newEntry]);
  }, []);

  const updateEntry = useCallback((id: string, updates: Partial<AgendaEntry>) => {
    setEntries(prev =>
      prev.map(e =>
        e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e
      )
    );
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
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
      value={{ entries, addEntry, updateEntry, deleteEntry, getEntriesForCell, getEntriesForPecFortnight, getAllEntries }}
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
