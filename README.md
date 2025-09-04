# 💰 Money Tracker

A full-stack money tracking application built with React, Node.js, and SQLite. Track your money coming in and going out with detailed account management and monthly statistics.

## Features

- ✅ Add and manage transactions with positive/negative amounts
- ✅ Track multiple accounts (checking, savings, cash, etc.)
- ✅ Categorize transactions with custom categories and colors
- ✅ Paginated transaction list from most recent to oldest
- ✅ Account balance tracking (all start from zero)
- ✅ Monthly statistics with account balance changes
- ✅ Category spending analysis sorted by amount
- ✅ Filter transactions by account, category, and date range
- ✅ Responsive design for mobile and desktop
- ✅ RESTful API with SQLite database

## Data Structure

Each transaction contains:
- **Date** (day, month, year)
- **Account** (free text - e.g., "Checking", "Savings", "Cash")
- **Amount** (in euros - positive for incoming, negative for outgoing)
- **Category** (free text - any category name you want)
- **Description** (free text, optional)

## Tech Stack

- **Frontend**: React, CSS3
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Development**: Concurrently for running both servers

## Project Structure

```
money-tracking/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.js         # Main app component
│   │   ├── App.css        # Styles
│   │   └── index.js       # Entry point
│   └── package.json
├── server/                 # Node.js backend
│   ├── index.js           # Express server
│   ├── .env               # Environment variables
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository or navigate to the project directory

2. Install all dependencies:
   ```bash
   npm run install-deps
   ```

### Running the Application

#### Development Mode (Recommended)

Run both frontend and backend simultaneously:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5001
- Frontend development server on http://localhost:3000

#### Production Mode

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Start the backend server:
   ```bash
   npm start
   ```

### Individual Server Commands

#### Backend Only
```bash
npm run server
# or
cd server && npm run dev
```

#### Frontend Only
```bash
npm run client
# or
cd client && npm start
```

## API Endpoints

### Transactions
- `GET /api/transactions` - Get paginated transactions with optional filtering
- `POST /api/transactions` - Create a new transaction
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category

### Accounts
- `GET /api/accounts/balances` - Get account balances

### Statistics
- `GET /api/stats/monthly` - Get paginated monthly statistics
- `GET /api/summary` - Get financial summary and statistics

### Health Check
- `GET /api/health` - Server health check

## Database Schema

### Transactions Table
- `id` - Primary key
- `amount` - Transaction amount (positive for income, negative for expenses)
- `account` - Account name (free text)
- `category` - Transaction category
- `description` - Optional description
- `date` - Transaction date
- `created_at` - Timestamp

### Categories Table
- `id` - Primary key
- `name` - Category name (unique)
- `color` - Hex color code

## Default Categories

The application comes with pre-loaded categories:
- Salary
- Freelance
- Food
- Transportation
- Entertainment
- Utilities
- Shopping
- Healthcare

## Usage

1. **Adding Transactions**: Use the transaction form with positive amounts for income and negative for expenses
2. **Account Management**: Enter any account name (e.g., "Checking", "Savings", "Cash")
3. **Category Management**: Enter any category name you want - the system will automatically assign colors
4. **Account Balances**: View real-time balances for all accounts at the top of the transactions page
5. **Filtering**: Use filters to search for specific accounts, categories (partial matches work), or date ranges
6. **Monthly Stats**: View paginated monthly statistics showing account balance changes and category spending

## Page Structure

### Transactions Page
- **Transaction Form**: Add new transactions at the top
- **Account Balances**: Display current balance for each account (starts from zero)
- **Transaction List**: Paginated list from most recent to oldest
- **Delete Button**: To the right of each transaction
- **Filters**: Filter by account, category, and date range

### Monthly Stats Page
- **Paginated List**: Shows monthly statistics
- **Account Balances**: Start of month, end of month, and difference for each account
- **Category Spending**: Amount spent in each category, sorted largest to smallest

## Environment Variables

Backend environment variables (server/.env):
```
PORT=5001
NODE_ENV=development
DB_PATH=./money_tracking.db
```

## Features in Detail

### Transaction Management
- Add transactions with positive/negative amounts
- Multiple account support
- Edit and delete existing transactions
- Categorize with custom colors
- Add descriptions and dates

### Account Tracking
- Real-time account balances
- Multiple account support
- All balances start from zero
- Balance calculations based on transaction history

### Filtering & Search
- Filter by account name
- Filter by category
- Filter by date range
- Paginated results
- Clear all filters option

### Monthly Statistics
- Paginated monthly breakdown
- Account balance changes per month
- Category spending analysis
- Sorted by spending amount
- Historical data view

### Category Management
- Create custom categories
- Choose from predefined colors
- Visual color coding
- Single category type (no income/expense separation)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the PORT in server/.env
2. **Database errors**: Delete the SQLite file to reset the database
3. **Frontend not connecting**: Ensure backend is running on port 5001

### Development Tips

- The SQLite database file is created automatically
- Frontend auto-refreshes during development
- Backend restarts automatically with nodemon
- Check browser console for frontend errors
- Check terminal for backend errors

## Future Enhancements

- [ ] User authentication and accounts
- [ ] Data export (CSV, PDF)
- [ ] Charts and graphs for spending trends
- [ ] Budget planning and alerts
- [ ] Recurring transactions
- [ ] Multi-currency support
- [ ] Data import from banking APIs
- [ ] Mobile app version
