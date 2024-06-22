
import mysql from "mysql";
import dotenv from 'dotenv';

dotenv.config(process.env.HOST, );

console.log(process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_DATABASE)
    const db=mysql.createConnection({
        // host:`${process.env.HOST}`,
        // user:`${process.env.USER}`,
        // password:`${process.env.PASSWORD}`, 
        // database:`${process.env.DATABASE}`

        // host:`${process.env.HOST}`,
        // user:`${process.env.USER}`,
        // password:`${process.env.PASSWORD}`, 
        // database:`${process.env.DATABASE}`

        host:process.env.DB_HOST,
        user:process.env.DB_USER,
        password:process.env.DB_PASSWORD, 
        database:process.env.DB_DATABASE
    
    })

    const connectDB=()=>{
        db.connect((error)=>{
            if(error){
                console.log(error);
            }else{
                console.log("Database connection successful");
            }
        })
    }


// module.exports=connect, connectDB;
export {db,connectDB};
