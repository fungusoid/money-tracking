import React, { useState, useEffect } from 'react';

function MonthlyStats() {
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalMonths: 0,
    limit: 12
  });
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  const fetchMonthlyStats = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/stats/monthly?page=${page}&limit=${pagination.limit}`);
      const data = await response.json();
      setMonthlyStats(data.monthlyStats || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMonthlyStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatMonth = (monthString) => {
    const [year, month] = monthString.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const handlePageChange = (page) => {
    fetchMonthlyStats(page);
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const start = Math.max(1, pagination.currentPage - 2);
    const end = Math.min(pagination.totalPages, pagination.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          className={`page-btn ${i === pagination.currentPage ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          className="page-btn"
          disabled={pagination.currentPage === 1}
          onClick={() => handlePageChange(pagination.currentPage - 1)}
        >
          Previous
        </button>
        {pages}
        <button
          className="page-btn"
          disabled={pagination.currentPage === pagination.totalPages}
          onClick={() => handlePageChange(pagination.currentPage + 1)}
        >
          Next
        </button>
        <span className="pagination-info">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading monthly statistics...</div>;
  }

  return (
    <div className="monthly-stats">
      <h2>Monthly Statistics</h2>
      
      {monthlyStats.length === 0 ? (
        <div className="empty-state">
          <p>No monthly data available. Add some transactions to see statistics!</p>
        </div>
      ) : (
        <>
          <div className="months-list">
            {monthlyStats.map((monthData, index) => (
              <div key={index} className="month-card">
                <h3>{formatMonth(monthData.month)}</h3>
                
                {/* Account Balances */}
                <div className="account-section">
                  <h4>Account Balances</h4>
                  {monthData.accounts.length > 0 ? (
                    <div className="accounts-table">
                      <div className="table-header">
                        <span>Account</span>
                        <span>Start of Month</span>
                        <span>End of Month</span>
                        <span>Difference</span>
                      </div>
                      {monthData.accounts.map((account, accIndex) => (
                        <div key={accIndex} className="table-row">
                          <span className="account-name">{account.account}</span>
                          <span className="balance-start">{formatCurrency(account.balance_start)}</span>
                          <span className="balance-end">{formatCurrency(account.balance_end)}</span>
                          <span className={`difference ${account.difference >= 0 ? 'positive' : 'negative'}`}>
                            {account.difference >= 0 ? '+' : ''}{formatCurrency(account.difference)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-data">No account data for this month</p>
                  )}
                </div>

                {/* Category Spending */}
                <div className="category-section">
                  <h4>Category Spending</h4>
                  {monthData.categories.length > 0 ? (
                    <div className="categories-list">
                      {monthData.categories.map((category, catIndex) => (
                        <div key={catIndex} className="category-item">
                          <div className="category-info">
                            <span className="category-name">{category.category}</span>
                            <span className="transaction-count">{category.count} transactions</span>
                          </div>
                          <span className={`category-amount ${category.total >= 0 ? 'income' : 'expense'}`}>
                            {category.total >= 0 ? '+' : ''}{formatCurrency(category.total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-data">No category data for this month</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {renderPagination()}
        </>
      )}
    </div>
  );
}

export default MonthlyStats;
