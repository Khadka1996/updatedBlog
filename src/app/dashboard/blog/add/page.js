'use client';
import { useState, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { useRouter } from 'next/navigation';
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Box,
  Card,
  CardMedia,
  Chip,
  Stack,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CloudUpload,
  Close,
  Delete,
  Save,
  Image as ImageIcon,
} from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
      <CircularProgress />
    </Box>
  ),
});

const Editor = ({ onSave, existingBlog, onDelete }) => {
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState(existingBlog?.title || '');
  const [subheading, setSubheading] = useState(existingBlog?.subheading || '');
  const [content, setContent] = useState(existingBlog?.content || '');
  const [imageFile, setImageFile] = useState(null);
  const [existingImage, setExistingImage] = useState(existingBlog?.image || null);
  const [youtubeLink, setYoutubeLink] = useState(existingBlog?.youtubeLink || '');
  const [tags, setTags] = useState(existingBlog?.tags || []);
  const [tagInput, setTagInput] = useState('');

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  // Word count
  const wordCount = useMemo(() => {
    const text = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return text ? text.split(' ').length : 0;
  }, [content]);

  // Quill configuration - rich toolbar
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, false] }],
        [{ font: [] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean'],
      ],
    }),
    []
  );

  const handleImageUpload = useCallback((file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, or WebP images allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    setImageFile(file);
    setExistingImage(null);
    setError(null);
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setExistingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSave = async () => {
    if (!title.trim()) return setError('Title is required');
    if (!content.trim()) return setError('Content is required');
    if (!imageFile && !existingImage) return setError('Featured image is required');

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content);
    if (subheading.trim()) formData.append('subheading', subheading.trim());
    if (youtubeLink.trim()) formData.append('youtubeLink', youtubeLink.trim());
    if (tags.length) formData.append('tags', tags.join(','));
    if (imageFile) formData.append('image', imageFile);

    try {
      const url = existingBlog ? `/api/blogs/${existingBlog._id}` : '/api/blogs';

      const res = await fetch(url, {
        method: existingBlog ? 'PATCH' : 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server error (${res.status})`);
      }

      toast.success(existingBlog ? 'Blog updated successfully' : 'Blog published successfully!');

      if (!existingBlog) {
        // Reset for new post
        setTitle('');
        setSubheading('');
        setContent('');
        setImageFile(null);
        setExistingImage(null);
        setYoutubeLink('');
        setTags([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }

      onSave?.(data.data || data);
    } catch (err) {
      const message =
        err.message.includes('401') || err.message.includes('Unauthorized')
          ? 'Session expired. Please login again.'
          : err.message || 'Failed to save blog';

      setError(message);
      toast.error(message);

      if (message.includes('Session expired')) {
        setTimeout(() => router.push('/login'), 1800);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingBlog?._id) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/blogs/${existingBlog._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Delete failed');
      }

      toast.success('Blog deleted successfully');
      onDelete?.();
    } catch (err) {
      toast.error(err.message || 'Failed to delete blog');
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
    }
  };

  const imagePreviewUrl = useMemo(() => {
    return imageFile ? URL.createObjectURL(imageFile) : existingImage ? `/uploads/${existingImage}` : null;
  }, [imageFile, existingImage]);

  return (
    <Container maxWidth="lg" sx={{ py: 5, pb: 10 }}>
      <Paper
        elevation={4}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          {existingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Stack spacing={4}>
          {/* Title + Subheading */}
          <Box>
            <TextField
              fullWidth
              label="Blog Title *"
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </Box>

          <Box>
            <TextField
              fullWidth
              label="Subheading (optional)"
              variant="outlined"
              value={subheading}
              onChange={(e) => setSubheading(e.target.value)}
              disabled={loading}
            />
          </Box>

          {/* Tags */}
          <Box>
            <Typography variant="subtitle1" gutterBottom fontWeight={500}>
              Tags
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={1}>
              <TextField
                size="small"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Type tag and press Enter..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                sx={{ minWidth: 200 }}
                disabled={loading}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || loading}
              >
                Add Tag
              </Button>
            </Stack>

            {tags.length > 0 && (
              <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" gap={1}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    variant="outlined"
                    color="primary"
                  />
                ))}
              </Stack>
            )}
          </Box>

          {/* Featured Image - Drag & Drop */}
          <Box>
            <Typography variant="subtitle1" gutterBottom fontWeight={500}>
              Featured Image *
            </Typography>

            <Box
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: '2px dashed',
                borderColor: dragActive ? 'primary.main' : 'grey.400',
                borderRadius: 3,
                p: 6,
                textAlign: 'center',
                backgroundColor: dragActive ? 'action.hover' : 'action.selected',
                transition: 'all 0.2s',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
              />

              {!imagePreviewUrl ? (
                <>
                  <CloudUpload sx={{ fontSize: 48, color: 'action.active', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Drag & drop image here
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    or <strong>click to browse</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" mt={1} component="div">
                    JPG, PNG, WebP • Max 5MB
                  </Typography>
                </>
              ) : (
                <Box sx={{ position: 'relative', maxWidth: 480, mx: 'auto' }}>
                  <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                    <CardMedia
                      component="img"
                      image={imagePreviewUrl}
                      alt="Featured preview"
                      sx={{
                        maxHeight: 420,
                        objectFit: 'cover',
                      }}
                    />
                  </Card>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      bgcolor: 'background.paper',
                      boxShadow: 2,
                    }}
                  >
                    <Close />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>

          {/* YouTube Link */}
          <Box>
            <TextField
              fullWidth
              label="YouTube Video URL (optional)"
              variant="outlined"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              disabled={loading}
            />
          </Box>

          {/* Rich Text Editor */}
          <Box>
            <Typography variant="subtitle1" gutterBottom fontWeight={500}>
              Content *
            </Typography>

            <Paper
              variant="outlined"
              sx={{
                overflow: 'hidden',
                borderRadius: 2,
                '& .ql-toolbar': {
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                },
                '& .ql-container': {
                  minHeight: '50vh',
                  maxHeight: '75vh',
                  overflowY: 'auto',
                  border: 'none',
                },
                '& .ql-editor': {
                  px: 4,
                  py: 3,
                  fontSize: '1.08rem',
                  lineHeight: 1.75,
                },
              }}
            >
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                placeholder="Start writing your story..."
                readOnly={loading}
              />
            </Paper>

            {/* Word count */}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {wordCount} words • {content.length} characters
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
            {existingBlog && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={loading}
              >
                Delete Post
              </Button>
            )}

            <Button
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={22} color="inherit" /> : <Save />}
              onClick={handleSave}
              disabled={loading}
              sx={{ minWidth: 160 }}
            >
              {loading ? 'Saving...' : existingBlog ? 'Update Post' : 'Publish Post'}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Blog Post</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this post? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer
        position="bottom-right"
        autoClose={4500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </Container>
  );
};

export default Editor;