'use client';

import { useState, useEffect, useCallback } from 'react';
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
  queryConfig: { from: string; params?: Record<string, any>; orderBy?: { column: string; ascending?: boolean }; limit?: number; pollingInterval?: number } | null | undefined,
  schema: string = 'public'
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (
    tableName: string,
    params: Record<string, any> | undefined,
    orderBy: { column: string; ascending?: boolean } | undefined,
    limit: number | undefined,
    schema: string
  ) => {
    try {
      console.log(`useCollection: Fetching from table: ${tableName} with params:`, params);
      let query = supabase.from(tableName).select('*');

      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
      }

      if (limit) {
        query = query.limit(limit);
      }

      if (params) {
        Object.keys(params).forEach((key) => {
          query = query.eq(key, params[key]);
        });
      }

      const { data: rows, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      const results: ResultItemType[] = (rows as T[]).map((row: T) => ({
        ...row,
        id: (row as any).id,
      }));
      setData(results);
      setError(null);
    } catch (err: any) {
      setError(err);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [setData, setError, setIsLoading, schema]);

  useEffect(() => {
    if (!queryConfig?.from) {
      setIsLoading(true);
      setData(null);
      setError(null);
      return;
    }

    const { from: tableName, params, orderBy, limit, pollingInterval } = queryConfig;

    setIsLoading(true);
    setError(null);

    // Initial fetch
    fetchData(tableName, params, orderBy, limit, schema);

    let channel: { unsubscribe: () => void } | null = null;
    if (!pollingInterval) {
      // Only subscribe to real-time changes if polling is not enabled
      channel = supabase
        .channel(`public:${tableName}`)
        .on(
          'postgres_changes',
          { event: '*', schema, table: tableName },
          (payload) => {
            fetchData(tableName, params, orderBy, limit, schema);
          }
        )
        .subscribe();
    }

    let intervalId: NodeJS.Timeout | null = null;
    if (pollingInterval && pollingInterval > 0) {
      intervalId = setInterval(() => {
        fetchData(tableName, params, orderBy, limit, schema);
      }, pollingInterval);
    }

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [queryConfig, schema, fetchData]);

  return { data, isLoading, error };
}