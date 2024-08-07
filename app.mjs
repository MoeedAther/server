import express from 'express';
import router from './routes/web.js';
import cors from 'cors';
import dotenv from 'dotenv';
import {connectDB,db} from './database/connectdb.js';
import session from 'express-session';
import expressMySQLSession from 'express-mysql-session';
import nodemailer from 'nodemailer';
import cron from 'node-cron';
import crypto from 'crypto';
import request from "request";
import fetch from "node-fetch";
import {createLogger, format, transports} from 'winston';
const { combine, timestamp, printf } = format;


// Define custom log format
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

// Create the logger
const logger = createLogger({
    format: combine(
        timestamp(),
        logFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'app.log' })
    ]
});


dotenv.config();
const app = express()
const port = process.env.PORT;

//Connection to Database
connectDB();

// Middleware to parse JSON bodies
app.use(express.json());


const MySQLStore = expressMySQLSession(session);

var sessionStore=new MySQLStore({
    expiration: 24 * 60 * 60 * 1000,
    clearExpired: true,
    checkExpirationInterval: 15 * 60 * 1000, // Check for expired sessions every 15 minutes
	createDatabaseTable: true,
	schema: {
		tableName: 'sessions',
		columnNames: {
			session_id: 'session_id',
			expires: 'expiration_time',
			data: 'data'
		}
	}
}, db)



app.use(session({
    name:"sessionCoinoSwap",
    secret:"kjbhidehuhiru374888ync8y84y785cy74y8cy58848yb54bb857y84",
    store:sessionStore,
    resave:false,
    saveUninitialized: false, // Only create session when something is stored
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));


//Cors
app.use(cors({ credentials: true, origin: true }));

//Loading Routes
app.use('/api', router)

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: process.env.SERVICE,
    port: process.env.SMTP_SERVER_PORT, // Port for SSL
    secure: process.env.SECURE, // Use SSL
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
  });

//Email sending success function
function sendSuccessEmail(email){
    console.log("success email function called");
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Swap Status',
        text: `Exchange was successful`
      };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
               console.log("Email sending failed");
        }
    });

}

//Email sending failed function
function sendFailedEmail(email){
    console.log("failed email function called");
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Swap Status',
        text: `Exchange was unsuccessfull`
      };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
               console.log("Email sending failed");
        }
    });

}

// *********************** Running Cron Job for updating exchange statuses in database ************************* //

