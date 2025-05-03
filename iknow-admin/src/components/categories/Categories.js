import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@material-ui/icons";
import Layout from "../layout/Layout";
import api from "../../utils/api";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/categories");
      setCategories(res.data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching categories");
      setLoading(false);
    }
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/categories/${categoryToDelete.id}`);
      setCategories(categories.filter((cat) => cat.id !== categoryToDelete.id));
      setSuccess("Category deleted successfully");
      setDeleteDialogOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || "Error deleting category");
      setDeleteDialogOpen(false);
    }
  };

  return (
    <Layout title="Categories">
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h5">Categories</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/categories/new"
        >
          Add Category
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Subcategory</TableCell>
              <TableCell>Universe</TableCell>
              <TableCell>IP Owner</TableCell>
              <TableCell>Questions</TableCell>
              <TableCell>Sets</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.id}</TableCell>
                <TableCell>{category.category}</TableCell>
                <TableCell>{category.subcategory || "-"}</TableCell>
                <TableCell>{category.universe || "-"}</TableCell>
                <TableCell>{category.ip_owner || "-"}</TableCell>
                <TableCell>{category.question_count || 0}</TableCell>
                <TableCell>{category.set_count || 0}</TableCell>
                <TableCell>
                  <IconButton
                    component={Link}
                    to={`/categories/edit/${category.id}`}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteClick(category)}
                    size="small"
                    disabled={
                      category.question_count > 0 || category.set_count > 0
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No categories found. Create one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the category "
            {categoryToDelete?.category}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess("")}
      >
        <Alert onClose={() => setSuccess("")} severity="success">
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
      >
        <Alert onClose={() => setError("")} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default Categories;
