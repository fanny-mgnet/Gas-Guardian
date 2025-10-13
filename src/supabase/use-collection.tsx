'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/supabase/client';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useCollection hook.
 * @template T Type of the document data.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: Error | null;      // Error object, or null.
}

/**
 * React hook to subscribe to a Supabase table in real-time.
 *
 * @template T Optional type for row data. Defaults to any.
 * @param {string | null | undefined} tableName - The Supabase table name. Waits if null/undefined.
 * @param {string} [schema='public'] - The database schema.
 * @returns {UseCollectionResult<T>} Object with data, isLoading, error.
 */
export function useCollection<T = any>(
  tableName: string | null | undefined,
  schema: string = 'public'
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tableName) {
      setIsLoading(true);
      setData(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const channel = supabase
      .channel(`public:${tableName}`)
      .on(
        'postgres_changes',
        { event: '*', schema, table: tableName },
        (payload) => {
          // For simplicity, we'll refetch all data on any change.
          // A more advanced implementation might handle specific events (INSERT, UPDATE, DELETE)
          // to update the state more efficiently.
          fetchData();
        }
      )
      .subscribe();

    const fetchData = async () => {
      try {
        const { data: rows, error: fetchError } = await supabase
          .from(tableName)
          .select('*');

        if (fetchError) {
          throw fetchError;
        }

        const results: ResultItemType[] = (rows as T[]).map((row: T) => ({
          ...row,
          id: (row as any).id || Math.random().toString(36).substring(7), // Fallback for id if not present
        }));
        setData(results);
        setError(null);
      } catch (err: any) {
        setError(err);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      channel.unsubscribe();
    };
  }, [tableName, schema]);

  return { data, isLoading, error };
}