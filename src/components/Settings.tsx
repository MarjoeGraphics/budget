import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Download,
  Upload,
  Moon,
  Sun,
  Database,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Plus,
  Wallet,
  Play,
  ChevronLeft,
  ChevronRight,
  Smile,
  Info,
  TrendingUp,
  Calendar,
  Layers,
  Palette
} from 'lucide-react';
import { encryptData, decryptData } from '../utils/crypto';
import { useBudget } from '../context/BudgetContext';

interface TransactionRecord {
  id: string | number;
  label: string;
  date: string;
  amount: number;
  account_number: string;
}

const Settings: React.FC = () => {
  const { transactions, settings, updateSettings, presets, updatePresets, clearAllData } = useBudget();
  const [password, setPassword] = useState<string>('');
  const [isEncrypted, setIsEncrypted] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);

  const [tempIncomeRate, setTempIncomeRate] = useState(settings.monthlyRate || 0);

  const tutorials = [
    { title: "Dashboard", content: "Your financial command center. View your 'Safe to Spend' metric, which is calculated as: Income - (Dues + Goals + Buffer).", icon: <Database className="text-blue-500" /> },
    { title: "Goals", content: "Plan for the future. Add images and custom types to your goals. We support everything from emergency funds to long-term dreams.", icon: <TrendingUp className="text-goal" /> },
    { title: "Monthly Dues", content: "Track recurring bills. Use the Cashflow Calendar to see exactly when money leaves your account and avoid 'crunch' days.", icon: <Calendar className="text-due" /> },
    { title: "Analytics", content: "Visualize your habits. Track your spending velocity and see how your net savings grow over time.", icon: <TrendingUp className="text-income" /> }
  ];

  const commonEmojis = ["💰", "☕", "🛒", "⛽", "🍽️", "📺", "🏠", "💊", "🎮", "🎁", "📱", "💻"];

  const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
      <div
        className="relative"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-bold rounded-lg shadow-xl z-50 w-48 text-center pointer-events-none border border-slate-700/50"
            >
              {text}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleExportCSV = () => {
    const headers = ['id', 'label', 'date', 'amount', 'account_number'];
    const rows = transactions.map(tx => [
      tx.id,
      tx.description,
      tx.date,
      tx.amount,
      'ACC-XXXX-1234'
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
    const data: TransactionRecord[] = transactions.map(tx => ({
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
      const dataToEncrypt = JSON.stringify(transactions);
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

  const handleAddPreset = () => {
    updatePresets([...presets, { label: 'New Preset', amount: -10, category: 'General', icon: '💰' }]);
  };

  const handleRemovePreset = (index: number) => {
    updatePresets(presets.filter((_, i) => i !== index));
  };

  const handleUpdatePreset = (index: number, field: string, value: any) => {
    const newPresets = [...presets];
    newPresets[index] = { ...newPresets[index], [field]: value };
    updatePresets(newPresets);
  };

  const handleAddGoalType = () => {
    const newType = {
      id: Math.random().toString(36).substr(2, 9),
      label: 'New Goal Type',
      baseType: 'someday' as const,
      icon: '🎯',
      color: '#3b82f6'
    };
    updateSettings({ customGoalTypes: [...(settings.customGoalTypes || []), newType] });
  };

  const handleRemoveGoalType = (id: string) => {
    updateSettings({ customGoalTypes: settings.customGoalTypes.filter(t => t.id !== id) });
  };

  const handleUpdateGoalType = (id: string, field: string, value: any) => {
    updateSettings({
      customGoalTypes: settings.customGoalTypes.map(t => t.id === id ? { ...t, [field]: value } : t)
    });
  };

  return (
    <div className="p-4 md:p-6 pb-24">
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
                onClick={() => updateSettings({ darkMode: !settings.darkMode })}
                className={`w-14 h-8 rounded-full transition-all duration-300 flex items-center px-1 ${
                  settings.darkMode ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                  settings.darkMode ? 'translate-x-6' : 'translate-x-0'
                } flex items-center justify-center`}>
                  {settings.darkMode ? <Moon size={12} className="text-blue-600" /> : <Sun size={12} className="text-amber-500" />}
                </div>
              </button>
            </div>
          </section>

          {/* Income Settings Section */}
          <section className="bg-card dark:bg-card rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wallet size={20} className="text-income" />
                <h3 className="text-xl font-black text-slate-800 dark:text-white">Income Setup</h3>
              </div>
              <button
                onClick={() => {
                  updateSettings({ monthlyRate: tempIncomeRate });
                  showFeedback('success', 'Income settings saved.');
                }}
                className="bg-income text-white px-4 py-2 rounded-xl text-xs font-black hover:opacity-90 transition-all"
              >
                Save
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Frequency</label>
                <select
                  value={settings.incomeFrequency}
                  onChange={e => updateSettings({ incomeFrequency: e.target.value as any })}
                  className="w-full bg-background dark:bg-background border border-slate-100 dark:border-slate-800 rounded-2xl py-3 px-4 font-bold text-slate-800 dark:text-white mt-1"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Rate (Base)</label>
                <input
                  type="number"
                  value={tempIncomeRate || ''}
                  onChange={e => setTempIncomeRate(Number(e.target.value))}
                  className="w-full bg-background dark:bg-background border border-slate-100 dark:border-slate-800 rounded-2xl py-3 px-4 font-bold text-slate-800 dark:text-white mt-1"
                />
              </div>
            </div>
          </section>

          {/* Tutorials Section */}
          <section className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-blue-500/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Play size={20} className="text-blue-200" />
                <h3 className="text-xl font-black">Feature Tutorials</h3>
              </div>
              {!showTutorial && (
                <button
                  onClick={() => setShowTutorial(true)}
                  className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-xl font-black text-sm transition-all"
                >
                  Start Guide
                </button>
              )}
            </div>

            {showTutorial ? (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white rounded-xl">
                    {tutorials[tutorialStep].icon}
                  </div>
                  <div>
                    <h4 className="font-black text-lg">{tutorials[tutorialStep].title}</h4>
                    <p className="text-blue-100/60 text-xs font-black uppercase tracking-widest">Step {tutorialStep + 1} of {tutorials.length}</p>
                  </div>
                </div>
                <p className="text-blue-50 font-medium leading-relaxed mb-8">
                  {tutorials[tutorialStep].content}
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex gap-1">
                    {tutorials.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all ${i === tutorialStep ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`} />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTutorialStep(s => Math.max(0, s - 1))}
                      disabled={tutorialStep === 0}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg disabled:opacity-50"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => tutorialStep === tutorials.length - 1 ? setShowTutorial(false) : setTutorialStep(s => s + 1)}
                      className="flex items-center gap-2 bg-white text-blue-600 px-6 py-2 rounded-xl font-black text-sm"
                    >
                      {tutorialStep === tutorials.length - 1 ? "Finish" : "Next"}
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-blue-100/80 font-medium">Learn how to master your budget with our quick interactive guide.</p>
            )}
          </section>

          {/* Presets Management */}
          <section className="bg-card dark:bg-card rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smile size={20} className="text-blue-500" />
                <h3 className="text-xl font-black text-slate-800 dark:text-white">Presets</h3>
              </div>
              <button
                onClick={handleAddPreset}
                className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-xl"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {presets.map((preset, idx) => (
                <div key={idx} className="p-4 bg-background dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 relative">
                  <div className="flex gap-2">
                    <div className="relative">
                      <button
                        onClick={() => setShowEmojiPicker(showEmojiPicker === idx ? null : idx)}
                        className="w-10 h-10 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-50 transition-colors"
                      >
                        {preset.icon}
                      </button>
                      {showEmojiPicker === idx && (
                        <div className="absolute top-full left-0 mt-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 grid grid-cols-4 gap-1 w-32 animate-in fade-in slide-in-from-top-2">
                          {commonEmojis.map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => {
                                handleUpdatePreset(idx, 'icon', emoji);
                                setShowEmojiPicker(null);
                              }}
                              className="w-6 h-6 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 rounded"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      value={preset.label}
                      onChange={e => handleUpdatePreset(idx, 'label', e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-700 border-none rounded-lg p-1 font-black text-xs text-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={preset.amount}
                      onChange={e => handleUpdatePreset(idx, 'amount', Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-700 border-none rounded-lg p-1 text-xs font-black text-slate-800 dark:text-white"
                    />
                    <button
                      onClick={() => handleRemovePreset(idx)}
                      className="text-rose-500 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Custom Goal Types */}
          <section className="bg-card dark:bg-card rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={20} className="text-goal" />
                <h3 className="text-xl font-black text-slate-800 dark:text-white">Goal Types</h3>
              </div>
              <button
                onClick={handleAddGoalType}
                className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-2 rounded-xl"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {settings.customGoalTypes?.map((type) => (
                <div key={type.id} className="p-4 bg-background dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex gap-2">
                    <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center font-bold">
                      {type.icon}
                    </div>
                    <input
                      type="text"
                      value={type.label}
                      onChange={e => handleUpdateGoalType(type.id, 'label', e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-700 border-none rounded-lg p-1 font-black text-xs text-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <select
                      value={type.baseType}
                      onChange={e => handleUpdateGoalType(type.id, 'baseType', e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-700 border-none rounded-lg p-1 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400"
                    >
                      <option value="someday">Someday</option>
                      <option value="monthly">Monthly</option>
                      <option value="deadline">Deadline</option>
                      <option value="reserve">Reserve</option>
                    </select>
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-700 rounded-lg p-1 px-2 border border-slate-100 dark:border-slate-600">
                      <Palette size={14} className="text-slate-400" />
                      <input
                        type="color"
                        value={type.color}
                        onChange={e => handleUpdateGoalType(type.id, 'color', e.target.value)}
                        className="w-6 h-6 border-none bg-transparent cursor-pointer"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveGoalType(type.id)}
                      className="text-rose-500 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
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
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AES-256 Encryption At Rest</p>
                  <Tooltip text="AES-256 is a military-grade encryption standard. Your data is scrambled with a secret key derived from your password, making it unreadable to anyone else even if they access your local storage.">
                    <Info size={12} className="text-slate-300 cursor-help" />
                  </Tooltip>
                </div>
                <p className="text-[10px] text-slate-400 font-medium leading-tight">
                  Secure your data locally. This scrambles your data using your password as a key.
                  <span className="text-rose-400 block mt-1">Warning: If you lose your password, your data cannot be recovered.</span>
                </p>
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

              {/* Dangerous Zone */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Dangerous Zone</p>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                      clearAllData();
                      showFeedback('success', 'All data cleared.');
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 px-6 py-4 rounded-2xl text-sm font-black border border-rose-100 dark:border-rose-900/50 hover:bg-rose-100 transition-all"
                >
                  <Trash2 size={18} />
                  Clear All Data
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
