"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Container, Typography, Paper, List, ListItem, 
  ListItemText, Alert, IconButton, Box, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Avatar, Chip, Stack
} from "@mui/material";
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Article as ArticleIcon,
  Add as AddIcon
} from "@mui/icons-material";

export default function ArticleList() {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch("/api/blogs");
        const result = await response.json();
        
        if (!response.ok) throw new Error("Failed to fetch articles");
        
        setArticles(result.data || []);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchArticles();
  }, []);

  const handleDeleteClick = (article) => {
    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/blogs/${articleToDelete._id}`, {
        method: "DELETE",  // Should be uppercase 'DELETE' to match HTTP standards
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete article");
      }
      
      setArticles(articles.filter(a => a._id !== articleToDelete._id));
      setDeleteDialogOpen(false);
      
      // Optional: Show success message
      setMessage({ text: "Article deleted successfully", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      
    } catch (err) {
      setError(err.message);
      // Optionally auto-hide error after some time
      setTimeout(() => setError(""), 5000);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          My Articles
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          component={Link}
          href="/dashboard/blog/add"
          sx={{ borderRadius: '8px' }}
        >
          New Article
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={0} sx={{ 
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden'
      }}>
        {articles.length > 0 ? (
          <List disablePadding>
            {articles.map((article) => (
              <ListItem 
                key={article._id}
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
                secondaryAction={
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      component={Link}
                      href={`/dashboard/blog/edit/${article._id}`}
                      sx={{ color: 'primary.main' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteClick(article)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" fontWeight="medium">
                      {article.title}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary" mr={2}>
                        {formatDate(article.createdAt)}
                      </Typography>
                      {article.isPublished ? (
                        <Chip 
                          label="Published" 
                          size="small" 
                          color="success" 
                          variant="outlined"
                        />
                      ) : (
                        <Chip 
                          label="Draft" 
                          size="small" 
                          color="warning" 
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            py: 8,
            textAlign: 'center'
          }}>
            <ArticleIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No articles found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Get started by creating your first article
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              component={Link}
              href="/dashboard/blog/add"
            >
              Create Article
            </Button>
          </Box>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography fontWeight="bold">Confirm Delete</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{articleToDelete?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}