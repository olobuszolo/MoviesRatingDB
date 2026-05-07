import './EmptyView.css'

function EmptyView({ label }: { label: string }) {
  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Management</p>
          <h2>{label}</h2>
        </div>
      </header>
      <section className="empty-state" aria-label={`${label} empty state`} />
    </>
  )
}

export default EmptyView
