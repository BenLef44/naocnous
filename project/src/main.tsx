import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import SuiviDemande from './components/interventions/SuiviDemande.tsx';
import './index.css';

const trackingRef = new URLSearchParams(window.location.search).get('ref');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {trackingRef
      ? <SuiviDemande reference={trackingRef} onBack={() => { window.history.pushState({}, '', window.location.pathname); window.location.reload(); }} />
      : <App />
    }
  </StrictMode>
);
