import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import Layout from "../layout/Layout";
import api from "../../utils/api";

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [filters, setFilters] = useState({
    category_id: "",
    difficulty: "",
  });

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      setError("Error fetching categories");
    }
  };

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      let url = "/questions";
      const params = new URLSearchParams();

      if (filters.category_id) {
        params.append("category_id", filters.category_id);
      }

      if (filters.difficulty) {
        params.append("difficulty", filters.difficulty);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await api.get(url);
      setQuestions(res.data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching questions");
      setLoading(false);
    }
  }, [filters]);

  const handleDeleteClick = (question) => {
    setQuestionToDelete(question);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/questions/${questionToDelete.id}`);
      setQuestions(questions.filter((q) => q.id !== questionToDelete.id));
      setSuccess("Question deleted successfully");
      setDeleteDialogOpen(false);
    } catch (err) {
      setError(err.response?.data?.error || "Error deleting question");
      setDeleteDialogOpen(false);
    }
  };

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value,
    });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions, filters]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 1:
        return "primary";
      case 2:
        return "default";
      case 3:
        return "secondary";
      case 4:
        return "error";
      case 5:
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Layout title="Questions">
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h5">Questions</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/questions/new"
        >
          Add Question
        </Button>
      </Box>

      <Box mb={3}>
        <Paper>
          <Box p={2} display="flex" alignItems="center">
            <Typography variant="subtitle1" style={{ marginRight: 16 }}>
              Filters:
            </Typography>
            <FormControl
              variant="outlined"
              style={{ minWidth: 200, marginRight: 16 }}
            >
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                name="category_id"
                value={filters.category_id}
                onChange={handleFilterChange}
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
            <FormControl variant="outlined" style={{ minWidth: 200 }}>
              <InputLabel id="difficulty-filter-label">Difficulty</InputLabel>
              <Select
                labelId="difficulty-filter-label"
                name="difficulty"
                value={filters.difficulty}
                onChange={handleFilterChange}
                label="Difficulty"
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {[1, 2, 3, 4, 5].map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
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
              <TableCell>Category</TableCell>
              <TableCell>Question</TableCell>
              <TableCell>Difficulty</TableCell>
              <TableCell>Answers</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question.id}>
                <TableCell>{question.id}</TableCell>
                <TableCell>
                  {question.category} - {question.subcategory}
                </TableCell>
                <TableCell>{question.question}</TableCell>
                <TableCell>
                  <Chip
                    label={question.difficulty}
                    color={getDifficultyColor(question.difficulty)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {question.answers?.map((answer, index) => (
                    <div
                      key={index}
                      style={{ color: answer.is_correct ? "green" : "inherit" }}
                    >
                      {answer.answer_text} {answer.is_correct && "✓"}
                    </div>
                  ))}
                </TableCell>
                <TableCell>
                  <IconButton
                    component={Link}
                    to={`/questions/edit/${question.id}`}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteClick(question)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {questions.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No questions found. Create one to get started.
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
        <DialogTitle>Delete Question</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this question? This action cannot be
            undone.
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

export default Questions;
