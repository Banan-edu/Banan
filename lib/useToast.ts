import { useState } from 'react';

interface Toast {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (props: Toast) => {
    console.log('Toast:', props.title, props.description);
    alert(`${props.title}\n${props.description || ''}`);
  };

  return { toast };
}
