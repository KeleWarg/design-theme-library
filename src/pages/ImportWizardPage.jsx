/**
 * @chunk 2.07 - ImportWizard Shell
 * @chunk 2.11 - Import Integration
 * 
 * Page wrapper for the import wizard.
 * Provides the page container and imports the wizard component.
 */

import { ImportWizard } from '../components/themes/import';

export default function ImportWizardPage() {
  return (
    <div className="page import-wizard-page">
      <ImportWizard />
    </div>
  );
}

