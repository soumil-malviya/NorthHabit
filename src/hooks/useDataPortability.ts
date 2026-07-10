import { useCallback, useRef, useState } from 'react';
import {
  applyNorthHabitImport,
  downloadNorthHabitExport,
  parseNorthHabitImport,
  type NorthHabitExport,
} from '../lib/storage/backup';

export function useDataPortability() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<NorthHabitExport | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const exportData = useCallback(() => {
    downloadNorthHabitExport();
    setMessage('Export downloaded.');
    setError(null);
  }, []);

  const handleImportFile = useCallback(async (file: File | undefined) => {
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
  }, []);

  const confirmImport = useCallback(() => {
    if (!pendingImport) return;
    applyNorthHabitImport(pendingImport);
    setPendingImport(null);
    setWarnings([]);
    setMessage('Import complete. Your workspace has been refreshed.');
  }, [pendingImport]);

  const cancelImport = useCallback(() => {
    setPendingImport(null);
    setWarnings([]);
  }, []);

  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const clearFeedback = useCallback(() => {
    setMessage(null);
    setError(null);
  }, []);

  return {
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
    clearFeedback,
  };
}
