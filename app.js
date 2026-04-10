/**
 * Pinoy Pocket Planner - Core Logic
 */

// --- State Management ---
let state = {
    transactions: [],
    dues: [],
    presets: [
        { id: 1, label: "🍱 Lunch", amount: 150, category: "Food", emoji: "🍱", type: "expense" },
        { id: 2, label: "🚗 Fare", amount: 50, category: "Transport", emoji: "🚗", type: "expense" },
        { id: 3, label: "☕ Coffee", amount: 100, category: "Food", emoji: "☕", type: "expense" },
        { id: 4, label: "🛒 Groceries", amount: 500, category: "Shopping", emoji: "🛒", type: "expense" },
        { id: 5, label: "💰 Day Wage", amount: 600, category: "Income", emoji: "💰", type: "income" },
        { id: 6, label: "💸 Gig Pay", amount: 1200, category: "Income", emoji: "💸", type: "income" }
    ],
    settings: {
        currency: "₱"
    }
};

// --- Initialization ---
function init() {
    const savedState = localStorage.getItem('budgetAppData');
    if (savedState) {
        state = JSON.parse(savedState);
    }
    render();
}

// --- Persistence ---
function saveState() {
    localStorage.setItem('budgetAppData', JSON.stringify(state));
}

// --- Logic & Calculations ---

