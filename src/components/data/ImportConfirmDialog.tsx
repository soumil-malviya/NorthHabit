import { X } from 'lucide-react';

interface ImportConfirmDialogProps {
  warnings: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function ImportConfirmDialog({
  warnings,
  onConfirm,
  onCancel,
}: ImportConfirmDialogProps) {
  return (
    <div
      className="import-confirm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-confirm-title"
    >
      <div className="import-confirm-panel">
        <div className="import-confirm-header">
          <div>
            <h3 id="import-confirm-title" className="import-confirm-title">
              Replace current data?
            </h3>
            <p className="import-confirm-copy">
              This import will overwrite your current routines, tasks, focus history, and app settings.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="import-confirm-close"
            aria-label="Cancel import"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {warnings.length > 0 ? (
          <div className="import-confirm-warnings">{warnings.join(' ')}</div>
        ) : null}

        <div className="import-confirm-actions">
          <button type="button" onClick={onCancel} className="settings-button settings-button--secondary">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="settings-button settings-button--primary">
            Overwrite and Import
          </button>
        </div>
      </div>
    </div>
  );
}
