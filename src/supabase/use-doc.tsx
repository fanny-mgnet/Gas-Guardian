'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/supabase/client';

/** Utility type to add an 'id' field to a given type T. */
type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useDoc hook.
 * @template T Type of the document data.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: Error | null;      // Error object, or null.
}

/**
 * React hook to subscribe to a single Supabase row in real-time.
 *
 * @template T Optional type for row data. Defaults to any.
 * @param {string | null | undefined} tableName - The Supabase table name. Waits if null/undefined.
 * @param {string | null | undefined} id - The ID of the row to subscribe to. Waits if null/undefined.
 * @param {string} [schema='public'] - The database schema.
 * @returns {UseDocResult<T>} Object with data, isLoading, error.
 */
export function useDoc<T = any>(
  queryConfig: { from: string; params?: Record<string, any> } | null | undefined,
  schema: string = 'public'
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!queryConfig?.from || !queryConfig?.params?.id) {
      setIsLoading(true);
      setData(null);
      setError(null);
      return;
    }

    const { from: tableName, params } = queryConfig;
    const id = params.id;

    setIsLoading(true);
    setError(null);

    const channel = supabase
      .channel(`public:${tableName}:${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema, table: tableName, filter: `id=eq.${id}` },
        (payload) => {
          fetchData();
        }
      )
      .subscribe();

    const fetchData = async () => {
      try {
        const { data: row, error: fetchError } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (row) {
          setData({ ...(row as T), id: (row as any).id || id });
        } else {
          setData(null);
        }
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
  }, [queryConfig, schema]);

  return { data, isLoading, error };
}