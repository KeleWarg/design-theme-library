/**
 * @chunk 7.24 - Export PDF
 * Button component for exporting annotated image as PDF
 */
import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { exportToPdf } from '../../../lib/qa/export/pdfExport';
import { useQAStore } from '../../../stores/qaStore';

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);
  const { asset, issues } = useQAStore();

  const handleExport = async () => {
    if (!asset) return;

    setIsExporting(true);
    try {
      await exportToPdf(asset, issues);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={!asset || isExporting}
      className="px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
    >
      {isExporting ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
      Export PDF
    </button>
  );
}
