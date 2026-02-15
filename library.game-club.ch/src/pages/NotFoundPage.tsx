import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-20 text-center">
      <div className="card space-y-4">
        <h1 className="text-4xl">Page not found</h1>
        <p className="text-sm text-ink-300">
          The route you requested is not available in this static build.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-xl bg-sun-300 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ink-900"
        >
          Return home
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
