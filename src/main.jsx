import { Analytics } from "@vercel/analytics/next"

import { Analytics } from '@vercel/analytics/react';

// Wrap your main app component with <Analytics />
ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <Analytics />
    <App />
  </>
);

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // <-- MUST BE AT THE BOTTOM

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)