import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from '@/routes/App';
import Editor from '@/routes/Editor';
import Templates from '@/routes/Templates';
import Export from '@/routes/Export';

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/editor', element: <Editor /> },
  { path: '/templates', element: <Templates /> },
  { path: '/export', element: <Export /> },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />);