function getCurrentBalance() {
    return state.transactions.reduce((acc, t) => {
        return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
}

function getUnpaidDues() {
    // Sort by due date (Day 1 to 31)
    return state.dues.filter(d => !d.paid).sort((a, b) => a.due_date - b.due_date);
}

function getDaysLeftInMonth() {
    const now = new Date();
    const today = now.getDate();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    // User requested: (Last Day - Today)
    // We use Math.max(1, ...) to avoid division by zero on the last day.
    return Math.max(1, lastDay - today);
}

/**
 * Waterfall Logic:
 * Distributes current balance to unpaid bills in order of due date.
 */
function calculateWaterfall() {
    let runningBalance = getCurrentBalance();
    const unpaidDues = getUnpaidDues();

    return unpaidDues.map(due => {
        const funding = Math.max(0, Math.min(runningBalance, due.amount));
        const percent = (funding / due.amount) * 100;
        runningBalance -= funding;
        return { ...due, funding, percent };
    });
}

/**
 * Safe to Spend Calculation:
 * Formula: (Current Balance - Total Remaining Unpaid Dues) / Days left in Month.
 * This represents money that is truly free after all bills are reserved for.
 */
function calculateSafeToSpend() {
    const balance = getCurrentBalance();
    const totalUnpaidDues = state.dues.filter(d => !d.paid).reduce((acc, d) => acc + d.amount, 0);
    const daysLeft = getDaysLeftInMonth();

    // If balance is less than dues, STS is 0.
    return Math.max(0, (balance - totalUnpaidDues) / daysLeft);
}

// --- UI Rendering ---

function render() {
    const balance = getCurrentBalance();
    const safeToSpend = calculateSafeToSpend();
    const waterfall = calculateWaterfall();
    const symbol = state.settings.currency;

    // Dashboard
    document.getElementById('current-balance-val').textContent = `${symbol}${balance.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    document.getElementById('safe-to-spend-val').textContent = `${symbol}${safeToSpend.toLocaleString(undefined, {minimumFractionDigits: 2})}`;

    // Efficiency Status
    renderEfficiency(safeToSpend);

    // Smart Insights
    renderInsights(waterfall, balance);

    // Presets
    renderPresets();

    // Dues
    renderDues(waterfall);

    // History
    renderHistory();

    saveState();
}

function renderEfficiency(safeToSpend) {
    const now = new Date();
    const todayStr = now.toLocaleDateString();
    const todaysSpending = state.transactions
        .filter(t => new Date(t.date).toLocaleDateString() === todayStr && t.type === 'expense' && !t.isBillPayment)
        .reduce((acc, t) => acc + t.amount, 0);

    // Cycle spending (from 1st of month till now)
    const cycleSpending = state.transactions
        .filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.type === 'expense' && !t.isBillPayment;
        })
        .reduce((acc, t) => acc + t.amount, 0);

    const statusEl = document.getElementById('efficiency-status');
    const valEl = document.getElementById('efficiency-val');
    const subEl = document.getElementById('efficiency-subtext');

    statusEl.classList.remove('efficiency-green', 'efficiency-yellow', 'efficiency-red');

    subEl.innerHTML = `Today: ${state.settings.currency}${todaysSpending.toLocaleString()} <br> Month: ${state.settings.currency}${cycleSpending.toLocaleString()}`;

    if (todaysSpending < safeToSpend || (todaysSpending === 0 && safeToSpend === 0)) {
        valEl.textContent = "Green (Under Limit)";
        statusEl.classList.add('efficiency-green');
    } else if (Math.abs(todaysSpending - safeToSpend) < 0.01 && safeToSpend > 0) {
        valEl.textContent = "Yellow (On Limit)";
        statusEl.classList.add('efficiency-yellow');
    } else {
        valEl.textContent = "Red (Over Limit)";
        statusEl.classList.add('efficiency-red');
    }
}

function renderInsights(waterfall, balance) {
    const insightsEl = document.getElementById('smart-insights');
    const nextUnfunded = waterfall.find(d => d.percent < 100);

    if (!nextUnfunded) {
        if (state.dues.filter(d => !d.paid).length === 0) {
            insightsEl.textContent = "🌟 All bills for this month are paid! Anything you earn now increases your Safe to Spend.";
        } else {
            insightsEl.textContent = "✅ All remaining bills are 100% funded in your balance. You're safe to spend your daily allowance!";
        }
    } else {
        const gap = nextUnfunded.amount - nextUnfunded.funding;
        insightsEl.innerHTML = `<strong>Priority:</strong> ${nextUnfunded.name} (Due on Day ${nextUnfunded.due_date}). <br>
                                ⚠️ <strong>Funding Gap:</strong> ${state.settings.currency}${gap.toLocaleString()} needed to fully cover this bill.`;
    }
}

function renderPresets() {
    const container = document.getElementById('presets-container');
    container.innerHTML = '';
    state.presets.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'preset-btn';
        btn.innerHTML = `<div>${p.emoji}</div> <strong>${p.label}</strong> <br> ${state.settings.currency}${p.amount}`;
        btn.onclick = () => addTransaction(p.amount, p.category, p.emoji, p.type);
        container.appendChild(btn);
    });
}

function renderHistory() {
    const container = document.getElementById('history-list');
    container.innerHTML = '';
    const sorted = [...state.transactions].sort((a,b) => b.id - a.id);

    if (sorted.length === 0) {
        container.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No transactions yet.</div>';
        return;
    }

    sorted.forEach(t => {
        const div = document.createElement('div');
        div.className = 'history-item';
        const isExpense = t.type === 'expense';
        div.innerHTML = `
            <span>${t.emoji} ${t.category}</span>
            <span class="${isExpense ? 'expense-text' : 'income-text'}">
                ${isExpense ? '-' : '+'}${state.settings.currency}${t.amount.toLocaleString()}
            </span>
        `;
        container.appendChild(div);
    });
}

function renderDues(waterfall) {
    const container = document.getElementById('dues-list');
    container.innerHTML = '';

    if (state.dues.length === 0) {
        container.innerHTML = '<p style="color: #999;">No recurring dues added yet.</p>';
        return;
    }

    const todayDay = new Date().getDate();

    // Show unpaid with waterfall progress
    waterfall.forEach(due => {
        const div = document.createElement('div');
        div.className = 'due-item';
        const isFunded = due.percent >= 100;
        const isOverdue = due.due_date < todayDay;

        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${due.name}</strong>
                    <span class="badge" style="background: #eee; color: #666;">Day ${due.due_date}</span>
                    ${isFunded ? '<span class="badge" style="background: #d4edda; color: #155724;">FUNDED</span>' : ''}
                    ${isOverdue ? '<span class="badge" style="background: #f8d7da; color: #721c24;">OVERDUE</span>' : ''}
                </div>
                <strong>${state.settings.currency}${due.amount.toLocaleString()}</strong>
            </div>
            <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${due.percent}%; background: ${isFunded ? '#28a745' : '#ffc107'}"></div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <small>${due.percent.toFixed(0)}% (${state.settings.currency}${due.funding.toLocaleString()} reserved)</small>
                <button onclick="markAsPaid(${due.id})" class="secondary" style="padding: 2px 10px; font-size: 0.8rem;">Mark as Paid</button>
            </div>
        `;
        container.appendChild(div);
    });

    // Show paid dues
    const paidDues = state.dues.filter(d => d.paid);
    if (paidDues.length > 0) {
        const paidHeader = document.createElement('h4');
        paidHeader.style.marginTop = "20px";
        paidHeader.textContent = "Paid This Month";
        container.appendChild(paidHeader);
        paidDues.forEach(due => {
            const div = document.createElement('div');
            div.className = 'due-item';
            div.style.opacity = '0.5';
            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="text-decoration: line-through;">${due.name} - ${state.settings.currency}${due.amount.toLocaleString()}</span>
                    <button onclick="deleteDue(${due.id})" class="danger" style="padding: 2px 8px; font-size: 0.7rem;">Delete</button>
                </div>
            `;
            container.appendChild(div);
        });
    }
}

// --- Actions ---

function addTransaction(amount, category, emoji, type, isBillPayment = false) {
    const transaction = {
        id: Date.now(),
        amount: parseFloat(amount),
        category,
        emoji,
        type,
        date: new Date().toISOString(),
        isBillPayment
    };
    state.transactions.push(transaction);
    render();
}

function markAsPaid(dueId) {
    const due = state.dues.find(d => d.id === dueId);
    if (due) {
        due.paid = true;
        // Also add it as an expense transaction so balance is reduced
        addTransaction(due.amount, due.name, "📄", "expense", true);
    }
}

function deleteDue(dueId) {
    if (confirm("Delete this due?")) {
        state.dues = state.dues.filter(d => d.id !== dueId);
        render();
    }
}

function clearTransactions() {
    if (confirm("Clear all transaction history?")) {
        state.transactions = [];
        render();
    }
}

// --- Event Listeners ---

document.getElementById('transaction-form').onsubmit = (e) => {
    e.preventDefault();
    const type = document.querySelector('input[name="type"]:checked').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const emojiInput = document.getElementById('emoji').value;
    const emoji = emojiInput || (type === 'income' ? '💰' : '💸');

    addTransaction(amount, category, emoji, type);
    e.target.reset();
};

document.getElementById('due-form').onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('due-name').value;
    const amount = parseFloat(document.getElementById('due-amount').value);
    const date = parseInt(document.getElementById('due-date').value);

    state.dues.push({
        id: Date.now(),
        name,
        amount,
        due_date: date,
        paid: false
    });

    e.target.reset();
    render();
};

document.getElementById('currency-symbol').oninput = (e) => {
    state.settings.currency = e.target.value;
    render();
};

document.getElementById('clear-data').onclick = () => {
    if (confirm("Reset everything? This will wipe all data!")) {
        localStorage.removeItem('budgetAppData');
        location.reload();
    }
};

document.getElementById('export-json').onclick = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `pocket_planner_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};

document.getElementById('import-json-btn').onclick = () => {
    document.getElementById('import-json-input').click();
};

document.getElementById('import-json-input').onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedState = JSON.parse(e.target.result);
            state = importedState;
            render();
        } catch (err) {
            alert("Invalid JSON file");
        }
    };
    reader.readAsText(file);
};

// Start
init();
