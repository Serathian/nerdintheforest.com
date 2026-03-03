// Full-bleed map layout — no nav/footer, full viewport height.
// The homepage owns its own chrome (MapHeader inside MapView).

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        height: '100dvh',
      }}
    >
      {children}
    </div>
  )
}
