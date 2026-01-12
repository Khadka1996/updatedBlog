"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { 
  Container, TextField, Button, Typography, Paper, 
  CircularProgress, IconButton, Alert, Box, Divider,
  Card,
  CardMedia,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { 
  ArrowBack,
  Save,
  Delete,
  Image as ImageIcon,
  YouTube,
  Close,
  Title as TitleIcon,
  Subtitles,
  CloudUpload
} from "@mui/icons-material";

const ReactQuill = dynamic(() => import("react-quill-new"), { 
  ssr: false,
  loading: () => (
    <Box sx={{ 
      height: '400px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: 'grey.50',
      borderRadius: 2
    }}>
      <CircularProgress size={40} />
    </Box>
  )
});

export default function EditArticle() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  
  const [article, setArticle] = useState(null);
  const [title, setTitle] = useState("");
  const [subheading, setSubheading] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      ["link", "image", "video"],
      ["clean"],
    ],
  };

  useEffect(() => {
    if (!id) return;

    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/blogs/${id}`);
        const result = await response.json();
        
        if (!response.ok) throw new Error("Failed to fetch article");
        
        setArticle(result.data);
        setTitle(result.data.title);
        setSubheading(result.data.subheading || "");
        setContent(result.data.content);
        setPreviewImage(result.data.image ? `/uploads/${result.data.image}` : "");
        setYoutubeLink(result.data.youtubeLink || "");
      } catch (err) {
        setMessage({ text: err.message, type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ 
        text: 'Only JPEG, PNG, or WebP images are allowed', 
        type: "error" 
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ 
        text: 'Image size must be less than 5MB', 
        type: "error" 
      });
      return;
    }

    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
    setMessage({ text: "", type: "" });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("subheading", subheading);
      formData.append("content", content);
      formData.append("youtubeLink", youtubeLink);
      
      if (imageFile) {
        formData.append("image", imageFile);
      } else if (previewImage === "") {
        formData.append("removeImage", "true");
      }

      const response = await fetch(`/api/blogs/${id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update article");
      }

      setMessage({ text: "Article updated successfully!", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete article");
      }

      setDeleteDialogOpen(false);
      router.push("/dashboard/blog/edit");
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'grey.50'
      }}>
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ color: '#174fa2', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading Article...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!article) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', p: 3 }}>
        <Container maxWidth="md">
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 3,
              '& .MuiAlert-message': { width: '100%' }
            }}
            action={
              <Button 
                color="inherit" 
                size="small"
                onClick={() => router.push("/dashboard/blog/edit")}
                startIcon={<ArrowBack />}
                sx={{ 
                  bgcolor: 'rgba(0,0,0,0.1)',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.2)' }
                }}
              >
                Back
              </Button>
            }
          >
            <Typography variant="h6" gutterBottom>
              Article Not Found
            </Typography>
            <Typography variant="body2">
              The article you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to access it.
            </Typography>
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            mb: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #174fa2 0%, #1e3a8a 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Button 
              variant="outlined"
              startIcon={<ArrowBack />} 
              onClick={() => router.push("/dashboard/blog/edit")}
              sx={{ 
                mb: 3,
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Back to Articles
            </Button>
            
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Edit Article
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
              Update and refine your blog post content
            </Typography>
          </Box>
          
          {/* Background Pattern */}
          <Box 
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.1)'
            }}
          />
        </Paper>

        {/* Main Form */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 5, 
            borderRadius: 4,
            bgcolor: 'white',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }}
        >
          {message.text && (
            <Alert 
              severity={message.type} 
              sx={{ 
                mb: 4,
                borderRadius: 3,
                alignItems: 'center'
              }}
              onClose={() => setMessage({ text: "", type: "" })}
            >
              <Typography fontWeight="medium">
                {message.text}
              </Typography>
            </Alert>
          )}

          <Stack spacing={5}>
            {/* Basic Information Section */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TitleIcon sx={{ color: '#174fa2', mr: 2, fontSize: 28 }} />
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#174fa2' }}>
                  Basic Information
                </Typography>
              </Box>
              
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Article Title"
                  variant="outlined"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  InputProps={{
                    sx: { 
                      borderRadius: 3,
                      fontSize: '1.1rem',
                      bgcolor: 'grey.50'
                    }
                  }}
                  InputLabelProps={{
                    sx: { fontWeight: 600 }
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Subheading"
                  variant="outlined"
                  value={subheading}
                  onChange={(e) => setSubheading(e.target.value)}
                  multiline
                  rows={2}
                  InputProps={{
                    sx: { 
                      borderRadius: 3,
                      bgcolor: 'grey.50'
                    }
                  }}
                  InputLabelProps={{
                    sx: { fontWeight: 600 }
                  }}
                />
              </Stack>
            </Box>

            <Divider sx={{ borderColor: 'grey.200' }} />

            {/* Media Section */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <ImageIcon sx={{ color: '#174fa2', mr: 2, fontSize: 28 }} />
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#174fa2' }}>
                  Media
                </Typography>
              </Box>

              <Stack spacing={3}>
                {/* Image Upload with Drag & Drop */}
                <Box>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                    Featured Image
                  </Typography>
                  
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Button
                      variant="contained"
                      component="label"
                      startIcon={<ImageIcon />}
                      sx={{ 
                        borderRadius: 3,
                        px: 3,
                        py: 1,
                        bgcolor: '#174fa2',
                        '&:hover': { bgcolor: '#1e3a8a' }
                      }}
                    >
                      Choose Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        hidden
                        ref={fileInputRef}
                      />
                    </Button>
                    {previewImage && (
                      <Button 
                        variant="outlined" 
                        color="error"
                        startIcon={<Close />}
                        onClick={handleRemoveImage}
                        sx={{ borderRadius: 3 }}
                      >
                        Remove
                      </Button>
                    )}
                  </Stack>
                  
                  {/* Drag & Drop Area */}
                  {!previewImage && (
                    <Box
                      ref={dropAreaRef}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      sx={{
                        border: isDragOver ? '3px dashed #174fa2' : '2px dashed #e2e8f0',
                        borderRadius: 3,
                        p: 4,
                        textAlign: 'center',
                        bgcolor: isDragOver ? '#f0f7ff' : 'grey.50',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: '#f8fafc',
                          borderColor: '#174fa2'
                        }
                      }}
                    >
                      <CloudUpload 
                        sx={{ 
                          fontSize: 48, 
                          color: isDragOver ? '#174fa2' : '#94a3b8',
                          mb: 2 
                        }} 
                      />
                      <Typography variant="h6" gutterBottom sx={{ color: isDragOver ? '#174fa2' : '#334155' }}>
                        {isDragOver ? 'Drop your image here' : 'Drag & drop your image here'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        or click to browse files
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Supports JPG, PNG, WebP • Max 5MB
                      </Typography>
                    </Box>
                  )}
                  
                  {previewImage && (
                    <Card 
                      sx={{ 
                        maxWidth: 400, 
                        borderRadius: 3, 
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={previewImage}
                        alt="Article preview"
                        sx={{ 
                          height: 250, 
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.02)'
                          }
                        }}
                      />
                    </Card>
                  )}
                </Box>

                {/* YouTube Link */}
                <Box>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                    YouTube Video
                  </Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    value={youtubeLink}
                    onChange={(e) => setYoutubeLink(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    InputProps={{
                      sx: { 
                        borderRadius: 3,
                        bgcolor: 'grey.50'
                      },
                      startAdornment: <YouTube sx={{ color: 'error.main', mr: 1, ml: 0.5 }} />
                    }}
                    sx={{ maxWidth: 600 }}
                  />
                </Box>
              </Stack>
            </Box>

            <Divider sx={{ borderColor: 'grey.200' }} />

            {/* Content Section */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Subtitles sx={{ color: '#174fa2', mr: 2, fontSize: 28 }} />
                <Typography variant="h5" fontWeight="bold" sx={{ color: '#174fa2' }}>
                  Content
                </Typography>
              </Box>
              
              <Box sx={{ 
                border: '2px solid', 
                borderColor: 'grey.200',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'border-color 0.3s ease',
                '&:hover': {
                  borderColor: 'grey.300'
                }
              }}>
                <ReactQuill
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  theme="snow"
                  style={{ 
                    height: "400px",
                  }}
                />
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              pt: 4,
              borderTop: '2px solid',
              borderColor: 'grey.100'
            }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => setDeleteDialogOpen(true)}
                sx={{ 
                  borderRadius: 3,
                  px: 3,
                  py: 1
                }}
              >
                Delete Article
              </Button>
              
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  onClick={() => router.push("/dashboard/blog/edit")}
                  sx={{ 
                    borderRadius: 3,
                    px: 4,
                    py: 1,
                    minWidth: 120
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                  onClick={handleSave}
                  disabled={saving}
                  sx={{ 
                    borderRadius: 3,
                    px: 4,
                    py: 1,
                    minWidth: 160,
                    bgcolor: '#d92026',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    '&:hover': { 
                      bgcolor: '#b71c1c',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(217, 32, 38, 0.3)'
                    },
                    '&:disabled': {
                      bgcolor: 'grey.400'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4 }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#fef2f2', 
          borderBottom: '1px solid #fecaca',
          py: 3
        }}>
          <Typography variant="h5" fontWeight="bold" color="error" sx={{ display: 'flex', alignItems: 'center' }}>
            <Delete sx={{ mr: 1 }} />
            Confirm Deletion
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 4 }}>
          <Box textAlign="center">
            <Typography variant="h6" gutterBottom color="error">
              Delete "{article.title}"?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              This action cannot be undone. All comments, likes, and associated data will be permanently removed from the system.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ 
              borderRadius: 3,
              px: 4,
              minWidth: 100
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete}
            variant="contained"
            color="error"
            startIcon={<Delete />}
            disabled={saving}
            sx={{ 
              borderRadius: 3,
              px: 4,
              minWidth: 120,
              fontWeight: 'bold'
            }}
          >
            {saving ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}