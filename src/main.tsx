import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/reference-ui.css';
import './styles/reference-layout.css';
import './styles/native-fx.css';
import './styles/replica-ui.css';
import './styles/progress-reference.css';
import './styles/progress.css';
import './styles/collections-reference.css';
import './styles/collections.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
