import express, { Request, Response } from 'express';
import { Pool } from 'pg';
const app = express()
const port = 5000
//parser
app.use(express.json())

const pool = new Pool({
    connectionString: `postgresql://neondb_owner:npg_rkW69ETmibYh@ep-still-truth-ah82ery0-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
});

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
