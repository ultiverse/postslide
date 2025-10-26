import { useEffect, useState } from 'react';

const MIN_WIDTH = 1024;
export default function Editor() {
    const [w, setW] = useState<number>(window.innerWidth);
    useEffect(() => {
        const onResize = () => setW(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    if (w < MIN_WIDTH) {
        return (
            <div className="h-dvh grid place-items-center p-6 text-center">
                <div>
                    <h2 className="text-xl font-semibold mb-2">Desktop required</h2>
                    <p>Please use a screen at least {MIN_WIDTH}px wide to edit. You can still preview on mobile.</p>
                </div>
            </div>
        );
    }
    return (
        <div className="grid grid-cols-[280px_minmax(0,1fr)_320px] h-dvh">
            <aside className="border-r p-4">Slides</aside>
            <section className="p-4">Canvas</section>
            <aside className="border-l p-4">Inspector</aside>
        </div>
    );
}
