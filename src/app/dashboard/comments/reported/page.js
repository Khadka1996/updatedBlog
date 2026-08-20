'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  FaBan,
  FaCheck,
  FaComments,
  FaSearch,
  FaSpinner,
  FaTrash,
  FaExclamationTriangle,
} from 'react-icons/fa';

export default function ReportedCommentsPage() {
  const [comments, setComments] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadComments = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/comments/reported', {
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Unable to load reported comments.');
      }

      setComments(result.data?.comments || []);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load reported comments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, []);

  const filteredComments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return comments.filter((comment) => {
      const matchesFilter = filter === 'all' || (filter === 'spam' ? comment.isSpam : !comment.isSpam);
      const searchableText = [
        comment.content,
        comment.user?.username,
        comment.user?.email,
        comment.blog?.title,
      ].filter(Boolean).join(' ').toLowerCase();

      return matchesFilter && (!normalizedSearch || searchableText.includes(normalizedSearch));
    });
  }, [comments, filter, search]);

  const runAction = async (id, action, options = {}) => {
    setBusyId(id || action);
    setError('');
    setNotice('');

    try {
      const response = await fetch(`/api/admin/comments${id ? `/${id}` : ''}${options.path || ''}`, {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        credentials: 'include',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'The action could not be completed.');
      }

      setNotice(result.message || 'Comment updated.');
      await loadComments();
    } catch (requestError) {
      setError(requestError.message || 'The action could not be completed.');
    } finally {
      setBusyId('');
    }
  };

  const toggleSpam = (comment) => {
    const action = comment.isSpam ? 'unmark' : 'mark';
    if (!window.confirm(`${action === 'mark' ? 'Mark' : 'Unmark'} this comment as spam?`)) return;
    runAction(comment._id, 'spam', { path: '/spam' });
  };

  const deleteComment = (comment) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    runAction(comment._id, 'delete');
  };

  const deleteSpam = () => {
    if (!window.confirm('Delete every comment currently marked as spam?')) return;
    runAction('', 'delete', { path: '/spam' });
  };

  const reportedCount = comments.reduce((total, comment) => total + (comment.reportedCount || 0), 0);
  const spamCount = comments.filter((comment) => comment.isSpam).length;

  return (
    <section className="min-h-full bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <FaExclamationTriangle aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reported Comments</h1>
                <p className="text-sm text-gray-500">Review comments reported by readers and moderate suspicious activity.</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={deleteSpam}
            disabled={!spamCount || busyId === 'delete'}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaTrash aria-hidden="true" />
            Delete spam comments
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Reported comments</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{comments.length}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total reports</p>
            <p className="mt-1 text-2xl font-bold text-orange-600">{reportedCount}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Marked as spam</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{spamCount}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search reported comments</span>
            <FaSearch className="pointer-events-none absolute left-3 top-3 text-gray-400" aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search comment, author, email, or blog..."
              className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </label>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            aria-label="Filter comments"
          >
            <option value="all">All reported</option>
            <option value="pending">Not marked spam</option>
            <option value="spam">Marked as spam</option>
          </select>
        </div>

        {notice && <p className="mt-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</p>}
        {error && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <FaSpinner className="animate-spin text-3xl text-teal-600" aria-label="Loading" />
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <FaComments className="text-4xl text-gray-300" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-semibold text-gray-800">No reported comments found</h2>
              <p className="mt-1 text-sm text-gray-500">Try changing the search or filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredComments.map((comment) => (
                <article key={comment._id} className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-semibold text-gray-900">{comment.user?.username || 'Unknown user'}</span>
                        {comment.user?.email && <span className="text-gray-500">{comment.user.email}</span>}
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${comment.isSpam ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                          {comment.isSpam ? 'Spam' : `${comment.reportedCount || 0} report${comment.reportedCount === 1 ? '' : 's'}`}
                        </span>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">{comment.content}</p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span>Blog: {comment.blog?.title || 'Unknown blog'}</span>
                        <span>{comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'Unknown date'}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSpam(comment)}
                        disabled={busyId === comment._id}
                        className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition disabled:opacity-50 ${comment.isSpam ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}
                      >
                        {comment.isSpam ? <FaCheck aria-hidden="true" /> : <FaBan aria-hidden="true" />}
                        {comment.isSpam ? 'Unmark spam' : 'Mark spam'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteComment(comment)}
                        disabled={busyId === comment._id}
                        className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                      >
                        <FaTrash aria-hidden="true" />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
