import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { dark } from '@clerk/themes'
import './index.css'
import App from './App.tsx'
import { ClerkProvider } from '@clerk/clerk-react'
import * as Sentry from "@sentry/react";
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

import { ErrorBoundary } from './components/ErrorBoundary'
import { Toaster } from 'sonner'

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
  });
}

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com'
if (POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
  });
}

const appContent = (
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      afterSignOutUrl="/"
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#ff5c35',
          colorText: 'white',
          colorBackground: 'transparent',
          colorInputBackground: 'rgba(255, 255, 255, 0.03)',
          colorInputText: 'white',
          borderRadius: '0.75rem',
          fontFamily: 'inherit',
        },
        elements: {
          rootBox: "w-full flex justify-center",
          cardBox: "w-full shadow-none border-none",
          card: "bg-transparent shadow-none border-none w-full p-0 sm:p-0",
          headerTitle: "font-display font-bold text-2xl text-ink-primary tracking-tight",
          headerSubtitle: "text-ink-secondary",
          socialButtonsBlockButton: "bg-canvas-100/50 border border-white/[0.04] hover:bg-canvas-200/50 text-white rounded-xl py-3 transition-colors",
          socialButtonsBlockButtonText: "text-sm font-semibold",
          dividerLine: "bg-white/[0.04]",
          dividerText: "text-ink-disabled text-xs uppercase tracking-widest font-bold",
          formFieldLabel: "text-xs font-bold text-ink-secondary",
          formFieldInput: "bg-canvas-200/50 border border-white/5 text-ink-primary rounded-xl px-4 py-3 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all text-sm",
          formButtonPrimary: "bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm py-3 rounded-xl border-none shadow-ag-glow-primary transition-all active:scale-[0.98]",
          footer: "bg-transparent border-none",
          footerAction: "hidden",
          footerActionText: "hidden",
          footerActionLink: "hidden",
          identityPreviewText: "text-ink-primary",
          identityPreviewEditButtonIcon: "text-brand-500 hover:text-brand-600",
        }
      }}
    >
      <App />
      <Toaster theme="dark" position="top-center" />
    </ClerkProvider>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {POSTHOG_KEY ? (
        <PostHogProvider client={posthog}>
          {appContent}
        </PostHogProvider>
      ) : (
        appContent
      )}
    </ErrorBoundary>
  </StrictMode>,
)
