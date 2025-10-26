import { jsx as _jsx } from "react/jsx-runtime";
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from '@/routes/App';
import Editor from '@/routes/Editor';
import Templates from '@/routes/Templates';
import Export from '@/routes/Export';
import { useProject } from '@/state/project.store';
// Rehydrate from localStorage
const saved = localStorage.getItem('slidepost.project');
if (saved) {
    useProject.setState({ project: JSON.parse(saved) });
}
const router = createBrowserRouter([
    { path: '/', element: _jsx(App, {}) },
    { path: '/editor', element: _jsx(Editor, {}) },
    { path: '/templates', element: _jsx(Templates, {}) },
    { path: '/export', element: _jsx(Export, {}) },
]);
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(RouterProvider, { router: router }));
