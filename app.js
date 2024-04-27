import express from 'express';
import router from './routes/web.js';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express()
const port = process.env.PORT;

//JSON
app.use(express.json()) 

//Cors
app.use(cors())

//Loading Routes
app.use('/api', router)

app.listen(port, () => {
    console.log(`Server listening at https://localhost:${port}`)
})