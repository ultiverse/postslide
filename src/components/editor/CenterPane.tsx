import { useProject } from '@/state/project.store';
import Canvas from '@/components/canvas';
import { IconButton } from '@/components/ui';
import { Copy, Trash2, Grid3x3 } from 'lucide-react';

export function CenterPane() {
    const project = useProject((s) => s.project);
    const selectedSlideId = useProject((s) => s.selectedSlideId);
    const duplicateSlide = useProject((s) => s.duplicateSlide);
    const removeSlide = useProject((s) => s.removeSlide);
    const showGrid = useProject((s) => s.showGrid);
    const toggleGrid = useProject((s) => s.toggleGrid);

    const selectedSlide = project.slides.find((s) => s.id === selectedSlideId);

    return (
        <main className="relative bg-neutral-50" style={{
            backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255, 255, 255, 0.2) 10px,
                rgba(255, 255, 255, 0.2) 20px
            )`
        }}>
            <div className="fixed inset-0 left-[280px] right-[320px] flex justify-center pt-8 overflow-y-auto">
                <div className="flex-shrink-0">
                    <Canvas />
                </div>
            </div>

            {/* Toolbar */}
            <div className="fixed right-[calc(320px+1rem)] top-4 flex items-center gap-2 rounded-lg border border-neutral-200 bg-white p-2 shadow-md z-10">
                {/* Slide Controls */}
                {selectedSlide && (
                    <>
                        <IconButton
                            onClick={() => duplicateSlide(selectedSlide.id)}
                            variant="ghost"
                            size="sm"
                            icon={Copy}
                            title="Duplicate Slide"
                        />
                        <IconButton
                            onClick={() => removeSlide(selectedSlide.id)}
                            disabled={project.slides.length === 1}
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            title="Delete Slide"
                            className="text-error hover:bg-error/10"
                        />
                        <div className="h-6 w-px bg-neutral-300" />
                    </>
                )}

                {/* Grid Toggle - IconButton version (test) */}
                <IconButton
                    icon={Grid3x3}
                    variant="ghost"
                    size="sm"
                    checked={showGrid}
                    onCheckedChange={toggleGrid}
                    title="Show Grid"
                />
            </div>
        </main>
    );
}
