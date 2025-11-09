import { useEffect, useState } from 'react';
import { useAutosave } from '@/hooks/useAutosave';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useFontLoader } from '@/hooks/useFontLoader';
import { LeftPane } from '@/components/editor/LeftPane';
import { CenterPane } from '@/components/editor/CenterPane';
import { RightPane } from '@/components/editor/RightPane';

const MIN_WIDTH = 1024;

export default function Editor() {
    useAutosave();
    useKeyboardShortcuts();
    useFontLoader();

    // SSR-safe initial width
    const [w, setW] = useState<number>(() =>
        typeof window !== 'undefined' ? window.innerWidth : MIN_WIDTH,
    );
    useEffect(() => {
        const onResize = () => setW(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    if (w < MIN_WIDTH) {
        return (
            <div className="h-dvh grid place-items-center p-6 text-center">
                <div>
                    <h2 className="mb-2 text-xl font-semibold">Desktop required</h2>
                    <p>
                        Please use a screen at least {MIN_WIDTH}px wide to edit. You can still
                        preview on mobile.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid h-dvh grid-cols-[280px_minmax(0,1fr)_320px] bg-gradient-to-br from-brand-50 via-white to-accent-400/5">
            <LeftPane />
            <CenterPane />
            <RightPane />
        </div>
    );
}
