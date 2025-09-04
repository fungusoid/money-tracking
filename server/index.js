const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const dbPath = path.join(__dirname, 'money_tracking.db');
console.log('Database path:', dbPath);
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create tables if they don't exist
db.serialize(() => {
  console.log('Creating tables...');
  // Transactions table
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    account TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating transactions table:', err.message);
    } else {
      console.log('Transactions table created/verified');
    }
  });

  // Categories table
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT
  )`, (err) => {
    if (err) {
      console.error('Error creating categories table:', err.message);
    } else {
      console.log('Categories table created/verified');
    }
  });

  // Insert default categories
  const defaultCategories = [
    { name: 'Salary', color: '#4CAF50' },
    { name: 'Freelance', color: '#8BC34A' },
    { name: 'Food', color: '#FF9800' },
    { name: 'Transportation', color: '#2196F3' },
    { name: 'Entertainment', color: '#9C27B0' },
    { name: 'Utilities', color: '#607D8B' },
    { name: 'Shopping', color: '#E91E63' },
    { name: 'Healthcare', color: '#F44336' }
  ];

  const stmt = db.prepare('INSERT OR IGNORE INTO categories (name, color) VALUES (?, ?)');
  defaultCategories.forEach(cat => {
    stmt.run(cat.name, cat.color);
  });
  stmt.finalize(() => {
    console.log('Database initialization complete');
    // Start server only after database is initialized
    startServer();
  });
});

// Routes

// Get all transactions with pagination
app.get('/api/transactions', (req, res) => {
  const { account, category, startDate, endDate, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  
  let query = 'SELECT * FROM transactions WHERE 1=1';
  const params = [];

  if (account) {
    query += ' AND account = ?';
    params.push(account);
  }
  if (category) {
    query += ' AND category LIKE ?';
    params.push(`%${category}%`);
  }
  if (startDate) {
    query += ' AND date >= ?';
    params.push(startDate);
  }
  if (endDate) {
    query += ' AND date <= ?';
    params.push(endDate);
  }

  // Get total count
  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
  
  db.get(countQuery, params, (err, countResult) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    const totalCount = Object.values(countResult)[0];
    const totalPages = Math.ceil(totalCount / limit);

    // Get paginated results
    query += ' ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    db.all(query, params, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        transactions: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          limit: parseInt(limit)
        }
      });
    });
  });
});

// Add new transaction
app.post('/api/transactions', (req, res) => {
  const { amount, account, category, description, date } = req.body;

  if (!amount || !account || !category || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const stmt = db.prepare('INSERT INTO transactions (amount, account, category, description, date) VALUES (?, ?, ?, ?, ?)');
  stmt.run(amount, account, category, description, date, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, amount, account, category, description, date });
  });
});

// Update transaction
app.put('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const { amount, account, category, description, date } = req.body;

  const stmt = db.prepare('UPDATE transactions SET amount = ?, account = ?, category = ?, description = ?, date = ? WHERE id = ?');
  stmt.run(amount, account, category, description, date, id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    res.json({ id, amount, account, category, description, date });
  });
});

// Delete transaction
app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare('DELETE FROM transactions WHERE id = ?');
  stmt.run(id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    res.json({ message: 'Transaction deleted successfully' });
  });
});

// Get all categories
app.get('/api/categories', (req, res) => {
  const query = 'SELECT * FROM categories ORDER BY name';

  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add new category
app.post('/api/categories', (req, res) => {
  const { name, color } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const stmt = db.prepare('INSERT INTO categories (name, color) VALUES (?, ?)');
  stmt.run(name, color || '#757575', function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        res.status(400).json({ error: 'Category already exists' });
      } else {
        res.status(500).json({ error: err.message });
      }
      return;
    }
    res.json({ id: this.lastID, name, color: color || '#757575' });
  });
});

// Get account balances
app.get('/api/accounts/balances', (req, res) => {
  const query = `
    SELECT 
      account,
      SUM(amount) as balance,
      COUNT(*) as transaction_count
    FROM transactions 
    GROUP BY account
    ORDER BY account
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get monthly statistics with pagination
app.get('/api/stats/monthly', (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit;

  // Get all unique months from transactions
  const monthsQuery = `
    SELECT DISTINCT 
      strftime('%Y-%m', date) as month
    FROM transactions 
    ORDER BY month DESC
    LIMIT ? OFFSET ?
  `;

  // Get total count of months
  const countQuery = `
    SELECT COUNT(DISTINCT strftime('%Y-%m', date)) as count
    FROM transactions
  `;

  db.get(countQuery, [], (err, countResult) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    const totalMonths = countResult.count;
    const totalPages = Math.ceil(totalMonths / limit);

    db.all(monthsQuery, [parseInt(limit), parseInt(offset)], (err, months) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (months.length === 0) {
        return res.json({
          monthlyStats: [],
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalMonths,
            limit: parseInt(limit)
          }
        });
      }

      // For each month, get account balances and category spending
      const monthlyStats = [];
      let completed = 0;

      months.forEach((monthRow, index) => {
        const month = monthRow.month;
        const startOfMonth = month + '-01';
        const endOfMonth = month + '-31'; // Simple approach, covers all possible days

        // Get account balances for this month
        const accountQuery = `
          SELECT 
            account,
            SUM(CASE WHEN date < ? THEN amount ELSE 0 END) as balance_start,
            SUM(CASE WHEN date <= ? THEN amount ELSE 0 END) as balance_end,
            SUM(CASE WHEN date >= ? AND date <= ? THEN amount ELSE 0 END) as difference
          FROM transactions 
          WHERE account IN (
            SELECT DISTINCT account FROM transactions 
            WHERE date >= ? AND date <= ?
          )
          GROUP BY account
        `;

        // Get category spending for this month
        const categoryQuery = `
          SELECT 
            category,
            SUM(amount) as total,
            COUNT(*) as count
          FROM transactions 
          WHERE date >= ? AND date <= ?
          GROUP BY category
          ORDER BY ABS(total) DESC
        `;

        db.all(accountQuery, [startOfMonth, endOfMonth, startOfMonth, endOfMonth, startOfMonth, endOfMonth], (err, accountData) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }

          db.all(categoryQuery, [startOfMonth, endOfMonth], (err, categoryData) => {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }

            monthlyStats[index] = {
              month,
              accounts: accountData,
              categories: categoryData
            };

            completed++;
            if (completed === months.length) {
              res.json({
                monthlyStats,
                pagination: {
                  currentPage: parseInt(page),
                  totalPages,
                  totalMonths,
                  limit: parseInt(limit)
                }
              });
            }
          });
        });
      });
    });
  });
});

