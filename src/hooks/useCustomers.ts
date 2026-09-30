import { useCallback, useEffect, useState } from 'react';
import type { Customer } from '../types';
import { createCustomer, deleteCustomer, listCustomers, updateCustomer } from '../services/customerService';

export function useCustomers(query = '') {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey(value => value + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    listCustomers(query).then(data => { if (active) setCustomers(data); }).catch(() => { if (active) setError('Unable to load customers.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query, refreshKey]);

  const add = useCallback(async (input: Omit<Customer, 'id'>) => { await createCustomer(input); refresh(); }, [refresh]);
  const edit = useCallback(async (id: number, input: Omit<Customer, 'id'>) => { await updateCustomer(id, input); refresh(); }, [refresh]);
  const remove = useCallback(async (id: number) => { await deleteCustomer(id); refresh(); }, [refresh]);
  return { customers, loading, error, refresh, add, edit, remove };
}
