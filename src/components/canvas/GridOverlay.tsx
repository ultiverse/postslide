import * as React from "react";
import type { ArtboardSpec } from "@/lib/types/design";
import clsx from "clsx";

export type GridOverlayProps = {
    spec: ArtboardSpec;
    /** Master switch */
    show?: boolean;
    /** Baseline grid (rows) */
    showBaseline?: boolean;
    /** Safe area outline */
    showSafeArea?: boolean;
    /** Optional vertical columns grid */
    columns?: { count: number; gap?: number; color?: string; alpha?: number; };

    /** Styling for baseline lines */
    baseline?: {
        /** pixel height between baselines; defaults to spec.baseline */
        step?: number;
        /** draw a stronger line every N baselines */
        majorEvery?: number;
        /** color for lines */
        color?: string; // any CSS color
        /** 0..1 alpha for minor lines */
        alpha?: number;
        /** 0..1 alpha for major lines */
        majorAlpha?: number;
    };

    className?: string;
};

/**
 * GridOverlay
 * Non-interactive visual guides for baseline rows, optional columns, and safe area.
 * Renders as absolutely positioned layers you can drop inside a relatively positioned artboard.
 */
const GridOverlay: React.FC<GridOverlayProps> = ({
    spec,
    show = true,
    showBaseline = true,
    showSafeArea = true,
    columns,
    baseline,
    className,
}) => {
    if (!show) return null;

    const step = baseline?.step ?? spec.baseline;
    const color = baseline?.color ?? "rgb(59, 130, 246)"; // tailwind blue-500
    const alpha = baseline?.alpha ?? 0.1;
    const majorEvery = Math.max(1, baseline?.majorEvery ?? 4);
    const majorAlpha = baseline?.majorAlpha ?? 0.18;

    // Build a layered background with thin minor lines and slightly stronger major lines
    // Minor lines every `step`, major lines every `majorEvery * step`
    const baselineBackground = `repeating-linear-gradient(
    to bottom,
    rgba(0,0,0,0) 0,
    rgba(0,0,0,0) ${step - 1}px,
    ${toRgba(color, alpha)} ${step - 1}px,
    ${toRgba(color, alpha)} ${step}px
  ),
  repeating-linear-gradient(
    to bottom,
    rgba(0,0,0,0) 0,
    rgba(0,0,0,0) ${majorEvery * step - 1}px,
    ${toRgba(color, majorAlpha)} ${majorEvery * step - 1}px,
    ${toRgba(color, majorAlpha)} ${majorEvery * step}px
  )`;

    // Optional columns background (n columns with optional gap)
    const columnData =
        columns &&
        buildColumnsBackground({
            width: spec.width,
            count: columns.count,
            gap: columns.gap ?? 0,
            color: toRgba(columns.color ?? "rgb(59, 130, 246)", columns.alpha ?? 0.08),
        });

    return (
        <div className={clsx("pointer-events-none absolute inset-0", className)}>
            {showBaseline && (
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: baselineBackground,
                    }}
                />
            )}

            {columns && columnData && (
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: columnData.backgroundImage,
                        backgroundPosition: columnData.backgroundPosition,
                        backgroundSize: columnData.backgroundSize,
                        backgroundRepeat: "no-repeat",
                    }}
                />
            )}

            {showSafeArea && (
                <div
                    className="absolute border-2 border-dashed border-blue-400/30"
                    style={{
                        left: spec.safeInset,
                        top: spec.safeInset,
                        width: spec.width - 2 * spec.safeInset,
                        height: spec.height - 2 * spec.safeInset,
                    }}
                />
            )}
        </div>
    );
};

export default GridOverlay;

/* ---------- helpers ---------- */

function toRgba(input: string, alpha: number) {
    // If it's already rgba(...), just replace alpha crudely
    if (input.startsWith("rgba(")) return input.replace(/rgba\(([^)]+),\s*[\d.]+\)/, `rgba($1, ${alpha})`);
    if (input.startsWith("rgb(")) return input.replace(/rgb\(([^)]+)\)/, `rgba($1, ${alpha})`);
    // Fallback for hex or named colors – wrap as CSS color-mix for alpha
    return `color-mix(in srgb, ${input} ${alpha * 100}%, transparent)`;
}

function buildColumnsBackground(opts: { width: number; count: number; gap: number; color: string; }) {
    const { width, count, gap, color } = opts;
    if (count <= 0) return undefined;

    // Calculate column width accounting for gaps
    // Total gap space = gap * (count - 1)
    // Total column space = width - total gap space
    // Each column width = total column space / count
    const totalGapSpace = gap * (count - 1);
    const totalColumnSpace = width - totalGapSpace;
    const columnWidth = totalColumnSpace / count;

    // Draw vertical guides as 1px lines at each column boundary
    // Position them at: columnWidth, columnWidth + gap, columnWidth + gap + columnWidth, etc.
    const parts: string[] = [];
    const positions: string[] = [];
    const sizes: string[] = [];

    for (let i = 1; i < count; i++) {
        const position = i * columnWidth + (i - 1) * gap + gap / 2;
        parts.push(`linear-gradient(to right, transparent calc(50% - 0.5px), ${color} calc(50% - 0.5px), ${color} calc(50% + 0.5px), transparent calc(50% + 0.5px))`);
        positions.push(`${position}px 0`);
        sizes.push(`${gap}px 100%`);
    }

    return parts.length > 0
        ? {
              backgroundImage: parts.join(", "),
              backgroundPosition: positions.join(", "),
              backgroundSize: sizes.join(", "),
          }
        : undefined;
}
