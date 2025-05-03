// routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { pool } = require('../db');

// Get all users (admin only)
router.get('/', async (req, res) => {
  try {
	// Check if requesting user is admin
	const admin = await pool.query(
	  'SELECT is_admin FROM users WHERE id = $1',
	  [req.user.id]
	);
	
	if (!admin.rows[0].is_admin) {
	  return res.status(403).json({ error: 'Unauthorized' });
	}
	
	const users = await pool.query(
	  'SELECT id, username, email, is_active, is_admin, created_at, last_login FROM users ORDER BY username'
	);
	
	res.json(users.rows);
  } catch (err) {
	console.error(err);
	res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
	const user = await pool.query(
	  'SELECT id, username, email, is_active, is_admin, created_at, last_login FROM users WHERE id = $1',
	  [req.user.id]
	);
	
	if (user.rows.length === 0) {
	  return res.status(404).json({ error: 'User not found' });
	}
	
	res.json(user.rows[0]);
  } catch (err) {
	console.error(err);
	res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
	const { username, email, currentPassword, newPassword } = req.body;
	
	// Check if user exists
	const user = await pool.query(
	  'SELECT password_hash FROM users WHERE id = $1',
	  [req.user.id]
	);
	
	if (user.rows.length === 0) {
	  return res.status(404).json({ error: 'User not found' });
	}
	
	// If changing password, verify current password
	if (newPassword) {
	  if (!currentPassword) {
		return res.status(400).json({ error: 'Current password is required' });
	  }
	  
	  const validPassword = await bcrypt.compare(currentPassword, user.rows[0].password_hash);
	  if (!validPassword) {
		return res.status(400).json({ error: 'Current password is incorrect' });
	  }
	  
	  // Hash new password
	  const salt = await bcrypt.genSalt(10);
	  const hashedPassword = await bcrypt.hash(newPassword, salt);
	  
	  // Update user with new password
	  await pool.query(
		'UPDATE users SET username = $1, email = $2, password_hash = $3 WHERE id = $4',
		[username, email, hashedPassword, req.user.id]
	  );
	} else {
	  // Update user without changing password
	  await pool.query(
		'UPDATE users SET username = $1, email = $2 WHERE id = $3',
		[username, email, req.user.id]
	  );
	}
	
	// Get updated user
	const updatedUser = await pool.query(
	  'SELECT id, username, email, is_active, is_admin, created_at, last_login FROM users WHERE id = $1',
	  [req.user.id]
	);
	
	res.json(updatedUser.rows[0]);
  } catch (err) {
	console.error(err);
	res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Create a new user
router.post('/', async (req, res) => {
  try {
	// Check if requesting user is admin
	const admin = await pool.query(
	  'SELECT is_admin FROM users WHERE id = $1',
	  [req.user.id]
	);
	
	if (!admin.rows[0].is_admin) {
	  return res.status(403).json({ error: 'Unauthorized' });
	}
	
	const { username, email, password, is_admin } = req.body;
	
	// Check if user already exists
	const existingUser = await pool.query(
	  'SELECT * FROM users WHERE email = $1 OR username = $2',
	  [email, username]
	);
	
	if (existingUser.rows.length > 0) {
	  return res.status(400).json({ error: 'User already exists'
	  // routes/users.js (continued)
			return res.status(400).json({ error: 'User already exists' });
		  }
		  
		  // Hash password
		  const salt = await bcrypt.genSalt(10);
		  const hashedPassword = await bcrypt.hash(password, salt);
		  
		  // Create new user
		  const newUser = await pool.query(
			'INSERT INTO users (username, email, password_hash, is_admin) VALUES ($1, $2, $3, $4) RETURNING id, username, email, is_active, is_admin, created_at',
			[username, email, hashedPassword, is_admin || false]
		  );
		  
		  res.status(201).json(newUser.rows[0]);
		} catch (err) {
		  console.error(err);
		  res.status(500).json({ error: 'Server error' });
		}
	  });
	  
	  // Admin: Update a user
	  router.put('/:id', async (req, res) => {
		try {
		  // Check if requesting user is admin
		  const admin = await pool.query(
			'SELECT is_admin FROM users WHERE id = $1',
			[req.user.id]
		  );
		  
		  if (!admin.rows[0].is_admin) {
			return res.status(403).json({ error: 'Unauthorized' });
		  }
		  
		  const { id } = req.params;
		  const { username, email, password, is_active, is_admin } = req.body;
		  
		  let query, params;
		  
		  if (password) {
			// Hash new password
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);
			
			query = 'UPDATE users SET username = $1, email = $2, password_hash = $3, is_active = $4, is_admin = $5 WHERE id = $6 RETURNING id, username, email, is_active, is_admin, created_at, last_login';
			params = [username, email, hashedPassword, is_active, is_admin, id];
		  } else {
			query = 'UPDATE users SET username = $1, email = $2, is_active = $3, is_admin = $4 WHERE id = $5 RETURNING id, username, email, is_active, is_admin, created_at, last_login';
			params = [username, email, is_active, is_admin, id];
		  }
		  
		  const updatedUser = await pool.query(query, params);
		  
		  if (updatedUser.rows.length === 0) {
			return res.status(404).json({ error: 'User not found' });
		  }
		  
		  res.json(updatedUser.rows[0]);
		} catch (err) {
		  console.error(err);
		  res.status(500).json({ error: 'Server error' });
		}
	  });
	  
	  // Admin: Delete a user
	  router.delete('/:id', async (req, res) => {
		try {
		  // Check if requesting user is admin
		  const admin = await pool.query(
			'SELECT is_admin FROM users WHERE id = $1',
			[req.user.id]
		  );
		  
		  if (!admin.rows[0].is_admin) {
			return res.status(403).json({ error: 'Unauthorized' });
		  }
		  
		  const { id } = req.params;
		  
		  // Prevent admin from deleting themselves
		  if (id === req.user.id.toString()) {
			return res.status(400).json({ error: 'Cannot delete your own account' });
		  }
		  
		  // Check if user has created any content
		  const content = await pool.query(`
			SELECT 
			  (SELECT COUNT(*) FROM trivia_categories WHERE created_by = $1) +
			  (SELECT COUNT(*) FROM trivia_questions WHERE created_by = $1) +
			  (SELECT COUNT(*) FROM trivia_sets WHERE created_by = $1) as content_count
		  `, [id]);
		  
		  if (parseInt(content.rows[0].content_count) > 0) {
			return res.status(400).json({ error: 'Cannot delete user who has created content' });
		  }
		  
		  const deletedUser = await pool.query(
			'DELETE FROM users WHERE id = $1 RETURNING id',
			[id]
		  );
		  
		  if (deletedUser.rows.length === 0) {
			return res.status(404).json({ error: 'User not found' });
		  }
		  
		  res.json({ message: 'User deleted successfully' });
		} catch (err) {
		  console.error(err);
		  res.status(500).json({ error: 'Server error' });
		}
	  });
	  
	  module.exports = router;