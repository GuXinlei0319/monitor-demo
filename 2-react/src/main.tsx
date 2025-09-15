import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import {
  init, 
  browserTracingIntegration,
  breadcrumbsIntegration
} from "@sentry/react";

init({
  dsn: "https://9ccb21a9359c9b1e7505c8fbdb1ec399@o4509921884045312.ingest.us.sentry.io/4509927129088000",
  sendDefaultPii: true,
  integrations:[
    browserTracingIntegration(),
    breadcrumbsIntegration()
  ]
});

// js 错误
// @ts-expect-error reacterror
reacterror


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
