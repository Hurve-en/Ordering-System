export const logger = {
  info: (message: string, data?: unknown): void => {
    console.log(`ℹ️  [INFO] ${message}`, data || '');
  },
  error: (message: string, error?: unknown): void => {
    console.error(`❌ [ERROR] ${message}`, error || '');
  },
  warn: (message: string, data?: unknown): void => {
    console.warn(`⚠️  [WARN] ${message}`, data || '');
  },
  success: (message: string, data?: unknown): void => {
    console.log(`✅ [SUCCESS] ${message}`, data || '');
  },
  debug: (message: string, data?: unknown): void => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🐛 [DEBUG] ${message}`, data || '');
    }
  }
};