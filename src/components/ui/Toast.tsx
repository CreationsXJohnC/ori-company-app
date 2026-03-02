/**
 * ORI APP — Toast / Notification System
 * Lightweight in-app toast. For production, consider react-native-toast-message.
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react-native';
import { useTheme } from '@/theme';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id:      string;
  type:    ToastType;
  title:   string;
  message?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string) => void;
  success:   (title: string, message?: string) => void;
  error:     (title: string, message?: string) => void;
  info:      (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const { colors, semantic, fontFamilies } = useTheme();

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const contextValue: ToastContextType = {
    showToast,
    success: (t, m) => showToast('success', t, m),
    error:   (t, m) => showToast('error', t, m),
    info:    (t, m) => showToast('info', t, m),
  };

  const typeConfig: Record<ToastType, { bg: string; icon: React.ReactNode }> = {
    success: {
      bg:   '#1A3A28',
      icon: <CheckCircle size={20} color={semantic.success} />,
    },
    error: {
      bg:   '#3A1A1A',
      icon: <AlertCircle size={20} color={semantic.error} />,
    },
    warning: {
      bg:   '#3A2E1A',
      icon: <AlertCircle size={20} color={semantic.warning} />,
    },
    info: {
      bg:   '#1A2A3A',
      icon: <Info size={20} color={semantic.info} />,
    },
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast container */}
      <View
        style={{
          position:   'absolute',
          top:        60,
          left:       16,
          right:      16,
          zIndex:     9999,
          gap:        8,
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => {
          const config = typeConfig[toast.type];
          return (
            <View
              key={toast.id}
              style={{
                backgroundColor:  config.bg,
                borderRadius:     14,
                padding:          14,
                flexDirection:    'row',
                alignItems:       'flex-start',
                gap:              10,
                borderWidth:      1,
                borderColor:      colors.border,
              }}
            >
              {config.icon}
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fontFamilies.bodySemiBold, fontSize: 14, color: colors.textPrimary }}>
                  {toast.title}
                </Text>
                {toast.message && (
                  <Text style={{ fontFamily: fontFamilies.bodyRegular, fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                    {toast.message}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
