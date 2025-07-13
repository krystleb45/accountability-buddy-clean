// src/context/ui/ModalContext.tsx
'use client';

import React, { createContext, useState, useCallback, useContext, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalOptions {
  style?: React.CSSProperties;
  closeOnOverlayClick?: boolean;
}

interface ModalContextType {
  isOpen: boolean;
  open: (content: ReactNode, options?: ModalOptions) => void;
  close: () => void;
  toggle: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = (): ModalContextType => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within a <ModalProvider>');
  return ctx;
};

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);
  const [options, setOptions] = useState<ModalOptions>({});

  const open = useCallback((modalContent: ReactNode, opts: ModalOptions = {}) => {
    setContent(modalContent);
    setOptions(opts);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setContent(null);
    setOptions({});
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((v) => !v);
  }, []);

  const handleOverlayClick = useCallback(() => {
    if (options.closeOnOverlayClick) {
      close();
    }
  }, [options.closeOnOverlayClick, close]);

  const modalPortal = isOpen
    ? createPortal(
        <>
          {/*
            This div has role="dialog" (an interactive widget) so:
            • tabIndex={-1} is allowed (it’s programmatically focusable)
            • it has both onClick and onKeyDown
            We disable exactly the lint rules on this element only.
          */}
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex,jsx-a11y/no-noninteractive-element-interactions,jsx-a11y/click-events-have-key-events */}
          <div
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            onClick={handleOverlayClick}
            onKeyDown={(e) => {
              if (e.key === 'Escape') close();
            }}
            style={overlayStyles}
          >
            {/* stop clicks inside from closing */}
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
            <div
              role="document"
              // stop clicks from closing the modal
              onClick={(e) => e.stopPropagation()}
              // stop key events (e.g. Escape) from bubbling to the overlay
              onKeyDown={(e) => e.stopPropagation()}
              style={{ ...contentStyles, ...options.style }}
            >
              {content}
              <button onClick={close} aria-label="Close modal" style={closeButtonStyles}>
                ×
              </button>
            </div>
          </div>
        </>,
        document.body,
      )
    : null;

  return (
    <ModalContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
      {modalPortal}
    </ModalContext.Provider>
  );
};

const overlayStyles: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const contentStyles: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: 8,
  padding: 20,
  maxWidth: '90%',
  maxHeight: '90%',
  overflowY: 'auto',
  position: 'relative',
};

const closeButtonStyles: React.CSSProperties = {
  position: 'absolute',
  top: 10,
  right: 10,
  background: 'transparent',
  border: 'none',
  fontSize: '1.5rem',
  cursor: 'pointer',
};
