export function toAbsoluteUrl(pathOrUrl: string, baseUrl: string) {
  baseUrl = baseUrl.replace(/\/$/, '');
  try {
    new URL(pathOrUrl);
  } catch {
    if (pathOrUrl.startsWith('//')) {
      pathOrUrl = 'https:' + pathOrUrl;
    } else if (pathOrUrl.startsWith('/')) {
      pathOrUrl = baseUrl + pathOrUrl;
    } else {
      pathOrUrl = baseUrl + '/' + pathOrUrl;
    }
  }
  return pathOrUrl;
}

export async function* limitedBytesStreamReaderIterator(stream: ReadableStream<Uint8Array>, maxBytes: number) {
  let counter = 0;
  let reader = stream.getReader();
  try {
    while (true) {
      let chunk = await reader.read();
      if (chunk.done) {
        return;
      }
      counter += chunk.value.byteLength;
      if (counter >= maxBytes) {
        return;
      }
      yield chunk.value;
    }
  } finally {
    reader.releaseLock();
  }
}
