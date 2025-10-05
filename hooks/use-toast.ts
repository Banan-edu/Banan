import { useState, useCallback } from 'react';

type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

export function useToast() {
  const [, setToasts] = useState<ToastProps[]>([]);

  const toast = useCallback((props: ToastProps) => {
    const toastElement = document.createElement('div');
    toastElement.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
      props.variant === 'destructive' 
        ? 'bg-red-600 text-white' 
        : 'bg-white border border-gray-200'
    }`;
    
    if (props.title) {
      const title = document.createElement('div');
      title.className = 'font-semibold mb-1';
      title.textContent = props.title;
      toastElement.appendChild(title);
    }
    
    if (props.description) {
      const desc = document.createElement('div');
      desc.className = 'text-sm opacity-90';
      desc.textContent = props.description;
      toastElement.appendChild(desc);
    }
    
    document.body.appendChild(toastElement);
    
    setTimeout(() => {
      toastElement.style.transition = 'opacity 0.3s';
      toastElement.style.opacity = '0';
      setTimeout(() => document.body.removeChild(toastElement), 300);
    }, 3000);
    
    setToasts(prev => [...prev, props]);
  }, []);

  return { toast };
}
