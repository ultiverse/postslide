/**
 * PreviewBlock Component
 *
 * A visual preview block for the Minimal Pro template in the Templates gallery.
 * Shows key design features: strong typography, generous spacing, and clean layout.
 */
export function PreviewBlock() {
  return (
    <div
      style={{
        width: '1080px',
        height: '1080px',
        background: '#ffffff',
        padding: '80px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        position: 'relative',
      }}
    >
      {/* Title */}
      <div
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 700,
          fontSize: '80px',
          lineHeight: '88px',
          color: '#0a0a0a',
        }}
      >
        Minimal Pro
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 600,
          fontSize: '52px',
          lineHeight: '64px',
          color: '#525252',
        }}
      >
        Clean & Professional
      </div>

      {/* Body text */}
      <div
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 400,
          fontSize: '36px',
          lineHeight: '48px',
          color: '#0a0a0a',
        }}
      >
        Strong contrast, generous spacing, and consistent typography for maximum readability.
      </div>

      {/* Bullet points */}
      <div
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 400,
          fontSize: '32px',
          lineHeight: '48px',
          color: '#0a0a0a',
          paddingLeft: '40px',
        }}
      >
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '-40px' }}>•</span>
          Bold typography
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '-40px' }}>•</span>
          80px outer gutter
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '-40px' }}>•</span>
          High contrast text
        </div>
      </div>

      {/* Preview decorator arrow */}
      <div
        style={{
          position: 'absolute',
          bottom: '80px',
          right: '80px',
          width: '120px',
          height: '120px',
        }}
      >
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12h14m0 0l-7-7m7 7l-7 7"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Progress bar at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          width: '100%',
          height: '4px',
          background: 'linear-gradient(90deg, #3b82f6 0%, #3b82f6 50%, #8b5cf6 50%, #8b5cf6 100%)',
        }}
      />
    </div>
  );
}
