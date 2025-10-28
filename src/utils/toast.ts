export type ToastType = 'info' | 'success' | 'error';

export function showToast(message: string, type: ToastType = 'info', duration = 3000): void {
  if (typeof document === 'undefined') return;

  const containerId = 'alf-toast-container';
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.className = 'fixed top-4 right-4 z-[10000] flex flex-col gap-2';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const base = 'px-4 py-2 rounded-lg shadow-lg text-white text-sm max-w-xs break-words';
  const color = type === 'success'
    ? 'bg-emerald-600'
    : type === 'error'
      ? 'bg-red-600'
      : 'bg-slate-900';
  toast.className = `${base} ${color}`;
  toast.textContent = message;

  // Dismiss on click
  toast.addEventListener('click', () => {
    toast.remove();
  });

  container.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
    // Cleanup container if empty
    if (container && container.childElementCount === 0) {
      container.remove();
    }
  }, Math.max(1200, duration));
}

