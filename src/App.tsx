import React, { useState, useCallback, useEffect } from 'react';
import { Copy, RefreshCw, Shield, Moon, Sun, Globe, Check, AlertCircle } from 'lucide-react';

// Import ipcRenderer the old way (as used in your old working code)
const { ipcRenderer } = window.require('electron');

interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

interface Notification {
  type: 'success' | 'error';
  message: string;
}

function App() {
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState('');
  const [copied, setCopied] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [saving, setSaving] = useState(false);
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  // Initialize dark mode from system preference
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const generatePassword = useCallback(() => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = '';
    let result = '';

    // Add required characters first
    if (options.uppercase) {
      chars += uppercase;
      result += uppercase[Math.floor(Math.random() * uppercase.length)];
    }
    if (options.lowercase) {
      chars += lowercase;
      result += lowercase[Math.floor(Math.random() * lowercase.length)];
    }
    if (options.numbers) {
      chars += numbers;
      result += numbers[Math.floor(Math.random() * numbers.length)];
    }
    if (options.symbols) {
      chars += symbols;
      result += symbols[Math.floor(Math.random() * symbols.length)];
    }

    // Fill the rest randomly
    while (result.length < options.length) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }

    // Shuffle the password
    result = result.split('').sort(() => Math.random() - 0.5).join('');
    setPassword(result);
  }, [options]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy password:', err);
      setNotification({
        type: 'error',
        message: 'Failed to copy to clipboard'
      });
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Updated save function: uses ipcRenderer.invoke to actually call the 1Password CLI integration
  const saveToOnePassword = async () => {
    if (!title) {
      setNotification({
        type: 'error',
        message: 'Title is required'
      });
      return;
    }

    if (!password) {
      setNotification({
        type: 'error',
        message: 'Please generate a password first'
      });
      return;
    }

    setSaving(true);

    try {
      const result = await ipcRenderer.invoke('save-to-1password', {
        title,
        username,
        password,
        website,
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      setNotification({
        type: 'success',
        message: 'Saved to 1Password successfully'
      });

      // Clear form on success
      setTitle('');
      setUsername('');
      setWebsite('');
      generatePassword();
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: error.message || 'Failed to save to 1Password'
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-gray-100'} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className={`max-w-md mx-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden transition-colors duration-200`}>
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Shield className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <h1 className={`ml-3 text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Password Generator</h1>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          {/* Notification */}
          {notification && (
            <div className={`mb-4 p-3 rounded-md ${
              notification.type === 'success'
                ? darkMode ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800'
                : darkMode ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800'
            } flex items-center`}>
              {notification.type === 'success'
                ? <Check className="h-5 w-5 mr-2" />
                : <AlertCircle className="h-5 w-5 mr-2" />}
              <span>{notification.message}</span>
            </div>
          )}

          {/* Password Display */}
          <div className="relative mb-6">
            <div className="flex">
              <input
                type="text"
                readOnly
                value={password}
                className={`block w-full px-4 py-3 rounded-l-lg ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-400 focus:border-blue-400'
                    : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                } border border-r-0 transition-colors`}
              />
              <button
                onClick={copyToClipboard}
                className={`px-4 py-2 ${
                  darkMode
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors`}
                title="Copy to clipboard"
              >
                {copied ? 'Copied!' : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Length Slider */}
          <div className="mb-6">
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 transition-colors`}>
              Password Length: {options.length}
            </label>
            <input
              type="range"
              min="1"
              max="25"
              value={options.length}
              onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value) })}
              className={`w-full h-2 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              } rounded-lg appearance-none cursor-pointer accent-blue-600 transition-colors`}
            />
          </div>

          {/* Character Options */}
          <div className="space-y-3 mb-6">
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 transition-colors`}>
              Include Characters:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'uppercase', label: 'Uppercase (A-Z)' },
                { key: 'lowercase', label: 'Lowercase (a-z)' },
                { key: 'numbers', label: 'Numbers (0-9)' },
                { key: 'symbols', label: 'Symbols (!@#$...)' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options[key as keyof PasswordOptions]}
                    onChange={(e) => setOptions({ ...options, [key]: e.target.checked })}
                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 ${
                      darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300'
                    } rounded transition-colors`}
                  />
                  <label className={`ml-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors`}>{label}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Save Form */}
          <div className="space-y-4 mb-6">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors`}>
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Gmail Password"
                className={`block w-full px-3 py-2 border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400 focus:border-blue-400'
                    : 'border-gray-300 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm transition-colors`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors`}>
                Username (optional)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username@example.com"
                className={`block w-full px-3 py-2 border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400 focus:border-blue-400'
                    : 'border-gray-300 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'
                } rounded-md shadow-sm transition-colors`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors`}>
                Website
              </label>
              <div className="flex">
                <div className={`inline-flex items-center px-3 rounded-l-md border border-r-0 ${
                  darkMode ? 'bg-gray-600 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-300 text-gray-500'
                } transition-colors`}>
                  <Globe className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className={`block w-full px-3 py-2 border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400 focus:border-blue-400'
                      : 'border-gray-300 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'
                  } rounded-r-md shadow-sm transition-colors`}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={generatePassword}
              className={`flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                darkMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate New
            </button>
            <button
              onClick={saveToOnePassword}
              disabled={saving}
              className={`flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                darkMode
                  ? saving ? 'bg-gray-600 text-gray-300' : 'text-blue-300 bg-gray-700 hover:bg-gray-600'
                  : saving ? 'bg-blue-300 text-white' : 'text-blue-700 bg-blue-100 hover:bg-blue-200'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
            >
              {saving ? 'Saving...' : 'Save to 1Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
