/**
 * @chunk 7.17 - QA Page Shell
 * Placeholder InputPanel component for image upload
 * Full implementation in later chunks
 */
import { Upload } from 'lucide-react';

export function InputPanel() {
  return (
    <div className="w-full max-w-md p-8 border-2 border-dashed border-gray-300 rounded-xl text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <Upload className="w-8 h-8 text-gray-400" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-gray-900">Upload an image</h2>
          <p className="text-sm text-gray-500 mt-1">
            Drop an image here or click to browse
          </p>
        </div>
        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
          Select Image
        </button>
      </div>
    </div>
  );
}
