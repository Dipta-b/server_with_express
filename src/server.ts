import express, { NextFunction, Request, Response } from 'express';
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

//logger middlware
const logger = (req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
    next();


}


//form data pete 
// app.use(express.urlencoded())
app.get('/', logger, (req: Request, res: Response) => {
    res.send('Hello Dipta!')
})

//*users route
app.post("/users", async (req: Request, res: Response) => {
    const { name, email } = req.body;

    try {

        const result = await pool.query(`
    INSERT INTO users(name,email) VALUES($1,$2) RETURNING *
    `, [name, email]);
        res.status(201).json({
            success: false,
            message: "Data Inserted Successfully",
            data: result.rows[0],
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }

})
//all users
app.get("/users", async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
    SELECT * FROM users
    `);
        res.status(200).json({
            success: true,
            message: "Data fetched successfully",
            data: result.rows,
        })


    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            details: error
        })
    }
})

//*single user
app.get("/users/:id", async (req: Request, res: Response) => {

    const { id } = req.params;
    try {
        const result = await pool.query(`
    SELECT * FROM users WHERE id=$1
    `, [id]);

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "User not found"
            })
        } else {
            res.status(200).json({
                success: true,
                message: "User ffetched successfully",
                data: result.rows[0]
            })
        }

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            details: error
        })
    }
});

//*update user
app.put("/users/:id", async (req: Request, res: Response) => {
    const { name, email } = req.body;
    const { id } = req.params;
    try {
        const result = await pool.query(`UPDATE users SET name=$1, email=$2 WHERE id=$3 RETURNING*`, [name, email, id]);

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "User not found"
            })
        } else {
            res.status(200).json({
                success: true,
                message: "User updated successfully",
                data: result.rows[0]
            })
        }

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            details: error
        })
    }
});

//*delete user
app.delete("/users/:id", async (req: Request, res: Response) => {

    const { id } = req.params;
    try {
        const result = await pool.query(`
    DELETE FROM users WHERE id=$1
    `, [id]);

        if (result.rowCount === 0) {
            res.status(404).json({
                success: false,
                message: "User not found"
            })
        } else {
            res.status(200).json({
                success: true,
                message: "User deleted successfully",
                data: null
            })
        }

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            details: error
        })
    }
});

//?Todos Crud started

//*create todo
app.post("/todos", async (req: Request, res: Response) => {
    const { user_id, title } = req.body;
    try {
        const result = await pool.query(` INSERT INTO todos(user_id, title) VALUES($1,$2) RETURNING*`, [user_id, title]);
        res.status(201).json({
            success: true,
            message: "Todo created successfully",
            data: result.rows[0]
        })



    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            details: error
        })
    }

})

//*get all todos
app.get("/todos", async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
    SELECT * FROM todos
    `);
        res.status(200).json({
            success: true,
            message: "todos fetched successfully",
            data: result.rows,
        })


    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            details: error
        })
    }
})



//!Not Found route
app.use((req, res) => {
    res.status(400).json({
        success: false,
        message: "Route not found",
        path: req.path,
    })
})
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
