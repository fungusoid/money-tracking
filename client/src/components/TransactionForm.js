import React, { useState } from 'react';

function TransactionForm({ onAddTransaction }) {
  const [transaction, setTransaction] = useState({
    amount: '',
    account: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!transaction.amount || !transaction.account || !transaction.category) {
      alert('Please fill in all required fields');
      return;
    }

    onAddTransaction({
      ...transaction,
      amount: parseFloat(transaction.amount)
    });

    // Reset form
    setTransaction({
      amount: '',
      account: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="transaction-form">
      <h2>Add Transaction</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Amount (€) *</label>
            <input
              type="number"
              step="0.01"
              value={transaction.amount}
              onChange={(e) => setTransaction({ ...transaction, amount: e.target.value })}
              placeholder="Use + for income, - for expenses"
              required
            />
            <small>Positive for income, negative for expenses</small>
          </div>

          <div className="form-group">
            <label>Account *</label>
            <input
              type="text"
              value={transaction.account}
              onChange={(e) => setTransaction({ ...transaction, account: e.target.value })}
              placeholder="e.g., Checking, Savings, Cash"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category *</label>
            <input
              type="text"
              value={transaction.category}
              onChange={(e) => setTransaction({ ...transaction, category: e.target.value })}
              placeholder="Enter any category name"
              required
            />
          </div>

          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              value={transaction.date}
              onChange={(e) => setTransaction({ ...transaction, date: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            value={transaction.description}
            onChange={(e) => setTransaction({ ...transaction, description: e.target.value })}
            placeholder="Optional description"
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Add Transaction
        </button>
      </form>
    </div>
  );
}

export default TransactionForm;
