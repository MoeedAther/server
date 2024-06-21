
import mysql from "mysql";

    const db=mysql.createConnection({
        host:'localhost',
        user:"root",
        password:"macbook",
        database:"coinoswap"
    
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
