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
import path from 'path';
import { default as nodemailerExpressHandlebars } from 'nodemailer-express-handlebars';
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

  // Handle Bars
const handlebarOptions = {
    viewEngine: {
    extName: ".handlebars",
    partialsDir: path.resolve('./views'),
    defaultLayout: false,
    },
    viewPath: path.resolve('./views'),
    extName: ".handlebars",
    }

    transporter.use('compile', nodemailerExpressHandlebars(handlebarOptions));

//Email sending success function
function sendSuccessEmail(email, transaction_id, exchange_logo_path, exchange_logo_file_name , tx_hash, tx_hash_link, sell_coin, get_coin, sell_coin_name, get_coin_name, transaction_type, sell_amount, get_amount, sell_coin_logo, get_coin_logo, completion_time, deposit_address, recipient_address){
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Swap Status',
        template: 'email',
        context: {
            transaction_id:transaction_id,
            tx_hash:tx_hash,
            tx_hash_link:tx_hash_link,
            sell_coin:sell_coin,
            get_coin:get_coin,
            sell_coin_name:sell_coin_name,
            get_coin_name:get_coin_name,
            transaction_type:transaction_type,
            sell_amount:sell_amount,
            get_amount:get_amount,
            sell_coin_logo:sell_coin_logo,
            get_coin_logo:get_coin_logo,
            completion_time:completion_time,
            deposit_address:deposit_address,
            recipient_address:recipient_address
        },
        attachments:[
            {
                filename: 'Coinoswap Logo.png',
                path:'./views/images/Coinoswap Logo.png',
                cid: 'coinoswaplogo@unique.cid'
            },
            {
                filename: 'Success Illustration.png',
                path:'./views/images/Success Illustration.png',
                cid: 'successillustration@unique.cid'
            },
            {
                filename: 'To_vertical Icon.png',
                path:'./views/images/To_vertical Icon.png',
                cid: 'To_verticalIcon@unique.cid'
            },
            {
                filename: 'orange_Bullet Point Icon.png',
                path:'./views/images/orange_Bullet Point Icon.png',
                cid: 'orange_BulletPointIcon@unique.cid'
            },
            {
                filename: 'Copy_black Icon.png',
                path:'./views/images/Copy_black Icon.png',
                cid: 'Copy_blackIcon@unique.cid'
            },
            {
                filename: exchange_logo_file_name,
                path:exchange_logo_path,
                cid: 'exchangelogo@unique.cid'
            },
            {
                filename: 'Floating_black Icon.png',
                path:'./views/images/Floating_black Icon.png',
                cid: 'Floating_blackIcon@unique.cid'
            },            {
                filename: 'Arrow Button.png',
                path:'./views/images/Arrow Button.png',
                cid: 'ArrowButton@unique.cid'
            },            {
                filename: 'Trustpilot Logo.png',
                path:'./views/images/Trustpilot Logo.png',
                cid: 'TrustpilotLogo@unique.cid'
            },            {
                filename: 'Buy Crypto With.png',
                path:'./views/images/Buy Crypto With.png',
                cid: 'BuyCryptoWith@unique.cid'
            },            {
                filename: 'Trustpilot Icon.png',
                path:'./views/images/Trustpilot Icon.png',
                cid: 'TrustpilotIcon@unique.cid'
            },
            {
                filename: 'email_bg.jpeg',
                path:'./views/images/email_bg.jpeg',
                cid: 'email_bg@unique.cid'
            },
            {
                filename: 'footer_bg.jpeg',
                path:'./views/images/footer_bg.jpeg',
                cid: 'footer_bg@unique.cid'
            },

        ]
      };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
               console.log("Email sending failed");
        }
    });

}

//Email sending failed function
//Email sending failed function
function sendFailedEmail(email){
    console.log("failed email function called"); 
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Swap Status',
        text: `Your swap was unfortunately unsuccessful. Please contact our support team with your Order ID so they can assist you with your transaction.`
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
    // console.log(`Difference in hours of exchange ${exchange} and transaction ID ${id} = ${differenceInHours}`);
    // Check if the difference is exactly 48 hours
    return differenceInHours >= 48;
  }

// This Function counts number of trues from the object
function countTrueValues(obj) {
    return Object.values(obj).filter(value => value === true).length;
  }

  //This function replaces placeholder with another place holder {}
  function replacePlaceholder(url) {
    if (url == null || url == "") {
        return null;
    } else {
        return url.replace('%1$s', '{}').replace('$$', '{}');
    }
}

   // Function that appends hash in transaction url
   function replaceOrAppendHash(url, transactionHash) {
    if (!url || !transactionHash) return null; // Check for null/undefined input
  
    if (url.includes('{}')) {
      // Replace '{}' with transaction hash
      return url.replace('{}', transactionHash);
    } else {
      // Check if the URL ends with '/'
      if (!url.endsWith('/')) {
        url += '/'; // Add '/' at the end if not present
      }
      // Append the transaction hash after the '/'
      return url + transactionHash;
    }
  }



