declare module 'express-session' {
  interface SessionData {
    userId?: string;
    phone?: string;
    otpSent?: boolean;
    authenticated?: boolean;
  }
}