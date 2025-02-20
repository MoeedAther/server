import crypto from 'crypto';
import request from "request";
import fetch from "node-fetch";
import dotenv from 'dotenv';
import { error } from 'console';
import { response } from 'express';
import {db} from '../database/connectdb.js';
dotenv.config();

class exchangeRatesController {

    static changellyprice=async (req, res)=>{
        const {sell,get,amount,exchangetype}=req.body
        const typeidentifier=exchangetype=="Floating"?"getExchangeAmount":"getFixRateForAmount";
        const privateKey = crypto.createPrivateKey({
          key: process.env.CHANGELLY_PRIVATE_KEY,
          format: "der",
          type: "pkcs8",
          encoding: "hex",
        });
      
        //Common Variables for Changelly
        const publicKey = crypto.createPublicKey(privateKey).export({
          type: "pkcs1",
          format: "der",
        });
      
        const message1 = {
          jsonrpc: "2.0",
          id: "test",
          method: typeidentifier,
          params: {
            from: sell,
            to: get,
            amountFrom: amount,
          },
        };
      
        const signature1 = crypto.sign(
          "sha256",
          Buffer.from(JSON.stringify(message1)),
          {
            key: privateKey,
            type: "pkcs8",
            format: "der",
          }
        );
      
        const param1 = {
          method: "POST",
          url: "https://api.changelly.com/v2",
          headers: {
            "Content-Type": "application/json",
            "X-Api-Key": crypto
              .createHash("sha256")
              .update(publicKey)
              .digest("base64"),
            "X-Api-Signature": signature1.toString("base64"),
          },
          body: JSON.stringify(message1),
        };
      
      
          request(param1, async function (error, response) {
            try {
              if (error) {
                // Return here only stops further execution inside this callback, not the parent function
                return res.status(502).json({name:"changelly", rate:0, message:"exchange_response_error"});
              }
              const data = await JSON.parse(response.body);
    
              //Check if amount is not in range
              if(data.error){
                if(data.error.data.limits){
                  return res.status(404).json({name:"changelly", rate:0, message:"amount_not_in_range"});
                }
              }
    
              //Sending response becase amount in range
              let rate = data.result[0].amountTo;
              let rate_id=null;
              if(exchangetype=="Fixed"){
                rate_id=data.result[0].id;
              }
              return res.status(200).json({name:"changelly", rate:rate, rate_id:rate_id, message:"success"});
    
            } catch (error) {
              return res.status(502).json({name:"changelly", rate:0, message:"exchange_response_error"});
            }
          })
      }
    
