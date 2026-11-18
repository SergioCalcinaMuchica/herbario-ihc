const SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Foco inicial dentro del diálogo, Tab atrapado y foco devuelto al cerrar. */
export function focusTrap(node: HTMLElement) {
  const previous = document.activeElement as HTMLElement | null;
  const focusables = () =>
    [...node.querySelectorAll<HTMLElement>(SELECTOR)].filter(
      (el) => el.offsetParent !== null || el === document.activeElement
    );

  function onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;
    const items = focusables();
    if (!items.length) {
      event.preventDefault();
      node.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  node.addEventListener('keydown', onKeydown);
  queueMicrotask(() => focusables()[0]?.focus());

  return {
    destroy() {
      node.removeEventListener('keydown', onKeydown);
      previous?.focus?.();
    }
  };
}
