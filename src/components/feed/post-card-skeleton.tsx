export default function PostCardSkeleton() {
  return (
    <div className="flex flex-row px-4 py-3 gap-3 border-b border-rule animate-pulse">
      <div
        className="flex-shrink-0 rounded-sm"
        style={{ width: 80, height: 80, backgroundColor: 'var(--color-contour)' }}
      />
      <div className="flex flex-col gap-2 flex-1">
        <div
          className="rounded-sm"
          style={{ width: '33%', height: 10, backgroundColor: 'var(--color-contour)' }}
        />
        <div
          className="rounded-sm"
          style={{ width: '100%', height: 14, backgroundColor: 'var(--color-contour)' }}
        />
        <div
          className="rounded-sm"
          style={{ width: '66%', height: 12, backgroundColor: 'var(--color-contour)' }}
        />
        <div
          className="rounded-sm"
          style={{ width: '50%', height: 10, backgroundColor: 'var(--color-contour)' }}
        />
      </div>
    </div>
  )
}
