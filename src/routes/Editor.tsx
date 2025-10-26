import { useEffect, useState } from 'react';
import { useProject } from '@/state/project.store';
import { useAutosave } from '@/hooks/useAutosave';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { SlideBlock } from '@/types/domain';

const MIN_WIDTH = 1024;
export default function Editor() {
    useAutosave();
    useKeyboardShortcuts();

    const project = useProject((s) => s.project);
    const selectedSlideId = useProject((s) => s.selectedSlideId);
    const setSelectedSlide = useProject((s) => s.setSelectedSlide);
    const updateProjectTitle = useProject((s) => s.updateProjectTitle);
    const addSlide = useProject((s) => s.addSlide);
    const duplicateSlide = useProject((s) => s.duplicateSlide);
    const removeSlide = useProject((s) => s.removeSlide);
    const moveSlideUp = useProject((s) => s.moveSlideUp);
    const moveSlideDown = useProject((s) => s.moveSlideDown);
    const addBlock = useProject((s) => s.addBlock);
    const updateBlock = useProject((s) => s.updateBlock);
    const updateBullets = useProject((s) => s.updateBullets);
    const removeBlock = useProject((s) => s.removeBlock);
    const moveBlockUp = useProject((s) => s.moveBlockUp);
    const moveBlockDown = useProject((s) => s.moveBlockDown);
    const convertBlockKind = useProject((s) => s.convertBlockKind);

    const selectedSlide = project.slides.find((s) => s.id === selectedSlideId);

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
            <aside className="border-r p-4 space-y-2 overflow-y-auto">
                <h2 className="font-semibold mb-2">Slides</h2>
                {project.slides.map((s) => (
                    <div
                        key={s.id}
                        onClick={() => setSelectedSlide(s.id)}
                        className={`p-2 rounded text-sm cursor-pointer ${
                            s.id === selectedSlideId ? 'bg-primary text-primary-foreground' : 'bg-muted/30 hover:bg-muted/50'
                        }`}
                    >
                        {s.blocks[0] && 'text' in s.blocks[0] ? s.blocks[0].text : 'Untitled slide'}
                    </div>
                ))}
                <button
                    onClick={addSlide}
                    className="w-full p-2 border border-dashed rounded text-sm hover:bg-muted/20"
                >
                    + Add Slide
                </button>
            </aside>

            <main className="p-4 flex items-center justify-center bg-muted/10">
                <div className="border rounded w-[540px] h-[540px] grid place-items-center text-center">
                    <p className="text-lg font-semibold">{project.title}</p>
                </div>
            </main>

            <aside className="border-l p-4 space-y-4 overflow-y-auto">
                <div>
                    <h2 className="font-semibold mb-2">Project</h2>
                    <label className="block text-sm mb-1">Title</label>
                    <input
                        type="text"
                        value={project.title}
                        onChange={(e) => updateProjectTitle(e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm bg-background"
                    />
                </div>

                {selectedSlide && (
                    <>
                        <div className="border-t pt-4">
                            <h2 className="font-semibold mb-2">Slide</h2>
                            <div className="space-y-2">
                                <button
                                    onClick={() => duplicateSlide(selectedSlide.id)}
                                    className="w-full px-2 py-1 border rounded text-sm hover:bg-muted/20"
                                >
                                    Duplicate
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => moveSlideUp(selectedSlide.id)}
                                        disabled={project.slides[0]?.id === selectedSlide.id}
                                        className="flex-1 px-2 py-1 border rounded text-sm hover:bg-muted/20 disabled:opacity-50"
                                    >
                                        ↑ Up
                                    </button>
                                    <button
                                        onClick={() => moveSlideDown(selectedSlide.id)}
                                        disabled={project.slides[project.slides.length - 1]?.id === selectedSlide.id}
                                        className="flex-1 px-2 py-1 border rounded text-sm hover:bg-muted/20 disabled:opacity-50"
                                    >
                                        ↓ Down
                                    </button>
                                </div>
                                <button
                                    onClick={() => removeSlide(selectedSlide.id)}
                                    disabled={project.slides.length === 1}
                                    className="w-full px-2 py-1 border border-destructive/50 text-destructive rounded text-sm hover:bg-destructive/10 disabled:opacity-50"
                                >
                                    Delete Slide
                                </button>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h2 className="font-semibold mb-2">Blocks</h2>
                            <div className="space-y-3">
                                {selectedSlide.blocks.map((block, idx) => (
                                    <div key={block.id} className="p-2 border rounded space-y-2">
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={block.kind}
                                                onChange={(e) => convertBlockKind(selectedSlide.id, block.id, e.target.value as SlideBlock['kind'])}
                                                className="flex-1 px-2 py-1 border rounded text-sm bg-background"
                                            >
                                                <option value="title">Title</option>
                                                <option value="subtitle">Subtitle</option>
                                                <option value="body">Body</option>
                                                <option value="bullets">Bullets</option>
                                            </select>
                                            <button
                                                onClick={() => removeBlock(selectedSlide.id, block.id)}
                                                className="px-2 py-1 text-xs border border-destructive/50 text-destructive rounded hover:bg-destructive/10"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        {block.kind === 'bullets' ? (
                                            <div className="space-y-1">
                                                {block.bullets.map((bullet, bulletIdx) => (
                                                    <div key={bulletIdx} className="flex gap-1">
                                                        <input
                                                            type="text"
                                                            value={bullet}
                                                            onChange={(e) => {
                                                                const newBullets = [...block.bullets];
                                                                newBullets[bulletIdx] = e.target.value;
                                                                updateBullets(selectedSlide.id, block.id, newBullets);
                                                            }}
                                                            className="flex-1 px-2 py-1 border rounded text-sm bg-background"
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const newBullets = block.bullets.filter((_, i) => i !== bulletIdx);
                                                                updateBullets(selectedSlide.id, block.id, newBullets);
                                                            }}
                                                            className="px-2 text-xs text-destructive hover:bg-destructive/10"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => updateBullets(selectedSlide.id, block.id, [...block.bullets, ''])}
                                                    className="w-full px-2 py-1 border border-dashed rounded text-xs hover:bg-muted/20"
                                                >
                                                    + Add Bullet
                                                </button>
                                            </div>
                                        ) : (
                                            <textarea
                                                value={block.text}
                                                onChange={(e) => updateBlock(selectedSlide.id, block.id, e.target.value)}
                                                rows={block.kind === 'body' ? 4 : 2}
                                                className="w-full px-2 py-1 border rounded text-sm bg-background resize-none"
                                            />
                                        )}

                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => moveBlockUp(selectedSlide.id, block.id)}
                                                disabled={idx === 0}
                                                className="flex-1 px-2 py-1 border rounded text-xs hover:bg-muted/20 disabled:opacity-50"
                                            >
                                                ↑
                                            </button>
                                            <button
                                                onClick={() => moveBlockDown(selectedSlide.id, block.id)}
                                                disabled={idx === selectedSlide.blocks.length - 1}
                                                className="flex-1 px-2 py-1 border rounded text-xs hover:bg-muted/20 disabled:opacity-50"
                                            >
                                                ↓
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <div className="space-y-1">
                                    <label className="block text-xs">Add Block</label>
                                    <div className="grid grid-cols-2 gap-1">
                                        <button
                                            onClick={() => addBlock(selectedSlide.id, 'title')}
                                            className="px-2 py-1 border border-dashed rounded text-xs hover:bg-muted/20"
                                        >
                                            + Title
                                        </button>
                                        <button
                                            onClick={() => addBlock(selectedSlide.id, 'subtitle')}
                                            className="px-2 py-1 border border-dashed rounded text-xs hover:bg-muted/20"
                                        >
                                            + Subtitle
                                        </button>
                                        <button
                                            onClick={() => addBlock(selectedSlide.id, 'body')}
                                            className="px-2 py-1 border border-dashed rounded text-xs hover:bg-muted/20"
                                        >
                                            + Body
                                        </button>
                                        <button
                                            onClick={() => addBlock(selectedSlide.id, 'bullets')}
                                            className="px-2 py-1 border border-dashed rounded text-xs hover:bg-muted/20"
                                        >
                                            + Bullets
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </aside>
        </div>
    );
}
