import { useLayoutEffect, useRef } from 'react';

/** refی که همیشه آخرین `value` را نگه می‌دارد؛ برای callbackهای پایدار که props تازه را می‌خوانند. */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