db.query('SELECT * FROM cron_job WHERE type=?',["status/removal cron"], (error, result)=>{
        
    if(error){
        console.log("Cron job failed");
    }else{

        cron.schedule(`${result[0].second} ${result[0].minute} ${result[0].hour} ${result[0].date_of_month} ${result[0].month} ${result[0].day_of_week}`, ()=>{


            db.query('SELECT * FROM changelly_transactions', (error, result)=>{
                if(result.length>0){

                    function is48HoursDifference(timestamp1, timestamp2) {
                        // Calculate the difference in milliseconds
                        const differenceInMilliseconds = Math.abs(timestamp1 - timestamp2);
                      
                        // Convert the difference to hours
                        const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
                      
                        // Check if the difference is exactly 48 hours
                        return differenceInHours >= 48;
                      }
                      const currentTimestamp = Date.now(); // Current timestamp
                        result.map((swap, index)=>{
                            const isValid=is48HoursDifference(currentTimestamp, swap.time);

                            try {
                                const privateKey = crypto.createPrivateKey({
                                    key: process.env.CHANGELLY_PRIVATE_KEY,
                                    format: "der",
                                    type: "pkcs8",
                                    encoding: "hex",
                                  });
                                
                                  const publicKey = crypto.createPublicKey(privateKey).export({
                                    type: "pkcs1",
                                    format: "der",
                                  });
                                
                                  const message = {
                                    jsonrpc: "2.0",
                                    id: "test",
                                    method: "getStatus",
                                    params: {
                                    id: swap.transaction_id
                                    }
                                  };
        
                                  const signature = crypto.sign(
                                    "sha256",
                                    Buffer.from(JSON.stringify(message)),
                                    {
                                      key: privateKey,
                                      type: "pkcs8",
                                      format: "der",
                                    }
                                  );
                                
                                  const params = {
                                    method: "POST",
                                    url: "https://api.changelly.com/v2",
                                    headers: {
                                      "Content-Type": "application/json",
                                      "X-Api-Key": crypto
                                        .createHash("sha256")
                                        .update(publicKey)
                                        .digest("base64"),
                                      "X-Api-Signature": signature.toString("base64"),
                                    },
                                    body: JSON.stringify(message),
                                  };

                                
                                  request(params, async function (error, response) {
                                    try {

                                        if(isValid && (swap.status!="finished" || swap.status!="success")){
                                            db.query("DELETE FROM changelly_transactions WHERE transaction_id=?",[swap.transaction_id],(error,result)=>{
                                                if(error){
                                                    console.log("Error deleting transaction");
                                                }
                                            })
                                        }else{
                                        const data = await JSON.parse(response.body);
                                        // console.log(`Index: ${index}`, data)
                                        if(data.result.status=="finished" && swap.status_email==0 && swap.email){
                                            console.log("1");
                                            sendSuccessEmail(swap.email);
                                            db.query("UPDATE changelly_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                                                if(error){
                                                    console.log("Email send status update in database unsuccessful");
                                                }
                                            })
                                        }else if(data.result.status=="failed" || data.result.status=="refunded" || data.result=="overdue" || data.result=="expired" || data.result.status=="expired"){
                                            if( swap.status_email==0 && swap.email!=null){
                                                console.log("2", swap.email);
                                            sendFailedEmail(swap.email);
                                            db.query("UPDATE changelly_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                                                if(error){
                                                    console.log("Email send status update in database unsuccessful");
                                                }
                                            })
                                        }
                                        }else{
                                            console.log("Error calling email functions or there are emails are already sent or status is waiting or processing");
                                            
                                        }
                                        if(data.result.status && data.result.payoutHash){
                                        db.query(`UPDATE changelly_transactions SET status=?, tx_hash=? WHERE transaction_id=?`,[data.result.status, data.result.payoutHash, swap.transaction_id],(error, result)=>{
                                            if(error){
                                                // console.log("Error 1 Loop:", index)
                                                // console.log("Transaction ID:", swap.transaction_id)
                                            }
                                        })}else if(data.result.status){
                                            db.query(`UPDATE changelly_transactions SET status=? WHERE transaction_id=?`,[data.result.status, swap.transaction_id],(error, result)=>{
                                                if(error){
                                                    // console.log("Error 2 Loop:", index)
                                                    // console.log("Transaction ID:", swap.transaction_id)
                                                }
                                            })
                                        }else{
                                            db.query(`UPDATE changelly_transactions SET status=? WHERE transaction_id=?`, [data.result, swap.transaction_id],(error, result)=>{
                                                if(error){
                                                    // console.log("Error 3 Loop:", index, data, error)
                                                    // console.log("Transaction ID:", swap.transaction_id)
                                                }
                                            })
                                        }
                                    }
                                    } catch (error) {
                                        // console.log("No data was stored in changelly Index:", index)
        
                                    }
                                  })
                                
                            } catch (error) {
                                // console.log("No data was stored in changelly Index:", index)
                            }            
                              
                        })
        
                }
            })
        
            db.query('SELECT * FROM changenow_transactions', async (error, result)=>{
        
                    if(result.length>0){
                        function is48HoursDifference(timestamp1, timestamp2) {
                            // Calculate the difference in milliseconds
                            const differenceInMilliseconds = Math.abs(timestamp1 - timestamp2);
                          
                            // Convert the difference to hours
                            const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
                          
                            // Check if the difference is exactly 48 hours
                            return differenceInHours >= 48;
                          }
                          const currentTimestamp = Date.now(); // Current timestamp
                        result.map(async(swap, index)=>{
                            const isValid=is48HoursDifference(currentTimestamp, swap.time);
                            try {
                                if(isValid && (swap.status!="finished" || swap.status!="success")){
                                    db.query("DELETE FROM changenow_transactions WHERE transaction_id=?",[swap.transaction_id],(error,result)=>{
                                        if(error){
                                            console.log("Error deleting transaction");
                                        }
                                    })
                                }else{
                                const url = `https://api.changenow.io/v2/exchange/by-id?id=${swap.transaction_id}`;
            
            
                            const options = {
                              method: "GET",
                              headers: {
                                "Content-Type": "application/json",
                                "x-changenow-api-key": `${process.env.CHANGENOW}`,
                              },
                            }
                          
                            const response = await fetch(url, options);
                          
                            const data = await response.json();

                            if(data.status=="finished" && swap.status_email==0 && swap.email){
                                console.log("1");
                                sendSuccessEmail(swap.email);
                                db.query("UPDATE changenow_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                                    if(error){
                                        console.log("Email send status update in database unsuccessful");
                                    }
                                })
                            }else if(data.status=="failed" || data.status=="refunded"){
                                if( swap.status_email==0 && swap.email!=null){
                                    console.log("2", swap.email);
                                sendFailedEmail(swap.email);
                                db.query("UPDATE changenow_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                                    if(error){
                                        console.log("Email send status update in database unsuccessful");
                                    }
                                })
                            }
                            }else{
                                console.log("Error calling email functions or there are emails are already sent or status is waiting or processing");
                                
                            }
        
                            // console.log(`Index: ${index}`, data)
                            if(data.status && data.tx_to && data.tx_to!=""){
                                db.query(`UPDATE changenow_transactions SET status=?, tx_hash=? WHERE transaction_id=?`,[data.status, data.tx_to, swap.transaction_id],(error, result)=>{
                                    if(error){
                                        // console.log("Error 1 Loop:", index)
                                        // console.log("Transaction ID:", swap.transaction_id)
                                    }
                                })
                                    }else if(data.status){
                                        db.query(`UPDATE changenow_transactions SET status=? WHERE transaction_id=?`,[data.status, swap.transaction_id],(error, result)=>{
                                            if(error){
                                                // console.log("Error 1 Loop:", index)
                                                // console.log("Transaction ID:", swap.transaction_id)
                                            }
                                        })
                                    } else {
                                        // console.log('No changes done: ', index)
                                    }
                                }
                            } catch (error) {
                                    // console.log('No changes done: ', index)
                            }
                            
                        })
                    }
        
            })
        
            db.query('SELECT * FROM changehero_transactions', (error, result)=>{
        
                 if(result.length>0){
                    function is48HoursDifference(timestamp1, timestamp2) {
                        // Calculate the difference in milliseconds
                        const differenceInMilliseconds = Math.abs(timestamp1 - timestamp2);
                      
                        // Convert the difference to hours
                        const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
                      
                        // Check if the difference is exactly 48 hours
                        return differenceInHours >= 48;
                      }
                      const currentTimestamp = Date.now(); // Current timestamp
        
                        result.map(async(swap, index)=>{
                            const isValid=is48HoursDifference(currentTimestamp, swap.time);
                        try {
                            if(isValid && (swap.status!="finished" || swap.status!="success")){
                                db.query("DELETE FROM changehero_transactions WHERE transaction_id=?",[swap.transaction_id],(error,result)=>{
                                    if(error){
                                        console.log("Error deleting transaction");
                                    }
                                })
                            }else{
                            const url = `https://api.changehero.io/v2/`;
            
                        const params = {
                      
                          jsonrpc: "2.0",
                          method: "getStatus",
                          params:{
                          id: `${swap.transaction_id}`
                          }
                        }
                      
                        const options = {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "api-key": `${process.env.CHANGEHERO}`
                          },
                          body: JSON.stringify(params)
                      
                        }
                        
                      
                        const response = await fetch(url, options)
                        const data = await response.json();

                        if(data.status=="finished" && swap.status_email==0 && swap.email){
                            console.log("1");
                            sendSuccessEmail(swap.email);
                            db.query("UPDATE changehero_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                                if(error){
                                    console.log("Email send status update in database unsuccessful");
                                }
                            })
                        }else if(data.status=="failed" || data.status=="refunded" || data.status=="expired" || data.result=="expired"){
                            if( swap.status_email==0 && swap.email!=null){
                                console.log("2", swap.email);
                            sendFailedEmail(swap.email);
                            db.query("UPDATE changehero_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                                if(error){
                                    console.log("Email send status update in database unsuccessful");
                                }
                            })
                        }
                        }else{
                            console.log("Error calling email functions or there are emails are already sent or status is waiting or processing");
                            
                        }
            
                                // console.log(`Index: ${index}`, data)
                                if(data.status && data.paoutHash){
                                    db.query(`UPDATE changehero_transactions SET status=?, tx_hash=? WHERE transaction_id=?`,[data.status, data.payoutHash, swap.transaction_id],(error, result)=>{
                                        if(error){
                                            // console.log("Error 1 Loop:", index)
                                            // console.log("Transaction ID:", swap.transaction_id)
                                        }
                                    })
                                        }else if(data.status){
                                            db.query(`UPDATE changehero_transactions SET status=? WHERE transaction_id=?`,[data.status, swap.transaction_id],(error, result)=>{
                                                if(error){
                                                    // console.log("Error 1 Loop:", index)
                                                    // console.log("Transaction ID:", swap.transaction_id)
                                                }
                                            })
                                        }else if(data.result){
                                            db.query(`UPDATE changehero_transactions SET status=? WHERE transaction_id=?`,[data.result, swap.transaction_id],(error, result)=>{
                                                if(error){
                                                    // console.log("Error 1 Loop:", index)
                                                    // console.log("Transaction ID:", swap.transaction_id)
                                                }
                                            })
                                        } else {
                                            // console.log('No changes done changehero: ', index)
                                        }
                                    }
                        } catch (error) {
                            // console.log('No changes done changehero: ', index)
                        }
                        
                    })             
            
                    }
                
            })
        
            db.query('SELECT * FROM exolix_transactions', (error, result)=>{
                if(result.length>0){
                    function is48HoursDifference(timestamp1, timestamp2) {
                        // Calculate the difference in milliseconds
                        const differenceInMilliseconds = Math.abs(timestamp1 - timestamp2);
                      
                        // Convert the difference to hours
                        const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
                      
                        // Check if the difference is exactly 48 hours
                        return differenceInHours >= 48;
                      }
                      const currentTimestamp = Date.now(); // Current timestamp
                    result.map(async(swap, index)=>{
                        try {
                            const isValid=is48HoursDifference(currentTimestamp, swap.time);
                            if(isValid && (swap.status!="finished" || swap.status!="success")){
                                db.query("DELETE FROM exolix_transactions WHERE transaction_id=?",[swap.transaction_id],(error,result)=>{
                                    if(error){
                                        console.log("Error deleting transaction");
                                    }
                                })
                            }else{

                        const url = `https://exolix.com/api/v2/transactions/${swap.transaction_id}`;
        
                        const options = {
                          method: "GET",
                          headers: {
                            "Content-Type": "application/json",
                          },
                        }
                      
                        const response = await fetch(url, options)
                      
                        const data = await response.json();

                        if(data.status=="success" && swap.status_email==0 && swap.email){
                            console.log("1");
                            sendSuccessEmail(swap.email);
                            db.query("UPDATE exolix_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                                if(error){
                                    console.log("Email send status update in database unsuccessful");
                                }
                            })
                        }else if(data.status=="failed" || data.status=="refunded" || data.status=="expired" || data.result=="expired" || data.result=="expired" || data.status=="overdue"){
                            if( swap.status_email==0 && swap.email!=null){
                                console.log("2", swap.email);
                            sendFailedEmail(swap.email);
                            db.query("UPDATE exolix_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                                if(error){
                                    console.log("Email send status update in database unsuccessful");
                                }
                            })
                        }
                        }else{
                            console.log("Error calling email functions or there are emails are already sent or status is waiting or processing");
                            
                        }
                      
                            // console.log(`Index: ${index}`, data)
                            if(data.status && data.hashOut.hash){
                                db.query(`UPDATE exolix_transactions SET status=?, tx_hash=? WHERE transaction_id=?`,[data.status, data.hashOut.hash, swap.transaction_id],(error, result)=>{
                                    if(error){
                                        // console.log("Error 1 Loop:", index)
                                        // console.log("Transaction ID:", swap.transaction_id)
                                    }
                                })
                                    }else if(data.status){
                                        db.query(`UPDATE exolix_transactions SET status=? WHERE transaction_id=?`,[data.status, swap.transaction_id],(error, result)=>{
                                            if(error){
                                                // console.log("Error 1 Loop:", index)
                                                // console.log("Transaction ID:", swap.transaction_id)
                                            }
                                        })
                                    }
                                     else {
                                        // console.log('No changes done exolix: ', index, data)
                                    }
                            }
                        } catch (error) {
                                // console.log('No changes done exolix: ', index, data)
                        }
                        
                    })             
        
                }
            })
        
            db.query('SELECT * FROM godex_transactions', (error, result)=>{
                if(result.length>0){
                    function is48HoursDifference(timestamp1, timestamp2) {
                        // Calculate the difference in milliseconds
                        const differenceInMilliseconds = Math.abs(timestamp1 - timestamp2);
                      
                        // Convert the difference to hours
                        const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
                      
                        // Check if the difference is exactly 48 hours
                        return differenceInHours >= 48;
                      }
                      const currentTimestamp = Date.now(); // Current timestamp
                    result.map(async(swap, index)=>{
                        try {
                            const isValid=is48HoursDifference(currentTimestamp, swap.time);
                            if(isValid && (swap.status!="finished" || swap.status!="success")){
                                db.query("DELETE FROM godex_transactions WHERE transaction_id=?",[swap.transaction_id],(error,result)=>{
                                    if(error){
                                        console.log("Error deleting transaction");
                                    }
                                })
                            }else{
                            const url = `http://api.godex.io/api/v1/transaction/${swap.transaction_id}`;
        
                        const options = {
                          method: "GET",
                          headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                          },
                        }
                      
                        const response = await fetch(url, options)
                      
                        const data = await response.json();

                        if(data.status=="success" && swap.status_email==0 && swap.email){
                            console.log("1");
                            sendSuccessEmail(swap.email);
                            db.query("UPDATE godex_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                                if(error){
                                    console.log("Email send status update in database unsuccessful");
                                }
                            })
                        }else if(data.status=="failed" || data.status=="error" || data.status=="refunded" || data.status=="expired" || data.result=="expired" || data.result=="expired" || data.status=="overdue" || data.result=="overdue" || data.result=="error"){
                            if( swap.status_email==0 && swap.email!=null){
                                console.log("2", swap.email);
                            sendFailedEmail(swap.email);
                            db.query("UPDATE godex_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                                if(error){
                                    console.log("Email send status update in database unsuccessful");
                                }
                            })
                        }
                        }else{
                            console.log("Error calling email functions or there are emails are already sent or status is waiting or processing");
                            
                        }
                      
                            // console.log(`Index: ${index}`, data)
                            if(data.status && data.hash_out){
                                db.query(`UPDATE godex_transactions SET status=?, tx_hash=? WHERE transaction_id=?`,[data.status, data.hash_out, swap.transaction_id],(error, result)=>{
                                    if(error){
                                        // console.log("Error 1 Loop:", index)
                                        // console.log("Transaction ID:", swap.transaction_id)
                                    }
                                })
                                    }else if(data.status){
                                        db.query(`UPDATE godex_transactions SET status=? WHERE transaction_id=?`,[data.status, swap.transaction_id],(error, result)=>{
                                            if(error){
                                                // console.log("Error 1 Loop:", index)
                                                // console.log("Transaction ID:", swap.transaction_id)
                                            }
                                        })
                                    }
                                     else {
                                        // console.log('No changes done godex: ', index, data)
                                    }
                            }
                        } catch (error) {
                                // console.log('No changes done godex: ', index, data)
                        }
                        
                    })             
        
                }
            })
        
            db.query('SELECT * FROM letsexchange_transactions', (error, result)=>{
                if(result.length>0){
                    function is48HoursDifference(timestamp1, timestamp2) {
                        // Calculate the difference in milliseconds
                        const differenceInMilliseconds = Math.abs(timestamp1 - timestamp2);
                      
                        // Convert the difference to hours
                        const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
                      
                        // Check if the difference is exactly 48 hours
                        return differenceInHours >= 48;
                      }
                      const currentTimestamp = Date.now(); // Current timestamp
                    result.map(async(swap, index)=>{
                        try {
                            const isValid=is48HoursDifference(currentTimestamp, swap.time);
                            if(isValid && (swap.status!="finished" || swap.status!="success")){
                                db.query("DELETE FROM letsexchange_transactions WHERE transaction_id=?",[swap.transaction_id],(error,result)=>{
                                    if(error){
                                        console.log("Error deleting transaction");
                                    }
                                })
                            }else{
                            const url = `https://api.letsexchange.io/api/v1/transaction/${swap.transaction_id}`;
        
                            const options = {
                              method: "GET",
                              headers: {
                                "Content-Type": "application/json",
                                "Authorization": `${process.env.LETSEXCHANGE}`,
                                "Accept": "application/json",
                              },
                              // body:JSON.stringify(params)
                            }
                          
                            const response = await fetch(url, options)
                          
                            const data = await response.json();

                            if(data.status=="success" && swap.status_email==0 && swap.email){
                                console.log("1");
                                sendSuccessEmail(swap.email);
                                db.query("UPDATE letsexchange_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                                    if(error){
                                        console.log("Email send status update in database unsuccessful");
                                    }
                                })
                            }else if(data.status=="failed" || data.status=="error" || data.status=="refunded" || data.status=="expired" || data.result=="aml_check_failed" || data.status=="aml_check_failed" || data.result=="expired" || data.status=="overdue" || data.result=="overdue" || data.result=="error"){
                                if( swap.status_email==0 && swap.email!=null){
                                    console.log("2", swap.email);
                                sendFailedEmail(swap.email);
                                db.query("UPDATE letsexchange_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                                    if(error){
                                        console.log("Email send status update in database unsuccessful");
                                    }
                                })
                            }
                            }else{
                                console.log("Error calling email functions or there are emails are already sent or status is waiting or processing");
                                
                            }
                          
                                // console.log(`Index: ${index}`, data)
                                if(data.status && data.hash_out && data.hash_out!=""){
                                    db.query(`UPDATE letsexchange_transactions SET status=?, tx_hash=? WHERE transaction_id=?`,[data.status, data.hash_out, swap.transaction_id],(error, result)=>{
                                        if(error){
                                            // console.log("Error 1 Loop:", index)
                                            // console.log("Transaction ID:", swap.transaction_id)
                                        }
                                    })
                                        }else if(data.status){
                                            db.query(`UPDATE letsexchange_transactions SET status=? WHERE transaction_id=?`,[data.status, swap.transaction_id],(error, result)=>{
                                                if(error){
                                                    // console.log("Error 1 Loop:", index)
                                                    // console.log("Transaction ID:", swap.transaction_id)
                                                }
                                            })
                                        }
                                         else {
                                            // console.log('No changes done letsexchange: ', index, data)
                                        }
                                    }
                        } catch (error) {
                                // console.log('No changes done letsexchange: ', index, data)
                        }
                       
                    })             
        
                }
            })
        
            db.query('SELECT * FROM stealthex_transactions', (error, result)=>{
                    if(result.length>0){
                        function is48HoursDifference(timestamp1, timestamp2) {
                            // Calculate the difference in milliseconds
                            const differenceInMilliseconds = Math.abs(timestamp1 - timestamp2);
                          
                            // Convert the difference to hours
                            const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
                          
                            // Check if the difference is exactly 48 hours
                            return differenceInHours >= 48;
                          }
                          const currentTimestamp = Date.now(); // Current timestamp
                        result.map(async(swap, index)=>{
                            try {
                                const isValid=is48HoursDifference(currentTimestamp, swap.time);
                                if(isValid && (swap.status!="finished" || swap.status!="success")){
                                    db.query("DELETE FROM stealthex_transactions WHERE transaction_id=?",[swap.transaction_id],(error,result)=>{
                                        if(error){
                                            console.log("Error deleting transaction");
                                        }
                                    })
                                }else{
                                const url = `https://api.stealthex.io/api/v2/exchange/${swap.transaction_id}?api_key=${process.env.STEALTHEX}`;
            
                            const options = {
                              method: "GET",
                              headers: {
                                "Content-Type": "application/json",
                              },
                            }
                          
                            const response = await fetch(url, options)
                          
                            const data = await response.json()

                            if(data.status=="finished" && swap.status_email==0 && swap.email){
                                console.log("1");
                                sendSuccessEmail(swap.email);
                                db.query("UPDATE stealthex_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                                    if(error){
                                        console.log("Email send status update in database unsuccessful");
                                    }
                                })
                            }else if(data.status=="failed" || data.status=="error" || data.status=="refunded" || data.status=="expired" || data.result=="aml_check_failed" || data.status=="aml_check_failed" || data.result=="expired" || data.status=="overdue" || data.result=="overdue" || data.result=="error"){
                                if( swap.status_email==0 && swap.email!=null){
                                    console.log("2", swap.email);
                                sendFailedEmail(swap.email);
                                db.query("UPDATE stealthex_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                                    if(error){
                                        console.log("Email send status update in database unsuccessful");
                                    }
                                })
                            }
                            }else{
                                console.log("Error calling email functions or there are emails are already sent or status is waiting or processing");
                                
                            }
                          
                                // console.log(`Index: ${index}`, data)
                                if(data.status && data.tx_to && data.tx_to!=""){
                                    db.query(`UPDATE stealthex_transactions SET status=?, tx_hash=? WHERE transaction_id=?`,[data.status, data.tx_to, swap.transaction_id],(error, result)=>{
                                        if(error){
                                            // console.log("Error 1 Loop:", index)
                                            // console.log("Transaction ID:", swap.transaction_id)
                                        }
                                    })
                                        }else if(data.status){
                                            db.query(`UPDATE stealthex_transactions SET status=? WHERE transaction_id=?`,[data.status, swap.transaction_id],(error, result)=>{
                                                if(error){
                                                    // console.log("Error 1 Loop:", index)
                                                    // console.log("Transaction ID:", swap.transaction_id)
                                                }
                                            })
                                        }
                                         else {
                                            // console.log('No changes done stealthex: ', index, data)
                                        }
                                }
                            } catch (error) {
                                // console.log('No changes done stealthex: ', index, data)
                            }
                            
                        })             
            
                    }
        
            })
        
            db.query('SELECT * FROM simpleswap_transactions', (error, result)=>{
                if(result.length>0){
                    function is48HoursDifference(timestamp1, timestamp2) {
                        // Calculate the difference in milliseconds
                        const differenceInMilliseconds = Math.abs(timestamp1 - timestamp2);
                      
                        // Convert the difference to hours
                        const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
                      
                        // Check if the difference is exactly 48 hours
                        return differenceInHours >= 48;
                      }
                      const currentTimestamp = Date.now(); // Current timestamp
                    result.map(async(swap, index)=>{
                        try {
                            const isValid=is48HoursDifference(currentTimestamp, swap.time);
                            if(isValid && (swap.status!="finished" || swap.status!="success")){
                                db.query("DELETE FROM simpleswap_transactions WHERE transaction_id=?",[swap.transaction_id],(error,result)=>{
                                    if(error){
                                        console.log("Error deleting transaction");
                                    }
                                })
                            }else{
                            const url = `https://api.simpleswap.io/get_exchange?api_key=${process.env.SIMPLESWAP}&id=${swap.transaction_id}`;
        
                            const options = {
                              method: "GET",
                              headers: {
                                "Content-Type": "application/json",
                                "Accept": "application/json"
                              },
                            }
        
                            const response = await fetch(url, options)
                      
                            const data = await response.json();

                            if(data.status=="finished" && swap.status_email==0 && swap.email){
                                console.log("1");
                                sendSuccessEmail(swap.email);
                                db.query("UPDATE simpleswap_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                                    if(error){
                                        console.log("Email send status update in database unsuccessful");
                                    }
                                })
                            }else if(data.status=="failed" || data.status=="error" || data.status=="refunded" || data.status=="blacklist" || data.result=="blacklist" || data.status=="expired" || data.result=="aml_check_failed" || data.status=="aml_check_failed" || data.result=="expired" || data.status=="overdue" || data.result=="overdue" || data.result=="error"){
                                if( swap.status_email==0 && swap.email!=null){
                                    console.log("2", swap.email);
                                sendFailedEmail(swap.email);
                                db.query("UPDATE simpleswap_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                                    if(error){
                                        console.log("Email send status update in database unsuccessful");
                                    }
                                })
                            }
                            }else{
                                console.log("Error calling email functions or there are emails are already sent or status is waiting or processing");
                                
                            }
                          
                                // console.log(`Index: ${index}`, data)
                                if(data.status && data.tx_to && data.tx_to!=""){
                                    db.query(`UPDATE simpleswap_transactions SET status=?, tx_hash=? WHERE transaction_id=?`,[data.status, data.tx_to, swap.transaction_id],(error, result)=>{
                                        if(error){
                                            // console.log("Error 1 Loop:", index)
                                            // console.log("Transaction ID:", swap.transaction_id)
                                        }
                                    })
                                        }else if(data.status){
                                            db.query(`UPDATE simpleswap_transactions SET status=? WHERE transaction_id=?`,[data.status, swap.transaction_id],(error, result)=>{
                                                if(error){
                                                    // console.log("Error 1 Loop:", index)
                                                    // console.log("Transaction ID:", swap.transaction_id)
                                                }
                                            })
                                        }
                                         else {
                                            // console.log('No changes done simpleswap: ', index, data)
                                        }
                                    }
                        } catch (error) {
                                // console.log('No changes done simpleswap: ', index, data)
                        }
        
                    })             
        
                }
        
            })
        
            })
    }

})


app.listen(port, () => {
    console.log(`Server listening at https://localhost:${port}`)
})
