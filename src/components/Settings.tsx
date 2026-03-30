import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Download,
  Upload,
  Moon,
  Sun,
  HelpCircle,
  Database,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { encryptData, decryptData } from '../utils/crypto';
import { mockTransactions } from '../data/transactions';

interface TransactionRecord {
  id: string | number;
  label: string;
  date: string;
  amount: number;
  account_number: string;
}

const Settings: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark');
  });
  const [password, setPassword] = useState<string>('');
  const [isEncrypted, setIsEncrypted] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleExportCSV = () => {
    const headers = ['id', 'label', 'date', 'amount', 'account_number'];
    const rows = mockTransactions.map(tx => [
      tx.id,
      tx.description,
      tx.date,
      tx.amount,
      'ACC-XXXX-1234' // Mock account number for portability demo
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'budget_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const data: TransactionRecord[] = mockTransactions.map(tx => ({
      id: tx.id,
      label: tx.description,
      date: tx.date,
      amount: tx.amount,
      account_number: 'ACC-XXXX-1234'
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'budget_data.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEncryptAtRest = async () => {
    if (!password) {
      showFeedback('error', 'Please enter a password for encryption.');
      return;
    }
    try {
      const dataToEncrypt = JSON.stringify(mockTransactions);
      const encrypted = await encryptData(dataToEncrypt, password);
      localStorage.setItem('encrypted_budget_data', encrypted);
      setIsEncrypted(true);
      showFeedback('success', 'Data encrypted and saved to local storage.');
    } catch {
      showFeedback('error', 'Encryption failed.');
    }
  };

  const handleDecryptData = async () => {
    const encrypted = localStorage.getItem('encrypted_budget_data');
    if (!encrypted) {
      showFeedback('error', 'No encrypted data found.');
      return;
    }
    if (!password) {
      showFeedback('error', 'Enter your password to decrypt.');
      return;
    }
    try {
      await decryptData(encrypted, password);
      showFeedback('success', 'Data decrypted successfully.');
    } catch {
      showFeedback('error', 'Decryption failed. Check your password.');
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <header>
          <div className="flex items-center gap-2 mb-1">
            <SettingsIcon size={18} className="text-slate-600 dark:text-slate-400" />
            <h2 className="text-slate-600 dark:text-slate-400 text-xs font-black uppercase tracking-widest">User Preferences</h2>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">App Settings</h1>
        </header>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-bold text-sm">{feedback.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Appearance Section */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Sun size={20} className="text-amber-500" />
              <h3 className="text-xl font-black text-slate-800 dark:text-white">Appearance</h3>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-black text-slate-800 dark:text-white">Dark Mode</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Switch between light and dark</p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-14 h-8 rounded-full transition-all duration-300 flex items-center px-1 ${
                  darkMode ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                  darkMode ? 'translate-x-6' : 'translate-x-0'
                } flex items-center justify-center`}>
                  {darkMode ? <Moon size={12} className="text-blue-600" /> : <Sun size={12} className="text-amber-500" />}
                </div>
              </button>
            </div>
          </section>

          {/* Help/Guide Section */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle size={20} className="text-indigo-500" />
              <h3 className="text-xl font-black text-slate-800 dark:text-white">Help & Guide</h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="font-black text-slate-800 dark:text-white text-sm">Safe to Spend Rule</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed">
                  Formula: S = I - (F + G + B). Focus on your daily disposable income after all commitments.
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="font-black text-slate-800 dark:text-white text-sm">Privacy & Security</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed">
                  Your data is yours. Use the 'Data Management' tools to keep copies or secure them with AES-256.
                </p>
              </div>
            </div>
          </section>

          {/* Data Management Section */}
          <section className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Database size={20} className="text-emerald-500" />
                <h3 className="text-xl font-black text-slate-800 dark:text-white">Data Management</h3>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={16} className={isEncrypted ? "text-emerald-500" : "text-slate-300"} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${isEncrypted ? "text-emerald-600" : "text-slate-400"}`}>
                  {isEncrypted ? "Data Secured" : "Unsecured"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Portability */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portability & Backup</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleExportCSV}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-900 dark:bg-blue-600 text-white px-6 py-4 rounded-2xl text-sm font-black hover:opacity-90 transition-all"
                  >
                    <Download size={18} />
                    Export CSV
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white px-6 py-4 rounded-2xl text-sm font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                  >
                    <Download size={18} />
                    Export JSON
                  </button>
                </div>
                <label className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 px-6 py-4 rounded-2xl text-sm font-black border-2 border-dashed border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-500 transition-all">
                  <Upload size={18} />
                  Import (CSV/JSON)
                  <input type="file" className="hidden" accept=".csv,.json" />
                </label>
              </div>

              {/* Encryption */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AES-256 Encryption At Rest</p>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set encryption password..."
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleEncryptAtRest}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                  >
                    <Shield size={18} />
                    Secure Data
                  </button>
                  <button
                    onClick={handleDecryptData}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white px-6 py-4 rounded-2xl text-sm font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                  >
                    <Unlock size={18} />
                    Unlock Data
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
