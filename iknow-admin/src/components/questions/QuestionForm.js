import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, FieldArray } from "formik";
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
  FormControlLabel,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Layout from "../layout/Layout";
import api from "../../utils/api";

const QuestionSchema = Yup.object().shape({
  category_id: Yup.number().required("Category is required"),
  difficulty: Yup.number().min(1).max(5).required("Difficulty is required"),
  question: Yup.string().required("Question is required"),
  answers: Yup.array()
    .of(
      Yup.object().shape({
        answer_text: Yup.string().required("Answer text is required"),
        is_correct: Yup.boolean(),
      })
    )
    .min(4, "Must have exactly 4 answers")
    .max(4, "Must have exactly 4 answers")
    .test(
      "oneCorrectAnswer",
      "Exactly one answer must be marked as correct",
      (answers) => answers.filter((a) => a.is_correct).length === 1
    ),
});

const QuestionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isEdit = !!id;

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      setError("Error fetching categories");
    }
  }, []);

  const fetchQuestion = useCallback(async () => {
    try {
      const res = await api.get(`/questions/${id}`);
      setQuestion(res.data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching question");
      setLoading(false);
    }
  }, [id]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEdit) {
        await api.put(`/questions/${id}`, values);
      } else {
        await api.post("/questions", values);
      }
      navigate("/questions");
    } catch (err) {
      setError(err.response?.data?.error || "Error saving question");
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchCategories();

    if (id) {
      fetchQuestion();
    } else {
      setLoading(false);
    }
  }, [fetchCategories, fetchQuestion, id]);

  if (loading) {
    return (
      <Layout title={isEdit ? "Edit Question" : "New Question"}>
        <CircularProgress />
      </Layout>
    );
  }

  const initialValues = isEdit
    ? {
        category_id: question?.category_id || "",
        difficulty: question?.difficulty || 1,
        question: question?.question || "",
        answers: question?.answers || [
          { answer_text: "", is_correct: true },
          { answer_text: "", is_correct: false },
          { answer_text: "", is_correct: false },
          { answer_text: "", is_correct: false },
        ],
      }
    : {
        category_id: "",
        difficulty: 1,
        question: "",
        answers: [
          { answer_text: "", is_correct: true },
          { answer_text: "", is_correct: false },
          { answer_text: "", is_correct: false },
          { answer_text: "", is_correct: false },
        ],
      };

  return (
    <Layout title={isEdit ? "Edit Question" : "New Question"}>
      <Paper>
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            {isEdit ? "Edit Question" : "New Question"}
          </Typography>

          <Formik
            initialValues={initialValues}
            validationSchema={QuestionSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, errors, touched, isSubmitting, setFieldValue }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      variant="outlined"
                      fullWidth
                      error={touched.category_id && Boolean(errors.category_id)}
                    >
                      <InputLabel id="category-label">Category</InputLabel>
                      <Field
                        as={Select}
                        labelId="category-label"
                        name="category_id"
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
                      </Field>
                      {touched.category_id && errors.category_id && (
                        <FormHelperText>{errors.category_id}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      variant="outlined"
                      fullWidth
                      error={touched.difficulty && Boolean(errors.difficulty)}
                    >
                      <InputLabel id="difficulty-label">Difficulty</InputLabel>
                      <Field
                        as={Select}
                        labelId="difficulty-label"
                        name="difficulty"
                        label="Difficulty"
                      >
                        {[1, 2, 3, 4, 5].map((level) => (
                          <MenuItem key={level} value={level}>
                            {level}
                          </MenuItem>
                        ))}
                      </Field>
                      {touched.difficulty && errors.difficulty && (
                        <FormHelperText>{errors.difficulty}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="question"
                      label="Question"
                      variant="outlined"
                      multiline
                      rows={3}
                      error={touched.question && Boolean(errors.question)}
                      helperText={touched.question && errors.question}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Answers (Exactly 4 answers with 1 marked as correct)
                    </Typography>
                    {touched.answers && typeof errors.answers === "string" && (
                      <FormHelperText error>{errors.answers}</FormHelperText>
                    )}
                    <FieldArray name="answers">
                      {({ push, remove }) => (
                        <div>
                          {values.answers.map((answer, index) => (
                            <Box
                              key={index}
                              display="flex"
                              alignItems="center"
                              mb={2}
                            >
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={answer.is_correct}
                                    onChange={(e) => {
                                      // Uncheck all other answers
                                      values.answers.forEach((_, i) => {
                                        if (i !== index) {
                                          setFieldValue(
                                            `answers[${i}].is_correct`,
                                            false
                                          );
                                        }
                                      });
                                      // Check this one
                                      setFieldValue(
                                        `answers[${index}].is_correct`,
                                        e.target.checked
                                      );
                                    }}
                                    color="primary"
                                  />
                                }
                                label="Correct"
                              />
                              <Field
                                as={TextField}
                                fullWidth
                                name={`answers[${index}].answer_text`}
                                label={`Answer ${index + 1}`}
                                variant="outlined"
                                error={
                                  touched.answers &&
                                  touched.answers[index] &&
                                  errors.answers &&
                                  errors.answers[index] &&
                                  errors.answers[index].answer_text
                                }
                                helperText={
                                  touched.answers &&
                                  touched.answers[index] &&
                                  errors.answers &&
                                  errors.answers[index] &&
                                  errors.answers[index].answer_text
                                }
                              />
                            </Box>
                          ))}
                          {values.answers.length < 4 && (
                            <Button
                              type="button"
                              variant="outlined"
                              color="primary"
                              onClick={() =>
                                push({ answer_text: "", is_correct: false })
                              }
                            >
                              Add Answer
                            </Button>
                          )}
                        </div>
                      )}
                    </FieldArray>
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end">
                      <Button
                        type="button"
                        variant="outlined"
                        color="secondary"
                        onClick={() => navigate("/questions")}
                        style={{ marginRight: 8 }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting}
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
                  </Grid>
                </Grid>
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

export default QuestionForm;
