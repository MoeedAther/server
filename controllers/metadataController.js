import express from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import {db} from '../database/connectdb.js';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';

dotenv.config();

class metadataController{

    static storeAndUpdateMeta = async (req, res) => {
        const { metadata_identifier, data } = req.body;
    
        if (!metadata_identifier || !data) {
            return res.status(400).json({ error: "metadata_identifier and data are required" });
        }
    
        const checkQuery = "SELECT * FROM meta_data WHERE meta_identifier = ?";
        db.query(checkQuery, [metadata_identifier], (err, results) => {
            if (err) {
                return res.status(500).json({ error: "Database error while checking metadata" });
            }
    
            if (results.length > 0) {
                // If metadata exists, update it
                const updateQuery = "UPDATE meta_data SET meta_object = ? WHERE meta_identifier = ?";
                db.query(updateQuery, [JSON.stringify(data), metadata_identifier], (updateErr, updateResults) => {
                    if (updateErr) {
                        return res.status(500).json({ error: "Database error while updating metadata" });
                    }
                    return res.status(200).json({ message: "Metadata updated successfully" });
                });
            } else {
                // If metadata does not exist, insert a new record
                const insertQuery = "INSERT INTO meta_data (meta_identifier, meta_object) VALUES (?, ?)";
                db.query(insertQuery, [metadata_identifier, JSON.stringify(data)], (insertErr, insertResults) => {
                    if (insertErr) {
                        return res.status(500).json({ error: "Database error while inserting metadata" });
                    }
                    return res.status(201).json({ message: "Metadata created successfully" });
                });
            }
        });
    };
    

    static getMeta = async (req, res)=>{
        const { metadata_identifier } = req.body;
        const checkQuery = "SELECT * FROM meta_data WHERE meta_identifier = ?";
        db.query(checkQuery, [metadata_identifier], (err, results) => {
            if (err) {
                return res.status(500).json({ error: "Database error while checking metadata" });
            }

            return res.status(200).json({result: JSON.parse(results[0].meta_object), message: "Meta data found" });

        });
    }

    static updateMeta = async (req, res)=>{

    }

    static deleteMeta = async (req, res)=>{

    }

}

export default metadataController;
