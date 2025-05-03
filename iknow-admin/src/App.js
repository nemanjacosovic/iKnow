import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createMuiTheme, CssBaseline } from "@material-ui/core";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/dashboard/Dashboard";
import Categories from "./components/categories/Categories";
import CategoryForm from "./components/categories/CategoryForm";
import Questions from "./components/questions/Questions";
import QuestionForm from "./components/questions/QuestionForm";
import Sets from "./components/sets/Sets";
import SetForm from "./components/sets/SetForm";
import Users from "./components/users/Users";
import UserForm from "./components/users/UserForm";
import Profile from "./components/profile/Profile";
import PrivateRoute from "./components/routing/PrivateRoute";
import "./App.css";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#f50057",
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/categories" element={
            <PrivateRoute>
              <Categories />
            </PrivateRoute>
          } />
          <Route path="/categories/new" element={
            <PrivateRoute>
              <CategoryForm />
            </PrivateRoute>
          } />
          <Route path="/categories/edit/:id" element={
            <PrivateRoute>
              <CategoryForm />
            </PrivateRoute>
          } />
          <Route path="/questions" element={
            <PrivateRoute>
              <Questions />
            </PrivateRoute>
          } />
          <Route path="/questions/new" element={
            <PrivateRoute>
              <QuestionForm />
            </PrivateRoute>
          } />
          <Route path="/questions/edit/:id" element={
            <PrivateRoute>
              <QuestionForm />
            </PrivateRoute>
          } />
          <Route path="/sets" element={
            <PrivateRoute>
              <Sets />
            </PrivateRoute>
          } />
          <Route path="/sets/new" element={
            <PrivateRoute>
              <SetForm />
            </PrivateRoute>
          } />
          <Route path="/sets/edit/:id" element={
            <PrivateRoute>
              <SetForm />
            </PrivateRoute>
          } />
          <Route path="/users" element={
            <PrivateRoute>
              <Users />
            </PrivateRoute>
          } />
          <Route path="/users/new" element={
            <PrivateRoute>
              <UserForm />
            </PrivateRoute>
          } />
          <Route path="/users/edit/:id" element={
            <PrivateRoute>
              <UserForm />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      </Router>
    </ThemeProvider>
  );
}

export default App;
