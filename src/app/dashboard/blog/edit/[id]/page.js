"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { 
  Container, TextField, Button, Typography, Paper, 
  CircularProgress, IconButton, Alert, Box, Divider
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

const ReactQuill = dynamic(() => import("react-quill-new"), { 
  ssr: false,
  loading: () => <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <CircularProgress />
  </div>
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
  const [message, setMessage] = useState({ text: "", type: "" });

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewImage("");
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
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

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ 
        mt: 6, 
        display: "flex", 
        justifyContent: "center",
        alignItems: "center",
        height: "80vh"
      }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (!article) {
    return (
      <Container maxWidth="md" sx={{ mt: 6 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Article not found
        </Alert>
        <Button 
          variant="contained"
          startIcon={<ArrowBack />} 
          onClick={() => router.push("/dashboard/blog/edit")}
        >
          Return to Articles
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button 
          variant="outlined"
          startIcon={<ArrowBack />} 
          onClick={() => router.push("/dashboard/blog/edit")}
          sx={{ mb: 2 }}
        >
          Back to Articles
        </Button>
        
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Edit Article
        </Typography>
        <Divider sx={{ my: 2 }} />
      </Box>

      <Paper elevation={0} sx={{ 
        p: 4, 
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}>
        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Basic Information
          </Typography>
          <TextField
            fullWidth
            label="Title"
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Subheading"
            variant="outlined"
            value={subheading}
            onChange={(e) => setSubheading(e.target.value)}
            sx={{ mb: 2 }}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Media
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button 
              variant="contained" 
              component="label"
              size="small"
            >
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                hidden
              />
            </Button>
            {previewImage && (
              <Button 
                variant="outlined" 
                color="error"
                size="small"
                onClick={handleRemoveImage}
              >
                Remove Image
              </Button>
            )}
          </Box>
          
          {previewImage && (
            <Box sx={{ 
              mb: 3, 
              border: '1px dashed', 
              borderColor: 'divider',
              p: 2, 
              borderRadius: 1,
              maxWidth: '400px'
            }}>
              <img
                src={previewImage}
                alt="Article preview"
                style={{ 
                  width: "100%", 
                  height: "auto",
                  borderRadius: "4px"
                }}
              />
            </Box>
          )}
          
          <TextField
            fullWidth
            label="YouTube Video URL"
            variant="outlined"
            value={youtubeLink}
            onChange={(e) => setYoutubeLink(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            sx={{ maxWidth: '600px' }}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Content
          </Typography>
          <Box sx={{ 
            border: '1px solid', 
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden'
          }}>
            <ReactQuill
              value={content}
              onChange={setContent}
              modules={modules}
              theme="snow"
              style={{ 
                height: "400px", 
                backgroundColor: "#fff",
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 2,
          pt: 2
        }}>
          <Button
            variant="outlined"
            onClick={() => router.push("/dashboard/blog/edit")}
            sx={{ minWidth: '120px' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={saving}
            sx={{ minWidth: '120px' }}
          >
            {saving ? <CircularProgress size={24} /> : "Save Changes"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}