import { useState, useCallback } from 'react';
import { Sale, SaleItem } from '@/types';
import { getActiveSalesByTable } from '@/actions/table';

interface CachedTableSales {
  tableId: string;
  activeSales: Sale[];
  combinedSaleItems: SaleItem[];
  lastUpdated: number;
  totalAmount: number;
  totalItems: number;
}

interface TableSalesCache {
  [tableId: string]: CachedTableSales;
}

// Cache duration: 2 minutes
const CACHE_DURATION = 2 * 60 * 1000;

// Global cache object
let globalCache: TableSalesCache = {};

export const useTableSalesCache = () => {
  const [loading, setLoading] = useState(false);

  const getCachedSales = useCallback((tableId: string): CachedTableSales | null => {
    const cached = globalCache[tableId];
    if (!cached) return null;

    const now = Date.now();
    const isExpired = now - cached.lastUpdated > CACHE_DURATION;
    
    if (isExpired) {
      delete globalCache[tableId];
      return null;
    }

    return cached;
  }, []);

  const setCachedSales = useCallback((tableId: string, data: CachedTableSales) => {
    globalCache[tableId] = data;
  }, []);

  const clearCache = useCallback((tableId?: string) => {
    if (tableId) {
      delete globalCache[tableId];
    } else {
      globalCache = {};
    }
  }, []);

  const getTableSales = useCallback(async (tableId: string): Promise<CachedTableSales> => {
    // Check cache first
    const cached = getCachedSales(tableId);
    if (cached) {
      return cached;
    }

    // Fetch from server
    setLoading(true);
    try {
      const activeSales = await getActiveSalesByTable(tableId);
      
      // Combine all sale items from active sales for this table
      const combinedSaleItems: SaleItem[] = [];
      
      activeSales.forEach(sale => {
        sale.saleItems.forEach(item => {
          // Check if product already exists in our combined list
          const existingItemIndex = combinedSaleItems.findIndex(
            existing => existing.productId === item.productId
          );
          
          if (existingItemIndex > -1) {
            // Add to existing quantity
            combinedSaleItems[existingItemIndex].quantity += item.quantity;
          } else {
            // Add new item with proper structure
            combinedSaleItems.push({
              id: item.id,
              saleId: item.saleId,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              product: item.product ? {
                ...item.product,
                description: item.product.description || undefined,
                image: item.product.image || undefined,
                isAvailable: item.product.isAvailable ?? true,
                createdAt: item.product.createdAt,
              } : undefined,
            });
          }
        });
      });

      const totalAmount = activeSales.reduce((sum, sale) => sum + sale.total, 0);
      const totalItems = combinedSaleItems.reduce((sum, item) => sum + item.quantity, 0);

      const cacheData: CachedTableSales = {
        tableId,
        activeSales: activeSales as unknown as Sale[],
        combinedSaleItems,
        lastUpdated: Date.now(),
        totalAmount,
        totalItems,
      };

      setCachedSales(tableId, cacheData);
      return cacheData;
    } catch (error) {
      console.error('Failed to load table sales:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getCachedSales, setCachedSales]);

  const invalidateTableCache = useCallback((tableId: string) => {
    clearCache(tableId);
  }, [clearCache]);

  const getAllCachedTables = useCallback((): string[] => {
    return Object.keys(globalCache);
  }, []);

  const isCached = useCallback((tableId: string): boolean => {
    return getCachedSales(tableId) !== null;
  }, [getCachedSales]);

  return {
    loading,
    getTableSales,
    getCachedSales,
    clearCache,
    invalidateTableCache,
    getAllCachedTables,
    isCached,
  };
};
