import React from 'react';
import ReactDOM from 'react-dom';
import createRoot from 'react-dom/client'

// Register service worker
if ('serviceWorker' in navigator && 'SyncManager' in window) {
  navigator.serviceWorker.register('/sw.js').then((registration) => {
    console.log('Service Worker registered with scope:', registration.scope);
  }).catch((error) => {
    console.error('Service Worker registration failed:', error);
  });
}

const Index = () => {
        return <div>WELCOME TO MELLIFERA!!</div>;
    };

    ReactDOM.createRoot(
        document.getElementById("app"),
      )
      .render(
        <React.StrictMode>
          <Index />
        </React.StrictMode>,
      );