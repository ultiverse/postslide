import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
export default function App() {
    return (_jsx("main", { className: "min-h-screen container flex items-center", children: _jsx(Card, { className: "mx-auto w-full max-w-xl", children: _jsxs(CardContent, { className: "p-8 space-y-6", children: [_jsx("h1", { className: "text-3xl font-bold", children: "SlidePost" }), _jsx("p", { children: "Create LinkedIn carousels in minutes \u2014 not hours." }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { asChild: true, children: _jsx(Link, { to: "/editor", children: "Open Editor" }) }), _jsx(Button, { variant: "outline", asChild: true, children: _jsx(Link, { to: "/templates", children: "Browse Templates" }) })] })] }) }) }));
}
