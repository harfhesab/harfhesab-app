import { createRef } from 'react';
import { ToastRefMethod, ShowParams } from './Toast'; // مسیر را چک کنید

export const toastRef = createRef<ToastRefMethod>();

// حالا وقتی پارامترها را پاس می‌دهید، IDE مقادیر مجاز را پیشنهاد می‌دهد
export const showToast = (params: ShowParams) => {
  toastRef.current?.show(params);
};

export const hideToast = () => {
  toastRef.current?.hide();
};