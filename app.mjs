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

//Two Days Difference Calculation
function is48HoursDifference(timestamp1, timestamp2, exchange, id) {
    // Calculate the difference in milliseconds
    const differenceInMilliseconds = Math.abs(timestamp1 - timestamp2);
  
    // Convert the difference to hours
    const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
    console.log(`Difference in hours of exchange ${exchange} and transaction ID ${id} = ${differenceInHours}`);
    // Check if the difference is exactly 48 hours
    return differenceInHours >= 48;
  }

cron.schedule(`10 * * * * *`, ()=>{


    db.query('SELECT * FROM changelly_transactions', (error, result)=>{
        if(result.length>0){
                result.map((swap)=>{
                    if(swap.status=="finished" && swap.status_email==0 && swap.email!=null){
                        sendSuccessEmail(swap.email);
                        db.query("UPDATE changelly_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                            if(error){
                                console.log("Changelly email status update unsuccessful of transaction id: ", swap.transaction_id);
                            }
                        })
                    }else if(swap.status=="failed" || swap.status=="refunded" || swap.status=="overdue" || swap.status=="expired"){
                        if(swap.status_email==0 && swap.email!=null){
                        sendFailedEmail(swap.email);
                        db.query("UPDATE changelly_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                            if(error){
                                console.log("Changelly email status update unsuccessful of transaction id: ", swap.transaction_id);
                            }
                        })
                    }
                    }            
                })
        }
    })

    db.query('SELECT * FROM changenow_transactions', async (error, result)=>{
        if(result.length>0){
            result.map((swap)=>{
                if(swap.status=="finished" && swap.status_email==0 && swap.email!=null){
                    sendSuccessEmail(swap.email);
                    db.query("UPDATE changenow_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                        if(error){
                            console.log("Changenow email status update unsuccessful of transaction id: ", swap.transaction_id);
                        }
                    })
                }else if(swap.status=="failed" || swap.status=="refunded" || swap.status=="overdue" || swap.status=="expired"){
                    if(swap.status_email==0 && swap.email!=null){
                    sendFailedEmail(swap.email);
                    db.query("UPDATE changenow_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                        if(error){
                            console.log("Changenow email status update unsuccessful of transaction id: ", swap.transaction_id);
                        }
                    })
                }
                }            
            })
    }

    })

    db.query('SELECT * FROM changehero_transactions', (error, result)=>{
        if(result.length>0){
            result.map((swap)=>{
                if(swap.status=="finished" && swap.status_email==0 && swap.email!=null){
                    sendSuccessEmail(swap.email);
                    db.query("UPDATE changehero_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                        if(error){
                            console.log("Changehero email status update unsuccessful of transaction id: ", swap.transaction_id);
                        }
                    })
                }else if(swap.status=="failed" || swap.status=="refunded" || swap.status=="overdue" || swap.status=="expired"){
                    if(swap.status_email==0 && swap.email!=null){
                    sendFailedEmail(swap.email);
                    db.query("UPDATE changehero_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                        if(error){
                            console.log("Changehero email status update unsuccessful of transaction id: ", swap.transaction_id);
                        }
                    })
                }
                }            
            });  
        }
    })

    db.query('SELECT * FROM exolix_transactions', (error, result)=>{
        if(result.length>0){
            result.map((swap)=>{
                if(swap.status=="success" && swap.status_email==0 && swap.email!=null){
                    sendSuccessEmail(swap.email);
                    db.query("UPDATE exolix_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                        if(error){
                            console.log("Exolix email status update unsuccessful of transaction id: ", swap.transaction_id);
                        }
                    })
                }else if(swap.status=="failed" || swap.status=="refunded" || swap.status=="overdue" || swap.status=="expired"){
                    if(swap.status_email==0 && swap.email!=null){
                    sendFailedEmail(swap.email);
                    db.query("UPDATE exolix_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                        if(error){
                            console.log("Exolix email status update unsuccessful of transaction id: ", swap.transaction_id);
                        }
                    })
                }
                }            
            });  
        }
    })

    db.query('SELECT * FROM godex_transactions', (error, result)=>{
        if(result.length>0){
            result.map((swap)=>{
                if(swap.status=="success" && swap.status_email==0 && swap.email!=null){
                    sendSuccessEmail(swap.email);
                    db.query("UPDATE godex_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                        if(error){
                            console.log("Godex email status update unsuccessful of transaction id: ", swap.transaction_id);
                        }
                    })
                }else if(swap.status=="failed" || swap.status=="refunded" || swap.status=="overdue" || swap.status=="expired"){
                    if(swap.status_email==0 && swap.email!=null){
                    sendFailedEmail(swap.email);
                    db.query("UPDATE godex_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                        if(error){
                            console.log("Godex email status update unsuccessful of transaction id: ", swap.transaction_id);
                        }
                    })
                }
                }            
            });  
        }
    })

    db.query('SELECT * FROM letsexchange_transactions', (error, result)=>{
        if(result.length>0){
            result.map((swap)=>{
                if(swap.status=="success" && swap.status_email==0 && swap.email!=null){
                    sendSuccessEmail(swap.email);
                    db.query("UPDATE letsexchange_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                        if(error){
                            console.log("Letsexchange email status update unsuccessful of transaction id: ", swap.transaction_id);
                        }
                    })
                }else if(swap.status=="failed" || swap.status=="refunded" || swap.status=="overdue" || swap.status=="expired"){
                    if(swap.status_email==0 && swap.email!=null){
                    sendFailedEmail(swap.email);
                    db.query("UPDATE letsexchange_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                        if(error){
                            console.log("Letsexchange email status update unsuccessful of transaction id: ", swap.transaction_id);
                        }
                    })
                }
                }            
            });  
        }
    })

    db.query('SELECT * FROM stealthex_transactions', (error, result)=>{
        if(result.length>0){
            result.map((swap)=>{
                if(swap.status=="finished" && swap.status_email==0 && swap.email!=null){
                    sendSuccessEmail(swap.email);
                    db.query("UPDATE stealthex_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                        if(error){
                            console.log("Stealthex email status update unsuccessful of transaction id: ", swap.transaction_id);
                        }
                    })
                }else if(swap.status=="failed" || swap.status=="refunded" || swap.status=="overdue" || swap.status=="expired"){
                    if(swap.status_email==0 && swap.email!=null){
                    sendFailedEmail(swap.email);
                    db.query("UPDATE stealthex_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                        if(error){
                            console.log("Stealthex email status update unsuccessful of transaction id: ", swap.transaction_id);
                        }
                    })
                }
                }            
            });  
        }

    })

    db.query('SELECT * FROM simpleswap_transactions', (error, result)=>{
        if(result.length>0){
            result.map((swap)=>{
                if(swap.status=="finished" && swap.status_email==0 && swap.email!=null){
                    sendSuccessEmail(swap.email);
                    db.query("UPDATE simpleswap_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                        if(error){
                            console.log("Simpleswap email status update unsuccessful of transaction id: ", swap.transaction_id);
                        }
                    })
                }else if(swap.status=="failed" || swap.status=="refunded" || swap.status=="overdue" || swap.status=="expired"){
                    if(swap.status_email==0 && swap.email!=null){
                    sendFailedEmail(swap.email);
                    db.query("UPDATE simpleswap_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                        if(error){
                            console.log("Simpleswap email status update unsuccessful of transaction id: ", swap.transaction_id);
                        }
                    })
                }
                }            
            });  
        }

    })

    })

