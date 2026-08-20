'use client';
import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { FaHeart, FaTrash, FaUser, FaPaperPlane, FaTimes, FaExclamationTriangle, FaCheck, FaClock, FaEye, FaComments } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

// ✅ Memoized individual comment component
const CommentItem = memo(({ 
  comment, 
  user, 
  onDelete, 
  formatDate 
}) => {
  const getInitials = useCallback((user) => {
    if (user?.username) return user.username.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  }, []);

  const getUserRoleColor = useCallback((role) => {
    switch(role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderator': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
          {/* User Avatar */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg">
              {getInitials(comment.user)}
            </div>
          </div>
          
          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            {/* User Info & Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-3 gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-gray-900 text-sm sm:text-base">
                  {comment.user?.username || comment.user?.email || 'Anonymous User'}
                </span>
                {comment.user?.role && (
                  <span className={`text-xs px-2 py-1 rounded-full border ${getUserRoleColor(comment.user.role)}`}>
                    {comment.user.role}
                  </span>
                )}
              </div>
              
              {/* Timestamp */}
              <div className="flex items-center text-xs text-gray-500">
                <FaClock className="w-3 h-3 mr-1" />
                <span>{formatDate(comment.createdAt)}</span>
              </div>
            </div>
            
            {/* Comment Text */}
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 border border-gray-200">
              <p className="text-gray-800 text-sm leading-relaxed font-medium">
                {comment.content}
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Comment metadata - simple and clean */}
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <FaComments className="w-3 h-3" />
                  <span>Comment</span>
                </div>
              </div>
              
              {/* Delete Button (only for logged-in users) */}
              {user?.loggedIn && (
                <button 
                  onClick={() => onDelete(comment._id)}
                  className="text-red-500 hover:text-red-700 p-2 rounded-lg transition-colors duration-200 hover:bg-red-50"
                  title="Delete comment"
                  aria-label="Delete comment"
                >
                  <FaTrash size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CommentItem.displayName = 'CommentItem';

// ✅ Main Comment Section Component
export default function CommentSection({ blog }) {
  const router = useRouter();
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(blog.comments || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  // Blog stats
  const blogStats = useMemo(() => ({
    likes: blog.likes?.length || 0,
    views: blog.viewCount || 0,
    comments: comments.length
  }), [blog.likes, blog.viewCount, comments.length]);

  // ✅ Memoized calculations
  const { wordCount, charCount, isValidComment } = useMemo(() => {
    const words = commentText.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const charCount = commentText.length;
    const isValidComment = wordCount >= 1 && charCount >= 1 && charCount <= 500;
    
    return { wordCount, charCount, isValidComment };
  }, [commentText]);

  // ✅ Memoized functions
  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const generateFingerprint = useCallback(() => {
    const userAgent = navigator.userAgent || '';
    const language = navigator.language || '';
    const platform = navigator.platform || '';
    
    const data = userAgent + language + platform;
    let hash = 0;
    
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(16).slice(0, 8);
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    const sessionId = localStorage.getItem('sessionId');
    const fingerprint = generateFingerprint();

    return {
      'Authorization': `Bearer ${token}`,
      'X-Session-ID': sessionId || '',
      'X-Client-Fingerprint': fingerprint,
      'Content-Type': 'application/json',
    };
  }, [generateFingerprint]);

  const validateComment = useCallback((text) => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    if (words.length < 1) return "Comment must contain at least 1 word";
    if (text.trim().length < 1) return "Comment cannot be empty";
    if (text.trim().length > 500) return "Comment cannot exceed 500 characters";
    return null;
  }, []);

  // ✅ Effects
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setUser({ loggedIn: true });
    }
  }, []);

  // ✅ Comment Actions
  const handleAddComment = useCallback(async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    
    const validationError = validateComment(commentText);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    // ✅ Optimistic update
    const tempComment = {
      _id: `temp-${Date.now()}`,
      content: commentText.trim(),
      user: { username: 'You', email: '' },
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      isOptimistic: true
    };

    setComments(prev => [tempComment, ...prev]);
    const originalCommentText = commentText;
    setCommentText("");

    try {
      const response = await fetch(`/api/blogs/${blog._id}/comments`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: originalCommentText.trim() }),
        credentials: 'include',
      });

      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('sessionId');
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add comment');
      }

      const result = await response.json();
      
      // ✅ Replace temporary comment with real one
      if (result.data) {
        setComments(prev => prev.map(comment => 
          comment.isOptimistic ? result.data : comment
        ));
      }

    } catch (error) {
      // ✅ Rollback optimistic update on error
      setComments(prev => prev.filter(comment => !comment.isOptimistic));
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [commentText, blog._id, router, validateComment, getAuthHeaders]);

  // ✅ Dialog Handlers
  const openDeleteDialog = useCallback((commentId) => {
    setCommentToDelete(commentId);
    setShowDeleteDialog(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setShowDeleteDialog(false);
    setCommentToDelete(null);
  }, []);

  const handleDeleteComment = useCallback(async () => {
    if (!commentToDelete) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      closeDeleteDialog();
      return;
    }
    
    setDeletingCommentId(commentToDelete);
    setError(null);

    // ✅ Optimistic deletion
    setComments(prev => prev.filter(comment => comment._id !== commentToDelete));
    closeDeleteDialog();

    try {
      const response = await fetch(`/api/blogs/comments/${commentToDelete}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('sessionId');
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      if (!response.ok) {
        // Refetch comments to restore state on error
        const response = await fetch(`/api/blogs/${blog._id}`);
        if (response.ok) {
          const blogData = await response.json();
          setComments(blogData.data?.comments || []);
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete comment');
      }

    } catch (error) {
      setError(error.message);
    } finally {
      setDeletingCommentId(null);
    }
  }, [commentToDelete, router, closeDeleteDialog, getAuthHeaders, blog._id]);

  const handleCommentBoxClick = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [router]);

  // ✅ Memoized comments list
  const commentsList = useMemo(() => (
    <div className="space-y-4">
      {comments.length > 0 ? (
        comments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            user={user}
            onDelete={openDeleteDialog}
            formatDate={formatDate}
          />
        ))
      ) : (
        <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl bg-white shadow-lg flex items-center justify-center">
            <FaComments size={24} className="text-gray-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">No Comments Yet</h3>
          <p className="text-gray-600 text-sm sm:text-lg max-w-md mx-auto leading-relaxed px-4">
            Start the conversation! Be the first to share your thoughts on this article.
          </p>
        </div>
      )}
    </div>
  ), [comments, user, openDeleteDialog, formatDate]);

  return (
    <>
      <section className="mt-8 sm:mt-16 border-t border-gray-200 pt-8 sm:pt-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Community Discussion
          </h2>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
            Join the conversation and share your perspective with other readers
          </p>
        </div>

        {/* Blog Stats - Mobile Optimized */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8 p-4 sm:p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          {/* Likes */}
          <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <FaHeart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              <div className="text-lg sm:text-2xl font-bold text-blue-600">{blogStats.likes}</div>
            </div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">Post Likes</div>
          </div>
          
          {/* Views */}
          <div className="text-center p-3 sm:p-4 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <FaEye className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              <div className="text-lg sm:text-2xl font-bold text-green-600">{blogStats.views}</div>
            </div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">Views</div>
          </div>
          
          {/* Comments */}
          <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-xl border border-purple-100">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <FaComments className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
              <div className="text-lg sm:text-2xl font-bold text-purple-600">{blogStats.comments}</div>
            </div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">Comments</div>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 sm:mb-8 bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6 animate-pulse mx-4 sm:mx-0">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <FaExclamationTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
              <div>
                <p className="text-red-800 font-semibold text-sm sm:text-base">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Comment Input */}
        <div className="mb-8 sm:mb-12 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg border border-gray-200 p-4 sm:p-8 mx-4 sm:mx-0">
          <form onSubmit={handleAddComment}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
              {/* User Avatar */}
              <div className="flex-shrink-0 flex justify-center sm:justify-start">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {user?.loggedIn ? 'Y' : <FaUser size={20} />}
                </div>
              </div>
              
              {/* Input Area */}
              <div className="flex-1">
                <div className="mb-4 text-center sm:text-left">
                  <span className="text-lg font-bold text-gray-900">
                    {user?.loggedIn ? 'Share Your Thoughts' : 'Join the Discussion'}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    {user?.loggedIn 
                      ? "Your voice matters! Share your perspective with the community." 
                      : "Login to participate in this meaningful conversation."
                    }
                  </p>
                </div>
                
                {/* Textarea */}
                <div className="relative">
                  <textarea
                    value={commentText}
                    onChange={(e) => {
                      setCommentText(e.target.value);
                      setError(null);
                    }}
                    placeholder={
                      user?.loggedIn 
                        ? "What are your thoughts on this article? Share your insights... (Minimum 1 word)" 
                        : "Click here to login and join the conversation"
                    }
                    className={`w-full border-2 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-base resize-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${
                      !user?.loggedIn 
                        ? 'cursor-pointer bg-gray-100 border-gray-200' 
                        : 'bg-white border-gray-300 hover:border-blue-400'
                    } ${isValidComment ? 'border-green-200 bg-green-50' : ''}`}
                    rows="4"
                    onClick={handleCommentBoxClick}
                    readOnly={!user?.loggedIn}
                    maxLength={500}
                    aria-label="Share your thoughts"
                  />
                  
                  {/* Character Counter */}
                  <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4">
                    <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      charCount > 450 
                        ? 'bg-red-100 text-red-700' 
                        : isValidComment 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                    }`}>
                      {charCount}/500
                    </div>
                  </div>
                </div>
                
                {/* Validation & Submit */}
                {user?.loggedIn && (
                  <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 gap-4">
                    <div className="flex items-center space-x-4 w-full sm:w-auto justify-center sm:justify-start">
                      {/* Word Count */}
                      <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl ${
                        wordCount >= 1 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {wordCount >= 1 ? (
                          <FaCheck className="w-4 h-4" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-yellow-600"></div>
                        )}
                        <span className="text-sm font-semibold">
                          {wordCount} word{wordCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      {/* Validation Status */}
                      {isValidComment && (
                        <div className="flex items-center space-x-2 text-green-600">
                          <FaCheck className="w-4 h-4" />
                          <span className="text-sm font-semibold hidden sm:block">Ready to post!</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting || !isValidComment}
                      className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-bold text-base w-full sm:w-auto justify-center"
                      aria-label="Post comment"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Posting...</span>
                        </>
                      ) : (
                        <>
                          <FaPaperPlane size={16} />
                          <span>Post Comment</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
        
        {/* Comments List */}
        <div className="mb-8 px-4 sm:px-0">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-3">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center sm:text-left">
              Community Comments
            </h3>
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </div>
          </div>
          {commentsList}
        </div>
      </section>

      {/* Custom Delete Confirmation Dialog - Mobile Optimized */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md mx-4 transform transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95">
            {/* Header */}
            <div className="border-b border-red-100 px-6 sm:px-8 py-4 sm:py-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-2xl flex items-center justify-center shadow-lg">
                    <FaExclamationTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-red-700">Delete Comment</h3>
                    <p className="text-xs sm:text-sm text-red-600 font-medium">This action cannot be undone</p>
                  </div>
                </div>
                <button
                  onClick={closeDeleteDialog}
                  className="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-xl"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8">
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-red-50 rounded-3xl flex items-center justify-center shadow-inner">
                  <FaTrash className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                </div>
                <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                  Confirm Deletion
                </h4>
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                  Are you sure you want to delete this comment? This action is permanent and cannot be reversed.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-6 sm:px-8 py-4 sm:py-6 bg-gray-50 rounded-b-3xl">
              <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={closeDeleteDialog}
                  className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteComment}
                  disabled={deletingCommentId}
                  className="px-6 sm:px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl hover:from-red-700 hover:to-orange-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"
                >
                  {deletingCommentId ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <FaTrash className="w-4 h-4" />
                      <span>Delete Comment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}