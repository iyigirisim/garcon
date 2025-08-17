"use client";

import { useState, useCallback } from "react";

interface CacheData<T> {
  data: T;
  lastUpdated: number;
}

interface DataCache {
  [key: string]: CacheData<any>;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// Global cache object
let globalCache: DataCache = {};

export const useDataCache = <T>() => {
  const [loading, setLoading] = useState(false);

  const getCachedData = useCallback((key: string): T | null => {
    const cached = globalCache[key];
    if (!cached) return null;

    const now = Date.now();
    const isExpired = now - cached.lastUpdated > CACHE_DURATION;
    
    if (isExpired) {
      delete globalCache[key];
      return null;
    }

    return cached.data;
  }, []);

  const setCachedData = useCallback((key: string, data: T) => {
    globalCache[key] = {
      data,
      lastUpdated: Date.now(),
    };
  }, []);

  const invalidateCache = useCallback((key?: string) => {
    if (key) {
      delete globalCache[key];
    } else {
      globalCache = {};
    }
  }, []);

  const fetchWithCache = useCallback(async (
    key: string,
    fetchFn: () => Promise<T>,
    forceRefresh: boolean = false
  ): Promise<T> => {
    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      const cached = getCachedData(key);
      if (cached) {
        return cached;
      }
    }

    // Fetch from server
    setLoading(true);
    try {
      const data = await fetchFn();
      setCachedData(key, data);
      return data;
    } finally {
      setLoading(false);
    }
  }, [getCachedData, setCachedData]);

  return {
    loading,
    getCachedData,
    setCachedData,
    invalidateCache,
    fetchWithCache,
  };
};

// Specific hooks for each data type
export const useProductsCache = () => {
  const cache = useDataCache<any[]>();

  const fetchProducts = useCallback(async (forceRefresh = false) => {
    return cache.fetchWithCache(
      'products',
      async () => {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        return response.json();
      },
      forceRefresh
    );
  }, [cache]);

  const invalidateProducts = useCallback(() => {
    cache.invalidateCache('products');
  }, [cache]);

  return {
    loading: cache.loading,
    fetchProducts,
    invalidateProducts,
  };
};

export const useCustomersCache = () => {
  const cache = useDataCache<any[]>();

  const fetchCustomers = useCallback(async (forceRefresh = false) => {
    return cache.fetchWithCache(
      'customers',
      async () => {
        const response = await fetch('/api/customers');
        if (!response.ok) throw new Error('Failed to fetch customers');
        return response.json();
      },
      forceRefresh
    );
  }, [cache]);

  const invalidateCustomers = useCallback(() => {
    cache.invalidateCache('customers');
  }, [cache]);

  return {
    loading: cache.loading,
    fetchCustomers,
    invalidateCustomers,
  };
};

export const useExpensesCache = () => {
  const cache = useDataCache<any[]>();

  const fetchExpenses = useCallback(async (forceRefresh = false) => {
    return cache.fetchWithCache(
      'expenses',
      async () => {
        const response = await fetch('/api/expenses');
        if (!response.ok) throw new Error('Failed to fetch expenses');
        return response.json();
      },
      forceRefresh
    );
  }, [cache]);

  const invalidateExpenses = useCallback(() => {
    cache.invalidateCache('expenses');
  }, [cache]);

  return {
    loading: cache.loading,
    fetchExpenses,
    invalidateExpenses,
  };
};
