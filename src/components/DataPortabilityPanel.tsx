import { AlertCircle, CheckCircle2, Download, Shield, Upload } from 'lucide-react';
import { ImportConfirmDialog } from './data/ImportConfirmDialog';
import { useDataPortability } from '../hooks/useDataPortability';

export function DataPortabilityPanel() {
  const {
    inputRef,
    pendingImport,
    warnings,
    message,
    error,
    exportData,
    handleImportFile,
    confirmImport,
    cancelImport,
    openFilePicker,
  } = useDataPortability();

  return (
    <>
      <section className="data-portability-panel" aria-labelledby="data-portability-heading">
        <div className="data-portability-header">
          <div>
            <h4 id="data-portability-heading" className="data-portability-title">
              Data backup
            </h4>
            <p className="data-portability-copy">
              Export or restore your full NorthHabit workspace, including routines, tasks, focus history, settings, themes, and preferences.
            </p>
          </div>
          <Shield className="data-portability-icon" strokeWidth={1.75} />
        </div>

        <div className="data-portability-actions">
          <button type="button" onClick={exportData} className="settings-button settings-button--secondary">
            <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
            Export Data
          </button>
          <button type="button" onClick={openFilePicker} className="settings-button settings-button--secondary">
            <Upload className="h-3.5 w-3.5" strokeWidth={1.75} />
            Import Data
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(event) => void handleImportFile(event.target.files?.[0])}
          />
        </div>

        {message ? (
          <p className="data-portability-feedback data-portability-feedback--success">
            <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="data-portability-feedback data-portability-feedback--error">
            <AlertCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
            {error}
          </p>
        ) : null}
      </section>

      {pendingImport ? (
        <ImportConfirmDialog
          warnings={warnings}
          onConfirm={confirmImport}
          onCancel={cancelImport}
        />
      ) : null}
    </>
  );
}
