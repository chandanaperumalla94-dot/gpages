import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Stars({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`text-2xl leading-none ${n <= value ? 'text-marigold-dark' : 'text-line'}`}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ReviewsSection({ placeId }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadReviews = () => {
    api
      .get(`/reviews/${placeId}`)
      .then(({ data }) => setReviews(data.data))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(loadReviews, [placeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (!rating) {
      setError('Please select a rating.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await api.post('/reviews', { place: placeId, rating, comment });
      setRating(0);
      setComment('');
      loadReviews();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-ink">Reviews</h2>

      <form onSubmit={handleSubmit} className="mt-4 rounded border border-line bg-white/50 p-4">
        <label className="text-sm text-ink/70">Your rating</label>
        <div className="mt-1">
          <Stars value={rating} onChange={setRating} />
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience…"
          rows={3}
          required
          className="mt-3 w-full rounded border border-line bg-white px-3 py-2 text-[14px] outline-none focus:border-ink/40"
        />
        {error && <p className="mt-2 text-sm text-vermilion">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-3 rounded bg-ink px-5 py-2 text-sm font-medium text-paper hover:bg-ink-light disabled:opacity-60"
        >
          {submitting ? 'Posting…' : 'Post review'}
        </button>
      </form>

      <div className="mt-6 flex flex-col divide-y divide-line">
        {loading && <p className="py-4 text-sm text-ink/45">Loading reviews…</p>}
        {!loading && reviews.length === 0 && (
          <p className="py-4 text-sm text-ink/45">No reviews yet — be the first to share your experience.</p>
        )}
        {reviews.map((r) => (
          <div key={r._id} className="py-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-ink">{r.user?.name || 'Anonymous'}</span>
              <span className="text-marigold-dark">{'★'.repeat(r.rating)}</span>
            </div>
            <p className="mt-1 text-[14px] text-ink/65">{r.comment}</p>
            <p className="mt-1 text-xs text-ink/35">{new Date(r.createdAt).toLocaleDateString()}</p>
            {r.ownerReply?.text && (
              <div className="mt-2 rounded bg-ink/5 p-3 text-[13px] text-ink/70">
                <span className="font-medium">Owner reply: </span>
                {r.ownerReply.text}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
