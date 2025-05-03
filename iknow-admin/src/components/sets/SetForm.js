import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  CircularProgress,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Layout from "../layout/Layout";
import api from "../../utils/api";

const SetSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  category_id: Yup.number().required("Category is required"),
  question_ids: Yup.array().of(Yup.number()),
});

const SetForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [set, setSet] = useState(null);
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const isEdit = !!id;

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      setError("Error fetching categories");
    }
  };

  const fetchSet = useCallback(async () => {
    try {
      const res = await api.get(`/sets/${id}`);
      setSet(res.data);
      setSelectedCategoryId(res.data.category_id);
      setSelectedQuestions(res.data.questions.map((q) => q.id));
      setLoading(false);
    } catch (err) {
      setError("Error fetching set");
      setLoading(false);
    }
  }, [id]);

  const fetchQuestions = useCallback(async (categoryId) => {
    try {
      const res = await api.get(`/questions?category_id=${categoryId}`);
      setQuestions(res.data);
    } catch (err) {
      setError("Error fetching questions");
    }
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        ...values,
        question_ids: selectedQuestions,
      };

      if (isEdit) {
        await api.put(`/sets/${id}`, payload);
      } else {
        await api.post("/sets", payload);
      }
      navigate("/sets");
    } catch (err) {
      setError(err.response?.data?.error || "Error saving set");
      setSubmitting(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleQuestionSelect = (questionId) => {
    if (selectedQuestions.includes(questionId)) {
      setSelectedQuestions(selectedQuestions.filter((id) => id !== questionId));
    } else {
      setSelectedQuestions([...selectedQuestions, questionId]);
    }
  };

  const handleCategoryChange = (categoryId) => {
    // src/components/sets/SetForm.js (continued)
    setSelectedCategoryId(categoryId);
    // Clear selected questions when category changes
    setSelectedQuestions([]);
  };

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchSet();
    } else {
      setLoading(false);
    }
  }, [fetchSet, id]);

  useEffect(() => {
    if (selectedCategoryId) {
      fetchQuestions(selectedCategoryId);
    }
  }, [fetchQuestions, selectedCategoryId]);

  if (loading) {
    return (
      <Layout title={isEdit ? "Edit Question Set" : "New Question Set"}>
        <CircularProgress />
      </Layout>
    );
  }

  const initialValues = isEdit
    ? {
        name: set?.name || "",
        category_id: set?.category_id || "",
      }
    : {
        name: "",
        category_id: "",
      };

  return (
    <Layout title={isEdit ? "Edit Question Set" : "New Question Set"}>
      <Paper>
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            {isEdit ? "Edit Question Set" : "New Question Set"}
          </Typography>

          <Formik
            initialValues={initialValues}
            validationSchema={SetSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, setFieldValue, errors, touched, isSubmitting }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="name"
                      label="Set Name"
                      variant="outlined"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      variant="outlined"
                      fullWidth
                      error={touched.category_id && Boolean(errors.category_id)}
                    >
                      <InputLabel id="category-label">Category</InputLabel>
                      <Select
                        labelId="category-label"
                        name="category_id"
                        value={values.category_id}
                        onChange={(e) => {
                          setFieldValue("category_id", e.target.value);
                          handleCategoryChange(e.target.value);
                        }}
                        label="Category"
                      >
                        <MenuItem value="">
                          <em>Select a category</em>
                        </MenuItem>
                        {categories.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.category} - {category.subcategory}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.category_id && errors.category_id && (
                        <FormHelperText>{errors.category_id}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>

                {values.category_id && (
                  <>
                    <Box mt={4} mb={2}>
                      <Typography variant="subtitle1">
                        Select Questions ({selectedQuestions.length} selected)
                      </Typography>
                    </Box>

                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell padding="checkbox"></TableCell>
                            <TableCell>ID</TableCell>
                            <TableCell>Question</TableCell>
                            <TableCell>Difficulty</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {questions
                            .slice(
                              page * rowsPerPage,
                              page * rowsPerPage + rowsPerPage
                            )
                            .map((question) => (
                              <TableRow key={question.id}>
                                <TableCell padding="checkbox">
                                  <Checkbox
                                    checked={selectedQuestions.includes(
                                      question.id
                                    )}
                                    onChange={() =>
                                      handleQuestionSelect(question.id)
                                    }
                                  />
                                </TableCell>
                                <TableCell>{question.id}</TableCell>
                                <TableCell>{question.question}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={question.difficulty}
                                    color={
                                      question.difficulty <= 2
                                        ? "primary"
                                        : question.difficulty >= 4
                                        ? "secondary"
                                        : "default"
                                    }
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          {questions.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} align="center">
                                No questions found for this category. Add
                                questions first.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={questions.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                      />
                    </TableContainer>
                  </>
                )}

                <Box mt={4} display="flex" justifyContent="flex-end">
                  <Button
                    type="button"
                    variant="outlined"
                    color="secondary"
                    onClick={() => navigate("/sets")}
                    style={{ marginRight: 8 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={
                      isSubmitting ||
                      !values.category_id ||
                      selectedQuestions.length === 0
                    }
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} />
                    ) : isEdit ? (
                      "Update"
                    ) : (
                      "Create"
                    )}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </Box>
      </Paper>

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

export default SetForm;
