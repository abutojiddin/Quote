/* global process*/
import 'dotenv/config'
import { Pool } from 'pg'

const pool = new Pool({
	connectionString: process.env.DB_URL,
	ssl: {
		rejectUnauthorized: false,
	},
})

pool.connect(() => {
	try {
		console.log('Dataga Qiylanmasdan ulandi')
	} catch (error) {
		console.log('Dataga ulanmadi Error:', error)
	}
})

export default pool