// *********************** Cron Job for updating coins in database ************************* //

  cron.schedule(`*/10 * * * *`,  ()=>{

            const changelly=async()=>{
                db.query('SELECT * FROM coins_data', async (error, coins)=>{
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
                        method: "getCurrenciesFull",
                        params: {
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
                        if(error){
                            console.log("Error occured while fetching coins from Changelly api");
                            return;
                        }
                        const data = await JSON.parse(response.body);
                        const apiCoins = data.result;
                        apiCoins.map((apiCoin, index)=>{
                            const matchCoinsTicker = coins.find(coin => apiCoin.ticker === coin.ticker);
                            let ticker = apiCoin.ticker;
                            let logo = apiCoin.image;
                            let tx_explorer = replacePlaceholder(apiCoin.transactionUrl);
                            if(!matchCoinsTicker && apiCoin.enabled==true){
                                let exchanges = JSON.stringify({changelly:true,changenow:false,changehero:false,exolix:false,stealthex:false,letsexchange:false,godex:false,simpleswap:false});
                                db.query('INSERT INTO coins_data (ticker, logo, tx_explorer, exchanges, alert) VALUES (?, ?, ?, ?, ?)',[ticker, logo, tx_explorer, exchanges, 1], (error, coins)=>{});
                            }else if(matchCoinsTicker && apiCoin.enabled==true){
                                let exchanges = JSON.parse(matchCoinsTicker.exchanges);
                                exchanges.changelly = true;
                                let trueCount=countTrueValues(exchanges);
                                let alert=trueCount<8?1:0;
                                if((matchCoinsTicker.tx_explorer==null || matchCoinsTicker.tx_explorer=="") && (tx_explorer!=null && tx_explorer!="") ){
                                    db.query('UPDATE coins_data set exchanges=?, tx_explorer=?, alert=?  WHERE id=?',[JSON.stringify(exchanges), tx_explorer, alert, matchCoinsTicker.id], (error, result)=>{
                                        if(error){
                                            console.log("Error updating changelly exchange status in database 1", error);
                                        }
                                    });
                                }else{
                                    db.query('UPDATE coins_data set exchanges=?, alert=?  WHERE id=?',[JSON.stringify(exchanges), alert, matchCoinsTicker.id], (error, result)=>{
                                        if(error){
                                            console.log("Error updating changelly exchange status in database 2", error);
                                        }
                                    });
                                }
                            }
                        })
        
                      })
                    
                    
                } catch (error) {
                    console.log("Error calling changelly currency api");
                }    
                })           
            };

            const changenow=async()=>{
                db.query('SELECT * FROM coins_data', async (error, coins)=>{
                try {
                    const url="https://api.changenow.io/v2/exchange/currencies?active=&flow=standard&buy=&sell=";
                    const response = await fetch(url);
                    const data = await response.json(response);
                    const apiCoins = data;

                    apiCoins.map((apiCoin, index)=>{
                        let ticker = apiCoin.ticker;
                        const matchCoinsTicker = coins.find(coin => ticker === coin.ticker);
                        let logo = apiCoin.image;
                        let tx_explorer = replacePlaceholder(null);
                        if(!matchCoinsTicker){
                            let exchanges = JSON.stringify({changelly:false, changenow:true, changehero:false, exolix:false, stealthex:false, letsexchange:false, godex:false, simpleswap:false});
                            db.query('INSERT INTO coins_data (ticker, logo, tx_explorer, exchanges, alert) VALUES (?, ?, ?, ?, ?)',[ticker, logo, tx_explorer, exchanges, 1], (error, coins)=>{
                                if(error){
                                    console.log("Error Inserting changenow Coin Data");
                                }
                            });
                        }else if(matchCoinsTicker){
                            let exchanges = JSON.parse(matchCoinsTicker.exchanges);
                            exchanges.changenow = true;
                            let trueCount=countTrueValues(exchanges);
                            let alert=trueCount<8?1:0;
                            if((matchCoinsTicker.tx_explorer==null || matchCoinsTicker.tx_explorer=="") && (tx_explorer!=null && tx_explorer!="") ){
                                db.query('UPDATE coins_data set exchanges=?, tx_explorer=?, alert=?  WHERE id=?',[JSON.stringify(exchanges), tx_explorer, alert, matchCoinsTicker.id], (error, result)=>{
                                    if(error){
                                        console.log("Error updating changenow exchange status in database", error);
                                    }
                                });
                            }else{
                                db.query('UPDATE coins_data set exchanges=?, alert=?  WHERE id=?',[JSON.stringify(exchanges), alert, matchCoinsTicker.id], (error, result)=>{
                                    if(error){
                                        console.log("Error updating changenow exchange status in database", error);
                                    }
                                });
                            }
                        }
                    })
                
            } catch (error) {
                console.log("Error calling changenow currency api", error);
            } 
                })
            };

            const changehero=async()=>{
                db.query('SELECT * FROM coins_data', async (error, coins)=>{
                try {
                    const url = `https://api.changehero.io/v2/`;
            
        const params = {
      
          jsonrpc: "2.0",
          method: "getCurrenciesFull",
          params:{
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
            
                    const apiCoins = data.result;

                    apiCoins.map((apiCoin, index)=>{
                        let ticker = apiCoin.name;
                        const matchCoinsTicker = coins.find(coin => ticker === coin.ticker);
                        let logo = apiCoin.image;
                        let tx_explorer = replacePlaceholder(apiCoin.transactionUrl);
                        if(!matchCoinsTicker){
                            let exchanges = JSON.stringify({changelly:false, changenow:false, changehero:true, exolix:false, stealthex:false, letsexchange:false, godex:false, simpleswap:false});
                            db.query('INSERT INTO coins_data (ticker, logo, tx_explorer, exchanges, alert) VALUES (?, ?, ?, ?, ?)',[ticker, logo, tx_explorer, exchanges, 1], (error, coins)=>{
                                if(error){
                                    console.log("Error Inserting changehero Coin Data");
                                }
                            });
                        }else if(matchCoinsTicker){
                            let exchanges = JSON.parse(matchCoinsTicker.exchanges);
                            exchanges.changehero = true;
                            let trueCount=countTrueValues(exchanges);
                            let alert=trueCount<8?1:0;
                            if((matchCoinsTicker.tx_explorer==null || matchCoinsTicker.tx_explorer=="") && (tx_explorer!=null && tx_explorer!="") ){
                                db.query('UPDATE coins_data set exchanges=?, tx_explorer=?, alert=?  WHERE id=?',[JSON.stringify(exchanges), tx_explorer, alert, matchCoinsTicker.id], (error, result)=>{
                                    if(error){
                                        console.log("Error updating changehero exchange status in database", error);
                                    }
                                });
                            }else{
                                db.query('UPDATE coins_data set exchanges=?, alert=?  WHERE id=?',[JSON.stringify(exchanges), alert, matchCoinsTicker.id], (error, result)=>{
                                    if(error){
                                        console.log("Error updating changehero exchange status in database", error);
                                    }
                                });
                            }
                        }
                    })
                
            } catch (error) {
                console.log("Error calling changehero currency api", error);
            } 
        });
            };
            
            const stealthex=async()=>{
                db.query('SELECT * FROM coins_data', async (error, coins)=>{
                try {

                        const url = `https://api.stealthex.io/api/v2/currency?api_key=${process.env.STEALTHEX}&fixed=boolean`;
        
                        const options = {
                        method: "GET",
                        headers: {
                        "Content-Type": "application/json",
                            },
                        }
      
                        const response = await fetch(url, options)
      
                        const data = await response.json();
                        const apiCoins = data;
                        apiCoins.map((apiCoin, index)=>{
                            if(apiCoin.symbol){
                                let ticker = apiCoin.symbol;
                            const matchCoinsTicker = coins.find(coin => ticker === coin.ticker);
                            let logo = apiCoin.image;
                            let tx_explorer = replacePlaceholder(apiCoin.tx_explorer);
                            if(!matchCoinsTicker){
                                let exchanges = JSON.stringify({changelly:false,changenow:false,changehero:false,exolix:false,stealthex:true,letsexchange:false,godex:false,simpleswap:false});
                                db.query('INSERT INTO coins_data (ticker, logo, tx_explorer, exchanges, alert) VALUES (?, ?, ?, ?, ?)',[ticker, logo, tx_explorer, exchanges, 1], (error, coins)=>{
                                    if(error){
                                        console.log("Error Inserting stealthex Coin Data");
                                    }
                                });
                            }else if(matchCoinsTicker){
                                let exchanges = JSON.parse(matchCoinsTicker.exchanges);
                                exchanges.stealthex = true;
                                let trueCount=countTrueValues(exchanges);
                                let alert=trueCount<8?1:0;
                                if((matchCoinsTicker.tx_explorer==null || matchCoinsTicker.tx_explorer=="") && (tx_explorer!=null && tx_explorer!="") ){
                                    db.query('UPDATE coins_data set exchanges=?, tx_explorer=?, alert=?  WHERE id=?',[JSON.stringify(exchanges), tx_explorer, alert, matchCoinsTicker.id], (error, result)=>{
                                        if(error){
                                            console.log("Error updating stealthex exchange status in database", error);
                                        }
                                    });
                                }else{
                                    db.query('UPDATE coins_data set exchanges=?, alert=?  WHERE id=?',[JSON.stringify(exchanges), alert, matchCoinsTicker.id], (error, result)=>{
                                        if(error){
                                            console.log("Error updating stealthex exchange status in database");
                                        }
                                    });
                                }
                            }
                        }
                    })
                    
                } catch (error) {
                    console.log("Error calling stealthex currency api", error);
                }   
            })
            };

            const letsexchange=async()=>{
                db.query('SELECT * FROM coins_data', async (error, coins)=>{

                try {

                const url = `https://api.letsexchange.io/api/v1/coins`;
        
                const options = {
                    method: "GET",
                    headers: {
                    "Content-Type": "application/json",
                    "Authorization": `${process.env.LETSEXCHANGE}`,
                    "Accept": "application/json",
                },
            }
      
                    const response = await fetch(url, options);
      
                    const data = await response.json();

                    const apiCoins = data;
                    apiCoins.map((apiCoin, index)=>{
                        let ticker = apiCoin.code.toLowerCase();
                        const matchCoinsTicker = coins.find(coin => ticker === coin.ticker);
                        let logo = apiCoin.icon;
                        let tx_explorer = replacePlaceholder(apiCoin.explorer);
                        if(!matchCoinsTicker){
                            let exchanges = JSON.stringify({changelly:false, changenow:false, changehero:false, exolix:false, stealthex:false, letsexchange:true, godex:false, simpleswap:false});
                            db.query('INSERT INTO coins_data (ticker, logo, tx_explorer, exchanges, alert) VALUES (?, ?, ?, ?, ?)',[ticker, logo, tx_explorer, exchanges, 1], (error, coins)=>{
                                if(error){
                                    console.log("Error Inserting letsexchange Coin Data");
                                }
                            });
                        }else if(matchCoinsTicker){
                            let exchanges = JSON.parse(matchCoinsTicker.exchanges);
                            exchanges.letsexchange = true;
                            let trueCount=countTrueValues(exchanges);
                            let alert=trueCount<8?1:0;
                            if((matchCoinsTicker.tx_explorer==null || matchCoinsTicker.tx_explorer=="") && (tx_explorer!=null && tx_explorer!="") ){
                                db.query('UPDATE coins_data set exchanges=?, tx_explorer=?, alert=?  WHERE id=?',[JSON.stringify(exchanges), tx_explorer, alert, matchCoinsTicker.id], (error, result)=>{
                                    if(error){
                                        console.log("Error updating letsexchange exchange status in database", error);
                                    }
                                });
                            }else{
                                db.query('UPDATE coins_data set exchanges=?, alert=?  WHERE id=?',[JSON.stringify(exchanges), alert, matchCoinsTicker.id], (error, result)=>{
                                    if(error){
                                        console.log("Error updating letsexchange exchange status in database", error);
                                    }
                                });
                            }
                        }
                    })
                
            } catch (error) {
                console.log("Error calling letsexchange currency api", error);
            }   
        })
        };

            const godex=async()=>{
                db.query('SELECT * FROM coins_data', async (error, coins)=>{

                try {


        const url = `https://api.godex.io/api/v1/coins`;
        
        const options = {
          method: "GET",
          headers: {
            "Accept": "application/json",
          },
        }
      
        const response = await fetch(url, options)
      
        const data = await response.json();
    
                        const apiCoins = data;
                        apiCoins.map((apiCoin, index)=>{
                            let ticker = apiCoin.code.toLowerCase();
                            const matchCoinsTicker = coins.find(coin => ticker === coin.ticker);
                            let logo = apiCoin.icon;
                            let tx_explorer = replacePlaceholder(apiCoin.networks[0].explorer);
                            if(!matchCoinsTicker){
                                let exchanges = JSON.stringify({changelly:false, changenow:false, changehero:false, exolix:false, stealthex:false, letsexchange:false, godex:true, simpleswap:false});
                                db.query('INSERT INTO coins_data (ticker, logo, tx_explorer, exchanges, alert) VALUES (?, ?, ?, ?, ?)',[ticker, logo, tx_explorer, exchanges, 1], (error, coins)=>{
                                    if(error){
                                        console.log("Error Inserting Godex Coin Data");
                                    }
                                });
                            }else if(matchCoinsTicker){
                                let exchanges = JSON.parse(matchCoinsTicker.exchanges);
                                exchanges.godex = true;
                                let trueCount=countTrueValues(exchanges);
                                let alert=trueCount<8?1:0;
                                if((matchCoinsTicker.tx_explorer==null || matchCoinsTicker.tx_explorer=="") && (tx_explorer!=null && tx_explorer!="") ){
                                    db.query('UPDATE coins_data set exchanges=?, tx_explorer=?, alert=?  WHERE id=?',[JSON.stringify(exchanges), tx_explorer, alert, matchCoinsTicker.id], (error, result)=>{
                                        if(error){
                                            console.log("Error updating Godex exchange status in database", error);
                                        }
                                    });
                                }else{
                                    db.query('UPDATE coins_data set exchanges=?, alert=?  WHERE id=?',[JSON.stringify(exchanges), alert, matchCoinsTicker.id], (error, result)=>{
                                        if(error){
                                            console.log("Error updating Godex exchange status in database", error);
                                        }
                                    });
                                }
                            }
                        })
                    
                } catch (error) {
                    console.log("Error calling Godex currency api", error);
                }  
            })
            };

            const exolix=async()=>{
                db.query('SELECT * FROM coins_data', async (error, coins)=>{

                try {
                                    const url = `https://exolix.com/api/v2/currencies?withNetworks=true`;
        
                                    const options = {
                                        method: "GET",
                                        headers: {
                                       "Content-Type": "application/json",
                                        },
                                    }
                                    const response = await fetch(url, options)
                                    const data = await response.json();
                                    const apiCoins = data.data;

                                    apiCoins.map((apiCoin, index)=>{
                                        let ticker = apiCoin.code.toLowerCase();
                                        const matchCoinsTicker = coins.find(coin => ticker === coin.ticker);
                                        let logo = apiCoin.icon;
                                        let tx_explorer = replacePlaceholder(apiCoin.networks[0].blockExplorer);
                                        if(!matchCoinsTicker){
                                            let exchanges = JSON.stringify({changelly:false, changenow:false, changehero:false, exolix:true, stealthex:false, letsexchange:false, godex:false, simpleswap:false});
                                            db.query('INSERT INTO coins_data (ticker, logo, tx_explorer, exchanges, alert) VALUES (?, ?, ?, ?, ?)',[ticker, logo, tx_explorer, exchanges, 1], (error, coins)=>{
                                                if(error){
                                                    console.log("Error Inserting exolix Coin Data");
                                                }
                                            });
                                        }else if(matchCoinsTicker){
                                            let exchanges = JSON.parse(matchCoinsTicker.exchanges);
                                            exchanges.exolix = true;
                                            let trueCount=countTrueValues(exchanges);
                                            let alert=trueCount<8?1:0;
                                            if((matchCoinsTicker.tx_explorer==null || matchCoinsTicker.tx_explorer=="") && (tx_explorer!=null && tx_explorer!="") ){
                                                db.query('UPDATE coins_data set exchanges=?, tx_explorer=?, alert=?  WHERE id=?',[JSON.stringify(exchanges), tx_explorer, alert, matchCoinsTicker.id], (error, result)=>{
                                                    if(error){
                                                        console.log("Error updating exolix exchange status in database", error);
                                                    }
                                                });
                                            }else{
                                                db.query('UPDATE coins_data set exchanges=?, alert=?  WHERE id=?',[JSON.stringify(exchanges), alert, matchCoinsTicker.id], (error, result)=>{
                                                    if(error){
                                                        console.log("Error updating exolix exchange status in database", error);
                                                    }
                                                });
                                            }
                                        }
                                    })
                                
                            } catch (error) {
                                console.log("Error calling exolix currency api", error);
                            } 
                        })
            };

            const simpleswap=async()=>{
                db.query('SELECT * FROM coins_data', async (error, coins)=>{

                try {
                    const url = `https://api.simpleswap.io/get_all_currencies?api_key=${process.env.SIMPLESWAP}`;
        
                    const options = {
                      method: "GET",
                      headers: {
                        "Accept": "application/json",
                      },
                    }
                  
                    const response = await fetch(url, options)
                  
                    const data = await response.json();
            
                    const apiCoins = data;

                    apiCoins.map((apiCoin, index)=>{
                        let ticker = apiCoin.symbol;
                        const matchCoinsTicker = coins.find(coin => ticker === coin.ticker);
                        let logo = apiCoin.image;
                        let tx_explorer = replacePlaceholder(apiCoin.tx_explorer);
                        if(!matchCoinsTicker){
                            let exchanges = JSON.stringify({changelly:false, changenow:false, changehero:false, exolix:false, stealthex:false, letsexchange:false, godex:false, simpleswap:true});
                            db.query('INSERT INTO coins_data (ticker, logo, tx_explorer, exchanges, alert) VALUES (?, ?, ?, ?, ?)',[ticker, logo, tx_explorer, exchanges, 1], (error, coins)=>{
                                if(error){
                                    console.log("Error Inserting simpleswap Coin Data");
                                }
                            });
                        }else if(matchCoinsTicker){
                            let exchanges = JSON.parse(matchCoinsTicker.exchanges);
                            exchanges.simpleswap = true;
                            let trueCount=countTrueValues(exchanges);
                            let alert=trueCount<8?1:0;
                            if((matchCoinsTicker.tx_explorer==null || matchCoinsTicker.tx_explorer=="") && (tx_explorer!=null && tx_explorer!="") ){
                                db.query('UPDATE coins_data set exchanges=?, tx_explorer=?, alert=?  WHERE id=?',[JSON.stringify(exchanges), tx_explorer, alert, matchCoinsTicker.id], (error, result)=>{
                                    if(error){
                                        console.log("Error updating simpleswap exchange status in database", error);
                                    }
                                });
                            }else{
                                db.query('UPDATE coins_data set exchanges=?, alert=?  WHERE id=?',[JSON.stringify(exchanges), alert, matchCoinsTicker.id], (error, result)=>{
                                    if(error){
                                        console.log("Error updating simpleswap exchange status in database", error);
                                    }
                                });
                            }
                        }
                    })
                
            } catch (error) {
                console.log("Error calling simpleswap currency api", error);
            } 
        })
            };

            setTimeout(()=>{
                changenow();
           }, 1 * 1000);
           setTimeout(()=>{
            changehero();
           }, 1 * 60000);
           setTimeout(()=>{
            stealthex();
           }, 2 * 60000);
           setTimeout(()=>{
            letsexchange();
           }, 3 * 60000);
           setTimeout(()=>{
            godex();
           }, 4 * 60000);
           setTimeout(()=>{
            exolix();
           }, 5 * 60000);
           setTimeout(()=>{
            simpleswap();
           }, 6 * 60000);
           setTimeout(()=>{
            changelly();
       }, 7 * 60000);
        })     


