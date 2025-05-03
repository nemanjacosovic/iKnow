const express = require("express");
const router = express.Router();
const { pool } = require("../db");

// Get all sets
router.get("/", async (req, res) => {
  try {
    const { category_id } = req.query;

    let query = `
	  SELECT s.*, 
			 c.category, c.subcategory, c.universe,
			 COUNT(sq.question_id) as question_count
	  FROM trivia_sets s
	  JOIN trivia_categories c ON s.category_id = c.id
	  LEFT JOIN trivia_set_questions sq ON sq.set_id = s.id
	`;

    const queryParams = [];

    if (category_id) {
      query += ` WHERE s.category_id = $1`;
      queryParams.push(category_id);
    }

    query += ` GROUP BY s.id, c.category, c.subcategory, c.universe
			   ORDER BY s.id DESC`;

    const sets = await pool.query(query, queryParams);

    res.json(sets.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get a single set with its questions
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const set = await pool.query(
      `
	  SELECT s.*, 
			 c.category, c.subcategory, c.universe
	  FROM trivia_sets s
	  JOIN trivia_categories c ON s.category_id = c.id
	  WHERE s.id = $1
	`,
      [id]
    );

    if (set.rows.length === 0) {
      return res.status(404).json({ error: "Set not found" });
    }

    const questions = await pool.query(
      `
	  SELECT q.*, sq.question_order,
			 (SELECT json_agg(json_build_object('id', a.id, 'answer_text', a.answer_text, 'is_correct', a.is_correct))
			  FROM trivia_answers a
			  WHERE a.question_id = q.id) as answers
	  FROM trivia_set_questions sq
	  JOIN trivia_questions q ON sq.question_id = q.id
	  WHERE sq.set_id = $1
	  ORDER BY sq.question_order
	`,
      [id]
    );

    const result = {
      ...set.rows[0],
      questions: questions.rows,
    };

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new set
router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { name, category_id, question_ids } = req.body;
    const userId = req.user.id;

    // Create set
    const newSet = await client.query(
      "INSERT INTO trivia_sets (name, category_id, created_by) VALUES ($1, $2, $3) RETURNING *",
      [name, category_id, userId]
    );

    const setId = newSet.rows[0].id;

    // Add questions to set
    if (question_ids && question_ids.length > 0) {
      for (let i = 0; i < question_ids.length; i++) {
        await client.query(
          "INSERT INTO trivia_set_questions (set_id, question_id, question_order) VALUES ($1, $2, $3)",
          [setId, question_ids[i], i + 1]
        );
      }
    }

    await client.query("COMMIT");

    // Fetch the complete set to return
    const completeSet = await pool.query(
      `
	  SELECT s.*, 
			 c.category, c.subcategory, c.universe,
			 COUNT(sq.question_id) as question_count
	  FROM trivia_sets s
	  JOIN trivia_categories c ON s.category_id = c.id
	  LEFT JOIN trivia_set_questions sq ON sq.set_id = s.id
	  WHERE s.id = $1
	  GROUP BY s.id, c.category, c.subcategory, c.universe
	`,
      [setId]
    );

    res.status(201).json(completeSet.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

// Update a set
router.put("/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const { name, category_id, question_ids } = req.body;
    const userId = req.user.id;

    // Update set
    const updatedSet = await client.query(
      "UPDATE trivia_sets SET name = $1, category_id = $2, updated_by = $3 WHERE id = $4 RETURNING *",
      [name, category_id, userId, id]
    );

    if (updatedSet.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Set not found" });
    }

    // Delete existing questions from set
    await client.query("DELETE FROM trivia_set_questions WHERE set_id = $1", [
      id,
    ]);

    // Add new questions to set
    if (question_ids && question_ids.length > 0) {
      for (let i = 0; i < question_ids.length; i++) {
        await client.query(
          "INSERT INTO trivia_set_questions (set_id, question_id, question_order) VALUES ($1, $2, $3)",
          [id, question_ids[i], i + 1]
        );
      }
    }

    await client.query("COMMIT");

    // Fetch the complete set to return
    const completeSet = await pool.query(
      `
	  SELECT s.*, 
			 c.category, c.subcategory, c.universe,
			 COUNT(sq.question_id) as question_count
	  FROM trivia_sets s
	  JOIN trivia_categories c ON s.category_id = c.id
	  LEFT JOIN trivia_set_questions sq ON sq.set_id = s.id
	  WHERE s.id = $1
	  GROUP BY s.id, c.category, c.subcategory, c.universe
	`,
      [id]
    );

    res.json(completeSet.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

// Delete a set
router.delete("/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { id } = req.params;

    // Delete questions from set
    await client.query("DELETE FROM trivia_set_questions WHERE set_id = $1", [
      id,
    ]);

    // Delete set
    const deletedSet = await client.query(
      "DELETE FROM trivia_sets WHERE id = $1 RETURNING *",
      [id]
    );

    if (deletedSet.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Set not found" });
    }

    await client.query("COMMIT");

    res.json({ message: "Set deleted successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

module.exports = router;
