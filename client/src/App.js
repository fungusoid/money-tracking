import React, { useState, useEffect } from 'react';
import './App.css';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import MonthlyStats from './components/MonthlyStats';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [accountBalances, setAccountBalances] = useState([]);
  const [activeTab, setActiveTab] = useState('transactions');
  const [filters, setFilters] = useState({
    account: '',
    category: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 15
  });

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  // Fetch data functions
  const fetchTransactions = async (page = 1) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('page', page);
      params.append('limit', pagination.limit);
      
      const response = await fetch(`${API_BASE}/transactions?${params}`);
      const data = await response.json();
      setTransactions(data.transactions || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchAccountBalances = async () => {
    try {
      const response = await fetch(`${API_BASE}/accounts/balances`);
      const data = await response.json();
      setAccountBalances(data);
    } catch (error) {
      console.error('Error fetching account balances:', error);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchTransactions();
    fetchAccountBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleAddTransaction = async (transaction) => {
    try {
      const response = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      });
      
      if (response.ok) {
        fetchTransactions();
        fetchAccountBalances();
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/transactions/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchTransactions();
        fetchAccountBalances();
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handlePageChange = (page) => {
    fetchTransactions(page);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>💰 Money Tracker</h1>
        <nav className="nav-tabs">
          <button 
            className={activeTab === 'transactions' ? 'active' : ''}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </button>
          <button 
            className={activeTab === 'monthly-stats' ? 'active' : ''}
            onClick={() => setActiveTab('monthly-stats')}
          >
            Monthly Stats
          </button>
        </nav>
      </header>

      <main className="App-main">
        {activeTab === 'transactions' && (
          <div className="transactions-tab">
            <TransactionForm 
              onAddTransaction={handleAddTransaction} 
            />
            
            {/* Account Balances */}
            {accountBalances.length > 0 && (
              <div className="account-balances">
                <h3>Account Balances</h3>
                <div className="balances-grid">
                  {accountBalances.map((account, index) => (
                    <div key={index} className="balance-card">
                      <span className="account-name">{account.account}</span>
                      <span className={`balance ${account.balance >= 0 ? 'positive' : 'negative'}`}>
                        €{account.balance.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <TransactionList 
              transactions={transactions}
              filters={filters}
              onFiltersChange={setFilters}
              onDeleteTransaction={handleDeleteTransaction}
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {activeTab === 'monthly-stats' && (
          <MonthlyStats />
        )}
      </main>
    </div>
  );
}

export default App;
