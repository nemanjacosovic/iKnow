// src/components/users/UserForm.js
import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
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
  FormControlLabel,
  Switch,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import Layout from "../layout/Layout";
import api from "../../utils/api";

const UserSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().when("isEdit", {
    is: false,
    then: Yup.string().required("Password is required"),
    otherwise: Yup.string(),
  }),
  is_active: Yup.boolean(),
  is_admin: Yup.boolean(),
});

const UserForm = () => {
  const { id } = useParams();
  const history = useHistory();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState("");
  const isEdit = !!id;

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await api.get(`/users/${id}`);
      setUser(res.data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching user");
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (isEdit) {
        const payload = { ...values };
        if (!payload.password) {
          delete payload.password;
        }
        await api.put(`/users/${id}`, payload);
      } else {
        await api.post("/users", values);
      }
      history.push("/users");
    } catch (err) {
      setError(err.response?.data?.error || "Error saving user");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout title={isEdit ? "Edit User" : "New User"}>
        <CircularProgress />
      </Layout>
    );
  }

  const initialValues = isEdit
    ? {
        username: user?.username || "",
        email: user?.email || "",
        password: "",
        is_active: user?.is_active || true,
        is_admin: user?.is_admin || false,
        isEdit: true,
      }
    : {
        username: "",
        email: "",
        password: "",
        is_active: true,
        is_admin: false,
        isEdit: false,
      };

  return (
    <Layout title={isEdit ? "Edit User" : "New User"}>
      <Paper>
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            {isEdit ? "Edit User" : "New User"}
          </Typography>

          <Formik
            initialValues={initialValues}
            validationSchema={UserSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ errors, touched, isSubmitting, values }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="username"
                      label="Username"
                      variant="outlined"
                      error={touched.username && Boolean(errors.username)}
                      helperText={touched.username && errors.username}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="email"
                      label="Email"
                      type="email"
                      variant="outlined"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="password"
                      label={
                        isEdit
                          ? "New Password (leave blank to keep current)"
                          : "Password"
                      }
                      type="password"
                      variant="outlined"
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Field
                          as={Switch}
                          name="is_active"
                          color="primary"
                          checked={values.is_active}
                        />
                      }
                      label="Active"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Field
                          as={Switch}
                          name="is_admin"
                          color="secondary"
                          checked={values.is_admin}
                        />
                      }
                      label="Admin"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end">
                      <Button
                        type="button"
                        variant="outlined"
                        color="secondary"
                        onClick={() => history.push("/users")}
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

export default UserForm;
