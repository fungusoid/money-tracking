import React from 'react';

function TransactionList({ transactions, filters, onFiltersChange, onDeleteTransaction, pagination, onPageChange }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCategoryColor = (categoryName) => {
    // Generate a consistent color based on category name
    const colors = [
      '#F44336', '#E91E63', '#9C27B0', '#673AB7',
      '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
      '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
      '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'
    ];
    
    // Simple hash function to get consistent color for same category
    let hash = 0;
    for (let i = 0; i < categoryName.length; i++) {
      hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
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
          onClick={() => onPageChange(i)}
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
          onClick={() => onPageChange(pagination.currentPage - 1)}
        >
          Previous
        </button>
        {pages}
        <button
          className="page-btn"
          disabled={pagination.currentPage === pagination.totalPages}
          onClick={() => onPageChange(pagination.currentPage + 1)}
        >
          Next
        </button>
        <span className="pagination-info">
          Page {pagination.currentPage} of {pagination.totalPages} 
          ({pagination.totalCount} transactions)
        </span>
      </div>
    );
  };

  return (
    <div className="transaction-list">
      <div className="list-header">
        <h2>Recent Transactions</h2>
        
        {/* Filters */}
        <div className="filters">
          <input
            type="text"
            value={filters.account}
            onChange={(e) => handleFilterChange('account', e.target.value)}
            placeholder="Filter by account"
          />

          <input
            type="text"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            placeholder="Filter by category"
          />

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            placeholder="Start Date"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            placeholder="End Date"
          />

          <button 
            onClick={() => onFiltersChange({ account: '', category: '', startDate: '', endDate: '' })}
            className="btn btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-state">
          <p>No transactions found. Add your first transaction above!</p>
        </div>
      ) : (
        <>
          <div className="transactions-grid">
            {transactions.map(transaction => (
              <div key={transaction.id} className={`transaction-card ${transaction.amount >= 0 ? 'income' : 'expense'}`}>
                <div className="transaction-header">
                  <span 
                    className="category-badge" 
                    style={{ backgroundColor: getCategoryColor(transaction.category) }}
                  >
                    {transaction.category}
                  </span>
                  <span className={`amount ${transaction.amount >= 0 ? 'income' : 'expense'}`}>
                    {transaction.amount >= 0 ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                </div>
                
                <div className="transaction-details">
                  <p className="account"><strong>Account:</strong> {transaction.account}</p>
                  <p className="description">{transaction.description || 'No description'}</p>
                  <p className="date">{formatDate(transaction.date)}</p>
                </div>

                <button
                  onClick={() => onDeleteTransaction(transaction.id)}
                  className="delete-btn"
                  title="Delete transaction"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
          
          {renderPagination()}
        </>
      )}
    </div>
  );
}

export default TransactionList;
