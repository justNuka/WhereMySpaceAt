import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';

console.log('React script lancé !');

const root = createRoot(document.getElementById('root'));
root.render(<App />);
