export interface GalleryArchiveFile {
  url: string;
  path: string;
  bytes: number;
}

interface ArchiveOptions {
  signal: AbortSignal;
  onProgress: (loaded: number, total: number) => void;
}

interface ArchiveSink {
  write: (data: Uint8Array) => Promise<void>;
  close: () => Promise<void>;
  abort: (reason?: unknown) => Promise<void>;
}

interface ArchiveEntry {
  name: Uint8Array;
  offset: number;
  size: number;
  crc: number;
}

const MAX_ZIP32 = 0xffffffff;
const ZIP_FLAGS = 0x0808; // UTF-8 names and a size/CRC descriptor after each file.
const crcTable = new Uint32Array(256);

for (let index = 0; index < crcTable.length; index += 1) {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  crcTable[index] = value >>> 0;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;
  return `${value.toLocaleString("en", {
    maximumFractionDigits: exponent === 0 || value >= 100 ? 0 : 1,
  })} ${units[exponent]}`;
}

function checkAbort(signal: AbortSignal): void {
  if (signal.aborted) {
    throw signal.reason ?? new DOMException("Download cancelled", "AbortError");
  }
}

function updateCrc(crc: number, data: Uint8Array): number {
  let result = crc;
  for (let index = 0; index < data.length; index += 1) {
    result = crcTable[(result ^ data[index]) & 0xff] ^ (result >>> 8);
  }
  return result >>> 0;
}

function zipName(path: string): Uint8Array {
  const normalized = path.replace(/\\/g, "/");
  if (
    !normalized ||
    normalized.includes("\0") ||
    normalized.startsWith("/") ||
    /^[a-z]:/i.test(normalized) ||
    normalized.split("/").some((part) => !part || part === "." || part === "..")
  ) {
    throw new Error(`Invalid archive path: ${path}`);
  }
  const name = new TextEncoder().encode(normalized);
  if (name.length > 0xffff) {
    throw new Error("A filename is too long to include in this archive.");
  }
  return name;
}

function createSink(filename: string): ArchiveSink {
  const chunks: ArrayBuffer[] = [];
  return {
    async write(data) {
      chunks.push(data.slice().buffer as ArrayBuffer);
    },
    async close() {
      const blob = new Blob(chunks, { type: "application/zip" });
      chunks.length = 0;
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = filename;
      link.hidden = true;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(href), 60_000);
    },
    async abort() {
      chunks.length = 0;
    },
  };
}

/** Download original files as a ZIP using the browser's standard download. */
export async function downloadGalleryArchive(
  files: GalleryArchiveFile[],
  filename: string,
  options: ArchiveOptions,
): Promise<void> {
  const { signal, onProgress } = options;
  checkAbort(signal);
  if (files.length > 0xffff) {
    throw new Error("This archive contains too many files.");
  }

  const names = files.map((file) => zipName(file.path));
  const total = files.reduce((sum, file) => sum + Math.max(0, file.bytes), 0);
  const date = new Date();
  const year = Math.min(2107, Math.max(1980, date.getFullYear()));
  const dosTime =
    (date.getHours() << 11) |
    (date.getMinutes() << 5) |
    Math.floor(date.getSeconds() / 2);
  const dosDate =
    ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  const entries: ArchiveEntry[] = [];
  const sink = createSink(filename);
  let offset = 0;
  let loaded = 0;
  let lastProgressAt = performance.now();

  async function write(data: Uint8Array): Promise<void> {
    checkAbort(signal);
    if (offset + data.length > MAX_ZIP32) {
      throw new Error("This archive is too large for a standard ZIP file.");
    }
    await sink.write(data);
    offset += data.length;
  }

  try {
    checkAbort(signal);
    onProgress(0, total);

    for (let index = 0; index < files.length; index += 1) {
      checkAbort(signal);
      const file = files[index];
      const name = names[index];
      const entryOffset = offset;
      const header = new Uint8Array(30 + name.length);
      const view = new DataView(header.buffer);
      view.setUint32(0, 0x04034b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, ZIP_FLAGS, true);
      view.setUint16(8, 0, true); // Stored: original media is already compressed.
      view.setUint16(10, dosTime, true);
      view.setUint16(12, dosDate, true);
      view.setUint16(26, name.length, true);
      header.set(name, 30);
      await write(header);

      const response = await fetch(file.url, { signal });
      if (!response.ok) {
        throw new Error(`Could not download ${file.path} (${response.status}).`);
      }

      let crc = 0xffffffff;
      let size = 0;
      async function writeContent(chunk: Uint8Array): Promise<void> {
        checkAbort(signal);
        if (size + chunk.length > MAX_ZIP32) {
          throw new Error(`The file ${file.path} is too large for this archive.`);
        }
        crc = updateCrc(crc, chunk);
        await write(chunk);
        size += chunk.length;
        loaded += chunk.length;
        const now = performance.now();
        if (now - lastProgressAt >= 100) {
          onProgress(loaded, total);
          lastProgressAt = now;
        }
      }

      if (response.body) {
        const reader = response.body.getReader();
        try {
          while (true) {
            checkAbort(signal);
            const { done, value } = await reader.read();
            if (done) break;
            await writeContent(value);
          }
        } catch (error) {
          await reader.cancel(error).catch(() => undefined);
          throw error;
        } finally {
          reader.releaseLock();
        }
      } else {
        await writeContent(new Uint8Array(await response.arrayBuffer()));
      }

      crc = (crc ^ 0xffffffff) >>> 0;
      const descriptor = new Uint8Array(16);
      const descriptorView = new DataView(descriptor.buffer);
      descriptorView.setUint32(0, 0x08074b50, true);
      descriptorView.setUint32(4, crc, true);
      descriptorView.setUint32(8, size, true);
      descriptorView.setUint32(12, size, true);
      await write(descriptor);
      entries.push({ name, offset: entryOffset, size, crc });
    }

    const directoryOffset = offset;
    for (const entry of entries) {
      const header = new Uint8Array(46 + entry.name.length);
      const view = new DataView(header.buffer);
      view.setUint32(0, 0x02014b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, 20, true);
      view.setUint16(8, ZIP_FLAGS, true);
      view.setUint16(12, dosTime, true);
      view.setUint16(14, dosDate, true);
      view.setUint32(16, entry.crc, true);
      view.setUint32(20, entry.size, true);
      view.setUint32(24, entry.size, true);
      view.setUint16(28, entry.name.length, true);
      view.setUint32(42, entry.offset, true);
      header.set(entry.name, 46);
      await write(header);
    }

    const end = new Uint8Array(22);
    const endView = new DataView(end.buffer);
    endView.setUint32(0, 0x06054b50, true);
    endView.setUint16(8, entries.length, true);
    endView.setUint16(10, entries.length, true);
    endView.setUint32(12, offset - directoryOffset, true);
    endView.setUint32(16, directoryOffset, true);
    await write(end);
    checkAbort(signal);
    onProgress(loaded, total);
    await sink.close();
  } catch (error) {
    await sink.abort(error).catch(() => undefined);
    throw error;
  }
}
