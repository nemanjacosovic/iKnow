import React, { useState, useEffect } from "react";
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
  Divider,
} from "@mui/material";
import Layout from "../layout/Layout";
import api from "../../utils/api";

const ProfileSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  currentPassword: Yup.string().when("newPassword", {
    is: (val) => val && val.length > 0,
    then: Yup.string().required(
      "Current password is required to set a new password"
    ),
  }),
  newPassword: Yup.string(),
  confirmPassword: Yup.string().when("newPassword", {
    is: (val) => val && val.length > 0,
    then: Yup.string()
      .oneOf([Yup.ref("newPassword")], "Passwords must match")
      .required("Password confirmation is required"),
  }),
});

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/profile");
      setProfile(res.data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching profile");
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        username: values.username,
        email: values.email,
      };

      if (values.newPassword) {
        payload.currentPassword = values.currentPassword;
        payload.newPassword = values.newPassword;
      }

      await api.put("/users/profile", payload);
      setSuccess("Profile updated successfully");

      // Update stored user info
      const user = JSON.parse(localStorage.getItem("user"));
      user.username = values.username;
      user.email = values.email;
      localStorage.setItem("user", JSON.stringify(user));

      setSubmitting(false);
    } catch (err) {
      setError(err.response?.data?.error || "Error updating profile");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout title="My Profile">
        <CircularProgress />
      </Layout>
    );
  }

  const initialValues = {
    username: profile?.username || "",
    email: profile?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  return (
    <Layout title="My Profile">
      <Paper>
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            My Profile
          </Typography>

          <Formik
            initialValues={initialValues}
            validationSchema={ProfileSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ errors, touched, isSubmitting }) => (
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
                    <Divider />
                    <Box mt={2} mb={2}>
                      <Typography variant="subtitle1">
                        Change Password
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="currentPassword"
                      label="Current Password"
                      type="password"
                      variant="outlined"
                      error={
                        touched.currentPassword &&
                        Boolean(errors.currentPassword)
                      }
                      helperText={
                        touched.currentPassword && errors.currentPassword
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="newPassword"
                      label="New Password"
                      type="password"
                      variant="outlined"
                      error={touched.newPassword && Boolean(errors.newPassword)}
                      helperText={touched.newPassword && errors.newPassword}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="confirmPassword"
                      label="Confirm New Password"
                      type="password"
                      variant="outlined"
                      error={
                        touched.confirmPassword &&
                        Boolean(errors.confirmPassword)
                      }
                      helperText={
                        touched.confirmPassword && errors.confirmPassword
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end">
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <CircularProgress size={24} />
                        ) : (
                          "Update Profile"
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

export default Profile;
