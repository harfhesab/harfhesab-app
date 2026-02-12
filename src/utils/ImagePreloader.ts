import FastImage from '@d11/react-native-fast-image';

type PreloadOptions = {
  batchSize?: number;
  delayBetweenBatches?: number;
};

const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export async function preloadImages(
  uris: string[],
  options?: PreloadOptions
): Promise<boolean> {
    if (!uris || uris.length === 0) return true;

    const batchSize = options?.batchSize ?? 10;
    const delayBetweenBatches = options?.delayBetweenBatches ?? 80;

    const uniqueUris = Array.from(
        new Set(uris.filter(u => typeof u === 'string' && u.length > 0))
    );

    try {
        for (let i = 0; i < uniqueUris.length; i += batchSize) {
            const batch = uniqueUris.slice(i, i + batchSize);

            FastImage.preload(
                batch.map(uri => ({
                    uri,
                    priority: FastImage.priority.high,
                    cache: FastImage.cacheControl.immutable,
                }))
            );

            if (i + batchSize < uniqueUris.length) {
                await sleep(delayBetweenBatches);
            }
        }

        return true;
    } catch (error) {
        console.warn('[ImagePreload]', error);
        return false;
    }
}
