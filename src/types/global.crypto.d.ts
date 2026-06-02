declare global {
  const crypto: {
    getRandomValues<T extends ArrayBufferView>(array: T): T;
  };
}

export {};