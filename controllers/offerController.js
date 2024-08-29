import crypto from 'crypto';
import request from "request";
import fetch from "node-fetch";
import dotenv from 'dotenv';
import { error } from 'console';
dotenv.config();


class offerController {

  static offers = async (req, res) => {

    //Private, Public and Api Keys
    const changelly_private_key=process.env.CHANGELLY_PRIVATE_KEY;
    const changenow_api_key=process.env.CHANGENOW;
    const changehero_api_key=process.env.CHANGEHERO;
    const stealthex_api_key=process.env.STEALTHEX;
    const simpleswap_api_key=process.env.SIMPLESWAP;
    const godex_private_key=process.env.GODEX_PRIVATE_KEY;

    let changelly_floating_price=0;
    let changenow_floating_price=0;
    let changehero_floating_price=0;
    let exolix_floating_price=0;
    let godex_floating_price=0;
    let letsexchange_floating_price=0; 
    let stealthex_floating_price=0;
    let simpleswap_floating_price=0;

    let changelly_fixed_price=0;
    let changenow_fixed_price=0;
    let changehero_fixed_price=0;
    let exolix_fixed_price=0;
    let letsexchange_fixed_price=0;
    let stealthex_fixed_price=0;
    let simpleswap_fixed_price=0;

    let changelly_fixed_rateId=0;
    let changenow_fixed_rateId=0;
    let changehero_fixed_rateId=0;
    let exolix_fixed_rateId=0;
    let letsexchange_fixed_rateId=0;
    let stealthex_fixed_rateId=0;
    let simpleswap_fixed_rateId=0;

    let changelly_floating_minimum_amount=0;
    let changelly_fixed_minimum_amount=0;
    let changenow_floating_minimum_amount=0;
    let changenow_fixed_minimum_amount=0;
    let changehero_floating_minimum_amount=0;
    let changehero_fixed_minimum_amount=0;
    let exolix_floating_minimum_amount=0;
    let exolix_fixed_minimum_amount=0;
    let godex_floating_minimum_amount=0;
    let letsexchange_floating_minimum_amount=0;
    let letsexchange_fixed_minimum_amount=0;
    let stealthex_floating_minimum_amount=0;
    let stealthex_fixed_minimum_amount=0;
    let simpleswap_floating_minimum_amount=0;
    let simpleswap_fixed_minimum_amount=0;

    let changelly_floating_maximum_amount=0;
    let changelly_fixed_maximum_amount=0;
    let changenow_floating_maximum_amount=0;
    let changenow_fixed_maximum_amount=0;
    let changehero_floating_maximum_amount=0;
    let changehero_fixed_maximum_amount=0;
    let exolix_floating_maximum_amount=0;
    let exolix_fixed_maximum_amount=0;
    let godex_floating_maximum_amount=0;
    let letsexchange_floating_maximum_amount=0;
    let letsexchange_fixed_maximum_amount=0;
    let stealthex_floating_maximum_amount=0;
    let stealthex_fixed_maximum_amount=0;
    let simpleswap_floating_maximum_amount=0;
    let simpleswap_fixed_maximum_amount=0;


    let changelly_floating_visibility=0;
    let changelly_fixed_visibility=0;
    let changenow_floating_visibility=0;
    let changenow_fixed_visibility=0;
    let changehero_floating_visibility=0;
    let changehero_fixed_visibility=0;
    let exolix_floating_visibility=0;
    let exolix_fixed_visibility=0;
    let godex_floating_visibility=0;
    let letsexchange_floating_visibility=0;
    let letsexchange_fixed_visibility=0;
    let stealthex_floating_visibility=0;
    let stealthex_fixed_visibility=0;
    let simpleswap_floating_visibility=0;
    let simpleswap_fixed_visibility=0;
 

    try {

      const { sell, get, amount, offerstype, fixed } = req.body;
      var sendingamount=parseFloat(amount);
      var response1, response2, response3, response4, response5, response6, response7, response8, response9, response10, response11, response12, response13, response14, response15, response16, response17, response18, response19, response20, response21;
      const apicalldelay = 1000;
      const responsecalldelay = 5000;

      //**************** Common Variables for Changelly *********************//
      const privateKey = crypto.createPrivateKey({
        key: changelly_private_key,
        format: "der",
        type: "pkcs8",
        encoding: "hex",
      });
    
      //****************** Common Variables for Changelly *******************//
      const publicKey = crypto.createPublicKey(privateKey).export({
        type: "pkcs1",
        format: "der",
      });

      //************************** Changelly float Params ********************//
      const message1 = {
        jsonrpc: "2.0",
        id: "test",
        method: "getExchangeAmount",
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
    
    
      //*************************** Changelly fixed Params ******************* */
    
      const message2 = {
    
        jsonrpc: "2.0",
        id: "test",
        method: "getFixRateForAmount",
        params: [
          {
            from: sell,
            to: get,
            amountFrom: amount
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


      //*************************** Changelly Min and Max Params ******************* */
      const message3 = {
    
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

      const signature3 = crypto.sign(
        "sha256",
        Buffer.from(JSON.stringify(message3)),
        {
          key: privateKey,
          type: "pkcs8",
          format: "der",
        }
      );
    
      const param3 = {
        method: "POST",
        url: "https://api.changelly.com/v2",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": crypto
            .createHash("sha256")
            .update(publicKey)
            .digest("base64"),
          "X-Api-Signature": signature3.toString("base64"),
        },
        body: JSON.stringify(message3),
      };
    

      // Response in case of empty variables, incorrect amounts or empty amounts
      if (!sell || !get || !amount || amount == 0 || amount == "0" || amount == "0." || amount == "") {
        return res.json({bestoffer: 0, offersarray:[]});
      }

      setTimeout(async()=>{

      //********************************* Response Handeling ******************************//

      //*************** Changenow Minimum and Maximum Floating Response Handeling ******************//
      try {
          const result1 = await response1.json();
        if(!isNaN(result1.minAmount)){
          changenow_floating_minimum_amount=parseFloat(result1.minAmount);
          changenow_floating_visibility=1;
        }
        
    } catch (error) {
      console.log("Changenow Minimum and Maximum Floating Response Handeling", error)
      console.log("My error", error)
    }

      //*************** Changenow Minimum and Maximum Fixed Response Handeling ******************//
      try {
          const result1 = await response20.json();
        if(!isNaN(result1.minAmount&&result1.maxAmount)){
          changenow_fixed_minimum_amount=parseFloat(result1.minAmount);
          changenow_fixed_maximum_amount=parseFloat(result1.maxAmount);
          changenow_fixed_visibility=1;
        }
    } catch (error) {
      
      console.log("Changenow Minimum and Maximum Fixed Response Handeling", error)
    }
      //********************* Changenow Floating Response Handeling **********************//
      try {
            const result2 = await response2.json();
          if(!isNaN (result2.estimatedAmount)){
            changenow_floating_price = parseFloat(result2.estimatedAmount);
          }
      } catch (error) {
        
        console.log("Changenow Floating Response Handeling",error)
      }

      //********************* Changenow Fixed Response Handeling **********************//
      try {
            const result3 = await response3.json();
          if(!isNaN (result3.estimatedAmount)){
            changenow_fixed_price = parseFloat(result3.estimatedAmount);
            changenow_fixed_rateId=result3.rateId
          }
      } catch (error) {
        console.log("Changenow Fixed Response Handelings", error)
      }

      //*************** Changehero Minimum and Maximum Floating Response Handeling ******************//
      try {
          const result1 = await response4.json();
          const result2 = await response21.json();
          if(!isNaN(result1.result)&&!isNaN(result2.result[0].minFrom)&&!isNaN(result2.result[0].maxFrom)){
          changehero_floating_minimum_amount=parseFloat(result1.result);
          changehero_fixed_minimum_amount=parseFloat(result2.result[0].minFrom);
          changehero_fixed_maximum_amount=parseFloat(result2.result[0].maxFrom);
          changehero_floating_visibility=1;
          changehero_fixed_visibility=1;
        }
    } catch (error) {  
      console.log("Changehero Minimum and Maximum Floating Response Handelings", error)
    }

      //*************** Changehero Floating Response Handeling ******************//
      try {
          const result = await response5.json();
        if(!isNaN(result.result)){
          changehero_floating_price=parseFloat(result.result);
        }
    } catch (error) {   
      console.log("Changehero Floating Response Handeling", error)
    }


      //*************** Changehero Fixed Response Handeling ******************//
      try {
          const result = await response6.json();
        if(!isNaN(result.result[0].result)){
          changehero_fixed_price=sendingamount*parseFloat(result.result[0].result);
          changehero_fixed_rateId=result.result[0].id;
        }
    } catch (error) { 
      console.log("Changehero Fixed Response Handeling", error)
    }


      //*************** Exolix Floating Response Handeling ******************//
      try {
          const result = await response7.json();
        if(!isNaN(result.toAmount)){
          exolix_floating_price=parseFloat(result.toAmount);
          exolix_floating_minimum_amount=parseFloat(result.minAmount);
          exolix_floating_maximum_amount=parseFloat(result.maxAmount);
          exolix_floating_visibility=1;
        }else{
          if(parseFloat(result.minAmount)>sendingamount){
            exolix_floating_minimum_amount=parseFloat(result.minAmount);
            exolix_floating_visibility=1;
          }else if(parseFloat(result.maxAmount)<sendingamount){
            exolix_floating_maximum_amount=parseFloat(result.maxAmount);
            exolix_floating_visibility=1;
          }
        }
    } catch (error) {   
      console.log("Exolix Floating Response Handeling",error)
    }

      //*************** Exolix Fixed Response Handeling ******************//
      try {
          const result = await response8.json();
        if(!isNaN(result.toAmount)){
          exolix_fixed_price=parseFloat(result.toAmount);
          exolix_fixed_minimum_amount=parseFloat(result.minAmount);
          exolix_fixed_maximum_amount=parseFloat(result.maxAmount);
          exolix_fixed_visibility=1;
        }else{
          if(parseFloat(result.minAmount)>sendingamount){
            exolix_fixed_minimum_amount=parseFloat(result.minAmount);
            exolix_fixed_visibility=1;
          }else if(parseFloat(result.maxAmount)<sendingamount){
            exolix_fixed_maximum_amount=rparseFloat(result.maxAmount);
            exolix_fixed_visibility=1;
          }
        }
    } catch (error) {    
        console.log("Exolix Fixed Response Handeling",error)
    }


      //*************** Godex Floating Response Handeling ******************//
      try {
          const result = await response9.json();
        if(!isNaN(result.amount)){
          godex_floating_minimum_amount=parseFloat(result.min_amount);
          godex_floating_maximum_amount=parseFloat(result.max_amount);
          godex_floating_visibility=1;
          if(sendingamount>parseFloat(result.min_amount) || sendingamount<parseFloat(result.max_amount)){
            godex_floating_visibility=1;
            godex_floating_price=parseFloat(result.amount);
          }
        }
    } catch (error) {   
      console.log("Godex Floating Response Handeling",error)
    }

      //*************** Letsexchange Floating Response Handeling ******************//
      try {
          const result = await response10.json();
        if(!isNaN(result.amount)){
          letsexchange_floating_minimum_amount=parseFloat(result.deposit_min_amount);
          letsexchange_floating_maximum_amount=parseFloat(result.deposit_max_amount);
          letsexchange_floating_visibility=1;
          if(sendingamount>parseFloat(result.deposit_min_amount) || sendingamount<parseFloat(result.deposit_max_amount)){
            letsexchange_floating_visibility=1;
            letsexchange_floating_price=parseFloat(result.amount);
          }
        }
    } catch (error) {
      console.log(" Letsexchange Floating Response Handeling ", error)
    }

      //*************** Letsexchange Fixed Response Handeling ******************//
      try {
          const result = await response11.json();
        if(!isNaN(result.amount)){
          letsexchange_fixed_minimum_amount=parseFloat(result.deposit_min_amount);
          letsexchange_fixed_maximum_amount=parseFloat(result.deposit_max_amount);
          letsexchange_fixed_visibility=1;
          if(sendingamount>parseFloat(result.deposit_min_amount) || sendingamount<parseFloat(result.deposit_max_amount)){
            letsexchange_fixed_visibility=1;
            letsexchange_fixed_price=parseFloat(result.amount);
            letsexchange_fixed_rateId=result.rate_id==""?0:result.rate_id;
          }
        }
    } catch (error) {
      console.log("Letsexchange Fixed Response Handeling",error)
    }
    
      //*************** Stealthex Minmum Maximum Floating Api Response Handeling ******************//
      try {
        // return res.json(result)
          const result = await response12.json();
        if(!isNaN(result.min_amount)){
          stealthex_floating_minimum_amount=parseFloat(result.min_amount);
          stealthex_floating_visibility=1;
        }
    } catch (error) {   
      console.log("Stealthex Minmum Maximum Floating Api Response Handeling",error)
    }

      //*************** Stealthex Minmum Maximum Fixed Api Response Handeling ******************//
      try {
          const result = await response13.json();
        if(!isNaN(result.min_amount)){
          stealthex_fixed_minimum_amount=parseFloat(result.min_amount);
          stealthex_fixed_maximum_amount=parseFloat(result.max_amount);
          stealthex_fixed_visibility=1;
        }
    } catch (error) {   
      console.log("Stealthex Minmum Maximum Fixed Api Response Handeling",error)
    }

      //*************** Stealthex Floating Response Handeling ******************//
      try {
        // return res.json(result)
          const result = await response14.json();
        if(!isNaN(result.estimated_amount)){
            stealthex_floating_price=parseFloat(result.estimated_amount);
        }
    } catch (error) {  
      console.log("Stealthex Floating Response Handeling",error);
      
    }

      //*************** Stealthex Fixed Response Handeling ******************//
      try {
        // return res.json(result)
          const result = await response15.json();
        if(!isNaN(result.estimated_amount)){
            stealthex_fixed_price=parseFloat(result.estimated_amount);
            stealthex_fixed_rateId=result.rate_id;
        }
    } catch (error) {
      console.log("Stealthex Fixed Response Handeling",error)
    }

      //*************** Simpleswap Minimum Maximum Floating Response Handeling ******************//
      try {
        // return res.json(result)
          const result = await response16.json();
        if(!isNaN(result.min)){
            simpleswap_floating_minimum_amount=parseFloat(result.min);
            simpleswap_floating_visibility=1;
        }
    } catch (error) {
      console.log("Simpleswap Minimum Maximum Floating Response Handeling",error)
    }

      //*************** Simpleswap Minimum Maximum Fixed Response Handeling ******************//
      try {
        // return res.json(result)
          const result = await response17.json();
        if(!isNaN(result.min)&&!isNaN(result.max)){
            simpleswap_fixed_minimum_amount=parseFloat(result.min);
            simpleswap_fixed_maximum_amount=parseFloat(result.max);
            simpleswap_fixed_visibility=1;
        }
    } catch (error) {
      console.log("Simpleswap Minimum Maximum Fixed Response Handeling",error)
    }

      //*************** Simpleswap Floating Response Handeling ******************//
      try {
          const result = await response18.json();
        if(!isNaN(parseFloat(result))){
            simpleswap_floating_price=parseFloat(result);
        }
    } catch (error) {
      console.log("Simpleswap Floating Response Handeling",error);
    }


      //*************** Simpleswap Fixed Response Handeling ******************//
      try {
        // return res.json(result)
          const result = await response19.json();
        if(!isNaN(parseFloat(result))){
            simpleswap_fixed_price=parseFloat(result);
        }
    } catch (error) {   
      console.log("Simpleswap Fixed Response Handeling",error);      
    }


    function truncateNumber(num, limit) {
      // Convert the number to a string
      let numStr = num.toString();
  
      // Check if the number has a decimal point
      const hasDecimal = numStr.includes('.');
  
      // If the number is longer than 16 characters
      if (numStr.length > limit) {
          // If the number has a decimal point
          if (hasDecimal==true) {
              // Find the index of the decimal point
              const decimalIndex = numStr.indexOf('.');
  
              // Get the substring up to 16 characters, including the decimal point
              numStr = numStr.substring(0, limit+1);
              // If the decimal point is beyond the 16 characters, trim it
              if (decimalIndex >= 16) {
                  numStr = numStr.slice(0, -1);
              }
          } else {
              // If the number doesn't have a decimal point, simply get the substring up to 16 characters
              numStr = numStr.substring(0, limit);
          }
      }
  
      // Parse the truncated string back to a number and return it
      return parseFloat(numStr);
  }
  



      //Response Array
      let offerarray = [
        //0
        { name: "changelly", offerED:sendingamount>=changelly_floating_minimum_amount?"enable":"disable", visibility:sendingamount>=changelly_floating_minimum_amount&&changelly_floating_price==0?0:changelly_floating_visibility, min:truncateNumber(changelly_floating_minimum_amount,8), max:changelly_floating_maximum_amount, transaction_type:"Floating", eta:"5-30 Min", kyc:"On Occasion", rating:"4.2/5", rate: truncateNumber(changelly_floating_price, 16)},
        //1
        { name: "changelly", offerED:sendingamount>=changelly_fixed_minimum_amount?"enable":"disable", visibility:sendingamount>=changelly_fixed_minimum_amount&&changelly_fixed_price==0?0:changelly_fixed_visibility, min:truncateNumber(changelly_fixed_minimum_amount, 8), max:changelly_fixed_maximum_amount, transaction_type:"Fixed", eta:"5-30 Min", kyc:"On Occasion", rating:"4.2/5", rate: truncateNumber(changelly_fixed_price, 16), rateId: changelly_fixed_rateId },
        //2
        { name: "changenow", offerED:sendingamount>=changenow_floating_minimum_amount?"enable":"disable", visibility:sendingamount>=changenow_floating_minimum_amount&&changenow_floating_price==0?0:changenow_floating_visibility, min:truncateNumber(changenow_floating_minimum_amount, 8), max:changenow_floating_maximum_amount, transaction_type:"Floating", eta:"10-60 Min", kyc:"On Occasion", rating:"4.5/5", rate: truncateNumber(changenow_floating_price, 16) },
        //3
        { name: "changenow", offerED:sendingamount>=changenow_fixed_minimum_amount?"enable":"disable", visibility:sendingamount>=changenow_fixed_minimum_amount&&changenow_fixed_price==0?0:changenow_fixed_visibility, min: truncateNumber(changenow_fixed_minimum_amount, 8), max:changenow_fixed_maximum_amount, transaction_type:"Fixed", eta:"10-60 Min", kyc:"On Occasion", rating:"4.5/5", rate: truncateNumber(changenow_fixed_price, 16), rateId: changenow_fixed_rateId },
        //4
        { name: "changehero", offerED:sendingamount>=changehero_floating_minimum_amount?"enable":"disable", visibility:sendingamount>=changehero_floating_minimum_amount&&changehero_floating_price==0?0:changehero_floating_visibility, min: truncateNumber(changehero_floating_minimum_amount, 8), max:changehero_floating_maximum_amount, transaction_type:"Floating", eta:"12-26 Min", kyc:"On Occasion", rating:"3.7/5", rate: truncateNumber(changehero_floating_price, 16) },
        //5
        { name: "changehero", offerED:sendingamount>=changehero_fixed_minimum_amount?"enable":"disable", visibility:sendingamount>=changehero_fixed_minimum_amount&&changehero_fixed_price==0?0:changehero_fixed_visibility, min: truncateNumber(changehero_fixed_minimum_amount, 8), max:changehero_fixed_maximum_amount, transaction_type:"Fixed", eta:"12-26 Min", kyc:"On Occasion", rating:"3.7/5",  rate: truncateNumber(changehero_fixed_price, 16), rateId: changehero_fixed_rateId },
        //6
        { name: "exolix", offerED:sendingamount>=exolix_floating_minimum_amount?"enable":"disable", visibility:sendingamount>=exolix_floating_minimum_amount&&exolix_floating_price==0?0:exolix_floating_visibility, min: truncateNumber(exolix_floating_minimum_amount, 8), max:exolix_floating_maximum_amount, transaction_type:"Floating", eta:"22-46 Min", kyc:"Rarely Required", rating:"4.3/5", rate: truncateNumber(exolix_floating_price, 16)},
        //7
        { name: "exolix", offerED:sendingamount>=exolix_fixed_minimum_amount?"enable":"disable", visibility:sendingamount>=exolix_fixed_minimum_amount&&exolix_fixed_price==0?0:exolix_fixed_visibility, min: truncateNumber(exolix_fixed_minimum_amount, 8), max:exolix_fixed_maximum_amount, transaction_type:"Fixed", eta:"22-46 Min", kyc:"Rarely Required", rating:"4.3/5", rate: truncateNumber(exolix_fixed_price, 16) },
        //8
        { name: "godex", offerED:sendingamount>=godex_floating_minimum_amount?"enable":"disable", visibility:sendingamount>=godex_floating_minimum_amount&&godex_floating_price==0?0:godex_floating_visibility, min: truncateNumber(godex_floating_minimum_amount, 8), max:godex_floating_maximum_amount, transaction_type:"Floating", eta:"14-51 Min", kyc:"Rarely Required", rating:"4.6/5", rate: truncateNumber(godex_floating_price, 16) },
        //9
        { name: "letsexchange", offerED:sendingamount>=letsexchange_floating_minimum_amount?"enable":"disable", visibility:sendingamount>=letsexchange_floating_minimum_amount&&letsexchange_floating_price==0?0:letsexchange_floating_visibility, min: truncateNumber(letsexchange_floating_minimum_amount, 8), max:letsexchange_floating_maximum_amount, transaction_type:"Floating", eta:"2-44 Min", kyc:"Not Required", rating:"4.6/5", rate: truncateNumber(letsexchange_floating_price, 16) },
        //10
        { name: "letsexchange", offerED:sendingamount>=letsexchange_fixed_minimum_amount?"enable":"disable", visibility:sendingamount>=letsexchange_fixed_minimum_amount&&letsexchange_fixed_price==0?0:letsexchange_fixed_visibility, min:truncateNumber(letsexchange_fixed_minimum_amount, 8), max:letsexchange_fixed_maximum_amount, transaction_type:"Fixed", eta:"2-44 Min", kyc:"Not Required", rating:"4.6/5", rate: truncateNumber(letsexchange_fixed_price, 16), rateId: letsexchange_fixed_rateId },
        //11
        { name: "stealthex", offerED:sendingamount>=stealthex_floating_minimum_amount?"enable":"disable", visibility:sendingamount>=stealthex_floating_minimum_amount&&stealthex_floating_price==0?0:stealthex_floating_visibility, min:truncateNumber(stealthex_floating_minimum_amount, 8), max:stealthex_floating_maximum_amount, transaction_type:"Floating", eta:"7-38 Min", kyc:"On Occasion", rating:"4.7/5", rate: truncateNumber(stealthex_floating_price, 16)},
        //12
        { name: "stealthex", offerED:sendingamount>=stealthex_fixed_minimum_amount?"enable":"disable", visibility:sendingamount>=stealthex_fixed_minimum_amount&&stealthex_fixed_price==0?0:stealthex_fixed_visibility,  min:truncateNumber(stealthex_fixed_minimum_amount, 8), max:stealthex_fixed_maximum_amount, transaction_type:"Fixed", eta:"7-38 Min", kyc:"On Occasion", rating:"4.7/5", rate: truncateNumber(stealthex_fixed_price, 16), rateId: stealthex_fixed_rateId },
        //13
        { name: "simpleswap", offerED:sendingamount>=simpleswap_floating_minimum_amount?"enable":"disable", visibility:sendingamount>=simpleswap_floating_minimum_amount&&simpleswap_floating_price==0?0:simpleswap_floating_visibility, min: truncateNumber(simpleswap_floating_minimum_amount, 8), max:simpleswap_floating_maximum_amount, transaction_type:"Floating", eta:"9-50 Min", kyc:"Rarely Required", rating:"4.4/5", rate:truncateNumber(simpleswap_floating_price, 16) },
        //14
        { name: "simpleswap", offerED:sendingamount>=simpleswap_fixed_minimum_amount?"enable":"disable", visibility:sendingamount>=simpleswap_fixed_minimum_amount&&simpleswap_fixed_price==0?0:simpleswap_fixed_visibility, min: truncateNumber(simpleswap_fixed_minimum_amount, 8), max:simpleswap_fixed_maximum_amount, transaction_type:"Fixed", eta:"9-50 Min", kyc:"Rarely Required", rating:"4.4/5",  rate: truncateNumber(simpleswap_fixed_price, 16)},
      ];

      //Arranging offers based on offer sequence type function
      function sortArrayDescending(offerarray) {
        if(offerstype=="bestprices")
        {
          console.log("best prices");
          // Filter objects with offer value "enable" and sort them based on rate in descending order
          let enabledObjects = offerarray.filter(obj => obj.offerED === "enable" && obj.visibility==1).sort((a, b) => parseFloat(b.rate) - parseFloat(a.rate));

          // Filter objects with offer value "disable" and sort them based on min in descending order
          let disabledObjects = offerarray.filter(obj => obj.offerED === "disable" && obj.visibility === 1).sort((a, b) => parseFloat(a.min) - parseFloat(b.min));

          // Concatenate the sorted arrays
          let sortedArray = enabledObjects.concat(disabledObjects);
          
          sortedArray=fixed=="Floating"?sortedArray.filter(obj => obj.transaction_type ==="Floating" || obj.transaction_type ==="Fixed"):sortedArray.filter(obj => obj.transaction_type ==="Fixed");
          // console.log(sortedArray);
          return sortedArray;

        }else if(offerstype=="fastestswap"){
          let fastestswap_array=[offerarray[9], offerarray[10], offerarray[0], offerarray[1], offerarray[11], offerarray[12], offerarray[13], offerarray[14], offerarray[2], offerarray[3], offerarray[4], offerarray[5], offerarray[8], offerarray[6], offerarray[7] ];
          console.log("Fastest Swap");

              // Filter out objects with visibility equal to 0
              fastestswap_array = fastestswap_array.filter(obj => obj.visibility !== 0);
              
              fastestswap_array=fixed=="Floating"?fastestswap_array.filter(obj => obj.transaction_type ==="Floating" || obj.transaction_type ==="Fixed"):fastestswap_array.filter(obj => obj.transaction_type ==="Fixed");
              // console.log(fastestswap_array);
              return fastestswap_array;

        }else if(offerstype=="bestrating"){
          let bestrating_array=[offerarray[11], offerarray[12], offerarray[9], offerarray[10], offerarray[8], offerarray[2], offerarray[3], offerarray[13], offerarray[14], offerarray[6], offerarray[7], offerarray[0], offerarray[1], offerarray[4], offerarray[5] ];
          console.log("Best Rating");

              // Filter out objects with visibility equal to 0
              bestrating_array = bestrating_array.filter(obj => obj.visibility !== 0);

              bestrating_array=fixed=="Floating"?bestrating_array.filter(obj => obj.transaction_type ==="Floating" || obj.transaction_type ==="Fixed"):bestrating_array.filter(obj => obj.transaction_type ==="Fixed");
              // console.log(bestrating_array);
              return bestrating_array;
        }
      }

      const sortedArray = sortArrayDescending(offerarray, "rate");
      
      return res.json({bestoffer:sortedArray.length>0?sortedArray[0].rate:0, offersarray:sortedArray});
      },responsecalldelay);


      //********************************************* API CALLS *******************************************/

      //*************************** Changelly Minimum and Maximum Fixed and Floating **********************/
      setTimeout(()=>{
        request(param3, async function (error, response) {
          try {
            const data = await JSON.parse(response.body);
            if(!isNaN(data.result[0].minAmountFloat)&&!isNaN(data.result[0].maxAmountFloat)&&!isNaN(data.result[0].minAmountFixed)&&!isNaN(data.result[0].maxAmountFixed)){
              changelly_floating_minimum_amount=parseFloat(data.result[0].minAmountFixed);
              changelly_floating_maximum_amount=parseFloat(data.result[0].maxAmountFixed);
              changelly_fixed_minimum_amount=parseFloat(data.result[0].minAmountFixed);
              changelly_fixed_maximum_amount=parseFloat(data.result[0].maxAmountFixed);
              changelly_floating_visibility=1;
              changelly_fixed_visibility=1;
            }

          } catch (error) {
            
            console.log("Changelly Minimum and Maximum Fixed and Floating",error);
          }
        })
      },apicalldelay)


      //********************************************* Changelly Floating Api Call *******************************************/
      setTimeout(() => {

        request(param1, async function (error, response) {
          try {
            const data = await JSON.parse(response.body);
            if(!isNaN(data.result[0].amountTo)){
              changelly_floating_price = parseFloat(data.result[0].amountTo);
            }
          } catch (error) {
            
            console.log("Changelly Floating Api Call",error)
          }
        })
      
    }, apicalldelay)

      //********************************************* Changelly Fixed Api Call *******************************************/
      setTimeout(async () => {

          request(param2, async function (error, response) {
            try {
                const data = await JSON.parse(response.body);
                if(!isNaN(data.result[0].amountTo)){
                  changelly_fixed_price = parseFloat(data.result[0].amountTo);
                  changelly_fixed_rateId= data.result[0].id;
                }   
            } catch (error) {
              
              console.log("Changelly Fixed Api Call", error);          
            }
          })
      }, apicalldelay)




      //********************************************* Changenow Minimum Maximum Floating Api Call *******************************************/
      setTimeout(async() => {
        try {
          response1 = await fetch(
            `https://api.changenow.io/v2/exchange/range?fromCurrency=${sell}&toCurrency=${get}&flow=standard`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "x-changenow-api-key":changenow_api_key
              },
            }
          )           
        } catch (error) {
          console.log("Changenow Minimum Maximum Floating Api Call", error);
        }  
      
    }, apicalldelay)

      //********************************************* Changenow Minimum Maximum Fixed Api Call *******************************************/
      setTimeout(async() => {
        try {
          response20 = await fetch(
            `https://api.changenow.io/v2/exchange/range?fromCurrency=${sell}&toCurrency=${get}&flow=fixed-rate`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "x-changenow-api-key":changenow_api_key
              },
            }
          ) 
        } catch (error) {
          console.log("Changenow Minimum Maximum Fixed Api Call", error);
        }    
      
    }, apicalldelay)

      //********************************************* Changenow Floating Api Call *******************************************/
      setTimeout(async() => {
        try {
          response2 = await fetch(
            `https://api.changenow.io/v1/exchange-amount/${amount}/${sell}_${get}/?api_key=${changenow_api_key}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          )  
        } catch (error) {
          console.log("Changenow Floating Api Call", error);
        }     
      
    }, apicalldelay)


      //********************************************* Changenow Fixed Api Call *******************************************/
      setTimeout(async() => {
        try {
          response3 = await fetch(
            `https://api.changenow.io/v1/exchange-amount/fixed-rate/${amount}/${sell}_${get}?api_key=${changenow_api_key}&useRateId=true`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          ) 
        } catch (error) {
          console.log("Changenow Fixed Api Call", error);
        }      
      
    }, apicalldelay)

    //********************************************* Changehero Minimum and Maximum Floating Api Call *******************************************/
    setTimeout(async() => {
      try {
        const param1 = {
          jsonrpc: "2.0",
          method: "getMinAmount",
          params: {
            from: sell,
            to: get,
          },
        };
  
        response4 = await fetch(`https://api.changehero.io/v2/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": changehero_api_key,
          },
          body: JSON.stringify(param1),
        })  
      } catch (error) {
        console.log("Changehero Minimum and Maximum Floating Api Call", error);
      }   
  
}, apicalldelay)

    //********************************************* Changehero Minimum and Maximum Fixed Api Call *******************************************/
    setTimeout(async() => {
      try {
        const param = {
          jsonrpc: "2.0",
          method: "getFixRate",
          params: {
            from: sell,
            to: get,
          },
        };
        response21 = await fetch(`https://api.changehero.io/v2/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": changehero_api_key,
          },
          body: JSON.stringify(param),
        })
      } catch (error) {
        console.log("Changehero Minimum and Maximum Fixed Api Call", error);
      }
    
  }, apicalldelay)

      //********************************************* Changehero Floating Api Call *******************************************/
      setTimeout(async() => {
        try {
          const param2 = {
            jsonrpc: "2.0",
            method: "getExchangeAmount",
            params: {
              from: sell,
              to: get,
              amount:amount
            },
          };
  
          response5 = await fetch(
            `https://api.changehero.io/v2/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "api-key": changehero_api_key,
              },
              body: JSON.stringify(param2),
            }
          )    
        } catch (error) {
          console.log("Changehero Floating Api Call", error);
        } 
    
  }, apicalldelay)


      //********************************************* Changehero Fixed Api Call *******************************************/
      setTimeout(async() => {
        try {
          const param = {
            jsonrpc: "2.0",
            method: "getFixRate",
            params: {
              from: sell,
              to: get,
            },
          };
          response6 = await fetch(`https://api.changehero.io/v2/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "api-key": changehero_api_key,
            },
            body: JSON.stringify(param),
          })
        } catch (error) {
          console.log("Changehero Fixed Api Call", error);
        }
       
    
  }, apicalldelay)


      //********************************************* Exolix Floating Api Call *******************************************/
      setTimeout(async() => {
        try {
          response7 = await fetch(
            `https://exolix.com/api/v2/rate?coinFrom=${sell}&coinTo=${get}&amount=${amount}&rateType=float`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          )  
        } catch (error) {
          console.log("Exolix Floating Api Call", error);
        }
    
  }, apicalldelay)

      //********************************************* Exolix Fixed Api Call *******************************************/
        setTimeout(async() => {
          try {
            response8 = await fetch(
              `https://exolix.com/api/v2/rate?coinFrom=${sell}&coinTo=${get}&amount=${amount}&rateType=fixed`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            )
          } catch (error) {
            console.log("Exolix Fixed Api Call", error);
          }
      
    }, apicalldelay)

      //********************************************* Godex Floating Api Call *******************************************/
      setTimeout(async() => {
        try {
          const param = {
            from: sell.toUpperCase(),
            to: get.toUpperCase(),
            amount: amount,
          };
  
          response9 = await fetch(
            `https://api.godex.io/api/v1/info`,
            {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify(param),
            }
          )
        } catch (error) {
          console.log("Exolix Floating Api Call", error);
        }
    
  }, apicalldelay)


      //********************************************* Letsexchange Floating Api Call *******************************************/
      setTimeout(async () => {
        try {
          let toncoinsell, toncoinget,param;
        if(sell=="toncoin" || get=="toncoin"){
          toncoinsell=sell=="toncoin"?"TON-ERC20":sell;
          toncoinget=get=="toncoin"?"TON-ERC20":get;
      
           param = {
            from: toncoinsell,
            to: toncoinget,
            amount: amount,
            float: true
          }
      
      
        }else{
          param = {
           from: sell,
           to: get,
           amount: amount,
           float: true
         };
       }
        
        response10 = await fetch(`https://api.letsexchange.io/api/v1/info`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": godex_private_key
          },
          body: JSON.stringify(param),
        })
        } catch (error) {
          console.log("Letsexchange Floating Api Call", error);
        }

      }, apicalldelay)

      //********************************************* Letsexchange Fixed Api Call *******************************************/
      setTimeout(async () => {
        try {
          let toncoinsell, toncoinget,param;
        if(sell=="toncoin" || get=="toncoin"){
          toncoinsell=sell=="toncoin"?"TON-ERC20":sell;
          toncoinget=get=="toncoin"?"TON-ERC20":get;
      
           param = {
            from: toncoinsell,
            to: toncoinget,
            amount: amount,
            float: false
          }
      
      
        }else{
          param = {
           from: sell,
           to: get,
           amount: amount,
           float: false
         };
       }
        
        response11 = await fetch(`https://api.letsexchange.io/api/v1/info`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": godex_private_key
          },
          body: JSON.stringify(param)
        })
        } catch (error) {
          console.log("Letsexchange Fixed Api Call", error);
        } 

      }, apicalldelay)    

      //********************************************* Stealthex Minimum Maximum Floating Api Call *******************************************/
      setTimeout(async () => {
        try {
          response12 = await fetch(
            `https://api.stealthex.io/api/v2/range/${sell}/${get}?api_key=${stealthex_api_key}&fixed=false`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
        } catch (error) {
          console.log("Stealthex Minimum Maximum Floating Api Call", error);
        }

      }, apicalldelay)
      
      //********************************************* Stealthex Minimum Maximum Fixed Api Call *******************************************/
      setTimeout(async () => {
        try {
          response13 = await fetch(
            `https://api.stealthex.io/api/v2/range/${sell}/${get}?api_key=${stealthex_api_key}&fixed=true`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
        } catch (error) {
          console.log("Stealthex Minimum Maximum Fixed Api Call", error);
        }

      }, apicalldelay)    

      //********************************************* Stealthex Floating Api Call *******************************************/
      setTimeout(async () => {
        try {
          response14 = await fetch(`https://api.stealthex.io/api/v2/estimate/${sell}/${get}?amount=${amount}&api_key=${stealthex_api_key}&fixed=false`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })
        } catch (error) {
          console.log("Stealthex Floating Api Call", error);
        }

      }, apicalldelay)   
      
      //********************************************* Stealthex Fixed Api Call *******************************************/
      setTimeout(async () => {
        try {
          response15 = await fetch(`https://api.stealthex.io/api/v2/estimate/${sell}/${get}?amount=${amount}&api_key=${stealthex_api_key}&fixed=true`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })
        } catch (error) {
          console.log("Stealthex Fixed Api Call", error);
        }

      }, apicalldelay)   

      //********************************************* Simpleswap Minimum Maximum Floating Api Call *******************************************/
      setTimeout(async () => {
        try {
          let sellcoin=sell=="toncoin"?"tonerc20":sell;
          let getcoin=get=="toncoin"?"tonerc20":get;
  
          response16 = await fetch(`https://api.simpleswap.io/get_ranges?api_key=${simpleswap_api_key}&fixed=false&currency_from=${sellcoin}&currency_to=${getcoin}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            }
          });
        } catch (error) {
          console.log("Simpleswap Minimum Maximum Floating Api Call", error);
        }

      }, apicalldelay) 

      //********************************************* Simpleswap Minimum Maximum Fixed Api Call *******************************************/
      setTimeout(async () => {
        try {
          let sellcoin=sell=="toncoin"?"tonerc20":sell;
          let getcoin=get=="toncoin"?"tonerc20":get;
  
          response17 = await fetch(`https://api.simpleswap.io/get_ranges?api_key=${simpleswap_api_key}&fixed=true&currency_from=${sellcoin}&currency_to=${getcoin}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            }
          });
        } catch (error) {
          console.log("Simpleswap Minimum Maximum Fixed Api Call", error);
        }

      }, apicalldelay) 

      //********************************************* Simpleswap Floating Api Call *******************************************/
      setTimeout(async () => {
        try {
          let sellcoin=sell=="toncoin"?"tonerc20":sell;
          let getcoin=get=="toncoin"?"tonerc20":get;
  
          response18 = await fetch(`http://api.simpleswap.io/get_estimated?api_key=${simpleswap_api_key}&fixed=false&currency_from=${sellcoin}&currency_to=${getcoin}&amount=${amount}`, {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                  }
                });
        } catch (error) {
          console.log("Simpleswap Floating Api Call", error);
        }

      }, apicalldelay) 

      //********************************************* Simpleswap Fixed Api Call *******************************************/
      setTimeout(async () => {
        try {
          let sellcoin=sell=="toncoin"?"tonerc20":sell;
          let getcoin=get=="toncoin"?"tonerc20":get;
  
          response19 = await fetch(`http://api.simpleswap.io/get_estimated?api_key=${simpleswap_api_key}&fixed=true&currency_from=${sellcoin}&currency_to=${getcoin}&amount=${amount}`, {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                  }
                });
        } catch (error) {
          console.log("Simpleswap Fixed Api Call", error);
        }

      }, apicalldelay) 
      
    } catch (error) {
      console.log(error)
      return res.json({bestoffer: 0, offersarray:[]});
    }
  }

  static currencies = async (req, res) =>{
    const url="https://api.changenow.io/v2/exchange/currencies?active=&flow=standard&buy=&sell=";
    const response = await fetch(url);
    const data = await response.json(response);
    const array = data.map((coin,index) => {

      var string=coin.name
      var tick=coin.legacyTicker
      let color="";

      if(coin.network=="matic" && coin.ticker!="eth"){
        color="rgb(218, 0, 80)";
      }else if (coin.network=="omni"){
        color="rgb(243, 147, 33)";
      }else if (coin.network=="dot"){
        color="rgb(218, 0, 80)";
      }else if (coin.network=="sol"){
        color="rgb(143, 74, 246)";
      }else if (coin.network=="kcs"){
        color="rgb(0, 147, 221)";
      }else if (coin.network=="bep2"){
        color="rgb(180, 191, 206)";
      }else if (coin.network=="avaxx"){
        color="rgb(94, 23, 254)";
      }else if (coin.network=="chiliz"){
        color="rgb(225, 17, 86)";
      }else if (coin.network=="eth"){
        color="rgb(79,173,208)";
      }else if (coin.network=="bsc"){
        color="rgb(255, 194,65)";
      }else if (coin.network=="arbitrum"){
        color="rgb(40, 160, 240)";
      }else if (coin.network=="op"){
        color="rgb(254, 5, 32)";
      }else if (coin.network=="zksync"){
        color="rgb(30, 105, 255)";
      }else if (coin.network=="base"){
        color="rgb(33, 81, 245)";
      }else if (coin.network=="strk"){
        color="rgb(0,0,0)";
      }else if (coin.network=="lna"){
        color="rgb(132, 220, 251)";
      }else if (coin.network=="trx"){
        color="rgb(238, 57, 50)";
      }else if (coin.network=="algo"){
        color="rgb(0,0,0)";
      }else if (coin.network=="avaxc"){
        color="rgb(254, 5, 32)";
      }else if (coin.network=="near"){
        color="rgb(108, 232, 158)";
      }else if (coin.network=="kavaevm"){
        color="rgb(255, 86, 79)";
      }else if (coin.network=="eos"){
        color="rgb(0,0,0";
      }else if (coin.network=="xtz"){
        color="rgb(230, 0, 122)";
      }else if (coin.network=="xlm"){
        color="rgb(57, 29, 210)";
      }else if (coin.network=="ron"){
        color="rgb(0, 177, 229)";
      }else if (coin.network=="kcc"){
        color="rgb(35, 175, 145)";
      }else if (coin.network=="ada"){
        color="rgb(60, 200, 200)";
      }else if (coin.network=="cro"){
        color="rgb(0,0,0)";
      }else if (coin.network=="mnt"){
        color="rgb(57, 119, 13)";
      }else if (coin.network=="theta"){
        color="rgb(180, 191, 206)";
      }else if (coin.network=="chz"){
        color="rgb(225, 18, 86)";
      }
      const index1 = string.indexOf("(");
      const index2 = string.indexOf(")");

      if(index1>=1 || index2>=1){
        const substring1=string.substring(index1+1, index2);
        const substring2=string.substring( index1-1, index2+1);
        const substring3=string.substring( 0, index1);
       
        if(string==="Tether (STATEMINT(Polkadot))"){
     
          return { coinindex:index, symbol: coin.legacyTicker, popular: coin.featured, isstable:coin.isStable, othercoin:coin.featured==false && coin.isStable==false?true:false,  shortname:coin.ticker, network:coin.network, networkcolor:color, name: coin.name, image: coin.image, chainname1:substring1, chainname2:"(Polkadot)", symbol2:substring3 };
          
        }else if(tick.includes("bsc")===true){

          return { coinindex:index, symbol: coin.legacyTicker, popular: coin.featured, shortname:coin.ticker, isstable:coin.isStable, othercoin:coin.featured==false && coin.isStable==false?true:false, network:coin.network, networkcolor:color, name: coin.name, image: coin.image, chainname1:substring1,  chainname2:substring2, symbol2:substring3, chainname3:" (Binance Smart Chain)" };

        }else if(tick.includes("erc20")===true){

          return { coinindex:index, symbol: coin.legacyTicker, popular: coin.featured, shortname:coin.ticker, isstable:coin.isStable, othercoin:coin.featured==false && coin.isStable==false?true:false, network:coin.network, networkcolor:color, name: coin.name, image: coin.image, chainname1:substring1,  chainname2:substring2, symbol2:substring3, chainname3:" (ERC20)" };

        }else if(tick.includes("mainnet")===true){

          return { coinindex:index, symbol: coin.legacyTicker, popular: coin.featured, shortname:coin.ticker, isstable:coin.isStable, othercoin:coin.featured==false && coin.isStable==false?true:false, network:coin.network, networkcolor:color, name: coin.name, image: coin.image, chainname1:substring1,  chainname2:substring2, symbol2:substring3, chainname3:" (Mainnet)" };

        }else if(tick.includes("matic")===true){

          return { coinindex:index, symbol: coin.legacyTicker, popular: coin.featured, shortname:coin.ticker, isstable:coin.isStable, othercoin:coin.featured==false && coin.isStable==false?true:false, network:coin.network, networkcolor:color, name: coin.name, image: coin.image, chainname1:substring1,  chainname2:substring2, symbol2:substring3, chainname3:" (Polygon)" };

        }else{
            return { coinindex:index, symbol: coin.legacyTicker, popular: coin.featured, shortname:coin.ticker, isstable:coin.isStable, othercoin:coin.featured==false && coin.isStable==false?true:false, network:coin.network, networkcolor:color, name: coin.name, image: coin.image, chainname1:substring1,  chainname2:substring2, symbol2:substring3 };
          }

      }else{
        const substring1=string.substring(index1+1, index2);
        const substring2=string.substring( index1-1, index2+1);
        const substring3=string.substring( 0, index1);

        if(tick.includes("bsc")===true){

          return { coinindex:index, symbol: coin.legacyTicker, popular: coin.featured, shortname:coin.ticker, isstable:coin.isStable, othercoin:coin.featured==false && coin.isStable==false?true:false, network:coin.network, networkcolor:color, name: coin.name, image: coin.image, chainname1:substring1,  chainname2:substring2, symbol2:coin.name, chainname3:" (Binance Smart Chain)" };

        }else if(tick.includes("erc20")===true){

          return { coinindex:index, symbol: coin.legacyTicker, popular: coin.featured, shortname:coin.ticker, isstable:coin.isStable, othercoin:coin.featured==false && coin.isStable==false?true:false, network:coin.network, networkcolor:color, name: coin.name, image: coin.image, chainname1:substring1,  chainname2:substring2, symbol2:coin.name, chainname3:" (ERC20)" };

        }else if(tick.includes("mainnet")===true){

          return { coinindex:index, symbol: coin.legacyTicker, popular: coin.featured, shortname:coin.ticker, isstable:coin.isStable, othercoin:coin.featured==false && coin.isStable==false?true:false, network:coin.network, networkcolor:color, name: coin.name, image: coin.image, chainname1:substring1,  chainname2:substring2, symbol2:coin.name, chainname3:" (Mainnet)" };

        }else if(tick.includes("matic")===true){

          return { coinindex:index, symbol: coin.legacyTicker, popular: coin.featured, shortname:coin.ticker, isstable:coin.isStable, othercoin:coin.featured==false && coin.isStable==false?true:false, network:coin.network, networkcolor:color, name: coin.name, image: coin.image, chainname1:substring1,  chainname2:substring2, symbol2:coin.name, chainname3:" (Polygon)" };

        }else{
            return { coinindex:index, symbol: coin.legacyTicker, popular: coin.featured, shortname:coin.ticker, isstable:coin.isStable, othercoin:coin.featured==false && coin.isStable==false?true:false, network:coin.network, networkcolor:color, name: coin.name, image: coin.image, chainname1:substring1,  chainname2:substring2, symbol2:coin.name };
          }                 
      }

})

return res.json(array);
  };

  static homeprice = async (req, res) => {
    const { sel, get, amount } = req.body;
        const stealthex_api_key=process.env.STEALTHEX;
        
      try {
        const response1 = await fetch(
          `https://api.stealthex.io/api/v2/range/${sel}/${get}?api_key=${stealthex_api_key}&fixed=false`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
    
        const data=await response1.json();
        console.log(data)
        const minamount =parseFloat(data.min_amount);
        const amt=parseFloat(amount);
        if(minamount<=amt){
  
          const response2 = await fetch(`https://api.stealthex.io/api/v2/estimate/${sel}/${get}?amount=${amt}&api_key=${stealthex_api_key}&fixed=false`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })
    
          // const response2=await fetch(url2,options2);
          const data2=await response2.json();
  
          const response3 = await fetch(`https://api.stealthex.io/api/v2/estimate/${sel}/${get}?amount=${minamount}&api_key=${stealthex_api_key}&fixed=false`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })
  
          const data3=await response3.json();
  
          // console.log("Minimum",data2, "Estimated Amount", data3)

          return res.json({to:{amount:data2.estimated_amount, from:{min:minamount}, onesel:data3.estimated_amount/minamount}})
        }else{
  
          const response3 = await fetch(`https://api.stealthex.io/api/v2/estimate/${sel}/${get}?amount=${minamount}&api_key=${stealthex_api_key}&fixed=false`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })
  
          const data3=await response3.json();
          console.log(data3)
          return res.json({to:{amount:0, from:{min:minamount}, onesel:data3.estimated_amount/minamount}})
        }
      } catch (error) {
        console.log(error)
        return res.json({to:{amount:0, from:{min:0}, onesel:0}});
      }
     
  };

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
          const data = await JSON.parse(response.body);
          let price = data.result[0].amountTo;
          return res.json({price:price})
        } catch (error) {
          return res.json({price:0, message:"Amount not in range! Please wait until amount comes in range or change sell amount."})
        }
      })
  }

  static changenowprice=async (req, res)=>{
    const {sell,get,amount, exchangetype}=req.body
    const typeidentifier=exchangetype=="Floating"?"":"/fixed-rate";
    try {
      const response = await fetch(
        `https://api.changenow.io/v1/exchange-amount${typeidentifier}/${amount}/${sell}_${get}/?api_key=3016eb278f481714c943980dec2bfc595f8a2160e8eabd0228dc02cc627a184c`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      const data=await response.json()
      const price=data.estimatedAmount;
      if(data.estimatedAmount){
        return res.json({price:price});
      }else{
        throw new Error();
      }
    } catch (error) {
      return res.json({price:0, message:"Amount not in range! Please wait until amount comes in range or change sell amount."})
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
    
      const data=await response.json()
      if(data.estimated_amount){
        const price=data.estimated_amount;
        return res.json({price:price});
      }else{
        throw new Error();
      }

    } catch (error) {
      return res.json({price:0, message:"Amount not in range! Please wait until amount comes in range or change sell amount."})
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
    
      const data=await response.json()
      if(data.toAmount){
        const price=data.toAmount
        return res.json({price:price});
      }else{
        throw new Error();
      }
    } catch (error) {
      return res.json({price:0, message:"Amount not in range! Please wait until amount comes in range or change sell amount."})
    }

  }

  static simpleswapprice=async (req, res)=>{
    const {sell,get,amount, exchangetype}=req.body;
    const typeidentifier=exchangetype=="Floating"?"false":"true";
    try {
      const response =  await fetch(`http://api.simpleswap.io/get_estimated?api_key=ae57f22d-7a23-4dbe-9881-624b2e147759&fixed=${typeidentifier}&currency_from=${sell}&currency_to=${get}&amount=${amount}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
    
      const data=await response.json();
      if(data.error){
        throw new Error();
      }else{
        const price=data
        return res.json({price:price}); 
      }
    } catch (error) {
        return res.json({price:0, message:"Amount not in range! Please wait until amount comes in range or change sell amount."});
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
        const price=data.result;
        return res.json({price:price});
      }else{
        throw new Error();
      }
    } catch (error) {
      return res.json({price:0, message:"Amount not in range! Please wait until amount comes in range or change sell amount."});
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
        const price=data.amount;
        return res.json({price:price});
      }else{
        throw new Error();
      }
    } catch (error) {
      return res.json({price:0, message:"Amount not in range! Please wait until amount comes in range or change sell amount."});
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
          "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0b2tlbiIsImRhdGEiOnsiaWQiOjkwLCJoYXNoIjoiZXlKcGRpSTZJa2wzYmxFNE1VeHVOMU5DU25aamFEbExWVE5rYW1jOVBTSXNJblpoYkhWbElqb2lUV1ZhWWs5dGNXY3dWSEZMYm1wWGRuVjJjMXBzV0RaU1ZpdFphamxJYWtrM1EzQkhTRlpsVFdGS1JXZHVXV1pxUTJRNU9WUXlaSHBEVDJWd2NVeEdRVTFOYjBVelJIaEdSRzlwWjBsaEt6UjJWR0UxVjI1TmQweEROamRCUmxCWFdISTJRMGRpUm1Kb1ltTTlJaXdpYldGaklqb2labU0xTnpNMU0yRXlaRFJqWmpSalpXWTFZV1ZqWVRkalptSTBZall4WmpVNFpqZGtNak0wTXpVNU1XRmtaRGRrWm1Sak5HWXhaamt6TldFM01tVXlOaUo5In0sImlzcyI6Imh0dHBzOlwvXC9sZXRzLW5naW54LXN2Y1wvYXBpXC92MVwvYXBpLWtleSIsImlhdCI6MTY2ODUxNjUzNywiZXhwIjoxOTg5OTI0NTM3LCJuYmYiOjE2Njg1MTY1MzcsImp0aSI6IkRCelpBVjdBRDhMMzZTZ1IifQ.tP5L6xDINQSmWVJsmin2vrjrYFopk-cDNWGkBOlKARg"
        },
        body: JSON.stringify(param),
      })
    
      const data=await response.json();

      if(data.amount){
        const price=data.amount;
        return res.json({price:price});
      }else{
        throw new Error();
      }

    } catch (error) {
      return res.json({price:0, message:"Amount not in range! Please wait until amount comes in range or change sell amount."});
    }

  }

}
export default offerController;