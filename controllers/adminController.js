import express from 'express';
import crypto from 'crypto';
import request from "request";
import fetch from "node-fetch";
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import {db} from '../database/connectdb.js';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';

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

const app=express();

// Configure body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: process.env.SERVICE,
    port: process.env.PORT, // Port for SSL
    secure: process.env.SECURE, // Use SSL
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
  });

// Utility function to generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit numeric OTP
};

// Utility function to get current timestamp in seconds
const getCurrentTimestamp = () => {
    return (Date.now() + 180000);
  };


class AdminController{

    static createAdmin=async(req, res)=>{
        const {username, email, password}=req.body;
        const saltRounds = 10;
  
        try {
            if(!email || !password || !username || email=="" || password=="" || username=="" ){
                return res.json({authorized:false, message:"Please fill all required fields"});
            }else{
            const sql1 =`SELECT * FROM admin WHERE email = ?;`
            db.query(sql1,[email],async function(error, result){
                if (error){
                    return res.json({signup:false, message:"User creation failed"});
                }else{
                    if(result.length>0){
                        return res.json({signup:false, message:"User already exists"});
                    }else{
                        const hashedPassword = await bcrypt.hash(password, saltRounds); 
          
                        const sql2 = 'INSERT INTO admin (username, email, password) VALUES (?, ?, ?)';
                        const values = [username, email, hashedPassword];
                        
                        db.query(sql2, values, (err, results) => {
                          if (err) {
                            return res.json({signup:false, message:"User creation failed"});
                          }else{
                              return res.json({signup:true, message:"User creation successful"});
                          }
                        });
                    }
               }
              })
            }
        } catch (error) {
            return res.json({signup:false, message:"Server Error"});
        }

    }

    static authenticateAdmin=async(req, res)=>{
        const {email, password}=req.body; 

        try {
            if(!email || !password || email=="" || password==""){
                return res.json({otp:false, message:"Please fill all required fields"});
            }else{
            const sql =`SELECT * FROM admin WHERE email = ?;`

    
            db.query(sql,[email],async function(error, result){

             if (result.length<1){
    
                return res.json({otp:false, message:"User doesnot exist"});
    
             }else{
    
             const isMatch = await bcrypt.compare(password, result[0].password);
    
             if(isMatch){

                const otp = generateOTP();
                const expiry = getCurrentTimestamp(); // OTP expires in 60 seconds

                const mailOptions = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: 'Your OTP Code',
                    text: `Your OTP code is ${otp}. It will expire in 1 minute.`
                  };
    
                transporter.sendMail(mailOptions, (error, info) => {

                    if (error) {
                            logger.error(`Error: ${error}`);
                            return res.json({otp:false, message:"Failed to send OTP"});
                    }

                    // Store OTP and expiry in session
                    req.session.otp = otp;
                    req.session.otpExpiry = expiry;
                    req.session.AdminEmail=email;
                    req.session.firstname=result[0].first_name;
                    req.session.lastname=result[0].last_name;
                    req.session.session_id=req.sessionID;
                    req.session.isAuthenticated = false;
                    return res.json({otp:true, otp_session_id:req.sessionID, email:email, message:"OTP sent successfully"});
                });
             }else{
                 return res.json({otp:false, message:"Incorrect password"});
             }
            }
           })
        }
        } catch (error) {
            return res.json({authorization:false, message:"There was an error connecting to the server"});
        }
       
    }

    static otpVarification=async(req, res)=>{
    const {otp, email } = req.body;
    const currentTime = Date.now();

    if (req.session.otp === otp && req.session.AdminEmail===email) {
        console.log(currentTime)
        console.log(req.session.otpExpiry)

        if (req.session.otpExpiry > currentTime) {
            // OTP is correct and not expired, create user session
            req.session.isAuthenticated = true;
            res.json({otp:true, message: 'OTP verified successfully', email:req.session.AdminEmail, first_name:req.session.firstname, lastname:req.session.lastname  });
        } else {
            req.session.destroy((err) => {})
            res.json({otp:false, message: 'OTP has expired' });
        }
    } else {
        res.json({otp:false, message: 'Invalid OTP' });
    }
    }

    static checkSession=(req, res)=>{

        if (req.session && req.session.AdminEmail && req.session.isAuthenticated) {
            console.log(req.session && req.session.AdminEmail)
                    return res.json({session:true, message:"Session exists"})
            } else {
                    return res.json({session:false, message:"Session expired"})
        }

    }

    static logoutSession=async (req, res)=>{
        console.log("Logout"+req.session);
        req.session.destroy((err) => {
            if (err) {
                console.log(err)
                return res.json({sessionDestroy:false, message:"Logout Failed"})
            } else {
                console.log("here")
                return res.json({sessionDestroy:true, message:"Session destroyed"});
            }
        });
    }

}

export default AdminController;
