// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from './contexts/ThemeProvider';
import { InstructorProvider } from './contexts/InstructorContext';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <InstructorProvider>
        <App />
      </InstructorProvider>
    </ThemeProvider>
  </React.StrictMode>
);