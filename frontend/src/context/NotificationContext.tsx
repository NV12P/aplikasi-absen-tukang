import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Trash2, HelpCircle } from 'lucide-react';
import './Notification.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
}

interface NotificationContextType {
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  toast: {
    success: (message: string, title?: string, duration?: number) => void;
    error: (message: string, title?: string, duration?: number) => void;
    warning: (message: string, title?: string, duration?: number) => void;
    info: (message: string, title?: string, duration?: number) => void;
  };
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: { title: '', message: '' },
    resolve: null
  });

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', title?: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (message: string, title = 'Berhasil', duration?: number) => showToast(message, 'success', title, duration),
    error: (message: string, title = 'Gagal', duration?: number) => showToast(message, 'error', title, duration),
    warning: (message: string, title = 'Peringatan', duration?: number) => showToast(message, 'warning', title, duration),
    info: (message: string, title = 'Informasi', duration?: number) => showToast(message, 'info', title, duration),
  };

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        resolve
      });
    });
  }, []);

  const handleConfirmResponse = (value: boolean) => {
    if (confirmState.resolve) {
      confirmState.resolve(value);
    }
    setConfirmState({ isOpen: false, options: { title: '', message: '' }, resolve: null });
  };

  return (
    <NotificationContext.Provider value={{ showToast, toast, confirm }}>
      {children}

      {/* Toast Container */}
      <div className="toast-container" aria-live="polite">
        {toasts.map((item) => (
          <div key={item.id} className={`toast-card toast-${item.type}`}>
            <div className="toast-icon-wrapper">
              {item.type === 'success' && <CheckCircle2 className="toast-icon" size={22} />}
              {item.type === 'error' && <XCircle className="toast-icon" size={22} />}
              {item.type === 'warning' && <AlertTriangle className="toast-icon" size={22} />}
              {item.type === 'info' && <Info className="toast-icon" size={22} />}
            </div>
            <div className="toast-content">
              {item.title && <div className="toast-title">{item.title}</div>}
              <div className="toast-message">{item.message}</div>
            </div>
            <button className="toast-close-btn" onClick={() => removeToast(item.id)} aria-label="Tutup notifikasi">
              <X size={16} />
            </button>
            {item.duration && item.duration > 0 && (
              <div
                className="toast-progress-bar"
                style={{ animationDuration: `${item.duration}ms` }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Confirm Modal */}
      {confirmState.isOpen && (
        <div className="confirm-modal-overlay" onClick={() => handleConfirmResponse(false)}>
          <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className={`confirm-icon-badge confirm-badge-${confirmState.options.type || 'warning'}`}>
              {confirmState.options.type === 'danger' && <Trash2 size={28} />}
              {confirmState.options.type === 'warning' && <AlertTriangle size={28} />}
              {confirmState.options.type === 'success' && <CheckCircle2 size={28} />}
              {(!confirmState.options.type || confirmState.options.type === 'info') && <HelpCircle size={28} />}
            </div>

            <div className="confirm-modal-body">
              <h3 className="confirm-modal-title">{confirmState.options.title}</h3>
              <p className="confirm-modal-message">{confirmState.options.message}</p>
            </div>

            <div className="confirm-modal-footer">
              <button
                type="button"
                className="btn-confirm-cancel"
                onClick={() => handleConfirmResponse(false)}
              >
                {confirmState.options.cancelText || 'Batal'}
              </button>
              <button
                type="button"
                className={`btn-confirm-action btn-action-${confirmState.options.type || 'warning'}`}
                onClick={() => handleConfirmResponse(true)}
              >
                {confirmState.options.confirmText || 'Ya, Lanjutkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
