'use client'

interface SidebarProps {
  children: React.ReactNode
}

export default function Sidebar({ children }: SidebarProps) {
  return (
    <div
      className="hidden lg:flex flex-col"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 420,
        borderRight: '1px solid var(--color-rule)',
        backgroundColor: 'var(--color-parchment)',
        overflowY: 'auto',
        zIndex: 40,
      }}
    >
      {children}
    </div>
  )
}
