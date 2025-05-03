// routes/questions.js
const express = require("express");
const router = express.Router();
const { pool } = require("../db");

// Get all questions
router.get("/", async (req, res) => {
  try {
    const { category_id, difficulty } = req.query;

    let query = `
	  SELECT q.*, 
			 c.category, c.subcategory, c.universe,
			 (SELECT json_agg(json_build_object('id', a.id, 'answer_text', a.answer_text, 'is_correct', a.is_correct))
			  FROM trivia_answers a
			  WHERE a.question_id = q.id) as answers
	  FROM trivia_questions q
	  JOIN trivia_categories c ON q.category_id = c.id
	`;

    const queryParams = [];
    const conditions = [];

    if (category_id) {
      conditions.push(`q.category_id = $${queryParams.length + 1}`);
      queryParams.push(category_id);
    }

    if (difficulty) {
      conditions.push(`q.difficulty = $${queryParams.length + 1}`);
      queryParams.push(difficulty);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY q.id DESC";

    const questions = await pool.query(query, queryParams);

    res.json(questions.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get a single question with its answers
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const question = await pool.query(
      `
	  SELECT q.*, 
			 c.category, c.subcategory, c.universe,
			 (SELECT json_agg(json_build_object('id', a.id, 'answer_text', a.answer_text, 'is_correct', a.is_correct))
			  FROM trivia_answers a
			  WHERE a.question_id = q.id) as answers
	  FROM trivia_questions q
	  JOIN trivia_categories c ON q.category_id = c.id
	  WHERE q.id = $1
	`,
      [id]
    );

    if (question.rows.length === 0) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.json(question.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new question with answers
router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { category_id, difficulty, question, answers } = req.body;
    const userId = req.user.id;

    // Validate answers (must have exactly 4 answers with exactly 1 correct)
    if (!answers || answers.length !== 4) {
      return res
        .status(400)
        .json({ error: "Question must have exactly 4 answers" });
    }

    if (answers.filter((a) => a.is_correct).length !== 1) {
      return res
        .status(400)
        .json({ error: "Question must have exactly 1 correct answer" });
    }

    // Insert question
    const newQuestion = await client.query(
      "INSERT INTO trivia_questions (category_id, difficulty, question, created_by) VALUES ($1, $2, $3, $4) RETURNING *",
      [category_id, difficulty, question, userId]
    );

    const questionId = newQuestion.rows[0].id;

    // Insert answers
    for (const answer of answers) {
      await client.query(
        "INSERT INTO trivia_answers (question_id, answer_text, is_correct, created_by) VALUES ($1, $2, $3, $4)",
        [questionId, answer.answer_text, answer.is_correct, userId]
      );
    }

    await client.query("COMMIT");

    // Fetch the complete question with answers to return
    const completeQuestion = await client.query(
      `
	  SELECT q.*, 
			 (SELECT json_agg(json_build_object('id', a.id, 'answer_text', a.answer_text, 'is_correct', a.is_correct))
			  FROM trivia_answers a
			  WHERE a.question_id = q.id) as answers
	  FROM trivia_questions q
	  WHERE q.id = $1
	`,
      [questionId]
    );

    res.status(201).json(completeQuestion.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

// Update a question with its answers
router.put("/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const { category_id, difficulty, question, answers } = req.body;
    const userId = req.user.id;

    // Validate answers (must have exactly 4 answers with exactly 1 correct)
    if (!answers || answers.length !== 4) {
      return res
        .status(400)
        .json({ error: "Question must have exactly 4 answers" });
    }

    if (answers.filter((a) => a.is_correct).length !== 1) {
      return res
        .status(400)
        .json({ error: "Question must have exactly 1 correct answer" });
    }

    // Update question
    const updatedQuestion = await client.query(
      "UPDATE trivia_questions SET category_id = $1, difficulty = $2, question = $3, updated_by = $4 WHERE id = $5 RETURNING *",
      [category_id, difficulty, question, userId, id]
    );

    if (updatedQuestion.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Question not found" });
    }

    // Delete existing answers
    await client.query("DELETE FROM trivia_answers WHERE question_id = $1", [
      id,
    ]);

    // Insert new answers
    for (const answer of answers) {
      await client.query(
        "INSERT INTO trivia_answers (question_id, answer_text, is_correct, created_by) VALUES ($1, $2, $3, $4)",
        [id, answer.answer_text, answer.is_correct, userId]
      );
    }

    await client.query("COMMIT");

    // Fetch the complete question with answers to return
    const completeQuestion = await client.query(
      `
	  SELECT q.*, 
			 (SELECT json_agg(json_build_object('id', a.id, 'answer_text', a.answer_text, 'is_correct', a.is_correct))
			  FROM trivia_answers a
			  WHERE a.question_id = q.id) as answers
	  FROM trivia_questions q
	  WHERE q.id = $1
	`,
      [id]
    );

    res.json(completeQuestion.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

// Delete a question
router.delete("/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { id } = req.params;

    // Check if question is part of any sets
    const sets = await client.query(
      "SELECT COUNT(*) FROM trivia_set_questions WHERE question_id = $1",
      [id]
    );

    if (parseInt(sets.rows[0].count) > 0) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "Cannot delete question that is part of a set" });
    }

    // Delete answers first
    await client.query("DELETE FROM trivia_answers WHERE question_id = $1", [
      id,
    ]);

    // Delete question
    const deletedQuestion = await client.query(
      "DELETE FROM trivia_questions WHERE id = $1 RETURNING *",
      [id]
    );

    if (deletedQuestion.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Question not found" });
    }

    await client.query("COMMIT");

    res.json({ message: "Question deleted successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});

module.exports = router;
