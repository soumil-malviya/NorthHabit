import { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Download, Shield, Upload, X } from 'lucide-react';
import {
  applyNorthHabitImport,
  downloadNorthHabitExport,
  parseNorthHabitImport,
  type NorthHabitExport,
} from '../lib/storage/backup';

export function DataPortabilityPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<NorthHabitExport | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImportFile = async (file: File | undefined) => {
    setMessage(null);
    setError(null);
    if (!file) return;
    const validation = await parseNorthHabitImport(file);
    if (validation.ok === false) {
      setError(validation.error);
      return;
    }
    setWarnings(validation.warnings);
    setPendingImport(validation.backup);
    if (inputRef.current) inputRef.current.value = '';
  };

  const confirmImport = () => {
    if (!pendingImport) return;
    applyNorthHabitImport(pendingImport);
    setPendingImport(null);
    setWarnings([]);
    setMessage('Import complete. Your workspace has been refreshed.');
  };

  return (
    <section className="rounded-xl border border-cyan-500/20 bg-white/45 dark:bg-white/[0.025] p-4" aria-labelledby="data-portability-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 id="data-portability-heading" className="text-xs font-bold uppercase tracking-wider text-cyan-500 dark:text-cyan-400">
            Data backup
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            Export or restore your full NorthHabit workspace, including routines, tasks, focus history, settings, themes, and preferences.
          </p>
        </div>
        <Shield className="hidden h-5 w-5 text-cyan-500 sm:block" />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            downloadNorthHabitExport();
            setMessage('Export downloaded.');
            setError(null);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-100/70 px-3 py-2.5 text-xs font-bold text-slate-800 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-cyan-500/10 active:translate-y-0 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.08]"
        >
          <Download className="h-3.5 w-3.5" />
          Export Data
        </button>
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-100/70 px-3 py-2.5 text-xs font-bold text-slate-800 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-cyan-500/10 active:translate-y-0 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.08]">
          <Upload className="h-3.5 w-3.5" />
          Import Data
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => void handleImportFile(event.target.files?.[0])}
          />
        </label>
      </div>

      {message && (
        <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {message}
        </p>
      )}
      {error && (
        <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}

      {pendingImport && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/50 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="import-confirm-title">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white p-5 shadow-2xl shadow-black/20 dark:bg-slate-950">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 id="import-confirm-title" className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Replace current data?
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  This import will overwrite your current routines, tasks, focus history, and app settings.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPendingImport(null)}
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Cancel import"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {warnings.length > 0 && (
              <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-700 dark:text-amber-200">
                {warnings.join(' ')}
              </div>
            )}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPendingImport(null)}
                className="rounded-lg px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmImport}
                className="rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-600/20 transition-all hover:bg-cyan-500 active:scale-95"
              >
                Overwrite and Import
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
