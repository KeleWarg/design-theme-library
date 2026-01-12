/**
 * @chunk 7.17 - QA Page Shell
 * Header component for Visual QA page with mode toggle
 */
import { useQAStore } from '../../stores/qaStore';
import { Scan, GitCompare } from 'lucide-react';

export function QAHeader() {
  const { mode, setMode, asset, setAsset, setIssues } = useQAStore();

  const handleReset = () => {
    setAsset(null);
    setIssues([]);
  };

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <h1 className="font-semibold">Visual QA</h1>

        {asset && (
          <button
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            New Analysis
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setMode('single')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm transition-colors
            ${mode === 'single' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <Scan size={16} />
          Single
        </button>
        <button
          onClick={() => setMode('compare')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm transition-colors
            ${mode === 'compare' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <GitCompare size={16} />
          Compare
        </button>
      </div>
    </header>
  );
}
