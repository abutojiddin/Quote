import pool from "../db/db.js"

//* CREATE QUOTE
export const createQuote = async (req, res) => {
  try {
    const { text } = req.body
    const userId = req.user.id

    if (!text) {
      return res.status(400).json({ message: "Matn talab qilinadi" })
    }

    const newQuote = await pool.query(
      `INSERT INTO quotes (text, user_id)
       VALUES ($1, $2)
       RETURNING *`,
      [text, userId]
    )

    res.status(201).json(newQuote.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

//* GET ALL QUOTES
export const getAllQuotes = async (req, res) => {
  try {
    const quotes = await pool.query(
      `SELECT q.id, q.text, q.created_at, u.username, u.id as user_id
       FROM quotes q
       JOIN users u ON q.user_id = u.id
       ORDER BY q.created_at DESC`
    )

    res.status(200).json(quotes.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

//* GET USER'S QUOTES
export const getMyQuotes = async (req, res) => {
  try {
    const userId = req.user.id

    const quotes = await pool.query(
      `SELECT * FROM quotes
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    )

    res.status(200).json(quotes.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

//* UPDATE QUOTE
export const updateQuote = async (req, res) => {
  try {
    const { id } = req.params
    const { text } = req.body
    const userId = req.user.id

    const quote = await pool.query(
      `SELECT * FROM quotes WHERE id = $1`,
      [id]
    )

    if (quote.rows.length === 0) {
      return res.status(404).json({ message: "Quote topilmadi" })
    }

    if (quote.rows[0].user_id !== userId) {
      return res.status(403).json({ message: "Faqat o'z quote'ni o'zgartirishingiz mumkin" })
    }

    const updatedQuote = await pool.query(
      `UPDATE quotes
       SET text = $1
       WHERE id = $2
       RETURNING *`,
      [text, id]
    )

    res.status(200).json(updatedQuote.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

//* DELETE QUOTE
export const deleteQuote = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const quote = await pool.query(
      `SELECT * FROM quotes WHERE id = $1`,
      [id]
    )

    if (quote.rows.length === 0) {
      return res.status(404).json({ message: "Quote topilmadi" })
    }

    if (quote.rows[0].user_id !== userId) {
      return res.status(403).json({ message: "Faqat o'z quote'ni o'chirishingiz mumkin" })
    }

    await pool.query(
      `DELETE FROM quotes WHERE id = $1`,
      [id]
    )

    res.status(200).json({ message: "Quote o'chirildi" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
