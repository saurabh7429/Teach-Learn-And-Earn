import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export default function Modal({ isOpen, show, onClose, title, description, children }) {
  const visible = isOpen !== undefined ? isOpen : show;
  const titleId = useId();
  const descriptionId = useId();
  const contentRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    if (!visible) return undefined;

    previouslyFocusedRef.current = document.activeElement;
    const root = document.getElementById('root');
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    if (root) {
      root.setAttribute('inert', '');
      root.setAttribute('aria-hidden', 'true');
    }

    const focusTimer = window.setTimeout(() => {
      const focusable = contentRef.current?.querySelector(FOCUSABLE_SELECTOR);
      if (focusable) {
        focusable.focus();
      } else {
        contentRef.current?.focus();
      }
    }, 0);

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusableNodes = contentRef.current
        ? Array.from(contentRef.current.querySelectorAll(FOCUSABLE_SELECTOR))
        : [];

      if (focusableNodes.length === 0) {
        event.preventDefault();
        contentRef.current?.focus();
        return;
      }

      const first = focusableNodes[0];
      const last = focusableNodes[focusableNodes.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        if (activeElement === first || activeElement === contentRef.current) {
          event.preventDefault();
          last.focus();
        }
      } else if (activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (root) {
        root.removeAttribute('inert');
        root.removeAttribute('aria-hidden');
      }
      if (previouslyFocusedRef.current && typeof previouslyFocusedRef.current.focus === 'function') {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return createPortal(
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        ref={contentRef}
        tabIndex={-1}
      >
        <div className="modal-header">
          <h2 className="modal-title" id={titleId}>{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal" type="button">✕</button>
        </div>
        {description && <p id={descriptionId} className="sr-only">{description}</p>}
        {children}
      </div>
    </div>,
    document.body
  );
}
