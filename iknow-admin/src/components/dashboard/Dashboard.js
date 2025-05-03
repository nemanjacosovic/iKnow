// src/components/dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Paper,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Snackbar,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import {
  Category as CategoryIcon,
  QuestionAnswer as QuestionIcon,
  LibraryBooks as SetIcon,
  People as PeopleIcon,
} from '@material-ui/icons';
import Layout from '../layout/Layout';
import api from '../../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
	categories: 0,
	questions: 0,
	sets: 0,
	users: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user && user.is_admin;

  useEffect(() => {
	fetchStats();
  }, []);

  const fetchStats = async () => {
	try {
	  setLoading(true);
	  
	  // Get Categories count
	  const categoriesRes = await api.get('/categories');
	  
	  // Get Questions count
	  const questionsRes = await api.get('/questions');
	  
	  // Get Sets count
	  const setsRes = await api.get('/sets');
	  
	  // Get Users count (admin only)
	  let usersCount = 0;
	  if (isAdmin) {
		const usersRes = await api.get('/users');
		usersCount = usersRes.data.length;
	  }
	  
	  setStats({
		categories: categoriesRes.data.length,
		questions: questionsRes.data.length,
		sets: setsRes.data.length,
		users: usersCount,
	  });
	  
	  setLoading(false);
	} catch (err) {
	  setError('Error fetching dashboard data');
	  setLoading(false);
	}
  };

  if (loading) {
	return (
	  <Layout title="Dashboard">
		<CircularProgress />
	  </Layout>
	);
  }

  return (
	<Layout title="Dashboard">
	  <Box mb={4}>
		<Typography variant="h5">Welcome, {user.username}!</Typography>
		<Typography variant="body1">
		  Manage your trivia game categories, questions, and sets.
		</Typography>
	  </Box>

	  <Grid container spacing={3}>
		<Grid item xs={12} sm={6} md={3}>
		  <Card>
			<CardContent>
			  <Box display="flex" alignItems="center" mb={2}>
				<CategoryIcon fontSize="large" color="primary" />
				<Box ml={2}>
				  <Typography variant="h4">{stats.categories}</Typography>
				</Box>
			  </Box>
			  <Typography variant="h6" gutterBottom>
				Categories
			  </Typography>
			  <Typography variant="body2" color="textSecondary">
				Organize your questions by category, subcategory, universe, and IP owner.
			  </Typography>
			</CardContent>
			<CardActions>
			  <Button
				size="small"
				color="primary"
				component={Link}
				to="/categories"
			  >
				View Categories
			  </Button>
			</CardActions>
		  </Card>
		</Grid>

		<Grid item xs={12} sm={6} md={3}>
		  <Card>
			<CardContent>
			  <Box display="flex" alignItems="center" mb={2}>
				<QuestionIcon fontSize="large" color="secondary" />
				<Box ml={2}>
				  <Typography variant="h4">{stats.questions}</Typography>
				</Box>
			  </Box>
			  <Typography variant="h6" gutterBottom>
				Questions
			  </Typography>
			  <Typography variant="body2" color="textSecondary">
				Create multiple-choice questions with varying difficulty levels.
			  </Typography>
			</CardContent>
			<CardActions>
			  <Button
				size="small"
				color="secondary"
				component={Link}
				to="/questions"
			  >
				View Questions
			  </Button>
			</CardActions>
		  </Card>
		</Grid>

		<Grid item xs={12} sm={6} md={3}>
		  <Card>
			<CardContent>
			  <Box display="flex" alignItems="center" mb={2}>
				<SetIcon fontSize="large" style={{ color: '#4caf50' }} />
				<Box ml={2}>
				  <Typography variant="h4">{stats.sets}</Typography>
				</Box>
			  </Box>
			  <Typography variant="h6" gutterBottom>
				Question Sets
			  </Typography>
			  <Typography variant="body2" color="textSecondary">
				Organize questions into playable sets for your trivia game.
			  </Typography>
			</CardContent>
			<CardActions>
			  <Button
				size="small"
				style={{ color: '#4caf50' }}
				component={Link}
				to="/sets"
			  >
				View Sets
			  </Button>
			</CardActions>
		  </Card>
		</Grid>

		{isAdmin && (
		  <Grid item xs={12} sm={6} md={3}>
			<Card>
 <Card>
						  <CardContent>
							<Box display="flex" alignItems="center" mb={2}>
							  <PeopleIcon fontSize="large" style={{ color: '#ff9800' }} />
							  <Box ml={2}>
								<Typography variant="h4">{stats.users}</Typography>
							  </Box>
							</Box>
							<Typography variant="h6" gutterBottom>
							  Users
							</Typography>
							<Typography variant="body2" color="textSecondary">
							  Manage admin and regular users of the trivia system.
							</Typography>
						  </CardContent>
						  <CardActions>
							<Button
							  size="small"
							  style={{ color: '#ff9800' }}
							  component={Link}
							  to="/users"
							>
							  View Users
							</Button>
						  </CardActions>
						</Card>
					  </Grid>
					)}
				  </Grid>
			
				  <Box mt={4}>
					<Paper>
					  <Box p={3}>
						<Typography variant="h6" gutterBottom>
						  Quick Actions
						</Typography>
						<Grid container spacing={2}>
						  <Grid item>
							<Button
							  variant="contained"
							  color="primary"
							  component={Link}
							  to="/categories/new"
							  startIcon={<CategoryIcon />}
							>
							  New Category
							</Button>
						  </Grid>
						  <Grid item>
							<Button
							  variant="contained"
							  color="secondary"
							  component={Link}
							  to="/questions/new"
							  startIcon={<QuestionIcon />}
							>
							  New Question
							</Button>
						  </Grid>
						  <Grid item>
							<Button
							  variant="contained"
							  style={{ backgroundColor: '#4caf50', color: 'white' }}
							  component={Link}
							  to="/sets/new"
							  startIcon={<SetIcon />}
							>
							  New Question Set
							</Button>
						  </Grid>
						  {isAdmin && (
							<Grid item>
							  <Button
								variant="contained"
								style={{ backgroundColor: '#ff9800', color: 'white' }}
								component={Link}
								to="/users/new"
								startIcon={<PeopleIcon />}
							  >
								New User
							  </Button>
							</Grid>
						  )}
						</Grid>
					  </Box>
					</Paper>
				  </Box>
			
				  <Snackbar
					open={!!error}
					autoHideDuration={6000}
					onClose={() => setError('')}
				  >
					<Alert onClose={() => setError('')} severity="error">
					  {error}
					</Alert>
				  </Snackbar>
				</Layout>
			  );
			};
			
			export default Dashboard;