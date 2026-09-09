import React, { useState } from 'react';
import { FiStar, FiCheck, FiPlus, FiMessageSquare } from 'react-icons/fi';
import Button from './Button';

export default function ReviewList({
  reviews = [],
  rating = 4.9,
  reviewCount = 48,
  ratingBreakdown = { 5: 85, 4: 12, 3: 2, 2: 1, 1: 0 },
}) {
  const [localReviews, setLocalReviews] = useState(reviews);
  const [formOpen, setFormOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newComment || !newAuthor) return;

    const newRev = {
      id: `rev-${Date.now()}`,
      author: newAuthor,
      rating: newRating,
      title: newTitle || 'Exceptional Footwear',
      comment: newComment,
      date: 'Just now',
      verified: true,
      sizePurchased: 'US 9.5',
      colorPurchased: 'Verified Purchase',
    };

    setLocalReviews([newRev, ...localReviews]);
    setFormOpen(false);
    setNewTitle('');
    setNewComment('');
    setNewAuthor('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const totalVotes = Object.values(ratingBreakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="py-12 border-t border-slate-200/80">
      <div className="flex flex-col lg:flex-row items-start justify-between gap-10 mb-12">
        {/* Rating Summary Score */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex flex-col items-center justify-center p-6 bg-brand-50 rounded-3xl border border-brand-200/80 text-center w-36 shrink-0">
            <span className="font-display font-black text-4xl sm:text-5xl text-brand-950 leading-none mb-2">
              {rating}
            </span>
            <div className="flex items-center gap-1 text-amber-500 mb-1">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.round(rating) ? 'fill-current' : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-slate-500">
              {reviewCount} Verified Reviews
            </span>
          </div>

          {/* Rating Breakdown Bars */}
          <div className="space-y-1.5 w-64 sm:w-72">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingBreakdown[stars] || 0;
              const percent = Math.round((count / totalVotes) * 100);

              return (
                <div key={stars} className="flex items-center gap-2.5 text-xs text-slate-600">
                  <span className="w-6 font-bold flex items-center gap-0.5">
                    {stars} <FiStar className="w-3 h-3 text-amber-500 fill-amber-500" />
                  </span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className="h-full bg-brand-700 rounded-full"
                    />
                  </div>
                  <span className="w-8 text-[11px] text-right text-slate-400 font-mono">
                    {percent}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action: Write Review */}
        <div className="flex flex-col items-start lg:items-end w-full sm:w-auto">
          <Button
            variant="outline"
            size="md"
            icon={<FiPlus className="w-4 h-4" />}
            onClick={() => setFormOpen(!formOpen)}
          >
            Write a Customer Review
          </Button>
          <span className="text-xs text-slate-400 mt-2">
            100% verified athlete & collector feedback
          </span>
        </div>
      </div>

      {/* Success Notification */}
      {submitted && (
        <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <FiCheck className="w-4 h-4 text-emerald-600" />
          <span>Thank you for contributing to the SoleSphere Collective reviews!</span>
        </div>
      )}

      {/* Expandable Review Submission Form */}
      {formOpen && (
        <form
          onSubmit={handleAddReview}
          className="mb-12 p-6 sm:p-8 bg-white rounded-3xl border border-brand-200 shadow-soft animate-fadeIn"
        >
          <h3 className="font-display font-black text-xl text-slate-900 mb-4">
            Submit Your Footwear Review
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                required
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                placeholder="Marcus Vance"
                className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Star Rating
              </label>
              <select
                value={newRating}
                onChange={(e) => setNewRating(parseInt(e.target.value, 10))}
                className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value={5}>5 Stars — Masterpiece</option>
                <option value={4}>4 Stars — Very Good</option>
                <option value={3}>3 Stars — Average</option>
                <option value={2}>2 Stars — Needs Refinement</option>
                <option value={1}>1 Star — Disappointed</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Review Title
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Unbelievable carbon propulsion"
              className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Review Experience
            </label>
            <textarea
              required
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your impressions on cushioning, fit, materials, and road feel..."
              className="w-full px-4 py-2.5 bg-[#F8FAF9] border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" variant="luxury" size="sm">
              Post Review
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFormOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Customer Reviews List */}
      <div className="space-y-6">
        {localReviews.map((rev) => (
          <div
            key={rev.id}
            className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-soft"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-900 font-bold flex items-center justify-center text-sm">
                  {rev.author?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{rev.author}</h4>
                    {rev.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <FiCheck className="w-3 h-3" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">{rev.date}</span>
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

            {rev.title && (
              <h5 className="text-sm font-bold text-slate-900 mb-1.5">{rev.title}</h5>
            )}

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
              {rev.comment}
            </p>

            {(rev.sizePurchased || rev.colorPurchased) && (
              <div className="text-[11px] text-slate-400 font-medium">
                Variant: {rev.colorPurchased} • Size: {rev.sizePurchased}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
