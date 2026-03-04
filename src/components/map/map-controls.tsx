'use client'

interface MapControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onLocate: (lat: number, lon: number) => void
}

function ControlButton({
  onClick,
  children,
  label,
}: {
  onClick: () => void
  children: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="w-9 h-9 flex items-center justify-center text-bark border border-rule rounded-sm cursor-pointer transition-colors hover:border-lichen hover:text-lichen"
      style={{ backgroundColor: 'var(--color-parchment)' }}
    >
      {children}
    </button>
  )
}

export default function MapControls({ onZoomIn, onZoomOut, onLocate }: MapControlsProps) {
  const handleLocate = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => onLocate(pos.coords.latitude, pos.coords.longitude),
      () => {},
    )
  }

  return (
    <div
      className="flex flex-col gap-1"
      style={{ position: 'absolute', bottom: 96, right: 12, zIndex: 20 }}
    >
      <ControlButton onClick={onZoomIn} label="Zoom in">
        <span className="text-lg leading-none">+</span>
      </ControlButton>
      <ControlButton onClick={onZoomOut} label="Zoom out">
        <span className="text-lg leading-none">&minus;</span>
      </ControlButton>
      <ControlButton onClick={handleLocate} label="My location">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="8" cy="8" r="3" />
          <path d="M8 1v3M8 12v3M1 8h3M12 8h3" />
        </svg>
      </ControlButton>
    </div>
  )
}
