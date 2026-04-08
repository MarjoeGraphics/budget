# BudgetApp - Financial Planning & Tracking

A modern budgeting application built with React, TypeScript, and Framer Motion.

## Core Features

- **Dynamic Safe to Spend**: Formula: `Projected Income - (Fixed Dues + Goal Allocations + Safety Buffer) - Current Discretionary Spending`.
- **Goals with Visuals**: Track financial ambitions with progress bars and hero images.
- **Cashflow Calendar**: Predict "crunch periods" where balance dips below a safety threshold.
- **Smart Analytics**: Automated anomaly detection and spending velocity tracking.
- **Privacy First**: Local-only storage with optional AES-256 encryption.

## How to Test Logic

The app's logic relies on the current date and stored transactions/settings. To test different scenarios:

### 1. Simulating Income from Different Dates
The app uses a **Projected Income** model for the "Safe to Spend" metric, which is set in the **Settings** tab (**Monthly Rate**).

To test actual income receipt:
1. Open the **Add Transaction** modal (`+` button).
2. Select **Income**.
3. Add a description (e.g., "Payday") and amount.
4. The **Net Saving** / **Current Savings** metric will update to reflect this actual inflow.

### 2. Testing Budget Math
- **Safe to Spend**: Subtracts all **discretionary** expenses (all negative transactions EXCEPT those categorized as `Bills/Dues`) from your monthly allowance.
- **Bills/Dues**: To test, mark a transaction as `Bills/Dues`. It will *not* reduce your "Safe to Spend" because it's already accounted for in the "Dues" reservation.

### 3. Testing Crunch Days
1. Go to **Settings** and set a **Monthly Rate** (e.g., $3000).
2. Go to **Monthly Dues** and add a large due (e.g., $2800) on the 5th of the month.
3. Observe the **Payday Cashflow Calendar**. Days 5 through the end of the month will likely be flagged as **Crunch Days** (indicated in red) because the projected balance falls below $500.

### 4. Testing Savings Requirements
1. Add a **Recurring Due** in the future (e.g., $300 due on the 25th).
2. The list item will display a badge: `Save $X / day`.
3. This calculation is `Amount / (DueDay - Today)`. If today is the 10th, it will show $20/day ($300 / 15 days).

## Development

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.
