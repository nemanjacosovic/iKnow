import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
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
        <Switch>
          <Route exact path="/" component={Login} />
          <Route exact path="/register" component={Register} />
          <PrivateRoute exact path="/dashboard" component={Dashboard} />
          <PrivateRoute exact path="/categories" component={Categories} />
          <PrivateRoute exact path="/categories/new" component={CategoryForm} />
          <PrivateRoute
            exact
            path="/categories/edit/:id"
            component={CategoryForm}
          />
          <PrivateRoute exact path="/questions" component={Questions} />
          <PrivateRoute exact path="/questions/new" component={QuestionForm} />
          <PrivateRoute
            exact
            path="/questions/edit/:id"
            component={QuestionForm}
          />
          <PrivateRoute exact path="/sets" component={Sets} />
          <PrivateRoute exact path="/sets/new" component={SetForm} />
          <PrivateRoute exact path="/sets/edit/:id" component={SetForm} />
          <PrivateRoute exact path="/users" component={Users} />
          <PrivateRoute exact path="/users/new" component={UserForm} />
          <PrivateRoute exact path="/users/edit/:id" component={UserForm} />
          <PrivateRoute exact path="/profile" component={Profile} />
          <Redirect to="/" />
        </Switch>
      </Router>
    </ThemeProvider>
  );
}

export default App;
