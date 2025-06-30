import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

export function navigate(name: string, params?: object) {
  if (navigationRef.isReady()) {
    (navigationRef.navigate as Function).apply(null, [name, params]);
  }
}
export function goBack() {
  if (navigationRef.isReady()) {
    (navigationRef.goBack as Function).apply(null, []);
  }
}