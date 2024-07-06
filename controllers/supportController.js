import express from 'express';
import {db} from '../database/connectdb.js';
import {createLogger, format, transports} from 'winston';
const { combine, timestamp, printf } = format;

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
};

export default SupportController;