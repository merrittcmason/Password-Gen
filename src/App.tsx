import React, { useState, useCallback } from 'react';
import { Copy, Check, Save, Shield } from 'lucide-react';

// Access electron IPC renderer
const { ipcRenderer } = window.require('electron');

interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  special: boolean;
}

function App() {
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    special: true,
  });

  const generatePassword = useCallback(() => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

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
    if (options.special) {
      chars += special;
      result += special[Math.floor(Math.random() * special.length)];
    }

    // Fill the rest randomly
    while (result.length < options.length) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }

    // Shuffle the result
    result = result
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');

    setPassword(result);
  }, [options]);

  const handleCopy = async () => {
    try {
      await ipcRenderer.invoke('copy-to-clipboard', password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  const handleSave = async () => {
    if (!title) return;

    setSaving(true);
    setSaveError('');

    try {
      const result = await ipcRenderer.invoke('save-to-1password', {
        title,
        username,
        password,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // Clear form on success
      setTitle('');
      setUsername('');
      generatePassword();
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Password Generator</h1>
        </div>

        {/* Password Display */}
        <div className="relative mb-6">
          <input
            type="text"
            readOnly
            value={password}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 pr-12 font-mono text-lg"
          />
          <button
            onClick={handleCopy}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-md transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <Copy className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Length Slider */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password Length: {options.length}
          </label>
          <input
            type="range"
            min="1"
            max="25"
            value={options.length}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, length: +e.target.value }))
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Character Options */}
        <div className="space-y-3 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Include Characters:
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'uppercase', label: 'Uppercase (A-Z)' },
              { key: 'lowercase', label: 'Lowercase (a-z)' },
              { key: 'numbers', label: 'Numbers (0-9)' },
              { key: 'special', label: 'Special (!@#$%)' },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center space-x-2 text-sm text-gray-600"
              >
                <input
                  type="checkbox"
                  checked={options[key as keyof PasswordOptions]}
                  onChange={(e) =>
                    setOptions((prev) => ({ ...prev, [key]: e.target.checked }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 1Password Integration Fields */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Gmail Password"
              className="w-full border border-gray-200 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username (optional)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., username@example.com"
              className="w-full border border-gray-200 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {saveError && (
            <div className="text-red-600 text-sm">{saveError}</div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={generatePassword}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generate New
          </button>
          <button
            onClick={handleSave}
            disabled={!title || saving}
            className="flex items-center justify-center gap-2 flex-1 bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save to 1Password'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
