import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { leadsApi } from '../services/api';

const LeadContext = createContext();

export function LeadProvider({ children }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const cacheKeyRef = useRef('');

  const fetchLeads = useCallback(async (type, params = {}, force = false) => {
    const key = `${type}-${JSON.stringify(params)}`;
    if (key === cacheKeyRef.current && !force && leads.length > 0) {
      // Already cached and populated, skip fetching to avoid spinners
      return; 
    }
    
    setLoading(true);
    try {
      let res;
      if (type === 'converted') {
        res = await leadsApi.getConverted();
      } else if (type === 'lost') {
        res = await leadsApi.getLost();
      } else {
        res = await leadsApi.getAll(params);
      }
      setLeads(res);
      cacheKeyRef.current = key;
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  }, [leads.length]);

  const updateLeadState = useCallback((id, updatedData) => {
    setLeads(prev => prev.map(l => (String(l.id) === String(id) ? { ...l, ...updatedData } : l)));
  }, []);

  const invalidateCache = useCallback(() => {
    cacheKeyRef.current = '';
  }, []);

  return (
    <LeadContext.Provider value={{ leads, loading, fetchLeads, updateLeadState, setLeads, invalidateCache }}>
      {children}
    </LeadContext.Provider>
  );
}

export const useLeadsContext = () => useContext(LeadContext);
