import FastImage from '@d11/react-native-fast-image';

type PreloadOptions = {
  batchSize?: number;
  delayBetweenBatches?: number;
};

const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));
const isValidUrl = (urlString: string): boolean => {
  try {
    if (!urlString || typeof urlString !== 'string') return false;
    const trimmed = urlString.trim();
    if (trimmed.length === 0) return false;
    if (!/^(https?|file):\/\//i.test(trimmed)) {
        return false;
    }
    new URL(trimmed); 
    return true;
  } catch (e) {
    return false;
  }
};

export async function preloadImages(
  uris: string[],
  options?: PreloadOptions
): Promise<boolean> {
    if (!uris || uris.length === 0) return true;
    const batchSize = options?.batchSize ?? 10;
    const delayBetweenBatches = options?.delayBetweenBatches ?? 80;
    const uniqueUris = Array.from(new Set(uris))
        .filter(u => isValidUrl(u))
        .map(u => u.trim());
    if (uniqueUris.length === 0) return true;
    try {
        for (let i = 0; i < uniqueUris.length; i += batchSize) {
            const batch = uniqueUris.slice(i, i + batchSize);
            try {
                FastImage.preload(
                    batch.map(uri => ({
                        uri,
                        priority: FastImage.priority.high,
                        cache: FastImage.cacheControl.immutable,
                    }))
                );
            } catch (innerError) {
                console.warn('[ImagePreload] Batch execution failed', innerError);
            }
            if (i + batchSize < uniqueUris.length) {
                await sleep(delayBetweenBatches);
            }
        }
        return true;
    } catch (error) {
        console.warn('[ImagePreload] Global error', error);
        return false;
    }
}