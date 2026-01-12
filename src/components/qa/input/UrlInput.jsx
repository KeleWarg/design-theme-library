import { useState } from 'react';
import { Globe, Loader2 } from 'lucide-react';

export function UrlInput({ onSubmit, isLoading }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const isValidUrl = (str) => {
    try {
      const u = new URL(str);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = () => {
    if (!isValidUrl(url)) {
      setError('Please enter a valid URL (http:// or https://)');
      return;
    }
    setError('');
    onSubmit(url);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={isLoading || !url}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Capture'}
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
