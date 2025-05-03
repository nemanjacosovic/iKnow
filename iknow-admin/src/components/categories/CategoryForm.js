import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Alert,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import Layout from "../layout/Layout";
import api from "../../utils/api";

const CategorySchema = Yup.object().shape({
  category: Yup.string().required("Category is required"),
  subcategory: Yup.string(),
  universe: Yup.string(),
  ip_owner: Yup.string(),
});

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState("");
  const isEdit = !!id;

  const fetchCategory = useCallback(async () => {
    try {
      const res = await api.get(`/categories/${id}`);
      setCategory(res.data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching category");
      setLoading(false);
    }
  }, [id]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEdit) {
        await api.put(`/categories/${id}`, values);
      } else {
        await api.post("/categories", values);
      }
      navigate("/categories");
    } catch (err) {
      setError(err.response?.data?.error || "Error saving category");
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [fetchCategory, id]);

  if (loading) {
    return (
      <Layout title={isEdit ? "Edit Category" : "New Category"}>
        <CircularProgress />
      </Layout>
    );
  }

  const initialValues = isEdit
    ? {
        category: category?.category || "",
        subcategory: category?.subcategory || "",
        universe: category?.universe || "",
        ip_owner: category?.ip_owner || "",
      }
    : {
        category: "",
        subcategory: "",
        universe: "",
        ip_owner: "",
      };

  return (
    <Layout title={isEdit ? "Edit Category" : "New Category"}>
      <Paper>
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            {isEdit ? "Edit Category" : "New Category"}
          </Typography>

          <Formik
            initialValues={initialValues}
            validationSchema={CategorySchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="category"
                      label="Category"
                      variant="outlined"
                      error={touched.category && Boolean(errors.category)}
                      helperText={touched.category && errors.category}
                    />
                  </Grid>
                  <Grid sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="subcategory"
                      label="Subcategory"
                      variant="outlined"
                      error={touched.subcategory && Boolean(errors.subcategory)}
                      helperText={touched.subcategory && errors.subcategory}
                    />
                  </Grid>
                  <Grid sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="universe"
                      label="Universe"
                      variant="outlined"
                      error={touched.universe && Boolean(errors.universe)}
                      helperText={touched.universe && errors.universe}
                    />
                  </Grid>
                  <Grid sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="ip_owner"
                      label="IP Owner"
                      variant="outlined"
                      error={touched.ip_owner && Boolean(errors.ip_owner)}
                      helperText={touched.ip_owner && errors.ip_owner}
                    />
                  </Grid>
                  <Grid>
                    <Box display="flex" justifyContent="flex-end">
                      <Button
                        type="button"
                        variant="outlined"
                        color="secondary"
                        onClick={() => navigate("/categories")}
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

export default CategoryForm;