      static changenowprice=async (req, res)=>{
        const {sell,get,amount, exchangetype}=req.body
        const typeidentifier=exchangetype=="Floating"?"":"/fixed-rate";
        try {
          const response = await fetch(
            `https://api.changenow.io/v1/exchange-amount${typeidentifier}/${amount}/${sell}_${get}/?api_key=3016eb278f481714c943980dec2bfc595f8a2160e8eabd0228dc02cc627a184c&useRateId=true`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
          const data=await response.json();
          if(data.estimatedAmount){
            const rate=data.estimatedAmount;
            let rate_id=null;
            if(exchangetype=="Fixed"){
              rate_id=data.rateId;
            }
            return res.status(200).json({name:"changenow", rate:rate, rate_id:rate_id, message:"success"});
          }else if(data.error=="deposit_too_small"){
            return res.status(404).json({name:"changenow", rate:0, message:"amount_not_in_range"});
          }else{
            throw new Error();
          }
        } catch (error) {
            console.log(error)
          return res.status(502).json({name:"changenow", rate:0, message:"exchange_response_error"});
        }
      }
    
      static stealthexprice=async (req, res)=>{
        const {sell,get,amount, exchangetype}=req.body;
        const typeidentifier=exchangetype=="Floating"?"false":"true";
        try {
    
          const response = await fetch(`https://api.stealthex.io/api/v2/estimate/${sell}/${get}?amount=${amount}&api_key=6cbd846e-a085-4505-afeb-8fca0d650c58&fixed=${typeidentifier}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })
        
          const data=await response.json();
          if(data.estimated_amount){
            const rate=data.estimated_amount;
            let rate_id=null;
            if(exchangetype=="Fixed"){
                rate_id=data.rate_id;
            }
            return res.status(200).json({name:"stealthex", rate:rate, rate_id:rate_id, message:"success"});
          }else if(data.err.details=="Amount is out of range"){
            return res.status(404).json({name:"stealthex", rate:0, message:"amount_not_in_range"});
          }else{
            throw new Error();
          }
    
        } catch (error) {
          return res.status(502).json({name:"stealthex", rate:0, message:"exchange_response_error"})
        }
      }
    
      static exolixprice=async (req, res)=>{
        const {sell,get,amount, exchangetype}=req.body;
        const typeidentifier=exchangetype=="Floating"?"float":"fixed";
        try {
          const response = await fetch(
            `https://exolix.com/api/v2/rate?coinFrom=${sell}&coinTo=${get}&amount=${amount}&rateType=${typeidentifier}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
        
          const data=await response.json();
          if(data.toAmount){
            const rate=data.toAmount;
            let rate_id=null;
            return res.status(200).json({name:"exolix", rate:rate, rate_id: rate_id, message:"success"});
          }else if(data.message=="Amount to exchange is below the possible min amount to exchange"){
            return res.status(404).json({name:"exolix", rate:0, message:"amount_not_in_range"});
          }else{
            throw new Error();
          }
        } catch (error) {
          return res.status(502).json({name:"exolix", rate:0, message:"exchange_response_error"});
        }
    
      }
    
      static simpleswapprice=async (req, res)=>{
        const {sell,get,amount, exchangetype}=req.body;
        const typeidentifier=exchangetype=="Floating"?"false":"true";
        try {
          const response =  await fetch(`https://api.simpleswap.io/get_estimated?api_key=ae57f22d-7a23-4dbe-9881-624b2e147759&fixed=${typeidentifier}&currency_from=${sell}&currency_to=${get}&amount=${amount}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            }
          });
        
          const data=await response.json();
    
          if(!isNaN(Number(data)) && isFinite(data)){
            const rate=data;
            let rate_id=null;
            return res.status(200).json({name:"simpleswap", rate:rate, rate_id:rate_id, message:"success"}); 
          }else if(data.error=="Unprocessable Entity"){
            return res.status(404).json({name:"simpleswap", rate:0, message:"amount_not_in_range"});
          }else{
            throw new Error();
          }
        } catch (error) {
            return res.status(502).json({name:"simpleswap", rate:0, message:"exchange_response_error"});
        }
      }
    
      static changeheroprice=async (req, res)=>{
        const {sell,get,amount, exchangetype}=req.body;
        const typeidentifier=exchangetype=="Floating"?"getExchangeAmount":"getFixRate";
        try {
          const param = {
            jsonrpc: "2.0",
            method: typeidentifier,
            params: {
              from: sell,
              to: get,
              amount: amount,
            },
          };
        
          const response =  await fetch(`https://api.changehero.io/v2/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "api-key": "46799cd819854116907d2a6f54926157",
            },
            body: JSON.stringify(param),
          })
        
          const data=await response.json();
          if(data.result){
            let rate=0;
            let rate_id=null;
            if(exchangetype=="Fixed"){
                rate=data.result[0].result;
                rate_id=data.result[0].id;
            }else{
                rate=data.result;
            }
            return res.status(200).json({name:"changehero", rate:rate, rate_id:rate_id, message:"success"});
          }else if(data.error.message.split(":")[0]=="Amount is less than minimal"){
            res.status(404).json({name:"changehero", rate:0, message:"amount_not_in_range"});
          }else{
            throw new Error();
          }
        } catch (error) {
          return res.status(502).json({name:"changehero", rate:0, message:"exchange_response_error"});
        }
      }
    
      static godexprice=async (req, res)=>{
        const {sell,get,amount}=req.body
        try {
          const param = {
            from: sell.toUpperCase(),
            to: get.toUpperCase(),
            amount: amount,
          };
        
          const response =  await fetch(`https://api.godex.io/api/v1/info`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(param),
          })
        
          const data=await response.json(); 
          if(data.amount){
            const rate=data.amount;
            let rate_id=null;
            if(rate!=="0"){
              return res.status(200).json({name:"godex", rate:rate, rate_id:rate_id, message:"success"});
            }else{
              return res.status(404).json({name:"godex", rate:0, message:"amount_not_in_range"});
            }
          }else if(data.error){
            throw new Error();
          }else{
            throw new Error();
          }
        } catch (error) {
          return res.status(502).json({name:"godex", rate:0, message:"exchange_response_error"});
        }
      }

      static letsexchangeprice=async (req, res)=>{
        const {sell,get,amount, exchangetype}=req.body;
        const typeidentifier=exchangetype=="Floating"?true:false;
    
        try {
          const param = {
            from: sell,
            to: get,
            amount: amount,
            float: typeidentifier
          };
        
          const response =  await fetch(`https://api.letsexchange.io/api/v1/info`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": process.env.LETSEXCHANGE
            },
            body: JSON.stringify(param),
          })
        
          const data=await response.json();
          if(data.amount){
            const rate=data.amount;
            if(rate!=="0"){
                let rate_id=null;
                if(exchangetype=="Fixed"){
                    rate_id=data.rate_id;
                }
                    return res.status(200).json({name:"letsexchange", rate:rate, rate_id:rate_id, message:"success"});
            }else{
              return res.status(404).json({name:"letsexchange", rate:0, message:"amount_not_in_range"});
            }
          }else{
            throw new Error();
          }
    
        } catch (error) {
          return res.status(502).json({name:"letsexchange", rate:0, message:"exchange_response_error"});
        }
    
      }

}

export default exchangeRatesController;