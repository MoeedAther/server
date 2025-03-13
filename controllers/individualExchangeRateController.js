import crypto from 'crypto';
import request from "request";
import fetch from "node-fetch";
import dotenv from 'dotenv';
import { error } from 'console';
import { response } from 'express';
import {db} from '../database/connectdb.js';
dotenv.config();

function fetchGiveawayMeta(){
    return new Promise((resolve, reject)=>{
    const checkQuery = "SELECT * FROM meta_data WHERE meta_identifier = ?";
    db.query(checkQuery, ["giveaway"], (err, results) => {
      if (err) {
        return reject({ error: "Database error while checking metadata" });
    }
    try {
      const metaData=JSON.parse(results[0].meta_object);
      resolve(metaData);
    } catch (error) {
      reject({ error: "Invalid metadata format" });
    }
    });
  });
  }

function fetchExchangeVisibilityMeta(){
    return new Promise((resolve, reject)=>{
    const checkQuery = "SELECT * FROM meta_data WHERE meta_identifier = ?";
    db.query(checkQuery, ["exchangevisibility"], (err, results) => {
      if (err) {
        return reject({ error: "Database error while checking metadata" });
    }
    try {
      const metaData=JSON.parse(results[0].meta_object);
      resolve(metaData);
    } catch (error) {
      reject([{name:"changelly", fixed:0, floating:0},{name:"changenow", fixed:0, floating:0},{name:"changehero", fixed:0, floating:0},{name:"exolix", fixed:0, floating:0},{name:"letsexchange", fixed:0, floating:0},{name:"stealthex", fixed:0, floating:0},{name:"simpleswap", fixed:0, floating:0},{name:"godex", fixed:0, floating:0}]);
    }
    });
  });
  }

function calculateUnitConversionPrice(rate, networkFee, amount){
  let unitPrice=(rate + networkFee)/amount;
  return unitPrice;
}

class exchangeRatesController {

    static changellyprice=async (req, res)=>{
        const {sell,get,amount,exchangetype}=req.body
        const typeidentifier=exchangetype=="Floating"?"getExchangeAmount":"getFixRateForAmount";


        // Fixed and float public and private keys for Changelly
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

        let rateObject={
            name:"changelly",
            rate:0,
            rate_id:null,
            min:0,
            max:0,
            exchangetype: exchangetype,
            eta:"5-30 Min", 
            kyc:"On Occasion", 
            rating:"4.2/5",
            giveaway:"no_giveaway"
        }
        

        //Fixed and Float body objects for Min and Max Rates Fixed and Floating
        const message2 = {
                jsonrpc: "2.0",
                id: "test",
                method: "getPairsParams",
                params: [
                  {
                    from: sell,
                    to: get,
                  }
                ]
              }
        
              const signature2 = crypto.sign(
                "sha256",
                Buffer.from(JSON.stringify(message2)),
                {
                  key: privateKey,
                  type: "pkcs8",
                  format: "der",
                }
              );
            
              const param2 = {
                method: "POST",
                url: "https://api.changelly.com/v2",
                headers: {
                  "Content-Type": "application/json",
                  "X-Api-Key": crypto
                    .createHash("sha256")
                    .update(publicKey)
                    .digest("base64"),
                  "X-Api-Signature": signature2.toString("base64"),
                },
                body: JSON.stringify(message2),
              };


        try {
        
            // Function to make API request using Promises
        const makeRequest = (options) => {
            return new Promise((resolve, reject) => {
                request(options, (error, response, body) => {
                    if (error) {
                        return res.status(502).json({rateObject:rateObject, message:"exchange_response_error"});
                    } else {
                        if (response.statusCode===200) {
                            resolve(JSON.parse(response.body));
                          }else{
                            return res.status(502).json({rateObject:rateObject, message:"exchange_response_error"});
                          }
                    }
                });
            });
        };
            const data = await makeRequest(param2);
            if(!isNaN(data.result[0].minAmountFloat)&&!isNaN(data.result[0].maxAmountFloat)&&!isNaN(data.result[0].minAmountFixed)&&!isNaN(data.result[0].maxAmountFixed)){
            
                //Storing minimum and maximum amount for both fixed and floating rate in rateObject
              if(exchangetype=="Floating"){
                rateObject.min=parseFloat(data.result[0].minAmountFixed);
                rateObject.max=parseFloat(data.result[0].maxAmountFixed);
                }else{
                rateObject.min=parseFloat(data.result[0].minAmountFixed);
                rateObject.max=parseFloat(data.result[0].maxAmountFixed);
                }
            }

        } catch (error) {
            return res.status(502).json({rateObject:rateObject, message:"exchange_response_error"});
        }
            
      
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
                return res.status(502).json({rateObject:rateObject, message:"exchange_response_error"});
              }
              const data = await JSON.parse(response.body);
    
