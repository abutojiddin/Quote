import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import pool from "../db/db.js"

//! TOKEN FUNKSIONS START
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.ACCESS_SECRET,
    { expiresIn: "15m" }
  )
}
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  )
}
//! TOKEN FUNKSIONS END

//* REGISTER
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body

    const userExist = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    )

    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: "User mavjud" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await pool.query(
      `INSERT INTO users (username, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, username, email`,
      [username, email, hashedPassword]
    )

    res.status(201).json(newUser.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

//* LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    )

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User topilmadi" })
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    )

    if (!validPassword) {
      return res.status(400).json({ message: "Parol noto'g'ri" })
    }

    const accessToken = generateAccessToken(user.rows[0])
    const refreshToken = generateRefreshToken(user.rows[0])

    // DB ga yozamiz
    await pool.query(
      `INSERT INTO refresh_tokens (token, user_id, expires_at)
       VALUES ($1, $2, NOW() + interval '7 days')`,
      [refreshToken, user.rows[0].id]
    )

    res.status(200).json({
      accessToken,
      refreshToken
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

//* REFRESH TOKEN API
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({ message: "Token yo'q" })
    }

    const tokenInDb = await pool.query(
      `SELECT * FROM refresh_tokens WHERE token = $1`,
      [refreshToken]
    )

    if (tokenInDb.rows.length === 0) {
      return res.status(403).json({ message: "Token noto'g'ri" })
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET
    )

    const newAccessToken = generateAccessToken(decoded)

    res.status(200).json({ accessToken: newAccessToken })
  } catch (err) {
    res.status(403).json({ message: "Token invalid" })
  }
}

//* LOGOUT
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body

    await pool.query(
      `DELETE FROM refresh_tokens WHERE token = $1`,
      [refreshToken]
    )

    res.status(200).json({ message: "Logged out" })
  } catch (err) {
    res.status(500).json({ message: 'ERROR', error: err.message })
  }
}