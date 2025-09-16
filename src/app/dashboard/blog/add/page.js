'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
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
  Divider,
  Stack,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Image as ImageIcon,
  YouTube,
  Title,
  Subtitles,
  Save,
  LocalOffer,
  Close,
  Delete
} from '@mui/icons-material';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <CircularProgress size={24} />
});

const Editor = ({ onSave, existingBlog, onDelete }) => {
  const router = useRouter();
  const [token, setToken] = useState('');
  
  // Form state
  const [title, setTitle] = useState(existingBlog?.title || '');
  const [subheading, setSubheading] = useState(existingBlog?.subheading || '');
  const [content, setContent] = useState(existingBlog?.content || '');
  const [imageFile, setImageFile] = useState(null);
  const [existingImage, setExistingImage] = useState(existingBlog?.image || null);
  const [youtubeLink, setYoutubeLink] = useState(existingBlog?.youtubeLink || '');
  const [tags, setTags] = useState(existingBlog?.tags || []);
  const [tagInput, setTagInput] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token') || '';
    setToken(storedToken);
  }, []);

  // Quill editor configuration
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  }), []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, or WebP images are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);
    setExistingImage(null);
    setError(null);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setExistingImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isValidYouTubeLink = (link) => {
    if (!link) return true;
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/;
    return regex.test(link);
  };

  const youtubeEmbedId = useMemo(() => {
    if (!youtubeLink) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = youtubeLink.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }, [youtubeLink]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      setLoading(false);
      return;
    }

    if (!content.trim()) {
      setError('Content is required');
      setLoading(false);
      return;
    }

    if (youtubeLink && !isValidYouTubeLink(youtubeLink)) {
      setError('Invalid YouTube URL format');
      setLoading(false);
      return;
    }

    if (!imageFile && !existingImage) {
      setError('Featured image is required');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (subheading) formData.append('subheading', subheading);
    if (youtubeLink) formData.append('youtubeLink', youtubeLink);
    if (tags.length > 0) formData.append('tags', tags.join(','));
    if (imageFile) formData.append('image', imageFile);

    try {
      const config = {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000,
      };

      const response = existingBlog
        ? await axios.patch(`/api/blogs/${existingBlog._id}`, formData, config)
        : await axios.post('/api/blogs', formData, config);

      if (response.data.success) {
        if (!existingBlog) {
          setTitle('');
          setSubheading('');
          setContent('');
          setImageFile(null);
          setExistingImage(null);
          setYoutubeLink('');
          setTags([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
        
        onSave(response.data.data);
        toast.success(`Blog ${existingBlog ? 'updated' : 'created'} successfully!`);
      }
    } catch (err) {
      let errorMessage = 'An error occurred while saving the blog';
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          errorMessage = err.response.data.error || err.message;
          
          if (err.response.status === 401) {
            router.push('/login');
            return;
          } else if (err.response.status === 413) {
            errorMessage = 'File size too large (max 5MB)';
          }
        } else if (err.request) {
          errorMessage = 'Network error - please check your connection';
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      };
      
      await axios.delete(`/api/blogs/${existingBlog._id}`, config);
      onDelete();
      toast.success('Blog deleted successfully');
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.error || 'Failed to delete blog'
        : 'Failed to delete blog';
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
    }
  };

  const imagePreviewUrl = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    if (existingImage) return `/uploads/${existingImage}`;
    return null;
  }, [imageFile, existingImage]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ 
        p: 4, 
        borderRadius: 4,
        position: 'relative'
      }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
          {existingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Button 
            variant={!previewMode ? "contained" : "outlined"} 
            onClick={() => setPreviewMode(false)}
            startIcon={<Save />}
          >
            Editor
          </Button>
          <Button 
            variant={previewMode ? "contained" : "outlined"} 
            onClick={() => setPreviewMode(true)}
            disabled={!title || !content}
          >
            Preview
          </Button>
          {existingBlog && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => setDeleteConfirmOpen(true)}
              startIcon={<Delete />}
              sx={{ ml: 'auto' }}
            >
              Delete
            </Button>
          )}
        </Stack>

        {!previewMode ? (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Blog Title
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter blog title..."
                disabled={loading}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Subheading
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={subheading}
                onChange={(e) => setSubheading(e.target.value)}
                placeholder="Enter subheading..."
                disabled={loading}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Tags
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <TextField
                  variant="outlined"
                  size="small"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags..."
                  disabled={loading}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  sx={{ width: 200 }}
                />
                <Button 
                  variant="outlined" 
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || loading}
                >
                  Add
                </Button>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {tags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Featured Image
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<ImageIcon />}
                  disabled={loading}
                >
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    hidden
                    ref={fileInputRef}
                  />
                </Button>
                {(imageFile || existingImage) && (
                  <IconButton onClick={handleRemoveImage} disabled={loading}>
                    <Close />
                  </IconButton>
                )}
              </Stack>
              {imagePreviewUrl && (
                <Box sx={{ mt: 2, maxWidth: 500 }}>
                  <Card>
                    <CardMedia
                      component="img"
                      image={imagePreviewUrl}
                      alt="Preview"
                    />
                  </Card>
                </Box>
              )}
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                YouTube Video URL
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                placeholder="Paste YouTube video URL..."
                disabled={loading}
              />
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Blog Content
              </Typography>
              <Box sx={{ height: 400, borderRadius: 1, overflow: 'hidden' }}>
                <ReactQuill
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  theme="snow"
                  style={{ height: '100%' }}
                  readOnly={loading}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSave}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                sx={{ minWidth: 180 }}
              >
                {loading ? (
                  existingBlog ? 'Updating...' : 'Publishing...'
                ) : (
                  existingBlog ? 'Update Blog' : 'Publish Blog'
                )}
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ p: 3 }}>
            <Typography variant="h2" sx={{ mb: 2 }}>{title}</Typography>
            {subheading && (
              <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
                {subheading}
              </Typography>
            )}
            
            {tags.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
                {tags.map(tag => (
                  <Chip key={tag} label={tag} variant="outlined" sx={{ mb: 1 }} />
                ))}
              </Stack>
            )}
            
            {imagePreviewUrl && (
              <Box sx={{ mb: 4 }}>
                <Card>
                  <CardMedia
                    component="img"
                    image={imagePreviewUrl}
                    alt="Featured"
                  />
                </Card>
              </Box>
            )}

            {youtubeEmbedId && (
              <Box sx={{ mb: 4 }}>
                <iframe
                  width="100%"
                  height="500"
                  src={`https://www.youtube.com/embed/${youtubeEmbedId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ borderRadius: '8px' }}
                />
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Box 
              className="ql-editor" 
              dangerouslySetInnerHTML={{ __html: content }}
              sx={{
                '& h1': { typography: 'h3', mb: 2 },
                '& h2': { typography: 'h4', mb: 2 },
                '& p': { typography: 'body1', mb: 2 },
                '& img': { 
                  maxWidth: '100%', 
                  height: 'auto', 
                  borderRadius: 2,
                  my: 2
                },
                '& blockquote': { 
                  borderLeft: '4px solid',
                  borderColor: 'primary.main',
                  pl: 2,
                  py: 1,
                  my: 2,
                  backgroundColor: 'action.hover'
                }
              }}
            />
          </Box>
        )}
      </Paper>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete Blog Post</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this blog post? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Delete />}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer 
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Container>
  );
};

export default Editor;