              //Check if amount is not in range
              if(data.error){
                if(data.error.data.limits){
                  return res.status(200).json({rateObject:rateObject, message:"amount_not_in_range"});
                }
              }
    
              //Sending response becase amount in range
              let rate = parseFloat(data.result[0].amountTo);
              rateObject.rate=rate;
              if(exchangetype=="Fixed"){
                rate_id=data.result[0].id;
              }

                const metaData= await fetchGiveawayMeta();
                const visibilityMetaDeta=await fetchExchangeVisibilityMeta();
                const visibilityBool=exchangetype==="Floating"?visibilityMetaDeta[0].floating:visibilityMetaDeta[0].fixed;

                if(metaData.giveaway && visibilityBool===1){
                    rateObject.name===metaData.giveaway?rateObject.giveaway=metaData.tagline:rateObject.giveaway="no_giveaway";
                    return res.status(200).json({rateObject:rateObject, message:"success"});
                }else{
                    return res.status(502).json({rateObject:rateObject, message:"giveaway meta query error"});
                }              
            } catch (error) {
              return res.status(502).json({rateObject:rateObject, message:"exchange_response_error"});
            }
          });
      }
    
      static changenowprice=async (req, res)=>{

        const {sell,get,amount, exchangetype}=req.body
        const typeidentifier=exchangetype=="Floating"?"":"/fixed-rate";
        const mintypeidentifier=exchangetype=="Floating"?"standard":"fixed-rate";

        let rateObject={
            name:"changenow",
            rate:0,
            rate_id:null,
            min:0,
            max:0,
            exchangetype: exchangetype,
            eta:"10-60 Min", 
            kyc:"On Occasion", 
            rating:"4.5/5",
            giveaway:"no_giveaway"
        }

        try {

            const respons1=await fetch(
                `https://api.changenow.io/v2/exchange/range?fromCurrency=${sell}&toCurrency=${get}&flow=${mintypeidentifier}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    "x-changenow-api-key":"3016eb278f481714c943980dec2bfc595f8a2160e8eabd0228dc02cc627a184c"
                  },
                }
              )
            const result1=await respons1.json();

            if(!isNaN(result1.minAmount)){
                rateObject.min=parseFloat(result1.minAmount);
            }

          const response2 = await fetch(
            `https://api.changenow.io/v1/exchange-amount${typeidentifier}/${amount}/${sell}_${get}/?api_key=3016eb278f481714c943980dec2bfc595f8a2160e8eabd0228dc02cc627a184c&useRateId=true`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
          const data=await response2.json();
          if(data.estimatedAmount){
            rateObject.rate=parseFloat(data.estimatedAmount);

            // Storing rate_id in rateObject if exchangetype is Fixed
            if(exchangetype=="Fixed"){
              rateObject.rate_id=data.rateId;
            }

            // finding if rate is greater than minimum amount
            if(rateObject.rate>rateObject.min){
                const metaData= await fetchGiveawayMeta();
                const visibilityMetaDeta=await fetchExchangeVisibilityMeta();
                const visibilityBool=exchangetype==="Floating"?visibilityMetaDeta[1].floating:visibilityMetaDeta[1].fixed;

                if(metaData.giveaway && visibilityBool===1){
                    rateObject.name===metaData.giveaway?rateObject.giveaway=metaData.tagline:rateObject.giveaway="no_giveaway";
                    return res.status(200).json({rateObject:rateObject, message:"success"});
                }else{
                    return res.status(502).json({rateObject:rateObject, message:"giveaway meta query error"});
                }
            }else{
                return res.status(200).json({rateObject:rateObject, message:"amount_not_in_range"});
            }

            // If exchanges tells amount is out of range
          }else if(data.error=="deposit_too_small" || data.error=="out_of_range"){
            return res.status(200).json({rateObject:rateObject, message:"amount_not_in_range"});

            // If exchange response is not as expected
          }else{
            throw new Error();
          }
        } catch (error) {
          return res.status(502).json({rateObject:rateObject, message:"exchange_response_error"});
        }
      }
    
      static stealthexprice=async (req, res)=>{
        const {sell,get,amount, exchangetype}=req.body;
        const typeidentifier=exchangetype=="Floating"?"false":"true";

        let rateObject={
            name:"stealthex",
            rate:0,
            rate_id:null,
            min:0,
            max:0,
            exchangetype: exchangetype,
            eta:"7-38 Min", 
            kyc:"Rarely Required", 
            rating:"4.7/5",
            giveaway:"no_giveaway"
        }

        try {
          const response1=await fetch(
            `https://api.stealthex.io/api/v2/range/${sell}/${get}?api_key=6cbd846e-a085-4505-afeb-8fca0d650c58&fixed=${typeidentifier}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
            const result1=await response1.json();
            if(!isNaN(result1.min_amount)){
                rateObject.min=parseFloat(result1.min_amount);
              }
    
          const response2 = await fetch(`https://api.stealthex.io/api/v2/estimate/${sell}/${get}?amount=${amount}&api_key=6cbd846e-a085-4505-afeb-8fca0d650c58&fixed=${typeidentifier}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })
        
          const data=await response2.json();
          if(data.estimated_amount){

            // Storing rate in rateObject
            rateObject.rate=parseFloat(data.estimated_amount);

            // Storing rate_id in rateObject if exchangetype is Fixed
            if(exchangetype=="Fixed"){
                rateObject.rate_id=data.rate_id;
            }

            // finding if rate is greater than minimum amount
            if(rateObject.rate>rateObject.min){
                
                const metaData= await fetchGiveawayMeta();
                const visibilityMetaDeta=await fetchExchangeVisibilityMeta();
                const visibilityBool=exchangetype==="Floating"?visibilityMetaDeta[5].floating:visibilityMetaDeta[5].fixed;
                if(metaData.giveaway && visibilityBool===1){
                    rateObject.name===metaData.giveaway?rateObject.giveaway=metaData.tagline:rateObject.giveaway="no_giveaway";
                    return res.status(200).json({rateObject:rateObject, message:"success"});
                }else{
                    return res.status(502).json({rateObject:rateObject, message:"giveaway meta query error"});
                }  
            }else{
                return res.status(200).json({rateObject:rateObject, message:"amount_not_in_range"});
            }

            // If exchanges tells amount is out of range
          }else if(data.err.details=="Amount is out of range"){
            return res.status(200).json({rateObject:rateObject, message:"amount_not_in_range"});
          }else{
            // If exchange response is not as expected
            throw new Error();
          }
    
        } catch (error) {
          return res.status(502).json({rateObject:rateObject, message:"exchange_response_error"})
        }
      }
    
      static exolixprice=async (req, res)=>{
        const {sell,get,amount, exchangetype}=req.body;
        const typeidentifier=exchangetype=="Floating"?"float":"fixed";

        let rateObject={
            name:"exolix",
            rate:0,
            rate_id:null,
            min:0,
            max:0,
            exchangetype: exchangetype,
            eta:"4-20 Min", 
            kyc:"Not Required", 
            rating:"4.3/5",
            giveaway:"no_giveaway"
        }

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

          if(!isNaN(data.toAmount)){
            rateObject.rate=parseFloat(data.toAmount);
            rateObject.min=parseFloat(data.minAmount);
            rateObject.max=parseFloat(data.maxAmount);
          }else if(!isNaN(data.minAmount) || !isNaN(data.maxAmount)){
            if(!isNaN(data.minAmount)){
                rateObject.min=parseFloat(data.minAmount);
            }
            if(!isNaN(data.maxAmount)){
                rateObject.max=parseFloat(data.maxAmount);
            } 
          }else if(data.message=="Amount to exchange is below the possible min amount to exchange"){
            return res.status(200).json({rateObject:rateObject, message:"amount_not_in_range"});
          }else{
            throw new Error();
          }

          //Comapring rate with minimum amount
            if(rateObject.rate>rateObject.min){
                
                const metaData= await fetchGiveawayMeta();
                const visibilityMetaDeta=await fetchExchangeVisibilityMeta();
                const visibilityBool=exchangetype==="Floating"?visibilityMetaDeta[3].floating:visibilityMetaDeta[3].fixed;

                if(metaData.giveaway && visibilityBool===1){
                    rateObject.name===metaData.giveaway?rateObject.giveaway=metaData.tagline:rateObject.giveaway="no_giveaway";
                    return res.status(200).json({rateObject:rateObject, message:"success"});
                }else{
                    return res.status(502).json({rateObject:rateObject, message:"giveaway meta query error"});
                }
            }else{
                return res.status(200).json({rateObject:rateObject, message:"amount_not_in_range"});
            }

        } catch (error) {
          return res.status(502).json({rateObject:rateObject, message:"exchange_response_error"});
        }
    
      }
    
      static simpleswapprice=async (req, res)=>{
        const {sell,get,amount, exchangetype}=req.body;
        const typeidentifier=exchangetype=="Floating"?"false":"true";

        // Object for storing rate data
        let rateObject={
            name:"simpleswap",
            rate:0,
            rate_id:null,
            min:0,
            max:0,
            exchangetype: exchangetype,
            eta:"9-50 Min", 
            kyc:"Rarely Required", 
            rating:"4.4/5",
            giveaway:"no_giveaway"
        }

        try {
          // Fetching minimum and maximum amount for both fixed and floating rate
          let sellcoin=sell=="toncoin"?"tonerc20":sell;
          let getcoin=get=="toncoin"?"tonerc20":get;
  
          const response1 = await fetch(`https://api.simpleswap.io/get_ranges?api_key=ae57f22d-7a23-4dbe-9881-624b2e147759&fixed=${typeidentifier}&currency_from=${sellcoin}&currency_to=${getcoin}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            }
          });

          const data1=await response1.json();
          if(!isNaN(data1.min)&&!isNaN(data1.max)){
            rateObject.min=parseFloat(data1.min);
            rateObject.max=parseFloat(data1.max);
        }

        // Fetching rate from api
          const response =  await fetch(`https://api.simpleswap.io/get_estimated?api_key=ae57f22d-7a23-4dbe-9881-624b2e147759&fixed=${typeidentifier}&currency_from=${sell}&currency_to=${get}&amount=${amount}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            }
          });
          const data=await response.json();

        //   Storing rate in rateObject if response is as expected
          if(!isNaN(Number(data)) && isFinite(data)){
            rateObject.rate=parseFloat(data);

            // finding if rate is greater than minimum amount
            if(rateObject.rate>rateObject.min){
                
                const metaData= await fetchGiveawayMeta();
                const visibilityMetaDeta=await fetchExchangeVisibilityMeta();
                const visibilityBool=exchangetype==="Floating"?visibilityMetaDeta[6].floating:visibilityMetaDeta[6].fixed;
            
                if(metaData.giveaway && visibilityBool===1){
                    rateObject.name===metaData.giveaway?rateObject.giveaway=metaData.tagline:rateObject.giveaway="no_giveaway";
                    return res.status(200).json({rateObject:rateObject, message:"success"});
                }else{
                    return res.status(502).json({rateObject:rateObject, message:"giveaway meta query error"});
                }
            }
            else{
                return res.status(200).json({rateObject:rateObject, message:"amount_not_in_range"});
            }

            // If exchanges tells amount is out of range
          }else if(data.error=="Unprocessable Entity"){
            return res.status(200).json({rateObject:rateObject, message:"amount_not_in_range"});

        // If exchange response is not as expected  
        }else{
            throw new Error();
          }
        } catch (error) {
            return res.status(502).json({rateObject:rateObject, message:"exchange_response_error"});
        }
      }
    
      static changeheroprice=async (req, res)=>{
        const {sell,get,amount, exchangetype}=req.body;
        const typeidentifier=exchangetype=="Floating"?"getExchangeAmount":"getFixRate";

        // Object for storing rate data
        let rateObject={
            name:"changehero",
            rate:0,
            rate_id:null,
            min:0,
            max:0,
            exchangetype: exchangetype,
            eta:"12-26 Min", 
            kyc:"On Occasion", 
            rating:"3.7/5",
            giveaway:"no_giveaway"
        }

        try {

            const param1 = {
                jsonrpc: "2.0",
                method: "getFixRate",
                params: {
                  from: sell,
                  to: get,
                },
              };
      
            const  response1 = await fetch(
                `https://api.changehero.io/v2/`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "api-key": "46799cd819854116907d2a6f54926157",
                  },
                  body: JSON.stringify(param1),
                }
              )

            const data1=await response1.json();    
            if(!isNaN(data1.result[0].minFrom)&&!isNaN(data1.result[0].maxFrom)){
                rateObject.min=parseFloat(data1.result[0].minFrom);
                rateObject.max=parseFloat(data1.result[0].maxFrom);
            }

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

          // Storing rate in rateObject if response is as expected
          if(data.result){

            // Changehero response is different for fixed and floating rate so when there is rate response response object is stored inside an array and when there is floating response object isnt stored in an array
            // Storing rate_id in rateObject if exchangetype is Fixed
            if(exchangetype=="Fixed"){
            rateObject.rate=parseFloat((parseFloat(amount)*parseFloat(data.result[0].result))-parseFloat(data.result[0].networkFee));
            rateObject.rate_id=data.result[0].id;
            }else{
            rateObject.rate=parseFloat(data.result);
            }

            // finding if rate is greater than minimum amount
            if(rateObject.rate>rateObject.min){
                
                const metaData= await fetchGiveawayMeta();
                const visibilityMetaDeta=await fetchExchangeVisibilityMeta();
                const visibilityBool=exchangetype==="Floating"?visibilityMetaDeta[2].floating:visibilityMetaDeta[2].fixed;

                if(metaData.giveaway && visibilityBool===1){
                    rateObject.name===metaData.giveaway?rateObject.giveaway=metaData.tagline:rateObject.giveaway="no_giveaway";
                    return res.status(200).json({rateObject:rateObject, message:"success"});
                }else{
                    return res.status(502).json({rateObject:rateObject, message:"giveaway meta query error"});
                }
            }else{
                return res.status(200).json({rateObject:rateObject, message:"amount_not_in_range"});
            }

            // If exchanges tells amount is out of range
          }else if(data.error.message.split(":")[0]=="Amount is less than minimal"){
            res.status(200).json({rateObject:rateObject, message:"amount_not_in_range"});

            // If exchange response is not as expected
          }else{
            throw new Error();
          }
        } catch (error) {
            console.log(error)
          return res.status(502).json({rateObject:rateObject, message:"exchange_response_error"});
        }
      }
    
      static godexprice=async (req, res)=>{
        const {sell,get,amount, exchangetype}=req.body
        let rateObject={
            name:"godex",
            rate:0,
            rate_id:null,
            min:0,
            max:0,
            exchangetype: exchangetype,
            eta:"14-51 Min", 
            kyc:"Rarely Required", 
            rating:"4.6/5",
            giveaway:"no_giveaway"
        }

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
          //Storing minimum and maximum amount for both fixed and floating rate in rateObject
          if(!isNaN(data.amount) && !isNaN(data.min_amount) && !isNaN(data.max_amount)){
            rateObject.min=parseFloat(data.min_amount);
            rateObject.max=parseFloat(data.max_amount);
            rateObject.rate=parseFloat(data.amount);

            if(rateObject.rate>rateObject.min){
                
                const metaData= await fetchGiveawayMeta();
                const visibilityMetaDeta=await fetchExchangeVisibilityMeta();
                const visibilityBool=exchangetype==="Floating"?visibilityMetaDeta[7].floating:visibilityMetaDeta[7].fixed;

                if(metaData.giveaway && visibilityBool===1){
                    rateObject.name===metaData.giveaway?rateObject.giveaway=metaData.tagline:rateObject.giveaway="no_giveaway";
                    return res.status(200).json({rateObject:rateObject, message:"success"});
                }else{
                    return res.status(502).json({rateObject:rateObject, message:"giveaway meta query error"});
                }  
              }else{
                return res.status(200).json({rateObject:rateObject, message:"amount_not_in_range"});
              }
        
        // If reponse an error object
        }else if(data.error){
          throw new Error();

          // if response is not as expected
        }else{
          throw new Error();
        }

        } catch (error) {
          return res.status(502).json({rateObject:rateObject, message:"exchange_response_error"});
        }
      }

      static letsexchangeprice=async (req, res)=>{

        const {sell,get,amount, exchangetype}=req.body;
        const typeidentifier=exchangetype=="Floating"?true:false;

        let rateObject={
            name:"letsexchange",
            rate:0,
            rate_id:null,
            min:0,
            max:0,
            exchangetype: exchangetype,
            eta:"2-44 Min", 
            kyc:"Not Required", 
            rating:"4.6/5",
            giveaway:"no_giveaway"
        }
    
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

        //   Storing rate min and max in rateObject if response is as expected
          if(!isNaN(data.amount) && !isNaN(data.deposit_min_amount) && !isNaN(data.deposit_max_amount)){
            rateObject.min=parseFloat(data.deposit_min_amount);
            rateObject.max=parseFloat(data.deposit_max_amount);
            rateObject.rate=parseFloat(data.amount);

            if(exchangetype=="Fixed" && data.rate_id!==""){
                rateObject.rate_id=data.rate_id;
            }

            // finding if rate is greater than minimum amount
            if(rateObject.rate>rateObject.min){
                
                const metaData= await fetchGiveawayMeta();
                const visibilityMetaDeta=await fetchExchangeVisibilityMeta();
                const visibilityBool=exchangetype==="Floating"?visibilityMetaDeta[4].floating:visibilityMetaDeta[4].fixed;
                
                if(metaData.giveaway && visibilityBool===1){
                    rateObject.name===metaData.giveaway?rateObject.giveaway=metaData.tagline:rateObject.giveaway="no_giveaway";
                    return res.status(200).json({rateObject:rateObject, message:"success"});
                }else{
                    return res.status(502).json({rateObject:rateObject, message:"giveaway meta query error"});
                }  
              }
            //   If rate is less than minimum amount
              else{
                return res.status(200).json({rateObject:rateObject, message:"amount_not_in_range"});
              }
            //   If response is not as expected
          }else{
            throw new Error();
          }
    
        } catch (error) {
          return res.status(502).json({rateObject:rateObject, message:"exchange_response_error"});
        }
    
      }

}

export default exchangeRatesController;