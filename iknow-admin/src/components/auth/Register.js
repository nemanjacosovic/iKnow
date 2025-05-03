import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Box,
  CircularProgress,
  Snackbar,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import api from "../../utils/api";

const RegisterSchema = Yup.object().shape({
  username: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Required"),
});

const Register = () => {
  const [error, setError] = useState("");
  const history = useHistory();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const { username, email, password } = values;
      const res = await api.post("/auth/register", {
        username,
        email,
        password,
      });

      // Save token and user data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      history.push("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.error || "Registration failed. Please try again."
      );
    }
    setSubmitting(false);
  };

  return (
    <Container maxWidth="sm">
      <Box mt={8}>
        <Paper elevation={3}>
          <Box p={4}>
            <Typography variant="h4" align="center" gutterBottom>
              Register
            </Typography>
            <Typography color="textSecondary" align="center" gutterBottom>
              Create your account to start managing trivia
            </Typography>

            <Formik
              initialValues={{
                username: "",
                email: "",
                password: "",
                confirmPassword: "",
              }}
              validationSchema={RegisterSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form>
                  <Box mb={3}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="username"
                      label="Username"
                      variant="outlined"
                      error={touched.username && Boolean(errors.username)}
                      helperText={touched.username && errors.username}
                    />
                  </Box>

                  <Box mb={3}>
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
                  </Box>

                  <Box mb={3}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      variant="outlined"
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                    />
                  </Box>

                  <Box mb={3}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="confirmPassword"
                      label="Confirm Password"
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
                  </Box>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <CircularProgress size={24} /> : "Register"}
                  </Button>

                  <Box mt={2}>
                    <Grid container justifyContent="flex-end">
                      <Grid item>
                        <Link to="/" style={{ textDecoration: "none" }}>
                          <Typography variant="body2" color="primary">
                            Already have an account? Login
                          </Typography>
                        </Link>
                      </Grid>
                    </Grid>
                  </Box>
                </Form>
              )}
            </Formik>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
      >
        <Alert onClose={() => setError("")} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Register;