// Get summary statistics
// Get summary statistics
app.get('/api/summary', (req, res) => {
  const { startDate, endDate } = req.query;
  let dateFilter = '';
  const params = [];

  if (startDate || endDate) {
    dateFilter = ' WHERE ';
    if (startDate) {
      dateFilter += 'date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      if (startDate) dateFilter += ' AND ';
      dateFilter += 'date <= ?';
      params.push(endDate);
    }
  }

  const summaryQuery = `
    SELECT 
      SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_expenses,
      SUM(amount) as net_balance,
      COUNT(*) as transaction_count
    FROM transactions 
    ${dateFilter}
  `;

  const categoryQuery = `
    SELECT 
      category,
      SUM(amount) as total,
      COUNT(*) as count
    FROM transactions 
    ${dateFilter}
    GROUP BY category
    ORDER BY ABS(total) DESC
  `;

  db.get(summaryQuery, params, (err, summaryRow) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    db.all(categoryQuery, params, (err, categoryRows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      const summary = {
        income: summaryRow.total_income || 0,
        expenses: summaryRow.total_expenses || 0,
        balance: summaryRow.net_balance || 0,
        transactionCount: summaryRow.transaction_count || 0
      };

      res.json({
        summary,
        categoryBreakdown: categoryRows
      });
    });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Function to start server
function startServer() {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
