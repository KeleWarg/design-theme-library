# Component state machine diagrams (current implementation)

These diagrams reflect the **state machines that exist in the code today** for “components” in this repo:

- **Design Components (DB records)**: Supabase `components` table records managed via `componentService`.
- **Figma Imports (DB records)**: Supabase `figma_imports` + `figma_import_components` records reviewed then imported into `components`.
- **Wizard / flow components (UI)**: Multi-step UIs that move between well-defined steps.

---

## Design component lifecycle (`components.status`)

Source of truth:
- `src/services/componentService.js`
- `src/components/components/ComponentCard.jsx`
- `src/pages/ComponentDetailPage.jsx`

```mermaid
stateDiagram-v2
  [*] --> Draft: createComponent()\nstatus='draft'

  Draft --> Published: publishComponent()\nOR updateComponent({status:'published'})
  Published --> Draft: unpublishComponent()\nupdateComponent({status:'draft'})
  Published --> Archived: archiveComponent()\nOR updateComponent({status:'archived'})
  Draft --> Archived: archiveComponent()

  Archived --> Draft: unarchiveComponent()\nupdateComponent({status:'draft'})

  Draft --> Draft: updateComponent()\n(edit code/props/tokens/examples/images)
  Published --> Published: updateComponent()\n(edit code/props/tokens/examples/images)
  Archived --> Archived: updateComponent()\n(edit metadata)

  Draft --> Draft: duplicateComponent()\n(copy always starts draft)
  Published --> Draft: duplicateComponent()\n(copy always starts draft)
  Archived --> Draft: duplicateComponent()\n(copy always starts draft)

  Draft --> [*]: deleteComponent()
  Published --> [*]: deleteComponent()
  Archived --> [*]: deleteComponent()
```

---

## Manual component creation wizard (UI)

Source of truth:
- `src/components/components/wizard/ManualCreationWizard.jsx`
- `src/components/components/wizard/steps/BasicInfoStep.jsx`
- `src/components/components/wizard/steps/PropsStep.jsx`
- `src/components/components/wizard/steps/VariantsStep.jsx`
- `src/components/components/wizard/steps/TokenLinkingStep.jsx`

```mermaid
stateDiagram-v2
  [*] --> BasicInfo
  BasicInfo --> Props: Next\n(name required)
  Props --> Variants: Next
  Variants --> TokenLinking: Next
  TokenLinking --> Creating: Create Component
  Creating --> ComponentDetail: createComponent(status='draft')\nthen navigate(/components/:id)
  Creating --> TokenLinking: error

  Props --> BasicInfo: Back
  Variants --> Props: Back
  TokenLinking --> Variants: Back

  BasicInfo --> Cancelled: Cancel\n(confirm if unsaved)
  Props --> Cancelled: Cancel\n(confirm if unsaved)
  Variants --> Cancelled: Cancel\n(confirm if unsaved)
  TokenLinking --> Cancelled: Cancel\n(confirm if unsaved)
  Cancelled --> [*]: navigate(/components)
```

---

## AI component generation flow (UI + service)

Source of truth:
- `src/components/components/ai/AIGenerationFlow.jsx`
- `src/services/aiService.js`

```mermaid
stateDiagram-v2
  [*] --> NotConfigured: aiService.isConfigured() === false
  NotConfigured --> [*]: Go to Settings\nOR Back/Cancel

  [*] --> Describe: aiService.isConfigured() === true
  Describe --> Generating: Generate Component
  Generating --> Review: success\n(code + props)
  Generating --> Describe: failure

  Review --> Review: Regenerate\n(with feedback)
  Review --> Creating: Accept
  Creating --> ComponentDetail: createComponent(status='draft')\nthen navigate(/components/:id)
  Creating --> Review: failure

  Review --> Describe: Start Over / Back
  Describe --> [*]: Cancel
```

---

## Theme import wizard (tokens/theme data) (UI)

Source of truth:
- `src/components/themes/import/ImportWizard.jsx`
- `src/components/themes/import/UploadStep.jsx`
- `src/components/themes/import/MappingStep.jsx`
- `src/components/themes/import/ReviewStep.jsx`
- `src/components/themes/import/CompleteStep.jsx`

```mermaid
stateDiagram-v2
  [*] --> Upload
  Upload --> Map: Next
  Map --> Review: Next
  Review --> Complete: Import
  Complete --> [*]

  Map --> Upload: Back
  Review --> Map: Back

  Upload --> Cancelled: Cancel (X)
  Map --> Cancelled: Cancel (X)
  Review --> Cancelled: Cancel (X)
  Complete --> Cancelled: Cancel (X)
  Cancelled --> [*]: navigate(/themes)
```

---

## Figma import record lifecycle (`figma_imports.status`)

Source of truth:
- `src/pages/FigmaImportPage.jsx`
- `src/hooks/useFigmaImport.js`
- `src/components/figma-import/ImportReviewCard.jsx`

```mermaid
stateDiagram-v2
  [*] --> Pending: figma_imports.status='pending'\n(default)

  Pending --> Reviewing: Review (opens modal)
  Reviewing --> Pending: Close modal

  Reviewing --> Importing: Import Selected\nOR Import All
  Importing --> Imported: all succeeded\nstatus='imported'
  Importing --> Partial: some succeeded\nstatus='partial'
  Importing --> Failed: none succeeded\nstatus='failed'

  Imported --> Reviewing: Review
  Partial --> Reviewing: Review
  Failed --> Reviewing: Review

  Imported --> Pending: Reset
  Partial --> Pending: Reset
  Failed --> Pending: Reset

  Failed --> Importing: Retry Import
  Partial --> Importing: Retry Import
```

---

## Figma component review/import modal (UI)

Source of truth:
- `src/components/figma-import/ImportReviewModal.jsx`
- `src/components/figma-import/GenerateFromFigma.jsx`

```mermaid
stateDiagram-v2
  [*] --> Overview
  Overview --> Structure: Tab
  Overview --> Props: Tab
  Overview --> Variants: Tab
  Overview --> Tokens: Tab
  Overview --> Images: Tab

  Structure --> Overview: Tab
  Props --> Overview: Tab
  Variants --> Overview: Tab
  Tokens --> Overview: Tab
  Images --> Overview: Tab

  Overview --> ImportAsDraft: Import as Draft
  ImportAsDraft --> [*]: inserts into components(status='draft')\n(via parent handler)

  Overview --> ImportAndGenerate: Import & Generate Code
  ImportAndGenerate --> ComponentDetail: handleImportAndGenerate()\ncreateComponent(status='draft')\n+ upload images\nthen navigate(/components/:id)
  ImportAndGenerate --> Overview: error

  Overview --> [*]: Cancel
```

---

## Export flow (UI)

Source of truth:
- `src/components/export/ExportModal.jsx`
- `src/services/exportService.js`
- `src/components/export/ExportResultDialog.jsx`

```mermaid
stateDiagram-v2
  [*] --> Closed
  Closed --> Open: open=true

  Open --> Selecting: choose themes/components\nchoose format tab
  Selecting --> Exporting: Export\n(exportService.buildPackage)
  Exporting --> Result: success\n(exportResult != null)
  Exporting --> Selecting: failure

  Result --> Downloading: Download ZIP\n(progress updates)
  Downloading --> Result: done or error

  Result --> Open: Close result dialog
  Open --> Closed: Cancel / onClose
```


