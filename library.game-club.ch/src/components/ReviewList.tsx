import type { GameReview } from '../lib/types'

interface ReviewListProps {
  reviews: GameReview[]
}

function ReviewList({ reviews }: ReviewListProps) {
  if (!reviews.length) {
    return <p className="text-sm text-ink-400">No reviews yet.</p>
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={`${review.steamid}-${review.timestamp}`} className="rounded-2xl border border-ink-700/60 bg-ink-900/60 p-4">
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-ink-400">
            <span>{review.display_name}</span>
            <span>{new Date(review.timestamp).toLocaleDateString()}</span>
          </div>
          <div className="mt-2 text-sm text-sun-200">Rating: {review.rating}/5</div>
          <div
            className="rich-text mt-3 text-sm text-ink-200"
            dangerouslySetInnerHTML={{ __html: review.text }}
          />
        </div>
      ))}
    </div>
  )
}

export default ReviewList
