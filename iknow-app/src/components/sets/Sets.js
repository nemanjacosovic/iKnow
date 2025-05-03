// src/components/sets/Sets.js
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@material-ui/icons";
import Layout from "../layout/Layout";
import api from "../../utils/api";

const Sets = () => {
  const [sets, setSets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [setToDelete, setSetToDelete] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchSets();
  }, []);

  useEffect(() => {
    fetchSets();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      setError("Error fetching categories");
    }
  };

  const fetchSets = async () => {
    try {
      setLoading(true);
      let url = "/sets";
      if (selectedCategory) {
        url += `?category_id=${selectedCategory}`;
      }
      const res = await api.get(url);
      setSets(res.data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching sets");
      setLoading(false);
    }
  };

  const handleDeleteClick = (set) => {
    setSetToDelete(set);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/sets/${setToDelete.id}`);
      setSets(sets.filter((s) => s.id !== setToDelete.id));
      setSuccess("Set deleted successfully");
      setDeleteDialogOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || "Error deleting set");
      setDeleteDialogOpen(false);
    }
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  return (
    <Layout title="Question Sets">
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h5">Question Sets</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/sets/new"
        >
          Add Set
        </Button>
      </Box>

      <Box mb={3}>
        <Paper>
          <Box p={2} display="flex" alignItems="center">
            <Typography variant="subtitle1" style={{ marginRight: 16 }}>
              Filter by Category:
            </Typography>
            <FormControl variant="outlined" style={{ minWidth: 200 }}>
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Category"
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.category} - {category.subcategory}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Paper>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Questions</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sets.map((set) => (
              <TableRow key={set.id}>
                <TableCell>{set.id}</TableCell>
                <TableCell>{set.name}</TableCell>
                <TableCell>
                  {set.category} - {set.subcategory}
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${set.question_count} questions`}
                    color={set.question_count >= 20 ? "primary" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    component={Link}
                    to={`/sets/edit/${set.id}`}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteClick(set)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {sets.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No question sets found. Create one to get started.
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
        <DialogTitle>Delete Question Set</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the set "{setToDelete?.name}"? This
            action cannot be undone.
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

export default Sets;
