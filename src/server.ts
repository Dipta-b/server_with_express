import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), ".env") });
const app = express()
const port = 5000
//parser
app.use(express.json())

//DB
const pool = new Pool({
    connectionString: `${process.env.CONNECTION_STR}`
});
//primary key diye shob ber kroe niye asha jay
const initDB = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,  
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            age INT,
            phone VARCHAR(15),
            address TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
    `);
    console.log("Users table created successfully 🚀");

    await pool.query(`
        CREATE TABLE IF NOT EXISTS todos(
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
         title VARCHAR(200) NOT NULL,
         description TEXT,
         completed BOOLEAN DEFAULT FALSE,
        due_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        ); `);
};


initDB();

//form data pete 
// app.use(express.urlencoded())
app.get('/', (req: Request, res: Response) => {
    res.send('Hello Dipta!')
})


app.post("/", (req: Request, res: Response) => {
    console.log(req.body);
    res.status(201).json({
        sucess: true,
        message: "Api is working fime"
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
