import express from 'express';
import {db} from '../database/connectdb.js';
import {createLogger, format, transports} from 'winston';
const { combine, timestamp, printf } = format;
import nodemailer from 'nodemailer';

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: process.env.CONTACT_SERVICE,
    port: process.env.CONTACT_SMTP_SERVER_PORT, // Port for SSL
    secure: process.env.CONTACT_SECURE, // Use SSL
    auth: {
      user: process.env.CONTACT_EMAIL,
      pass: process.env.CONTACT_PASSWORD
    }
  });

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
            res.json({exchange_name:result[0].exchange_name, slack:result[0].slack, gmail:result[0].gmail, telegram:result[0].telegram, profit:result[0].profit_percent});
        })
    }

    static changenowSupportLinks=async(req,res)=>{
        let sql="SELECT * FROM exchange_links WHERE exchange_name=?";
        db.query(sql,["changenow"],(error, result)=>{
            if(error){
                logger.error(`Error: ${error}`)
            }
            res.json({exchange_name:result[0].exchange_name, slack:result[0].slack, gmail:result[0].gmail, telegram:result[0].telegram, profit:result[0].profit_percent});
        })
    }

    static changeheroSupportLinks=async(req,res)=>{
        let sql="SELECT * FROM exchange_links WHERE exchange_name=?";
        db.query(sql,["changehero"],(error, result)=>{
            if(error){
                logger.error(`Error: ${error}`)
            }
            res.json({exchange_name:result[0].exchange_name, slack:result[0].slack, gmail:result[0].gmail, telegram:result[0].telegram, profit:result[0].profit_percent});
        })
    }

    static letsexchangeSupportLinks=async(req,res)=>{
        let sql="SELECT * FROM exchange_links WHERE exchange_name=?";
        db.query(sql,["letsexchange"],(error, result)=>{
            if(error){
                logger.error(`Error: ${error}`)
            }
            res.json({exchange_name:result[0].exchange_name, slack:result[0].slack, gmail:result[0].gmail, telegram:result[0].telegram, profit:result[0].profit_percent});
        })
    }

    static exolixSupportLinks=async(req,res)=>{
        let sql="SELECT * FROM exchange_links WHERE exchange_name=?";
        db.query(sql,["exolix"],(error, result)=>{
            if(error){
                logger.error(`Error: ${error}`)
            }
            res.json({exchange_name:result[0].exchange_name, slack:result[0].slack, gmail:result[0].gmail, telegram:result[0].telegram, profit:result[0].profit_percent});
        })
    }

    static stealthexSupportLinks=async(req,res)=>{
        let sql="SELECT * FROM exchange_links WHERE exchange_name=?";
        db.query(sql,["stealthex"],(error, result)=>{
            if(error){
                logger.error(`Error: ${error}`)
            }
            res.json({exchange_name:result[0].exchange_name, slack:result[0].slack, gmail:result[0].gmail, telegram:result[0].telegram, profit:result[0].profit_percent});
        })
    }

    static godexSupportLinks=async(req,res)=>{
        let sql="SELECT * FROM exchange_links WHERE exchange_name=?";
        db.query(sql,["godex"],(error, result)=>{
            if(error){
                logger.error(`Error: ${error}`)
            }
            res.json({exchange_name:result[0].exchange_name, slack:result[0].slack, gmail:result[0].gmail, telegram:result[0].telegram, profit:result[0].profit_percent});
        })
    }

    static simpleswapSupportLinks=async(req,res)=>{
        let sql="SELECT * FROM exchange_links WHERE exchange_name=?";
        db.query(sql,["simpleswap"],(error, result)=>{
            if(error){
                logger.error(`Error: ${error}`)
            }
            res.json({exchange_name:result[0].exchange_name, slack:result[0].slack, gmail:result[0].gmail, telegram:result[0].telegram, profit:result[0].profit_percent});
        })
    }

    //********************************** Exchange Profile Update Queries *********************** */
    static changellyUpdateProfile = async (req, res) => {
        const { exchange, slack, gmail, telegram, profit_percent } = req.body; // Extracting data from request body
    
        let sqlUpdate = `UPDATE exchange_links 
                         SET slack = ?, gmail = ?, telegram = ?, profit_percent = ?
                         WHERE exchange_name = ?`;
    
        db.query(sqlUpdate, [slack, gmail, telegram, profit_percent, exchange], (error, result) => {
            if (error) {
                return res.json({ message: 'Profile update unsuccessfull!' });
            }
    
            res.json({ message: 'Profile updated successfully' });
        });
    }

    static changenowUpdateProfile = async (req, res) => {
        const { exchange, slack, gmail, telegram, profit_percent } = req.body; // Extracting data from request body
    
        let sqlUpdate = `UPDATE exchange_links 
                         SET slack = ?, gmail = ?, telegram = ?, profit_percent = ?
                         WHERE exchange_name = ?`;
    
        db.query(sqlUpdate, [slack, gmail, telegram, profit_percent, exchange], (error, result) => {
            if (error) {
                return res.json({ message: 'Profile update unsuccessfull!' });
            }
    
            res.json({ message: 'Profile updated successfully' });
        });
    }
    static changeheroUpdateProfile = async (req, res) => {
        const { exchange, slack, gmail, telegram, profit_percent } = req.body; // Extracting data from request body
    
        let sqlUpdate = `UPDATE exchange_links 
                         SET slack = ?, gmail = ?, telegram = ?, profit_percent = ?
                         WHERE exchange_name = ?`;
    
        db.query(sqlUpdate, [slack, gmail, telegram, profit_percent, exchange], (error, result) => {
            if (error) {
                return res.json({ message: 'Profile update unsuccessfull!' });
            }
    
            res.json({ message: 'Profile updated successfully' });
        });
    }
    static exolixUpdateProfile = async (req, res) => {
        const { exchange, slack, gmail, telegram, profit_percent } = req.body; // Extracting data from request body
    
        let sqlUpdate = `UPDATE exchange_links 
                         SET slack = ?, gmail = ?, telegram = ?, profit_percent = ?
                         WHERE exchange_name = ?`;
    
        db.query(sqlUpdate, [slack, gmail, telegram, profit_percent, exchange], (error, result) => {
            if (error) {
                return res.json({ message: 'Profile update unsuccessfull!' });
            }
    
            res.json({ message: 'Profile updated successfully' });
        });
    }
    static godexUpdateProfile = async (req, res) => {
        const { exchange, slack, gmail, telegram, profit_percent } = req.body; // Extracting data from request body
    
        let sqlUpdate = `UPDATE exchange_links 
                         SET slack = ?, gmail = ?, telegram = ?, profit_percent = ?
                         WHERE exchange_name = ?`;
    
        db.query(sqlUpdate, [slack, gmail, telegram, profit_percent, exchange], (error, result) => {
            if (error) {
                return res.json({ message: 'Profile update unsuccessfull!' });
            }
    
            res.json({ message: 'Profile updated successfully' });
        });
    }
    static stealthexUpdateProfile = async (req, res) => {
        const { exchange, slack, gmail, telegram, profit_percent } = req.body; // Extracting data from request body
    
        let sqlUpdate = `UPDATE exchange_links 
                         SET slack = ?, gmail = ?, telegram = ?, profit_percent = ?
                         WHERE exchange_name = ?`;
    
        db.query(sqlUpdate, [slack, gmail, telegram, profit_percent, exchange], (error, result) => {
            if (error) {
                return res.json({ message: 'Profile update unsuccessfull!' });
            }
    
            res.json({ message: 'Profile updated successfully' });
        });
    }
    static letsexchangeUpdateProfile = async (req, res) => {
        const { exchange, slack, gmail, telegram, profit_percent } = req.body; // Extracting data from request body
    
        let sqlUpdate = `UPDATE exchange_links 
                         SET slack = ?, gmail = ?, telegram = ?, profit_percent = ?
                         WHERE exchange_name = ?`;
    
        db.query(sqlUpdate, [slack, gmail, telegram, profit_percent, exchange], (error, result) => {
            if (error) {
                return res.json({ message: 'Profile update unsuccessfull!' });
            }
    
            res.json({ message: 'Profile updated successfully' });
        });
    }
    static simpleswapUpdateProfile = async (req, res) => {
        const { exchange, slack, gmail, telegram, profit_percent } = req.body; // Extracting data from request body
    
        let sqlUpdate = `UPDATE exchange_links 
                         SET slack = ?, gmail = ?, telegram = ?, profit_percent = ?
                         WHERE exchange_name = ?`;
    
        db.query(sqlUpdate, [slack, gmail, telegram, profit_percent, exchange], (error, result) => {
            if (error) {
                return res.json({ message: 'Profile update unsuccessfull!' });
            }
    
            res.json({ message: 'Profile updated successfully' });
        });
    }

    //********************************** Contact Email *********************** */
    static contactMail=async(req, res)=>{
        const {email, name, subject, orderid, message}=req.body;
        const mailOptions = {
            from: process.env.CONTACT_EMAIL,
            to: subject=="support@coinoswap.com"?"support@coinoswap.com":subject,
            subject: subject,
            text: `<b>ORDER ID:</b> <p> ${{orderid}} </p> <br> 
            <b>USER NAME:</b> <p> ${{name}} </p> <br> 
            <b>Email: </b> <p>${{email}}</p><br> 
            <b>Message: </b> <p>${{message}}</p>`
          };
    
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                   return res.json({status:0});
            }else{
                return res.json({status:1});
            }
        });
    }

    
};

export default SupportController;