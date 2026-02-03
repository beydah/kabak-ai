import express from 'express';
import dotenv from 'dotenv';
import path from 'path';

// Strict naming: server_entry.ts

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Example strict naming route handler
app.get('/api/health', (p_req, p_res) => {
    p_res.json({ status: 'ok', message: 'Server is running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
