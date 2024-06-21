import express from 'express';
import crypto from 'crypto';
import request from "request";
import fetch from "node-fetch";
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import {db} from '../database/connectdb.js';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';


dotenv.config();

const app=express();




class CronController{

    static getStatusCronData= async (req, res)=>{
        const {type}=req.body;
        const sql="SELECT * FROM cron_job WHERE type=?";

        db.query(sql, [type], (error, result)=>{
            if(error){
                return res.json({cron:false});
            }
            return res.json({cron:true, second:result[0].second, minute:result[0].minute,  minute:result[0].hour, date_of_month:result[0].date_of_month, month:result[0].month, day_of_week:result[0].day_of_week});
        })
    }

    static setStatusCronData= async (req, res)=>{
        const {type, second, minute, hour, date_of_month, month, day_of_week}=req.body;
        console.log(req.body)
        const sql="UPDATE cron_job SET second=?, minute=?, hour=?, date_of_month=?, month=?, day_of_week=? WHERE type=?";

        db.query(sql, [second, minute, hour, date_of_month, month, day_of_week, type], (error, result)=>{
            if(error){
                console.log(error);
                return res.json({cron:false});
            }else{
                return res.json({cron:true});
            }
        })
    }

}

export default CronController;