// *********************** Running Cron Job for updating exchange statuses in database ************************* //

db.query('SELECT * FROM cron_job WHERE type=?',["status/removal cron"], (error, result)=>{
        
    if(error){
        console.log("Cron job failed");
    }else{

        cron.schedule(`${result[0].second} ${result[0].minute} ${result[0].hour} ${result[0].date_of_month} ${result[0].month} ${result[0].day_of_week}`, ()=>{

            //Qyery for fetching coins fetching coins from database
            db.query('SELECT * FROM coins_data', (error, coins)=>{
                if(error){
                    console.log("Error fetching coins from database")
                }else{
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
                                                    if (error) {
                                                        console.log("Changelly Status Api Call Error", error);          
                                                        // Return here only stops further execution inside this callback, not the parent function
                                                        return;
                                                      }
                                                    //This logic checks if time difference is greater than two days and status is not finished and successfull then delete transaction
                                                    if(isValid && swap.status!="finished"){
                                                        db.query("DELETE FROM changelly_transactions WHERE transaction_id=?",[swap.transaction_id],(error,result)=>{
                                                            if(error){
                                                                console.log("Error deleting transaction Changelly Transation");
                                                            }
                                                        })
                                                    }else{
                                                    const data = await JSON.parse(response.body);
                                                    //Logic for updating Exchange Start Time
                                                    if(data.result[0].status && (data.result[0].status=="confirming" || data.result[0].status=="confirmation" || data.result[0].status=="confirmed")){
                                                        db.query(`UPDATE changelly_transactions SET start_time=NOW() WHERE transaction_id=?`[swap.transaction_id],(error, result)=>{
                                                            if(error){
                                                                // console.log("Error 1 Loop:", index)
                                                                // console.log("Transaction ID:", swap.transaction_id)
                                                            }})
                                                    }
                                                    if(data.result[0].status && data.result[0].payoutHash){
                                                        let tx_explorer;
                                                        const matchCoinsTicker = coins.find(coin => swap.get_coin === coin.ticker);
                                                        if(data.result[0].payoutHashLink==null || data.result[0].payoutHashLink==""){
                                                            tx_explorer=replaceOrAppendHash(matchCoinsTicker.tx_explorer, data.result[0].payoutHash);
                                                        }else{
                                                            tx_explorer=data.result[0].payoutHashLink;
                                                        }

                                                    db.query(`UPDATE changelly_transactions SET status=?, tx_hash=?, tx_hash_link=?, sell_amount=?, get_amount=?, completion_time=NOW(), rate=? WHERE transaction_id=?`,[data.result[0].status, data.result[0].payoutHash, tx_explorer, data.result[0].amountFrom, data.result[0].amountTo, data.result[0].rate, swap.transaction_id],(error, result)=>{
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
                                    //Logic for updating Exchange Start Time
                                    if(data.status && (data.status=="confirming" || data.status=="confirmation" || data.status=="confirmed")){
                                        db.query(`UPDATE changenow_transactions SET start_time=NOW() WHERE transaction_id=?`[swap.transaction_id],(error, result)=>{
                                                if(error){
                                                    // console.log("Error 1 Loop:", index)
                                                    // console.log("Transaction ID:", swap.transaction_id)
                                                }})
                                    }

                                    if(data.status && data.payoutHash && data.payoutHash!=""){
                                    let tx_explorer;
                                    const matchCoinsTicker = coins.find(coin => swap.get_coin === coin.ticker);
                                    if(matchCoinsTicker!=null){
                                        tx_explorer=replaceOrAppendHash(matchCoinsTicker.tx_explorer, data.payoutHash);
                                    }else{
                                        tx_explorer=null;
                                    }
                                        db.query(`UPDATE changenow_transactions SET status=?, tx_hash=?, tx_hash_link=?, sell_amount=?, get_amount=?, completion_time=NOW() WHERE transaction_id=?`,[data.status, data.payoutHash, tx_explorer, data.amountFrom , data.amountTo, swap.transaction_id],(error, result)=>{
                                            if(error){
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
                                if(data.result[0].status && (data.result[0].status=="confirming" || data.result[0].status=="confirmation" || data.result[0].status=="confirmed")){
                                    db.query(`UPDATE changehero_transactions SET start_time=NOW() WHERE transaction_id=?`[swap.transaction_id],(error, result)=>{
                                            if(error){
                                                // console.log("Error 1 Loop:", index)
                                                // console.log("Transaction ID:", swap.transaction_id)
                                            }})
                                    }
                                        if(data.result[0].status && data.result[0].payoutHash && data.result[0].payoutHash!=null){
                                            let tx_explorer;
                                            const matchCoinsTicker = coins.find(coin => swap.get_coin === coin.ticker);
                                            if(matchCoinsTicker!=null){
                                                tx_explorer=replaceOrAppendHash(matchCoinsTicker.tx_explorer, data.result[0].payoutHash);
                                            }else{
                                                tx_explorer=null;
                                            }
                                            db.query(`UPDATE changehero_transactions SET status=?, tx_hash=?, tx_hash_link=?, sell_amount=?, get_amount=?, completion_time=NOW() WHERE transaction_id=?`,[data.result[0].status, data.result[0].payoutHash, tx_explorer, data.result[0].amountFrom && data.result[0].amountFrom, data.result[0].amountTo && data.result[0].amountTo,  swap.transaction_id],(error, result)=>{
                                                if(error){
                                                    // console.log("Error 1 Loop:", index)
                                                    // console.log("Transaction ID:", swap.transaction_id);
                                                    // console.log(error);
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
                                if(swap.status!="finished" && swap.status!="success"){
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
                                if(data.status && (data.status=="confirming" || data.status=="confirmation" || data.status=="confirmed")){
                                    db.query(`UPDATE exolix_transactions SET start_time=NOW() WHERE transaction_id=?`[swap.transaction_id],(error, result)=>{
                                            if(error){
                                                // console.log("Error 1 Loop:", index)
                                                // console.log("Transaction ID:", swap.transaction_id)
                                            }})
                                }
                                    if(data.status && data.hashOut.hash && data.hashOut.hash!=null){
                                        let tx_explorer;
                                        const matchCoinsTicker = coins.find(coin => swap.get_coin === coin.ticker);
                                        if(data.hashOut.link==null){
                                            tx_explorer=replaceOrAppendHash(matchCoinsTicker.tx_explorer, data.hashOut.hash);
                                        }else{
                                            tx_explorer=data.hashOut.link;
                                        }
                                        db.query(`UPDATE exolix_transactions SET status=?, tx_hash=?, tx_hash_link=?, sell_amount=?, get_amount=?, completion_time=NOW(), rate=? WHERE transaction_id=?`,[data.status, data.hashOut.hash, tx_explorer, data.amount, data.amountTo, data.rate, swap.transaction_id],(error, result)=>{
                                            if(error){
                                                // console.log("Error 1 Loop:", index)
                                                console.log("Transaction ID:", error);
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
                              
                                const response = await fetch(url, options);
                              
                                const data = await response.json();
                                if(data.status && (data.status=="confirming" || data.status=="confirmation" || data.status=="confirmed")){
                                    db.query(`UPDATE godex_transactions SET start_time=NOW() WHERE transaction_id=?`[swap.transaction_id],(error, result)=>{
                                            if(error){
                                                // console.log("Error 1 Loop:", index)
                                                // console.log("Transaction ID:", swap.transaction_id)
                                            }})
                                }
                                    if(data.status && data.hash_out && data.hash_out!==null){
                                        let tx_explorer;
                                        const matchCoinsTicker = coins.find(coin => swap.get_coin === coin.ticker);
                                        if(data.coin_to_explorer_url==null){
                                            tx_explorer=replaceOrAppendHash(matchCoinsTicker.tx_explorer, data.hash_out);
                                        }else{
                                            tx_explorer=replaceOrAppendHash(data.coin_to_explorer_url, data.hash_out);
                                        }
                                        db.query(`UPDATE godex_transactions SET status=?, tx_hash=?, tx_hash_link=?, sell_amount=?, get_amount=?, completion_time=NOW(), rate=? WHERE transaction_id=?`,[data.status, data.hash_out, tx_explorer, data.deposit_amount ,data.real_withdrawal_amount,data.rate, swap.transaction_id],(error, result)=>{
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
                                    if(data.status && (data.status=="confirming" || data.status=="confirmation" || data.status=="confirmed")){
                                        db.query(`UPDATE letsexchange_transactions SET start_time=NOW() WHERE transaction_id=?`[swap.transaction_id],(error, result)=>{
                                                if(error){
                                                    // console.log("Error 1 Loop:", index)
                                                    // console.log("Transaction ID:", swap.transaction_id)
                                                }})
                                    }
                                    if(data.status && data.hash_out && data.hash_out!=null){
                                        let tx_explorer;
                                        const matchCoinsTicker = coins.find(coin => swap.get_coin === coin.ticker);
                                        if(data.coin_to_explorer_url==null){
                                            tx_explorer=replaceOrAppendHash(matchCoinsTicker.tx_explorer, data.hash_out);
                                        }else{
                                            tx_explorer=replaceOrAppendHash(data.coin_to_explorer_url, data.hash_out);
                                        }
                                            db.query(`UPDATE letsexchange_transactions SET status=?, tx_hash=?, tx_hash_link=?, sell_amount=?, get_amount=?, completion_time=NOW(), rate=? WHERE transaction_id=?`,[data.status, data.hash_out, tx_explorer, data.real_deposit_amount, data.real_withdrawal_amount, data.rate,  swap.transaction_id],(error, result)=>{
                                                if(error){
                                                    console.log(error);
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
                                    if(data.status && (data.status=="confirming" || data.status=="confirmation" || data.status=="confirmed")){
                                        db.query(`UPDATE stealthex_transactions SET start_time=NOW() WHERE transaction_id=?`[swap.transaction_id],(error, result)=>{
                                                if(error){
                                                    // console.log("Error 1 Loop:", index)
                                                    // console.log("Transaction ID:", swap.transaction_id)
                                                }})
                                    }   
                                        let keys = Object.keys(data.currencies); // Get the keys as an array
                                        let keyAtIndex = keys[1]; // Get the key at the specified index
                                        let innerObject = data.currencies[keyAtIndex]; // Access the inner object using the key
        
                                        if(data.status && data.tx_to && data.tx_to!=""){

                                            let tx_explorer;
                                            const matchCoinsTicker = coins.find(coin => swap.get_coin === coin.ticker);
                                            if(innerObject.tx_explorer==null || innerObject.tx_explorer==''){
                                                tx_explorer=replaceOrAppendHash(matchCoinsTicker.tx_explorer, data.tx_to);
                                            }else{
                                                tx_explorer=replaceOrAppendHash(innerObject.tx_explorer, data.tx_to);
                                            }

                                            db.query(`UPDATE stealthex_transactions SET status=?, tx_hash=?, tx_hash_link=?, sell_amount=?, get_amount=?, completion_time=NOW() WHERE transaction_id=?`,[data.status, data.tx_to, tx_explorer, data.amount_from, data.amount_to, swap.transaction_id],(error, result)=>{
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
                                    if(data.status && (data.status=="confirming" || data.status=="confirmation" || data.status=="confirmed")){
                                        db.query(`UPDATE simpleswap_transactions SET start_time=NOW() WHERE transaction_id=?`[swap.transaction_id],(error, result)=>{
                                                if(error){
                                                    // console.log("Error 1 Loop:", index)
                                                    // console.log("Transaction ID:", swap.transaction_id)
                                                }})
                                    }                                        
                                        let keys = Object.keys(data.currencies); // Get the keys as an array
                                        let keyAtIndex = keys[1]; // Get the key at the specified index
                                        let innerObject = data.currencies[keyAtIndex]; // Access the inner object using the key
        
                                        if(data.status && data.tx_to && data.tx_to!=""){

                                            let tx_explorer;
                                            const matchCoinsTicker = coins.find(coin => swap.get_coin === coin.ticker);
                                            if(innerObject.tx_explorer==null || innerObject.tx_explorer==""){
                                                tx_explorer=replaceOrAppendHash(matchCoinsTicker.tx_explorer, data.tx_to);
                                            }else{
                                                tx_explorer=replaceOrAppendHash(innerObject.tx_explorer, data.tx_to);
                                            }

                                            db.query(`UPDATE simpleswap_transactions SET status=?, tx_hash=?, tx_hash_link=?, sell_amount=?, get_amount=?, completion_time=NOW() WHERE transaction_id=?`,[data.status, data.tx_to, tx_explorer, data.amount_from, data.amount_to, swap.transaction_id],(error, result)=>{
                                                if(error){
                                                    // console.log("Error 1 Loop:", index);
                                                    // console.log("Transaction ID:", swap.transaction_id);
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
                }
            })
            })
    }

})

// *********************** Running Cron Job for sending success and Fail emails ************************* //
cron.schedule(`10 * * * * *`, ()=>{


    db.query('SELECT * FROM changelly_transactions', (error, result)=>{
        if(result.length>0){
                result.map((swap)=>{

                    if(swap.status=="finished" && swap.status_email==0 && swap.email!=null){
                        sendSuccessEmail(swap.email, swap.transaction_id, "./views/images/Changelly Offer.png", "Changelly Offer.png", swap.tx_hash, swap.tx_hash_link, swap.sell_coin, swap.get_coin, swap.sell_coin_name, swap.get_coin_name, swap.transaction_type, swap.sell_amount, swap.get_amount, swap.sell_coin_logo, swap.get_coin_logo, swap.completion_time, swap.deposit_address, swap.recipient_address);
                        db.query("UPDATE changelly_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                            if(error){
                                console.log("Changelly email status update unsuccessful of transaction id: ", swap.transaction_id);
                            }
                        })
                    // }else if(swap.status=="failed" || swap.status=="refunded" || swap.status=="overdue" || swap.status=="expired"){
                    }else if(swap.status=="failed" || swap.status=="refunded"){
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
                    sendSuccessEmail(swap.email, swap.transaction_id, "./views/images/ChangeNow Offer.png", "ChangeNow Offer.png", swap.tx_hash, swap.tx_hash_link, swap.sell_coin, swap.get_coin, swap.sell_coin_name, swap.get_coin_name, swap.transaction_type, swap.sell_amount, swap.get_amount, swap.sell_coin_logo, swap.get_coin_logo, swap.completion_time, swap.deposit_address, swap.recipient_address);
                    db.query("UPDATE changenow_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                        if(error){
                            console.log("Changenow email status update unsuccessful of transaction id: ", swap.transaction_id);
                        }
                    })
                // }else if(swap.status=="failed" || swap.status=="refunded" || swap.status=="overdue" || swap.status=="expired"){
                }else if(swap.status=="failed" || swap.status=="refunded"){
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
                    sendSuccessEmail(swap.email, swap.transaction_id, "./views/images/Change Hero Offer.png", "Change Hero Offer.png", swap.tx_hash, swap.tx_hash_link, swap.sell_coin, swap.get_coin, swap.sell_coin_name, swap.get_coin_name, swap.transaction_type, swap.sell_amount, swap.get_amount, swap.sell_coin_logo, swap.get_coin_logo, swap.completion_time, swap.deposit_address, swap.recipient_address);
                    db.query("UPDATE changehero_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                        if(error){
                            console.log("Changehero email status update unsuccessful of transaction id: ", swap.transaction_id);
                        }
                    })
                // }else if(swap.status=="failed" || swap.status=="refunded" || swap.status=="overdue" || swap.status=="expired"){
                }else if(swap.status=="failed" || swap.status=="refunded"){
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
                    sendSuccessEmail(swap.email, swap.transaction_id, "./views/images/Exolix Offer.png", "Exolix Offer.png", swap.tx_hash, swap.tx_hash_link, swap.sell_coin, swap.get_coin, swap.sell_coin_name, swap.get_coin_name, swap.transaction_type, swap.sell_amount, swap.get_amount, swap.sell_coin_logo, swap.get_coin_logo, swap.completion_time, swap.deposit_address, swap.recipient_address);
                    db.query("UPDATE exolix_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                        if(error){
                            console.log("Exolix email status update unsuccessful of transaction id: ", swap.transaction_id);
                        }
                    })
                // }else if(swap.status=="failed" || swap.status=="refunded" || swap.status=="overdue" || swap.status=="expired"){
                }else if(swap.status=="failed" || swap.status=="refunded"){
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
                    sendSuccessEmail(swap.email, swap.transaction_id, "./views/images/Godex Offers.png", "Godex Offers.png", swap.tx_hash, swap.tx_hash_link, swap.sell_coin, swap.get_coin, swap.sell_coin_name, swap.get_coin_name, swap.transaction_type, swap.sell_amount, swap.get_amount, swap.sell_coin_logo, swap.get_coin_logo, swap.completion_time, swap.deposit_address, swap.recipient_address);
                    db.query("UPDATE godex_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                        if(error){
                            console.log("Godex email status update unsuccessful of transaction id: ", swap.transaction_id);
                        }
                    })
                // }else if(swap.status=="failed" || swap.status=="refunded" || swap.status=="overdue" || swap.status=="expired"){
                }else if(swap.status=="failed" || swap.status=="refunded"){
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
                    sendSuccessEmail(swap.email, swap.transaction_id, "./views/images/LetsExchange Offer.png", "LetsExchange Offer.png", swap.tx_hash, swap.tx_hash_link, swap.sell_coin, swap.get_coin, swap.sell_coin_name, swap.get_coin_name, swap.transaction_type, swap.sell_amount, swap.get_amount, swap.sell_coin_logo, swap.get_coin_logo, swap.completion_time, swap.deposit_address, swap.recipient_address);
                    db.query("UPDATE letsexchange_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                        if(error){
                            console.log("Letsexchange email status update unsuccessful of transaction id: ", swap.transaction_id);
                        }
                    })
                // }else if(swap.status=="failed" || swap.status=="refunded" || swap.status=="overdue" || swap.status=="expired"){
                }else if(swap.status=="failed" || swap.status=="refunded"){
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
                    sendSuccessEmail(swap.email, swap.transaction_id, "./views/images/Stealthex Offer.png", "Stealthex Offer.png", swap.tx_hash, swap.tx_hash_link, swap.sell_coin, swap.get_coin, swap.sell_coin_name, swap.get_coin_name, swap.transaction_type, swap.sell_amount, swap.get_amount, swap.sell_coin_logo, swap.get_coin_logo, swap.completion_time, swap.deposit_address, swap.recipient_address);
                    db.query("UPDATE stealthex_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                        if(error){
                            console.log("Stealthex email status update unsuccessful of transaction id: ", swap.transaction_id);
                        }
                    })
                // }else if(swap.status=="failed" || swap.status=="refunded" || swap.status=="overdue" || swap.status=="expired"){
                }else if(swap.status=="failed" || swap.status=="refunded"){
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
                    sendSuccessEmail(swap.email, swap.transaction_id, "./views/images/SimpleSwap Offer.png", "SimpleSwap Offer.png", swap.tx_hash, swap.tx_hash_link, swap.sell_coin, swap.get_coin, swap.sell_coin_name, swap.get_coin_name, swap.transaction_type, swap.sell_amount, swap.get_amount, swap.sell_coin_logo, swap.get_coin_logo, swap.completion_time, swap.deposit_address, swap.recipient_address);
                    db.query("UPDATE simpleswap_transactions SET status_email=? WHERE transaction_id=?",[1, swap.transaction_id],(error,result)=>{
                        if(error){
                            console.log("Simpleswap email status update unsuccessful of transaction id: ", swap.transaction_id);
                        }
                    })
                // }else if(swap.status=="failed" || swap.status=="refunded" || swap.status=="overdue" || swap.status=="expired"){
                }else if(swap.status=="failed" || swap.status=="refunded"){
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


app.listen(port, () => {
    console.log(`Server listening at https://localhost:${port}`)
})
