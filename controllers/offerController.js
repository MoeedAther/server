import crypto from 'crypto';
import request from "request";
import fetch from "node-fetch";
import dotenv from 'dotenv';
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
      const responsecalldelay = 3500;

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
        console.log("Changenow Fixed Response Handeling", error)
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
      console.log("Changehero Minimum and Maximum Floating Response Handeling", error)
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
        // return res.json(result)
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
        // return res.json(result);
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
            exolix_fixed_maximum_amount=rparseFloat(esult.maxAmount);
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
        const result = await response12.json();
        // return res.json(result)
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
        const result = await response14.json();
        // return res.json(result)
        if(!isNaN(result.estimated_amount)){
            stealthex_floating_price=parseFloat(result.estimated_amount);
        }
    } catch (error) {
      console.log("Stealthex Floating Response Handeling",error);
      
    }

      //*************** Stealthex Fixed Response Handeling ******************//
      try {
        const result = await response15.json();
        // return res.json(result)
        if(!isNaN(result.estimated_amount)){
            stealthex_fixed_price=parseFloat(result.estimated_amount);
            stealthex_fixed_rateId=result.rate_id;
        }
    } catch (error) {
      console.log("Stealthex Fixed Response Handeling",error)
    }

      //*************** Simpleswap Minimum Maximum Floating Response Handeling ******************//
      try {
        const result = await response16.json();
        // return res.json(result)
        if(!isNaN(result.min)){
            simpleswap_floating_minimum_amount=parseFloat(result.min);
            simpleswap_floating_visibility=1;
        }
    } catch (error) {
      console.log("Simpleswap Minimum Maximum Floating Response Handeling",error)
    }

      //*************** Simpleswap Minimum Maximum Fixed Response Handeling ******************//
      try {
        const result = await response17.json();
        // return res.json(result)
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
        const result = await response19.json();
        // return res.json(result)
        if(!isNaN(parseFloat(result))){
            simpleswap_fixed_price=parseFloat(result);
        }
    } catch (error) {
      console.log("Simpleswap Fixed Response Handeling",error);      
    }



      //Response Array
      let offerarray = [
        //0
        { name: "changelly", offerED:sendingamount>=changelly_floating_minimum_amount?"enable":"disable", visibility:sendingamount>=changelly_floating_minimum_amount&&changelly_floating_price==0?0:changelly_floating_visibility, min:changelly_floating_minimum_amount.toFixed(6), max:changelly_floating_maximum_amount, transaction_type:"Floating", eta:"5-30 Min", kyc:"On Occasion", rating:"4.2/5", rate: changelly_floating_price.toFixed(8) },
        //1
        { name: "changelly", offerED:sendingamount>=changelly_fixed_minimum_amount?"enable":"disable", visibility:sendingamount>=changelly_fixed_minimum_amount&&changelly_fixed_price==0?0:changelly_fixed_visibility, min:changelly_fixed_minimum_amount.toFixed(6), max:changelly_fixed_maximum_amount, transaction_type:"Fixed", eta:"5-30 Min", kyc:"On Occasion", rating:"4.2/5", rate: changelly_fixed_price.toFixed(8), rateId: changelly_fixed_rateId },
        //2
        { name: "changenow", offerED:sendingamount>=changenow_floating_minimum_amount?"enable":"disable", visibility:sendingamount>=changenow_floating_minimum_amount&&changenow_floating_price==0?0:changenow_floating_visibility, min:changenow_floating_minimum_amount.toFixed(6), max:changenow_floating_maximum_amount, transaction_type:"Floating", eta:"10-60 Min", kyc:"On Occasion", rating:"4.5/5", rate: changenow_floating_price.toFixed(8) },
        //3
        { name: "changenow", offerED:sendingamount>=changenow_fixed_minimum_amount?"enable":"disable", visibility:sendingamount>=changenow_fixed_minimum_amount&&changenow_fixed_price==0?0:changenow_fixed_visibility, min:changenow_fixed_minimum_amount.toFixed(6), max:changenow_fixed_maximum_amount, transaction_type:"Fixed", eta:"10-60 Min", kyc:"On Occasion", rating:"4.5/5", rate: changenow_fixed_price.toFixed(8), rateId: changenow_fixed_rateId },
        //4
        { name: "changehero", offerED:sendingamount>=changehero_floating_minimum_amount?"enable":"disable", visibility:sendingamount>=changehero_floating_minimum_amount&&changehero_floating_price==0?0:changehero_floating_visibility, min:changehero_floating_minimum_amount.toFixed(6), max:changehero_floating_maximum_amount, transaction_type:"Floating", eta:"12-26 Min", kyc:"On Occasion", rating:"3.7/5", rate: changehero_floating_price.toFixed(8) },
        //5
        { name: "changehero", offerED:sendingamount>=changehero_fixed_minimum_amount?"enable":"disable", visibility:sendingamount>=changehero_fixed_minimum_amount&&changehero_fixed_price==0?0:changehero_fixed_visibility, min:changehero_fixed_minimum_amount.toFixed(6), max:changehero_fixed_maximum_amount, transaction_type:"Fixed", eta:"12-26 Min", kyc:"On Occasion", rating:"3.7/5",  rate: changehero_fixed_price.toFixed(8), rateId: changehero_fixed_rateId },
        //6
        { name: "exolix", offerED:sendingamount>=exolix_floating_minimum_amount?"enable":"disable", visibility:sendingamount>=exolix_floating_minimum_amount&&exolix_floating_price==0?0:exolix_floating_visibility, min:exolix_floating_minimum_amount.toFixed(6), max:exolix_floating_maximum_amount, transaction_type:"Floating", eta:"22-46 Min", kyc:"Rarely Required", rating:"4.3/5", rate: exolix_floating_price.toFixed(8) },
        //7
        { name: "exolix", offerED:sendingamount>=exolix_fixed_minimum_amount?"enable":"disable", visibility:sendingamount>=exolix_fixed_minimum_amount&&exolix_fixed_price==0?0:exolix_fixed_visibility, min:exolix_fixed_minimum_amount.toFixed(6), max:exolix_fixed_maximum_amount, transaction_type:"Fixed", eta:"22-46 Min", kyc:"Rarely Required", rating:"4.3/5", rate: exolix_fixed_price.toFixed(8) },
        //8
        { name: "godex", offerED:sendingamount>=godex_floating_minimum_amount?"enable":"disable", visibility:sendingamount>=godex_floating_minimum_amount&&godex_floating_price==0?0:godex_floating_visibility, min:godex_floating_minimum_amount.toFixed(6), max:godex_floating_maximum_amount, transaction_type:"Floating", eta:"14-51 Min", kyc:"Rarely Required", rating:"4.6/5", rate: godex_floating_price.toFixed(8) },
        //9
        { name: "letsexchange", offerED:sendingamount>=letsexchange_floating_minimum_amount?"enable":"disable", visibility:sendingamount>=letsexchange_floating_minimum_amount&&letsexchange_floating_price==0?0:letsexchange_floating_visibility.toFixed(6), min:letsexchange_floating_minimum_amount, max:letsexchange_floating_maximum_amount, transaction_type:"Floating", eta:"2-44 Min", kyc:"Not Required", rating:"4.6/5", rate:letsexchange_floating_price.toFixed(8) },
        //10
        { name: "letsexchange", offerED:sendingamount>=letsexchange_fixed_minimum_amount?"enable":"disable", visibility:sendingamount>=letsexchange_fixed_minimum_amount&&letsexchange_fixed_price==0?0:letsexchange_fixed_visibility, min:letsexchange_fixed_minimum_amount.toFixed(6), max:letsexchange_fixed_maximum_amount, transaction_type:"Fixed", eta:"2-44 Min", kyc:"Not Required", rating:"4.6/5", rate: letsexchange_fixed_price.toFixed(8), rateId: letsexchange_fixed_rateId },
        //11
        { name: "stealthex", offerED:sendingamount>=stealthex_floating_minimum_amount?"enable":"disable", visibility:sendingamount>=stealthex_floating_minimum_amount&&stealthex_floating_price==0?0:stealthex_floating_visibility, min:stealthex_floating_minimum_amount.toFixed(6), max:stealthex_floating_maximum_amount, transaction_type:"Floating", eta:"7-38 Min", kyc:"On Occasion", rating:"4.7/5", rate: stealthex_floating_price.toFixed(8)},
        //12
        { name: "stealthex", offerED:sendingamount>=stealthex_fixed_minimum_amount?"enable":"disable", visibility:sendingamount>=stealthex_fixed_minimum_amount&&stealthex_fixed_price==0?0:stealthex_fixed_visibility,  min:stealthex_fixed_minimum_amount.toFixed(6), max:stealthex_fixed_maximum_amount, transaction_type:"Fixed", eta:"7-38 Min", kyc:"On Occasion", rating:"4.7/5", rate: stealthex_fixed_price.toFixed(8), rateId: stealthex_fixed_rateId },
        //13
        { name: "simpleswap", offerED:sendingamount>=simpleswap_floating_minimum_amount?"enable":"disable", visibility:sendingamount>=simpleswap_floating_minimum_amount&&simpleswap_floating_price==0?0:simpleswap_floating_visibility, min:simpleswap_floating_minimum_amount.toFixed(6), max:simpleswap_floating_maximum_amount, transaction_type:"Floating", eta:"9-50 Min", kyc:"Rarely Required", rating:"4.4/5", rate: simpleswap_floating_price.toFixed(8) },
        //14
        { name: "simpleswap", offerED:sendingamount>=simpleswap_fixed_minimum_amount?"enable":"disable", visibility:sendingamount>=simpleswap_fixed_minimum_amount&&simpleswap_fixed_price==0?0:simpleswap_fixed_visibility, min:simpleswap_fixed_minimum_amount.toFixed(6), max:simpleswap_fixed_maximum_amount, transaction_type:"Fixed", eta:"9-50 Min", kyc:"Rarely Required", rating:"4.4/5",  rate: simpleswap_fixed_price.toFixed(8) },
      ];

      //Arranging offers based on offer sequence type function
      function sortArrayDescending(offerarray) {
        if(offerstype=="bestprices")
        {
          // Filter objects with offer value "enable" and sort them based on rate in descending order
          let enabledObjects = offerarray.filter(obj => obj.offerED === "enable" && obj.visibility==1).sort((a, b) => parseFloat(b.rate) - parseFloat(a.rate));

          // Filter objects with offer value "disable" and sort them based on min in descending order
          let disabledObjects = offerarray.filter(obj => obj.offerED === "disable" && obj.visibility === 1).sort((a, b) => parseFloat(a.min) - parseFloat(b.min));

          // Concatenate the sorted arrays
          let sortedArray = enabledObjects.concat(disabledObjects);
          
          sortedArray=fixed=="Floating"?sortedArray.filter(obj => obj.transaction_type ==="Floating" || obj.transaction_type ==="Fixed"):sortedArray.filter(obj => obj.transaction_type ==="Fixed");

          return sortedArray;

        }else if(offerstype=="fastestswap"){
          let fastestswap_array=[offerarray[9], offerarray[10], offerarray[0], offerarray[1], offerarray[11], offerarray[12], offerarray[13], offerarray[14], offerarray[2], offerarray[3], offerarray[4], offerarray[5], offerarray[8], offerarray[6], offerarray[7] ];
          console.log("Fastest Swap");

              // Filter out objects with visibility equal to 0
              fastestswap_array = fastestswap_array.filter(obj => obj.visibility !== 0);
              
              fastestswap_array=fixed=="Floating"?fastestswap_array.filter(obj => obj.transaction_type ==="Floating" || obj.transaction_type ==="Fixed"):fastestswap_array.filter(obj => obj.transaction_type ==="Fixed");
              
              return fastestswap_array;

        }else if(offerstype=="bestrating"){
          let bestrating_array=[offerarray[11], offerarray[12], offerarray[9], offerarray[10], offerarray[8], offerarray[2], offerarray[3], offerarray[13], offerarray[14], offerarray[6], offerarray[7], offerarray[0], offerarray[1], offerarray[4], offerarray[5] ];
          console.log("Best Rating");

              // Filter out objects with visibility equal to 0
              bestrating_array = bestrating_array.filter(obj => obj.visibility !== 0);

              bestrating_array=fixed=="Floating"?bestrating_array.filter(obj => obj.transaction_type ==="Floating" || obj.transaction_type ==="Fixed"):bestrating_array.filter(obj => obj.transaction_type ==="Fixed");

              return bestrating_array;
        }
      }

      const sortedArray = sortArrayDescending(offerarray, "rate");
      return res.json({bestoffer:sortedArray[0].rate, offersarray:sortedArray});
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
      
    }, apicalldelay)

      //********************************************* Changenow Minimum Maximum Fixed Api Call *******************************************/
      setTimeout(async() => {

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
      
    }, apicalldelay)

      //********************************************* Changenow Floating Api Call *******************************************/
      setTimeout(async() => {
  
          response2 = await fetch(
            `https://api.changenow.io/v1/exchange-amount/${amount}/${sell}_${get}/?api_key=${changenow_api_key}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          )       
      
    }, apicalldelay)


      //********************************************* Changenow Fixed Api Call *******************************************/
      setTimeout(async() => {

          response3 = await fetch(
            `https://api.changenow.io/v1/exchange-amount/fixed-rate/${amount}/${sell}_${get}?api_key=${changenow_api_key}&useRateId=true`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          )       
      
    }, apicalldelay)

    //********************************************* Changehero Minimum and Maximum Floating Api Call *******************************************/
    setTimeout(async() => {

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
  
}, apicalldelay)

    //********************************************* Changehero Minimum and Maximum Fixed Api Call *******************************************/
    setTimeout(async() => {

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
    
  }, apicalldelay)

      //********************************************* Changehero Floating Api Call *******************************************/
      setTimeout(async() => {

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
    
  }, apicalldelay)


      //********************************************* Changehero Fixed Api Call *******************************************/
      setTimeout(async() => {

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
    
  }, apicalldelay)


      //********************************************* Exolix Floating Api Call *******************************************/
      setTimeout(async() => {

        response7 = await fetch(
          `https://exolix.com/api/v2/rate?coinFrom=${sell}&coinTo=${get}&amount=${amount}&rateType=float`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )  
    
  }, apicalldelay)

      //********************************************* Exolix Fixed Api Call *******************************************/
        setTimeout(async() => {

          response8 = await fetch(
            `https://exolix.com/api/v2/rate?coinFrom=${sell}&coinTo=${get}&amount=${amount}&rateType=fixed`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
      
    }, apicalldelay)

      //********************************************* Godex Floating Api Call *******************************************/
      setTimeout(async() => {

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
    
  }, apicalldelay)


      //********************************************* Letsexchange Floating Api Call *******************************************/
      setTimeout(async () => {

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

      }, apicalldelay)

      //********************************************* Letsexchange Fixed Api Call *******************************************/
      setTimeout(async () => {

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

      }, apicalldelay)    

      //********************************************* Stealthex Minimum Maximum Floating Api Call *******************************************/
      setTimeout(async () => {

        response12 = await fetch(
          `https://api.stealthex.io/api/v2/range/${sell}/${get}?api_key=${stealthex_api_key}&fixed=false`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )

      }, apicalldelay)
      
      //********************************************* Stealthex Minimum Maximum Fixed Api Call *******************************************/
      setTimeout(async () => {

        response13 = await fetch(
          `https://api.stealthex.io/api/v2/range/${sell}/${get}?api_key=${stealthex_api_key}&fixed=true`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )

      }, apicalldelay)    

      //********************************************* Stealthex Floating Api Call *******************************************/
      setTimeout(async () => {

        response14 = await fetch(`https://api.stealthex.io/api/v2/estimate/${sell}/${get}?amount=${amount}&api_key=${stealthex_api_key}&fixed=false`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

      }, apicalldelay)   
      
      //********************************************* Stealthex Fixed Api Call *******************************************/
      setTimeout(async () => {

        response15 = await fetch(`https://api.stealthex.io/api/v2/estimate/${sell}/${get}?amount=${amount}&api_key=${stealthex_api_key}&fixed=true`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

      }, apicalldelay)   

      //********************************************* Simpleswap Minimum Maximum Floating Api Call *******************************************/
      setTimeout(async () => {

        let sellcoin=sell=="toncoin"?"tonerc20":sell;
        let getcoin=get=="toncoin"?"tonerc20":get;

        response16 = await fetch(`https://api.simpleswap.io/get_ranges?api_key=${simpleswap_api_key}&fixed=false&currency_from=${sellcoin}&currency_to=${getcoin}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        });

      }, apicalldelay) 

      //********************************************* Simpleswap Minimum Maximum Fixed Api Call *******************************************/
      setTimeout(async () => {

        let sellcoin=sell=="toncoin"?"tonerc20":sell;
        let getcoin=get=="toncoin"?"tonerc20":get;

        response17 = await fetch(`https://api.simpleswap.io/get_ranges?api_key=${simpleswap_api_key}&fixed=true&currency_from=${sellcoin}&currency_to=${getcoin}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        });


      }, apicalldelay) 

      //********************************************* Simpleswap Floating Api Call *******************************************/
      setTimeout(async () => {

        let sellcoin=sell=="toncoin"?"tonerc20":sell;
        let getcoin=get=="toncoin"?"tonerc20":get;

        response18 = await fetch(`http://api.simpleswap.io/get_estimated?api_key=${simpleswap_api_key}&fixed=false&currency_from=${sellcoin}&currency_to=${getcoin}&amount=${amount}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                }
              });

      }, apicalldelay) 

      //********************************************* Simpleswap Fixed Api Call *******************************************/
      setTimeout(async () => {

        let sellcoin=sell=="toncoin"?"tonerc20":sell;
        let getcoin=get=="toncoin"?"tonerc20":get;

        response19 = await fetch(`http://api.simpleswap.io/get_estimated?api_key=${simpleswap_api_key}&fixed=true&currency_from=${sellcoin}&currency_to=${getcoin}&amount=${amount}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                }
              });

      }, apicalldelay) 
      
    } catch (error) {
      console.log(error)
      return res.json({bestoffer: 0, offersarray:[]});
    }
  }

  static homeprice = async (req, res) => {
    const { sel, get, amount } = req.body;
    console.log("Hi Moeed")
    if (amount != "0" && amount != "0." && amount != 0 && amount != "") {
  
      const url=`https://api.changenow.io/v1/min-amount/${sel}_${get}?api_key=3016eb278f481714c943980dec2bfc595f8a2160e8eabd0228dc02cc627a184c`;
      const options={
        method:"GET",
        header:{
          "Content-Type":"application/json"
        },
      }
      const response=await fetch(url,options);
      const data=await response.json();
      const minamount =data.minAmount;
      if(minamount<=amount){
        const url2=`https://api.changenow.io/v1/exchange-amount/${amount}/${sel}_${get}/?api_key=3016eb278f481714c943980dec2bfc595f8a2160e8eabd0228dc02cc627a184c`;
        const options2={
          method:"GET",
          header:{
            "Content-Type":"application/json"         
          }
        }
  
        const response2=await fetch(url2,options2);
        const data2=await response2.json();
  
        const url3=`https://api.changenow.io/v1/exchange-amount/1/${sel}_${get}/?api_key=3016eb278f481714c943980dec2bfc595f8a2160e8eabd0228dc02cc627a184c`;
        const options3={
          method:"GET",
          header:{
            "Content-Type":"application/json"         
          }
        }
  
        const response3=await fetch(url3,options3);
        const data3=await response3.json();
  
        return res.json({to:{amount:data2.estimatedAmount, from:{min:minamount}, onesel:data3.estimatedAmount}})
      }else{
        const url3=`https://api.changenow.io/v1/exchange-amount/1/${sel}_${get}/?api_key=3016eb278f481714c943980dec2bfc595f8a2160e8eabd0228dc02cc627a184c`;
        const options3={
          method:"GET",
          header:{
            "Content-Type":"application/json"         
          }
        }
  
        const response3=await fetch(url3,options3);
        const data3=await response3.json();
        return res.json({to:{amount:0, from:{min:minamount}, onesel:data3.estimatedAmount}})
      }
    } else {
      
      return res.json({to:{amount:0, from:{min:0}, onesel:0}})
    }
  };
}
export default offerController;


// {"ticker":"usdt",
// "name":"Tether (ERC20)",
// "image":"https://content-api.changenow.io/uploads/usdterc20_5ae21618aa.svg",
// "hasExternalId":false,
// "isFiat":false,
// "featured":true,
// "isStable":true,
// "supportsFixedRate":true,
// "network":"eth",
// "tokenContract":"0xdAC17F958D2ee523a2206206994597C13D831ec7",
// "buy":true,
// "sell":true,
// "legacyTicker":"usdterc20"}