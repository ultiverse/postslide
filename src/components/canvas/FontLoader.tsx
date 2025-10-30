import { useEffect, useState } from 'react';

type FontConfig = {
  family: string;
  url: string;
  weight?: number;
};

type Props = {
  head: FontConfig;
  body: FontConfig;
  children: (fontsReady: boolean) => React.ReactNode;
};

/**
 * FontLoader: Loads fonts via FontFace API and provides loading state.
 * Improvements:
 * - Better error handling with fallback
 * - Cleanup of font faces on unmount
 * - Type safety improvements
 */
export default function FontLoader({ head, body, children }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadedFaces: FontFace[] = [];

    const load = async () => {
      try {
        // Create font faces
        const headFace = new FontFace(
          head.family,
          `url(${head.url})`,
          { weight: String(head.weight ?? 700), display: 'swap' }
        );

        const bodyFace = new FontFace(
          body.family,
          `url(${body.url})`,
          { weight: String(body.weight ?? 400), display: 'swap' }
        );

        // Load both fonts in parallel
        const [loadedHead, loadedBody] = await Promise.all([
          headFace.load(),
          bodyFace.load(),
        ]);

        // Add to document fonts
        document.fonts.add(loadedHead);
        document.fonts.add(loadedBody);

        loadedFaces.push(loadedHead, loadedBody);

        if (mounted) {
          setReady(true);
        }
      } catch (err) {
        console.error('Font loading error:', err);
        if (mounted) {
          setReady(true); // Fail open to avoid blocking render
        }
      }
    };

    load();

    return () => {
      mounted = false;
      // Cleanup: remove fonts from document
      loadedFaces.forEach(face => {
        try {
          document.fonts.delete(face);
        } catch {
          // Ignore cleanup errors
        }
      });
    };
  }, [head.family, head.url, head.weight, body.family, body.url, body.weight]);

  return <>{children(ready)}</>;
}
