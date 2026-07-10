export const LOCAL_STORAGE_SYNC_EVENT = 'northhabit:storage-sync';

type CloudStorageWriter = (key: string, value: unknown) => void;

let cloudStorageWriter: CloudStorageWriter | null = null;
let cloudWritesPaused = false;

export function publishStorageSync<T>(key: string, value: T) {
  window.dispatchEvent(
    new CustomEvent(LOCAL_STORAGE_SYNC_EVENT, { detail: { key, value } }),
  );
}

export function setCloudStorageWriter(writer: CloudStorageWriter | null) {
  cloudStorageWriter = writer;
}

export function writeCloudStorageValue(key: string, value: unknown) {
  if (cloudWritesPaused) return;
  cloudStorageWriter?.(key, value);
}

export function runWithoutCloudStorageWrites(callback: () => void) {
  cloudWritesPaused = true;
  try {
    callback();
  } finally {
    cloudWritesPaused = false;
  }
}

export function applyCloudStorageValue(
  key: string,
  value: unknown,
  type: 'json' | 'string' = 'json',
) {
  runWithoutCloudStorageWrites(() => {
    localStorage.setItem(key, type === 'json' ? JSON.stringify(value) : String(value));
    publishStorageSync(key, value);
  });
}
