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

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().required("Required"),
});

const Login = () => {
  const [error, setError] = useState("");
  const history = useHistory();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const res = await api.post("/auth/login", values);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      history.push("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <Container maxWidth="sm">
      <Box mt={8}>
        <Paper elevation={3}>
          <Box p={4}>
            <Typography variant="h4" align="center" gutterBottom>
              Trivia Admin Login
            </Typography>
            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={LoginSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form>
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

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <CircularProgress size={24} /> : "Login"}
                  </Button>

                  <Box mt={2}>
                    <Grid container justifyContent="flex-end">
                      <Grid item>
                        <Link to="/register" style={{ textDecoration: "none" }}>
                          <Typography variant="body2" color="primary">
                            Don't have an account? Register
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

export default Login;
