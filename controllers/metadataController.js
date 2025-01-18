import express from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import {db} from '../database/connectdb.js';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';

dotenv.config();

class metadataController{

    static storeMeta = async (req, res)=>{  
        console.log(req)  
    const { metadata_identifier, data } = req.body;

    if (!metadata_identifier || !data) {
        return res.status(400).json({ error: "metadata_identifier and data are required" });
    }

    const query = "INSERT INTO meta_data (meta_identifier, meta_object) VALUES (?, ?)";
    db.query(query, [metadata_identifier, JSON.stringify(data)], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ message: "Data stored successfully", data: results.meta_object });
    });
}

    static getMeta = async (req, res)=>{

    }

    static updateMeta = async (req, res)=>{

    }

    static deleteMeta = async (req, res)=>{

    }

}

export default metadataController;
