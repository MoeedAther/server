import express from 'express';
import {db} from '../database/connectdb.js';
import {createLogger, format, transports} from 'winston';
const { combine, timestamp, printf } = format;
import crypto from 'crypto';
import request from "request";

const app=express();

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

class SupportController{

    //*************************************** Support Links *****************************************//

    static changellySupportLinks=async(req,res)=>{
        let sql="SELECT * FROM exchange_links WHERE exchange_name=?";
        db.query(sql,["changelly"],(error, result)=>{
            if(error){
                logger.error(`Error: ${error}`)
            }
            console.log(result);
            res.json({exchange_name:result[0].exchange_name, slack:result[0].slack, gmail:result[0].gmail, telegram:result[0].telegram});
        })
    }

    static changenowSupportLinks=async(req,res)=>{
        let sql="SELECT * FROM exchange_links WHERE exchange_name=?";
        db.query(sql,["changenow"],(error, result)=>{
            if(error){
                logger.error(`Error: ${error}`)
            }
            res.json({exchange_name:result[0].exchange_name, slack:result[0].slack, gmail:result[0].gmail, telegram:result[0].telegram});
        })
    }

    static changeheroSupportLinks=async(req,res)=>{
        let sql="SELECT * FROM exchange_links WHERE exchange_name=?";
        db.query(sql,["changehero"],(error, result)=>{
            if(error){
                logger.error(`Error: ${error}`)
            }
            res.json({exchange_name:result[0].exchange_name, slack:result[0].slack, gmail:result[0].gmail, telegram:result[0].telegram});
        })
    }

    static letsexchangeSupportLinks=async(req,res)=>{
        let sql="SELECT * FROM exchange_links WHERE exchange_name=?";
        db.query(sql,["letsexchange"],(error, result)=>{
            if(error){
                logger.error(`Error: ${error}`)
            }
            res.json({exchange_name:result[0].exchange_name, slack:result[0].slack, gmail:result[0].gmail, telegram:result[0].telegram});
        })
    }

    static exolixSupportLinks=async(req,res)=>{
        let sql="SELECT * FROM exchange_links WHERE exchange_name=?";
        db.query(sql,["exolix"],(error, result)=>{
            if(error){
                logger.error(`Error: ${error}`)
            }
            res.json({exchange_name:result[0].exchange_name, slack:result[0].slack, gmail:result[0].gmail, telegram:result[0].telegram});
        })
    }

    static stealthexSupportLinks=async(req,res)=>{
        let sql="SELECT * FROM exchange_links WHERE exchange_name=?";
        db.query(sql,["stealthex"],(error, result)=>{
            if(error){
                logger.error(`Error: ${error}`)
            }
            res.json({exchange_name:result[0].exchange_name, slack:result[0].slack, gmail:result[0].gmail, telegram:result[0].telegram});
        })
    }

    static godexSupportLinks=async(req,res)=>{
        let sql="SELECT * FROM exchange_links WHERE exchange_name=?";
        db.query(sql,["godex"],(error, result)=>{
            if(error){
                logger.error(`Error: ${error}`)
            }
            res.json({exchange_name:result[0].exchange_name, slack:result[0].slack, gmail:result[0].gmail, telegram:result[0].telegram});
        })
    }

    static simpleswapSupportLinks=async(req,res)=>{
        let sql="SELECT * FROM exchange_links WHERE exchange_name=?";
        db.query(sql,["simpleswap"],(error, result)=>{
            if(error){
                logger.error(`Error: ${error}`)
            }
            res.json({exchange_name:result[0].exchange_name, slack:result[0].slack, gmail:result[0].gmail, telegram:result[0].telegram});
        })
    }

