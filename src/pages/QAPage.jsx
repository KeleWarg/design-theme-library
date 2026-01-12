/**
 * @chunk 7.17 - QA Page Shell
 * Main Visual QA page with mode toggle and state management
 */
import { useQAStore } from '../stores/qaStore';
import { QAHeader } from '../components/qa/QAHeader';
import { InputPanel } from '../components/qa/InputPanel';
import { AnnotatedImageViewer } from '../components/qa/viewer/AnnotatedImageViewer';
import { IssueLog } from '../components/qa/issues/IssueLog';
import { ComparisonWorkspace } from '../components/qa/comparison/ComparisonWorkspace';

export default function QAPage() {
  const { mode, asset, issues } = useQAStore();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <QAHeader />

      {mode === 'single' ? (
        <div className="flex-1 flex overflow-hidden">
          {!asset ? (
            <div className="flex-1 flex items-center justify-center">
              <InputPanel />
            </div>
          ) : (
            <>
              <div className="flex-1 p-4">
                <AnnotatedImageViewer />
              </div>
              <div className="w-96 border-l bg-white overflow-hidden">
                <IssueLog issues={issues} />
              </div>
            </>
          )}
        </div>
      ) : (
        <ComparisonWorkspace />
      )}
    </div>
  );
}
