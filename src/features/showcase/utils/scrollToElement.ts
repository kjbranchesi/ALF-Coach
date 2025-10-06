const DEFAULT_HIGHLIGHT_CLASSES = ['ring-2', 'ring-primary-500', 'ring-offset-4', 'dark:ring-offset-slate-900'];

interface ScrollToElementOptions {
  behavior?: ScrollBehavior;
  highlightClasses?: string[];
  highlightDurationMs?: number;
}

export function scrollToElement(elementId: string, options: ScrollToElementOptions = {}): void {
  if (typeof window === 'undefined') {
    return;
  }

  const { behavior = 'smooth', highlightClasses = DEFAULT_HIGHLIGHT_CLASSES, highlightDurationMs = 2000 } = options;
  const element = document.getElementById(elementId);

  if (!element) {
    return;
  }

  element.scrollIntoView({ behavior, block: 'start' });

  if (highlightClasses.length > 0) {
    element.classList.add(...highlightClasses);
    window.setTimeout(() => {
      element.classList.remove(...highlightClasses);
    }, highlightDurationMs);
  }
}
