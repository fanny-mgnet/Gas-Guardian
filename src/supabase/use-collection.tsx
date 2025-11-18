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
 * React hook to subscribe to a Supabase table in real-time or via polling.
 *
 * @template T Optional type for row data. Defaults to any.
 * @param {object | null | undefined} queryConfig - The configuration for the query.
 * @param {string} queryConfig.from - The Supabase table name.
 * @param {Record<string, any>} [queryConfig.params] - Key-value pairs for .eq() filters.
 * @param {{ column: string; ascending?: boolean }} [queryConfig.orderBy] - Column to order by.
 * @param {number} [queryConfig.limit] - Max number of rows to return.
 * @param {number} [queryConfig.pollingInterval] - Interval in ms to re-fetch data. If set, realtime subscription is disabled.
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
    limit: number | undefined
  ) => {
    // Keep it loading if it's not the initial fetch in polling mode
    if (!queryConfig?.pollingInterval) {
        setIsLoading(true);
    }
    try {
      console.log(`useCollection: Fetching from table: ${tableName} with params:`, params);
      let query = supabase.from(tableName).select('*', { schema });

      if (params) {
        Object.keys(params).forEach((key) => {
          query = query.eq(key, params[key]);
        });
      }
      
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
      }

      if (limit) {
        query = query.limit(limit);
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
      console.error(`useCollection error fetching ${tableName}:`, err);
      setError(err);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [schema, queryConfig?.pollingInterval]);

  useEffect(() => {
    if (!queryConfig?.from) {
      setIsLoading(true);
      setData(null);
      setError(null);
      return;
    }

    const { from: tableName, params, orderBy, limit, pollingInterval } = queryConfig;

    // Initial fetch
    fetchData(tableName, params, orderBy, limit);

    const isPolling = pollingInterval && pollingInterval > 0;
    let channel: any;
    let intervalId: NodeJS.Timeout | null = null;

    if (isPolling) {
      intervalId = setInterval(() => {
        fetchData(tableName, params, orderBy, limit);
      }, pollingInterval);
    } else {
      // Only subscribe to real-time changes if polling is not enabled
      const filterString = params 
        ? Object.keys(params).map(key => `${key}=eq.${params[key]}`).join('&')
        : 'id=neq.0'; // A non-empty filter that is always true
        
      channel = supabase
        .channel(`public:${tableName}:${filterString}`)
        .on(
          'postgres_changes',
          { event: '*', schema, table: tableName, filter: filterString },
          () => {
            fetchData(tableName, params, orderBy, limit);
          }
        )
        .subscribe();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [JSON.stringify(queryConfig), schema, fetchData]);

  return { data, isLoading, error };
}
