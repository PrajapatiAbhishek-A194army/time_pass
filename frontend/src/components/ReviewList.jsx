import React, { useState, useEffect } from 'react';
import {
  FiStar,
  FiCheck,
  FiPlus,
  FiThumbsUp,
  FiThumbsDown,
  FiFilter,
  FiTrash2,
  FiImage,
  FiX,
  FiClock,
  FiShield,
  FiCamera,
} from 'react-icons/fi';
import Button from './Button';
import Badge from './Badge';
import { useAuth } from '../context/AuthContext';
import {
  fetchProductReviews,
  submitReview,
  voteReviewHelpful,
  deleteReview,
} from '../services/reviewService';

export default function ReviewList({
  productId = 'prod-1',
  productSlug = 'apex-carbon-velocity-pro',
  reviews: propReviews = [],
  rating: propRating = 4.9,
  reviewCount: propCount = 48,
  ratingBreakdown: propBreakdown = { 5: 85, 4: 12, 3: 2, 2: 1, 1: 0 },
}) {
  const { user } = useAuth();

  const [reviews, setReviews] = useState(propReviews);
  const [totalReviews, setTotalReviews] = useState(propCount);
  const [averageRating, setAverageRating] = useState(propRating);
  const [ratingBreakdown, setRatingBreakdown] = useState(propBreakdown);

  // Sorting & Filtering State
  const [sort, setSort] = useState('recent'); // 'recent' | 'highest' | 'lowest' | 'helpful'
  const [starFilter, setStarFilter] = useState(null); // null | 5 | 4 | 3 | 2 | 1
  const [loading, setLoading] = useState(false);

  // Form State
  const [formOpen, setFormOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newAuthor, setNewAuthor] = useState(user?.name || '');
  const [newSize, setNewSize] = useState('US 9.5');
  const [newColor, setNewColor] = useState('Default');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedToast, setSubmittedToast] = useState(false);

  // Track user votes locally so user can vote once per review
  const [votedReviews, setVotedReviews] = useState({});

  const ratingDescriptions = {
    5: 'Masterpiece — Exceeds elite expectations',
    4: 'High Performance — Highly recommended',
    3: 'Average — Good with slight reservations',
    2: 'Needs Refinement — Below expectations',
    1: 'Disappointed — Does not meet standards',
  };

  // Load reviews from backend when product, sort, or filter changes
  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      try {
        const res = await fetchProductReviews(productId, {
          sort,
          starFilter: starFilter || undefined,
        });
        if (res?.data) {
          setReviews(res.data.reviews || []);
          if (res.data.totalReviews !== undefined) setTotalReviews(res.data.totalReviews);
          if (res.data.averageRating !== undefined) setAverageRating(res.data.averageRating);
          if (res.data.ratingBreakdown) setRatingBreakdown(res.data.ratingBreakdown);
        }
      } catch (err) {
        console.warn('Backend review fetch note:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [productId, sort, starFilter]);

  // Handle Photo Attachment
  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    setUploadedPhotos([...uploadedPhotos, newPhotoUrl.trim()]);
    setNewPhotoUrl('');
  };

  const handleRemovePhoto = (idx) => {
    setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== idx));
  };

  // Submit Review Handler
  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || newComment.trim().length < 5) return;

    setSubmitting(true);
    try {
      const payload = {
        productId,
        productSlug,
        rating: newRating,
        title: newTitle.trim() || 'Verified Customer Review',
        comment: newComment.trim(),
        author: newAuthor.trim() || user?.name || 'Collector',
        sizePurchased: newSize,
        colorPurchased: newColor,
        photos: uploadedPhotos,
      };

      const res = await submitReview(payload);
      if (res?.data) {
        setReviews([res.data, ...reviews]);
        setTotalReviews((prev) => prev + 1);
        setFormOpen(false);
        setNewTitle('');
        setNewComment('');
        setUploadedPhotos([]);
        setSubmittedToast(true);
        setTimeout(() => setSubmittedToast(false), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helpful Voting Handler
  const handleVote = async (reviewId, isHelpful) => {
    if (votedReviews[reviewId]) return;

    // Optimistic UI update
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          return {
            ...r,
            helpfulCount: isHelpful ? (r.helpfulCount || 0) + 1 : r.helpfulCount,
            unhelpfulCount: !isHelpful ? (r.unhelpfulCount || 0) + 1 : r.unhelpfulCount,
          };
        }
        return r;
      })
    );
    setVotedReviews({ ...votedReviews, [reviewId]: isHelpful ? 'up' : 'down' });

    try {
      await voteReviewHelpful(reviewId, isHelpful);
    } catch (err) {
      console.warn('Vote recording note:', err.message);
    }
  };

  // Delete Review Handler (Owner / Admin)
  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to remove this review?')) return;
    try {
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setTotalReviews((prev) => Math.max(0, prev - 1));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete review.');
    }
  };

  const totalBreakdownVotes =
    Object.values(ratingBreakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="py-12 border-t border-slate-200/80">
      {/* Top Header & Rating Aggregate Summary */}
      <div className="flex flex-col lg:flex-row items-start justify-between gap-10 mb-10">
        {/* Rating Summary Score */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex flex-col items-center justify-center p-6 bg-brand-50 rounded-3xl border border-brand-200/80 text-center w-36 shrink-0 shadow-soft">
            <span className="font-display font-black text-4xl sm:text-5xl text-brand-950 leading-none mb-2">
              {averageRating}
            </span>
            <div className="flex items-center gap-1 text-amber-500 mb-1">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.round(averageRating) ? 'fill-current' : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-slate-500">
              {totalReviews} Verified {totalReviews === 1 ? 'Review' : 'Reviews'}
            </span>
          </div>

          {/* Interactive Rating Breakdown Bars (Click to Filter) */}
          <div className="space-y-2 w-64 sm:w-72">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingBreakdown[stars] || 0;
              const percent = Math.round((count / totalBreakdownVotes) * 100);
              const isActive = starFilter === stars;

              return (
                <button
                  key={stars}
                  onClick={() => setStarFilter(isActive ? null : stars)}
                  className={`w-full flex items-center gap-2.5 text-xs text-left transition rounded-lg px-2 py-0.5 ${
                    isActive ? 'bg-brand-100 font-bold' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                  title={`Filter by ${stars} stars`}
                >
                  <span className="w-6 font-bold flex items-center gap-0.5 shrink-0">
                    {stars} <FiStar className="w-3 h-3 text-amber-500 fill-amber-500" />
                  </span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className={`h-full rounded-full transition-all ${
                        isActive ? 'bg-brand-900' : 'bg-brand-700'
                      }`}
                    />
                  </div>
                  <span className="w-10 text-[11px] text-right text-slate-400 font-mono shrink-0">
                    {count} ({percent}%)
                  </span>
                </button>
              );
            })}
            {starFilter && (
              <button
                onClick={() => setStarFilter(null)}
                className="text-[11px] font-bold text-rose-600 hover:underline pt-1 block"
              >
                Clear star filter ({starFilter}★ active)
              </button>
            )}
          </div>
        </div>

        {/* Action: Write Review CTA */}
        <div className="flex flex-col items-start lg:items-end w-full sm:w-auto">
          <Button
            variant={formOpen ? 'outline' : 'primary'}
            size="md"
            icon={formOpen ? <FiX className="w-4 h-4" /> : <FiPlus className="w-4 h-4" />}
            onClick={() => setFormOpen(!formOpen)}
          >
            {formOpen ? 'Close Review Form' : 'Write a Customer Review'}
          </Button>
          <span className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <FiShield className="w-3.5 h-3.5 text-brand-700" /> 100% verified athlete & collector feedback
          </span>
        </div>
      </div>

      {/* Success Notification */}
      {submittedToast && (
        <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <FiCheck className="w-4 h-4 text-emerald-600" />
          <span>Thank you! Your feedback has been contributed to the SoleSphere Collective.</span>
        </div>
      )}

      {/* Expandable Review Submission Form */}
      {formOpen && (
        <form
          onSubmit={handleAddReview}
          className="mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-brand-300 shadow-premium animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <h3 className="font-display font-black text-xl text-slate-900">
                Submit Your Footwear Review
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Share your road and track impressions with the SoleSphere community.
              </p>
            </div>
            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-full">
              Atelier Review
            </span>
          </div>

          {/* Interactive Star Rating Selector */}
          <div className="mb-6 p-4 rounded-2xl bg-[#F8FAF9] border border-slate-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Overall Score *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = hoverRating ? star <= hoverRating : star <= newRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setNewRating(star)}
                    className="p-1 text-2xl transition transform hover:scale-125 focus:outline-none"
                    aria-label={`${star} Stars`}
                  >
                    <FiStar
                      className={`w-7 h-7 ${
                        filled ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
              <span className="text-xs font-bold text-slate-800 ml-3">
                {ratingDescriptions[hoverRating || newRating]}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                placeholder="Marcus Vance"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Size Purchased
              </label>
              <input
                type="text"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                placeholder="US 9.5"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Colorway
              </label>
              <input
                type="text"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                placeholder="Forest Night / Volt"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Headline / Review Title *
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Unrivaled carbon propulsion and road feedback"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detailed Experience *
            </label>
            <textarea
              required
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Discuss fit, cushioning rebound, durability, breathability, and tempo pacing..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          {/* Photo Attachment Simulator */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FiCamera className="w-3.5 h-3.5" /> Attach Photo (URL / Demo Preview)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddPhoto}>
                Add Photo
              </Button>
            </div>

            {uploadedPhotos.length > 0 && (
              <div className="flex items-center gap-3 mt-3 overflow-x-auto py-1">
                {uploadedPhotos.map((url, idx) => (
                  <div key={idx} className="relative group shrink-0">
                    <img
                      src={url}
                      alt={`Upload ${idx}`}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <Button type="submit" variant="luxury" size="md" loading={submitting}>
              Publish Review
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setFormOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Sorting Controls & Review Stream Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 mb-6">
        <div className="text-xs font-bold text-slate-500">
          Showing {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
          {starFilter && <span> (Filtered by {starFilter} Stars)</span>}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <FiFilter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-600">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rated (5★ First)</option>
            <option value="lowest">Lowest Rated (1★ First)</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Customer Reviews Feed */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="w-8 h-8 border-2 border-brand-300 border-t-brand-800 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-semibold">Updating reviews stream...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-3xl border border-slate-200/80 p-8">
          <p className="text-sm font-bold text-slate-800 mb-1">No reviews found for this selection.</p>
          <p className="text-xs text-slate-400 mb-4">Be the first to share your experience with this footwear.</p>
          <Button variant="outline" size="sm" onClick={() => { setStarFilter(null); setFormOpen(true); }}>
            Write First Review
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((rev) => {
            const hasVoted = votedReviews[rev.id];
            const isOwner = user && (user.id === rev.userId || user.role === 'ADMIN');

            return (
              <div
                key={rev.id}
                className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-soft hover:shadow-premium transition"
              >
                {/* Review Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-900 font-bold flex items-center justify-center text-sm shadow-inner">
                      {rev.author?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{rev.author}</h4>
                        {rev.verified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <FiCheck className="w-3 h-3 text-emerald-600" /> Verified Purchase
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {rev.date || (rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent')}
                      </span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-current' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Review Title */}
                {rev.title && (
                  <h5 className="text-sm font-bold text-slate-900 mb-1.5">{rev.title}</h5>
                )}

                {/* Review Comment Body */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {rev.comment}
                </p>

                {/* Photo Attachments */}
                {rev.photos && rev.photos.length > 0 && (
                  <div className="flex items-center gap-3 mb-4 overflow-x-auto py-1">
                    {rev.photos.map((photo, pIdx) => (
                      <a
                        key={pIdx}
                        href={photo}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 group"
                      >
                        <img
                          src={photo}
                          alt="Review attachment"
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 group-hover:scale-105 transition"
                        />
                      </a>
                    ))}
                  </div>
                )}

                {/* Footer Variant info & Helpful voting actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400 font-medium">
                    {rev.colorPurchased && <span>Variant: {rev.colorPurchased} • </span>}
                    {rev.sizePurchased && <span>Size: {rev.sizePurchased}</span>}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="text-[11px]">Helpful?</span>
                      <button
                        onClick={() => handleVote(rev.id, true)}
                        disabled={Boolean(hasVoted)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold transition ${
                          hasVoted === 'up'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'hover:bg-slate-100 border-slate-200'
                        }`}
                        title="Yes, this was helpful"
                      >
                        <FiThumbsUp className="w-3 h-3" />
                        <span>{rev.helpfulCount || 0}</span>
                      </button>

                      <button
                        onClick={() => handleVote(rev.id, false)}
                        disabled={Boolean(hasVoted)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold transition ${
                          hasVoted === 'down'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'hover:bg-slate-100 border-slate-200'
                        }`}
                        title="No, not helpful"
                      >
                        <FiThumbsDown className="w-3 h-3" />
                        <span>{rev.unhelpfulCount || 0}</span>
                      </button>
                    </div>

                    {isOwner && (
                      <button
                        onClick={() => handleDelete(rev.id)}
                        className="text-rose-500 hover:text-rose-700 p-1 transition"
                        title="Delete review"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
