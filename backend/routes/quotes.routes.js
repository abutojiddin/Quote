import express from "express"
import { verifyToken } from "../middleware/auth.middleware.js"
import {
  createQuote,
  getAllQuotes,
  getMyQuotes,
  updateQuote,
  deleteQuote
} from "../controllers/quotes.controller.js"

const router = express.Router()

router.post("/", verifyToken, createQuote)
router.get("/", getAllQuotes)
router.get("/my", verifyToken, getMyQuotes)
router.put("/:id", verifyToken, updateQuote)
router.delete("/:id", verifyToken, deleteQuote)

export default router