    static testApis=async(req,res)=>{
        // const privateKey = crypto.createPrivateKey({
        //     key: process.env.CHANGELLY_PRIVATE_KEY,
        //     format: "der",
        //     type: "pkcs8",
        //     encoding: "hex",
        //   });
        
        //   const publicKey = crypto.createPublicKey(privateKey).export({
        //     type: "pkcs1",
        //     format: "der",
        //   });
        
        //   const message = {
        //     jsonrpc: "2.0",
        //     id: "test",
        //     method: "getCurrenciesFull",
        //     params: {
        //     }
        //   };

        //   const signature = crypto.sign(
        //     "sha256",
        //     Buffer.from(JSON.stringify(message)),
        //     {
        //       key: privateKey,
        //       type: "pkcs8",
        //       format: "der",
        //     }
        //   );
        
        //   const params = {
        //     method: "POST",
        //     url: "https://api.changelly.com/v2",
        //     headers: {
        //       "Content-Type": "application/json",
        //       "X-Api-Key": crypto
        //         .createHash("sha256")
        //         .update(publicKey)
        //         .digest("base64"),
        //       "X-Api-Signature": signature.toString("base64"),
        //     },
        //     body: JSON.stringify(message),
        //   };

        
        //   request(params, async function (error, response) {
        //     const data = await JSON.parse(response.body);
        //     return res.json(data);
        //   })

        // const url = `https://api.changehero.io/v2/`;
            
        // const params = {
      
        //   jsonrpc: "2.0",
        //   method: "getCurrenciesFull",
        //   params:{
        //   }
        // }
      
        // const options = {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //     "api-key": `${process.env.CHANGEHERO}`
        //   },
        //   body: JSON.stringify(params)
      
        // }
      
        // const response = await fetch(url, options);
        // const data = await response.json();
        //             return res.json(data);

        // const url = `https://exolix.com/api/v2/currencies?withNetworks=true`;
        
        // const options = {
        //   method: "GET",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        // }
      
        // const response = await fetch(url, options)
      
        // const data = await response.json();
        // return res.json(data);


        // const url = `https://api.stealthex.io/api/v2/currency?api_key=${process.env.STEALTHEX}&fixed=boolean`;
        
        // const options = {
        //   method: "GET",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        // }
      
        // const response = await fetch(url, options)
      
        // const data = await response.json();
        // return res.json(data);

        // const url = `https://api.letsexchange.io/api/v1/coins`;
        
        // const options = {
        //   method: "GET",
        //   headers: {
        //     "Content-Type": "application/json",
        //     "Authorization": `${process.env.LETSEXCHANGE}`,
        //     "Accept": "application/json",
        //   },
        // }
      
        // const response = await fetch(url, options)
      
        // const data = await response.json();

        // return res.json(data);

        // const url = `https://api.godex.io/api/v1/coins`;
        
        // const options = {
        //   method: "GET",
        //   headers: {
        //     "Accept": "application/json",
        //   },
        // }
      
        // const response = await fetch(url, options)
      
        // const data = await response.json();

        // return res.json(data);

        // const url = `https://api.simpleswap.io/get_all_currencies?api_key=${process.env.SIMPLESWAP}`;
        
        // const options = {
        //   method: "GET",
        //   headers: {
        //     "Accept": "application/json",
        //   },
        // }
      
        // const response = await fetch(url, options)
      
        // const data = await response.json();

        // return res.json(data);

        // const url="https://api.changenow.io/v2/exchange/currencies?active=&flow=standard&buy=&sell=";
        // const response = await fetch(url);
        // const data = await response.json(response);
        // return res.json(data);

        // db.query('SELECT * FROM coins_data', (error, result)=>{
        //     let exchanges=JSON.parse(result[0].exchanges);
        //     exchanges.changelly=true;

        //     db.query('UPDATE coins_data set exchanges=? WHERE id=?',[JSON.stringify(exchanges), result[0].id], (error, result)=>{
        //         if(error){
        //             return res.json("Failed");
        //         }else{
        //             return res.json("Succeeded");
        //         }
        //     })
        // })

    }
};

export default SupportController;