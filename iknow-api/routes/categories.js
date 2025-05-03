const express = require("express");
const router = express.Router();
const { pool } = require("../db");

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await pool.query(`
	  SELECT c.*, 
			 COUNT(DISTINCT q.id) as question_count,
			 COUNT(DISTINCT s.id) as set_count
	  FROM trivia_categories c
	  LEFT JOIN trivia_questions q ON q.category_id = c.id
	  LEFT JOIN trivia_sets s ON s.category_id = c.id
	  GROUP BY c.id
	  ORDER BY c.category, c.subcategory
	`);

    res.json(categories.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get a single category
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const category = await pool.query(
      "SELECT * FROM trivia_categories WHERE id = $1",
      [id]
    );

    if (category.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(category.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new category
router.post("/", async (req, res) => {
  try {
    const { category, subcategory, universe, ip_owner } = req.body;
    const userId = req.user.id;

    const newCategory = await pool.query(
      "INSERT INTO trivia_categories (category, subcategory, universe, ip_owner, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [category, subcategory, universe, ip_owner, userId]
    );

    res.status(201).json(newCategory.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update a category
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { category, subcategory, universe, ip_owner } = req.body;
    const userId = req.user.id;

    const updatedCategory = await pool.query(
      "UPDATE trivia_categories SET category = $1, subcategory = $2, universe = $3, ip_owner = $4, updated_by = $5 WHERE id = $6 RETURNING *",
      [category, subcategory, universe, ip_owner, userId, id]
    );

    if (updatedCategory.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(updatedCategory.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a category
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if there are any questions using this category
    const questions = await pool.query(
      "SELECT COUNT(*) FROM trivia_questions WHERE category_id = $1",
      [id]
    );

    if (parseInt(questions.rows[0].count) > 0) {
      return res
        .status(400)
        .json({ error: "Cannot delete category with existing questions" });
    }

    const deletedCategory = await pool.query(
      "DELETE FROM trivia_categories WHERE id = $1 RETURNING *",
      [id]
    );

    if (deletedCategory.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