// *********************** Running Cron Job for updating exchange statuses in database ************************* //

db.query('SELECT * FROM cron_job WHERE type=?',["status/removal cron"], (error, result)=>{
        
    if(error){
        console.log("Cron job failed");
    }else{

        cron.schedule(`${result[0].second} ${result[0].minute} ${result[0].hour} ${result[0].date_of_month} ${result[0].month} ${result[0].day_of_week}`, ()=>{


            db.query('SELECT * FROM changelly_transactions', (error, result)=>{
                if(result.length>0){
                        result.map((swap)=>{
                            // This condition checks if a transaction is successfull then it doesnot perform any logic
                            if(swap.status!="finished" && swap.status !="success"){
                                const currentTimestamp = Date.now(); // Current timestamp
                                const isValid=is48HoursDifference(currentTimestamp, swap.time, "Changelly", swap.transaction_id);
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
                                        method: "getTransactions",
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

                                            //This logic checks if time difference is greater than two days and status is not finished and successfull then delete transaction
                                            if(isValid && swap.status!="finished"){
                                                db.query("DELETE FROM changelly_transactions WHERE transaction_id=?",[swap.transaction_id],(error,result)=>{
                                                    if(error){
                                                        console.log("Error deleting transaction Changelly Transation");
                                                    }
                                                })
                                            }else{
                                            const data = await JSON.parse(response.body);
                                            if(data.result[0].status && data.result[0].payoutHash){
                                            db.query(`UPDATE changelly_transactions SET status=?, tx_hash=?, tx_hash_link=?, get_amount WHERE transaction_id=?`,[data.result[0].status, data.result[0].payoutHash, data.result[0].payoutHashLink, data.result[0].amountTo, swap.transaction_id],(error, result)=>{
                                                if(error){
                                                    // console.log("Error 1 Loop:", index)
                                                    // console.log("Transaction ID:", swap.transaction_id)
                                                }
                                            })}else if(data.result[0].status){
                                                db.query(`UPDATE changelly_transactions SET status=? WHERE transaction_id=?`,[data.result[0].status, swap.transaction_id],(error, result)=>{
                                                    if(error){
                                                        // console.log("Error 2 Loop:", index)
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

                            }       
                        })
        
                }
            })
        
            db.query('SELECT * FROM changenow_transactions', async (error, result)=>{
        
                    if(result.length>0){
                        const currentTimestamp = Date.now(); // Current timestamp
                        result.map(async(swap)=>{
                            if(swap.status!="finished" && swap.status !="success"){
                            const isValid=is48HoursDifference(currentTimestamp, swap.time, "Changenow", swap.transaction_id);
                            try {
                                if(isValid && swap.status!="finished"){
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
                            if(data.status && data.payoutHash && data.payoutHash!=""){
                                db.query(`UPDATE changenow_transactions SET status=?, tx_hash=?, get_amount WHERE transaction_id=?`,[data.status, data.payoutHash, data.amountTo, swap.transaction_id],(error, result)=>{
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
                            }}
                            
                        })
                }
        
            })
        
            db.query('SELECT * FROM changehero_transactions', (error, result)=>{
        
                 if(result.length>0){
                      const currentTimestamp = Date.now(); // Current timestamp
                        result.map(async(swap, index)=>{
                            if(swap.status!="finished" && swap.status !="success"){
                            const isValid=is48HoursDifference(currentTimestamp, swap.time, "Changehero", swap.transaction_id);
                        try {
                            if(isValid && swap.status!="finished"){
                                db.query("DELETE FROM changehero_transactions WHERE transaction_id=?",[swap.transaction_id],(error,result)=>{
                                    if(error){
                                        console.log("Error deleting transaction");
                                    }
                                })
                            }else{
                            const url = `https://api.changehero.io/v2/`;
            
                        const params = {
                      
                          jsonrpc: "2.0",
                          method: "getTransactions",
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
                      
                        const response = await fetch(url, options);
                        const data = await response.json();

                                if(data.result[0].status && data.result[0].payoutHash && data.result[0].payoutHash!=null){
                                    db.query(`UPDATE changehero_transactions SET status=?, tx_hash=? WHERE transaction_id=?`,[data.result[0].status, data.result[0].payoutHash, swap.transaction_id],(error, result)=>{
                                        if(error){
                                            // console.log("Error 1 Loop:", index)
                                            // console.log("Transaction ID:", swap.transaction_id)
                                        }
                                    })
                                        }else if(data.result[0].status){
                                            db.query(`UPDATE changehero_transactions SET status=? WHERE transaction_id=?`,[data.result[0].status, swap.transaction_id],(error, result)=>{
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
                        }}
                        
                    })             
            
                
            }
                
            })
        
            db.query('SELECT * FROM exolix_transactions', (error, result)=>{
                if(result.length>0){
                    const currentTimestamp = Date.now(); // Current timestamp
                    result.map(async(swap, index)=>{
                        if(swap.status!="finished" && swap.status !="success"){
                        try {
                            const isValid=is48HoursDifference(currentTimestamp, swap.time, "Exolix", swap.transaction_id);
                            if(isValid && swap.status!=="success"){
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
                            if(data.status && data.hashOut.hash && data.hashOut.hash!=null){
                                db.query(`UPDATE exolix_transactions SET status=?, tx_hash=?, tx_hash_link=?, get_amount WHERE transaction_id=?`,[data.status, data.hashOut.hash, data.hashOut.link, data.amountTo, swap.transaction_id],(error, result)=>{
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
                        }}
                        
                    })
                }
            })
        
            db.query('SELECT * FROM godex_transactions', (error, result)=>{
                if(result.length>0){
                    const currentTimestamp = Date.now(); // Current timestamp
                    result.map(async(swap)=>{
                        if(swap.status!="finished" && swap.status !="success"){
                        try {
                            const isValid=is48HoursDifference(currentTimestamp, swap.time, "Godex", swap.transaction_id);
                            if(isValid && swap.status!="success"){
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
                            if(data.status && data.hash_out && data.hash_out!==null){
                                db.query(`UPDATE godex_transactions SET status=?, tx_hash=?, tx_hash_link=?, get_amount WHERE transaction_id=?`,[data.status, data.hash_out, data.coin_to_explorer_url, data.real_withdrawal_amount, swap.transaction_id],(error, result)=>{
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
                        }}
                        
                    })             
                }
            })
        
            db.query('SELECT * FROM letsexchange_transactions', (error, result)=>{
                if(result.length>0){
                    const currentTimestamp = Date.now(); // Current timestamp
                    result.map(async(swap)=>{
                        if(swap.status!="finished" && swap.status !="success"){
                        try {
                            const isValid=is48HoursDifference(currentTimestamp, swap.time, "Letsexchange", swap.transaction_id);
                            if(isValid &&  swap.status!="success"){
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
                            }
                          
                            const response = await fetch(url, options)
                          
                            const data = await response.json();

                            if(data.status && data.hash_out && data.hash_out!=null){
                                    db.query(`UPDATE letsexchange_transactions SET status=?, tx_hash=?, tx_hash_link=? WHERE transaction_id=?`,[data.status, data.hash_out, data.coin_to_explorer_url,  swap.transaction_id],(error, result)=>{
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
                        }}
                       
                    })             
                }
            })
        
            db.query('SELECT * FROM stealthex_transactions', (error, result)=>{
                    if(result.length>0){
                        const currentTimestamp = Date.now(); // Current timestamp
                        result.map(async(swap, index)=>{
                            if(swap.status!="finished" && swap.status !="success"){
                            try {
                                
                                const isValid=is48HoursDifference(currentTimestamp, swap.time, "Stealthex", swap.transaction_id);
                                if(isValid && swap.status!="finished"){
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
                          
                            const data = await response.json();
                          
                                let keys = Object.keys(data.currencies); // Get the keys as an array
                                let keyAtIndex = keys[1]; // Get the key at the specified index
                                let innerObject = data.currencies[keyAtIndex]; // Access the inner object using the key

                                if(data.status && data.tx_to && data.tx_to!=""){
                                    db.query(`UPDATE stealthex_transactions SET status=?, tx_hash=?, tx_hash_link=? WHERE transaction_id=?`,[data.status, data.tx_to, innerObject.tx_explorer, swap.transaction_id],(error, result)=>{
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
                            }}
                            
                        })             
                        
                    }
        
            })
        
            db.query('SELECT * FROM simpleswap_transactions', (error, result)=>{
                if(result.length>0){
                    const currentTimestamp = Date.now(); // Current timestamp
                    result.map(async(swap, index)=>{
                        if(swap.status!="finished" && swap.status !="success"){
                        try {
                            const isValid=is48HoursDifference(currentTimestamp, swap.time, "Simpleswap", swap.transaction_id);
                            if(isValid && swap.status!="finished"){
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

                                let keys = Object.keys(data.currencies); // Get the keys as an array
                                let keyAtIndex = keys[1]; // Get the key at the specified index
                                let innerObject = data.currencies[keyAtIndex]; // Access the inner object using the key

                                if(data.status && data.tx_to && data.tx_to!=""){
                                    db.query(`UPDATE simpleswap_transactions SET status=?, tx_hash=?, tx_hash_link=? WHERE transaction_id=?`,[data.status, data.tx_to, innerObject.tx_explorer, swap.transaction_id],(error, result)=>{
                                        if(error){
                                            // console.log("Error 1 Loop:", index)
                                            // console.log("Transaction ID:", swap.transaction_id)
                                        }else{
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
                        }}
        
                    })             
        
                }
        
            })
        
            })
    }

})


app.listen(port, () => {
    console.log(`Server listening at https://localhost:${port}`)
})
