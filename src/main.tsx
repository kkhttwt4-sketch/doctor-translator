import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ignore HMR WebSocket connection errors as specified in AI Studio guidelines
window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message || String(event.reason || '');
  if (
    msg.includes('WebSocket') ||
    msg.includes('vite:ws') ||
    msg.includes('closed without opened')
  ) {
    event.preventDefault();
  }
});

// Register Service Worker for PWA compliance and offline support
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('PWA Service Worker registered successfully with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('PWA Service Worker registration skipped or failed:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
