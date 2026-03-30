import cors from 'cors';
import 'dotenv/config'
import express from 'express';
import pool from './db/db';

const app = express()
app.use(express.json())
app.use(cors())

const PORT = process.env.PORT || 9955

app.listen(PORT, () => {
    pool
    console.log(`Server is running on http://localhost:${PORT}`);
})