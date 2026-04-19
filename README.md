# Personal Budget App v2.0.1

A minimalist, high-contrast personal finance tracker built with React, Vite, Tailwind CSS, and Framer Motion.

## Core Design Philosophy: 'Pyramid & Symmetry'
- **The Peak:** A full-width 'Safe to Spend' card dominates the Home view, providing instant clarity on your daily allowance after all monthly dues are accounted for.
- **Symmetry:** Statistics and Activity are balanced in a responsive 50/50 layout, ensuring critical data is always visible at a glance.
- **Zebra Striping:** Muted date labels and alternating background colors in lists for superior readability on mobile.

## Key Features

### 1. Waterfall Funding System
- Automatically 'pours' your current balance into monthly commitments based on a 5-level priority system (Critical to Wishlist).
- Derived state funding ensures progress bars are always accurate and reactive.

### 2. Trend & Distribution Dashboard
- **Cumulative Trend:** Visualize your monthly cash flow with a dual AreaChart showing Income vs. Expenses. The shaded area represents your real-time Net Flow.
- **Expense Distribution:** A dynamic Pie Chart that maps transactions to your custom categories and colors defined in Settings.

### 3. Automated Monthly Roadmaps
- Track long-term commitments (loans, subscriptions) with term tracking (e.g., Month 12 of 36).
- **'Paid' Automation:** Mark goals as paid to instantly increment terms and reset contributions for the next cycle.
- Automatic list re-sorting moves paid items to the bottom to focus on pending goals.

### 4. Hybrid Transaction Logging
- **Quick Log:** Tap custom presets in the FAB modal for 1-second logging.
- **Manual Entry:** Full control over notes, amounts, categories, and past dates.

### 5. Mobile-First & Privacy-Focused
- Centered 'max-w-md' container for a native app feel on desktop.
- 100% local storage. Your financial data never leaves your device.
- Dark/Light mode support with Tailwind CSS v4.

## Technical Stack
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand (with Persist middleware)
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Icons:** Lucide React
