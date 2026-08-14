import { createNavigationContainerRef, StackActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

export function navigate(name: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function goBack() {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
}

export function getCurrentRouteName() {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute()?.name;
  }
  return null;
}

export function pop(count: number = 1) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch({
      ...StackActions.pop(count),
    });
  }
}

export function popTo(name: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      StackActions.popTo(name, params)
    );
  }
}