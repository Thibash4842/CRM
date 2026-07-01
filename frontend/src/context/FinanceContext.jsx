import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { quotesApi, invoicesApi, paymentsApi, expensesApi, auditLogsApi } from '../services/api';
import { useAuth } from './AuthContext';

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider = ({ children }) => {
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const { isAuthenticated } = useAuth();
  
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [qRes, iRes, pRes, eRes, aRes] = await Promise.all([
        quotesApi.getAll().catch(e => { console.error('Quotes API error:', e); return []; }),
        invoicesApi.getAll().catch(e => { console.error('Invoices API error:', e); return []; }),
        paymentsApi.getAll().catch(e => { console.error('Payments API error:', e); return []; }),
        expensesApi.getAll().catch(e => { console.error('Expenses API error:', e); return []; }),
        auditLogsApi.getAll().catch(e => { console.error('Audit Logs API error:', e); return []; })
      ]);
      setQuotes(qRes || []);
      setInvoices(iRes || []);
      setPayments(pRes || []);
      setExpenses(eRes || []);
      setAuditLogs(aRes || []);
    } catch (err) {
      console.error('Error fetching finance data', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addQuote = async (quote) => {
    try {
      // Map local fields to backend fields if necessary (customer -> clientId, owner -> ownerId)
      // For simplicity assuming the payload is correct or adjusted in the UI
      await quotesApi.create(quote);
      await fetchData();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateQuoteStatus = async (id, status) => {
    try {
      await quotesApi.updateStatus(id, status);
      await fetchData();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteQuote = async (id) => {
    try {
      await quotesApi.delete(id);
      await fetchData();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const addInvoice = async (invoice) => {
    try {
      await invoicesApi.create(invoice);
      await fetchData();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateInvoice = async (id, updates) => {
    try {
      // Backend expects updateStatus for now
      if (updates.status) {
        await invoicesApi.updateStatus(id, updates.status);
      }
      await fetchData();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const recordPayment = async (payment) => {
    try {
      await paymentsApi.record(payment);
      await fetchData();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const addExpense = async (expense) => {
    try {
      await expensesApi.create(expense);
      await fetchData();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateExpenseStatus = async (id, status) => {
    try {
      await expensesApi.updateStatus(id, status);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getRevenueStats = () => {
    const totalCollected = payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalRefunded = payments.filter(p => p.status === 'REFUNDED').reduce((sum, p) => sum + (p.amount || 0), 0);
    const outstanding = invoices.reduce((sum, i) => sum + (i.balanceDue || 0), 0);
    const totalExpenses = expenses.filter(e => e.status === 'REIMBURSED').reduce((sum, e) => sum + (e.amount || 0), 0);
    
    return {
      totalRevenue: totalCollected - totalRefunded,
      outstanding,
      totalExpenses
    };
  };

  return (
    <FinanceContext.Provider value={{
      quotes, addQuote, updateQuoteStatus, deleteQuote,
      invoices, addInvoice, updateInvoice,
      payments, recordPayment,
      expenses, addExpense, updateExpenseStatus,
      getRevenueStats,
      auditLogs
    }}>
      {children}
    </FinanceContext.Provider>
  );
};
