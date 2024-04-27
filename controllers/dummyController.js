import crypto from 'crypto';
import request from "request";
import fetch from "node-fetch";
import dotenv from 'dotenv';
dotenv.config();


class offerController {

  static offers = async (req, res) => {

    const changelly_private_key=process.env.CHANGELLY_PRIVATE_KEY;
    const changehero_api_key=process.env.CHANGEHERO
    const stealthex_api_key=process.env.STEALTHEX
    const simpleswap_api_key=process.env.SIMPLESWAP
    const changenow_api_key=process.env.CHANGENOW


    let changelly_float_price = 0, changelly = 0, exolix = 0, changehero = 0, godex = 0, simpleswap = 0, changenow = 0, stealthio = 0, letsexchange = 0, exolix_fixed = 0, simpleswap_fixed = 0, fixedfloat = 0;
    let changelly_fixed_price = 0, changelly_fixed = 0, stealthio_fixed = 0, changehero_fixed = 0, letsexchange_fixed = 0, changenow_fixed = 0, fixedfloat_fixed = 0;
    let changelly_fixed_rateId = 0, changenow_fixed_rateId = 0, stealthio_fixed_rate_id = 0, exolix_fixed_rateId = 0, simpleswap_fixed_rateId = 0, changehero_fixed_rateId = 0, letsexchange_fixed_rateId = 0;
    let comp1 = 0, comp2 = 0;

    let changelly_floating_minimum_amount=0;
    let changelly_fixed_minimum_amount=0;
    let exolix_floating_minimum_amount=0;
    let exolix_fixed_minimum_amount=0;
    let changehero_floating_minimum_amount=0;
    let changehero_fixed_minimum_amount=0;
    let godex_floating_minimum_amount=0;
    let simple_floating_minimum_amount=0;
    let simple_fixed_minimum_amount=0;
    let changenow_floating_minimum_amount=0;
    let changenow_fixed_minimum_amount=0;
    let stealthex_floating_minimum_amount=0;
    let stealthex_fixed_minimum_amount=0;
    let letsexchange_floating_minimum_amount=0;
    let letsexchange_fixed_minimum_amount=0;

    let changelly_floating_maximum_amount=0;
    let changelly_fixed_maximum_amount=0;
    let exolix_floating_maximum_amount=0;
    let exolix_fixed_maximum_amount=0;
    let changehero_floating_maximum_amount=0;
    let changehero_fixed_maximum_amount=0;
    let godex_floating_maximum_amount=0;
    let simple_floating_maximum_amount=0;
    let simple_fixed_maximum_amount=0;
    let changenow_floating_maximum_amount=0;
    let changenow_fixed_maximum_amount=0;
    let stealthex_floating_maximum_amount=0;
    let stealthex_fixed_maximum_amount=0;
    let letsexchange_floating_maximum_amount=0;
    let letsexchange_fixed_maximum_amount=0;

    let changelly_floating_visibility=1;
    let changelly_fixed_visibility=1;
    let exolix_floating_visibility=1;
    let exolix_fixed_visibility=1;
    let changehero_floating_visibility=1;
    let changehero_fixed_visibility=1;
    let godex_floating_visibility=1;
    let simple_floating_visibility=1;
    let simple_fixed_visibility=1;
    let changenow_floating_visibility=1;
    let changenow_fixed_visibility=1;
    let stealthex_floating_visibility=1;
    let stealthex_fixed_visibility=1;
    let letsexchange_floating_visibility=1;
    let letsexchange_fixed_visibility=1;



    const privateKeyString = changelly_private_key;

      const { sell, get, amount, offerstype } = req.body;
      console.log(req.body)
      const timeout = 1000;
      const responseCall = 5000;
    
    
      changelly_float_price = 0
      changelly = 0
      exolix = 0
      changehero = 0
      godex = 0
      simpleswap = 0
      changenow = 0
      stealthio = 0
      letsexchange = 0
      fixedfloat = 0
      fixedfloat_fixed = 0
      exolix_fixed = 0
      simpleswap_fixed = 0;
      changelly_fixed_price = 0
      changelly_fixed = 0
      stealthio_fixed = 0
      changehero_fixed = 0
      letsexchange_fixed = 0
      changelly_fixed_rateId = 0
      changenow_fixed_rateId = 0
      stealthio_fixed_rate_id = 0
      exolix_fixed_rateId = 0
      simpleswap_fixed_rateId = 0
      changehero_fixed_rateId = 0
      letsexchange_fixed_rateId = 0;
    
    
      //This condition prevents backend from crashing application fails to send a parameter
      if (!sell || !get || !amount || amount == 0) {
        return res.json({
          bestoffer: 0,
          offersarray: [],
          changelly: 0,
          exolix: 0,
          changehero: 0,
          godex: 0,
          simpleswap: 0,
          changenow: 0,
          stealthio: 0,
          letsexchange: 0,
          changelly_fixed: 0,
          changenow_fixed: 0,
          stealthio_fixed: 0,
          exolix_fixed: 0,
          simpleswap_fixed: 0,
          changehero_fixed: 0,
          letsexchange_fixed: 0
        })
      }
    
      //Common Variables for Changelly
      const privateKey = crypto.createPrivateKey({
        key: privateKeyString,
        format: "der",
        type: "pkcs8",
        encoding: "hex",
      });
    
      //Common Variables for Changelly
      const publicKey = crypto.createPublicKey(privateKey).export({
        type: "pkcs1",
        format: "der",
      });
    
    
      //************************** Changelly float Params ********************/
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
    
      const param9 = {
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
    
      //*************************** Changehero Float Params ******************* */
      const param3 = {
        jsonrpc: "2.0",
        method: "getExchangeAmount",
        params: {
          from: sell,
          to: get,
          amount: amount,
        },
      };
    
      //*************************** Changehero Min Amount Params ******************* */
      const param16 = {
        jsonrpc: "2.0",
        method: "getMinAmount",
        params: {
          from: sell,
          to: get,
        },
      };
    
      //*************************** Godex Float Params ******************* */
      const param4 = {
        from: sell.toUpperCase(),
        to: get.toUpperCase(),
        amount: amount,
      };
    
      //*************************** Changehero Fixed Params ******************* */
      const param5 = {
        jsonrpc: "2.0",
        method: "getFixRate",
        params: {
          from: sell,
          to: get,
          amount: amount,
        },
      };
    
      //*************************** Letsexchange Float Params ******************* */
      let toncoinsell, toncoinget,param8;
      if(sell=="toncoin" || get=="toncoin"){
        toncoinsell=sell=="toncoin"?"TON-ERC20":sell;
        toncoinget=get=="toncoin"?"TON-ERC20":get;
    
         param8 = {
          from: toncoinsell,
          to: toncoinget,
          amount: amount,
          float: true
        }
    
    
      }else{
        param8 = {
         from: sell,
         to: get,
         amount: amount,
         float: true
       };
     }
    
    
      //*************************** Letsexchange Fixed Params ******************* */
    
      let param10;
      if(sell=="toncoin" || get=="toncoin"){
        toncoinsell=sell=="toncoin"?"TON-ERC20":sell;
        toncoinget=get=="toncoin"?"TON-ERC20":get;
    
        param10 = {
          from: toncoinsell,
          to: toncoinget,
          amount: amount,
          float: false
        }
    
    
      }else{
        param10 = {
         from: sell,
         to: get,
         amount: amount,
         float: false
       };
     }
    
    
      //This conditions checks for empty strings and zero
      if (amount == "0" || amount == "0." || amount == "") {
          res.json({ bestoffer: "0", offersarray:[] })
      } else {
    
        try {
          var response1, response2, response3, response4, response5, response6, response7, response8, response9, response10, response11, response12, response13, response14, response15, response16;
          setTimeout(async () => {
    
            // Changelly
            let result1 = changelly_float_price;
            changelly = typeof result1 === 'undefined' ? 0 : parseFloat(result1)
            changelly_fixed = parseFloat(changelly_fixed_price)
    
            changelly = typeof changelly === 'number' && !isNaN(changelly) ? changelly.toFixed(8) : 0;
            changelly_fixed = typeof changelly_fixed === 'number' && !isNaN(changelly_fixed) ? changelly_fixed.toFixed(8) : 0;
    
            // Exolix
            try {
              if (response2.ok) {
    
                var result2 = await response2.json();
                let amount_num=parseFloat(amount)
                let exolix_min=parseFloat(result2.minAmount)
                exolix_floating_minimum_amount=exolix_min;
                if (amount_num >= exolix_min) {
                  exolix = typeof result2.toAmount === 'undefined'? 0: parseFloat(result2.toAmount)
                  exolix = typeof exolix === 'number' && !isNaN(exolix)?exolix.toFixed(8):0;
                } else {
                  exolix = 0
                }
    
              } else {
                exolix = 0
              }
            } catch (error) {
              exolix = 0
            }
    
            // Changehero
            try {
              if (response3.ok) {
                var result3 = await response3.json();
                changehero = typeof result3.result === 'undefined' ? 0 : parseFloat(result3.result)
                changehero = typeof changehero === 'number' && !isNaN(changehero) ? changehero.toFixed(8) : 0;
    
              } else {
                changehero = 0
              }
            } catch (error) {
              changehero = 0
            }
    
    
            // Godex
            try {
              if (response4.ok != "undefined") {
                var result4 = await response4.json();
    
                let amount_num=parseFloat(amount)
                let Godex_min=parseFloat(result4.min_amount )
                godex_floating_minimum_amount=Godex_min;
                if (amount_num >= Godex_min) {
                  godex = typeof result4.amount === 'undefined' ? 0 : parseFloat(result4.amount)
                  godex = typeof godex === 'number' && !isNaN(godex) ? godex.toFixed(8) : 0;
                } else {
                  godex = 0
                }
              } else {
                godex = 0
              }
            } catch (error) {
              godex = 0
            }
    
            // Simpleswap
            try {
              if (response5.ok) {
                var result5 = await response5.json();
                simpleswap = typeof result5 === 'undefined' ? 0 : parseFloat(result5)
                simpleswap = typeof simpleswap === 'number' && !isNaN(simpleswap) ? simpleswap.toFixed(8) : 0;
              } else {
                simpleswap = 0
                console.log("simpleswap error")
              }
            } catch (error) {
              simpleswap = 0
              console.log("simpleswap error")
            }
    
    
    
            // StealthEX
            try {
              if (response7.ok != "undefined") {
                var result7 = await response7.json();
                stealthio = typeof result7.estimated_amount === 'undefined' ? 0 : parseFloat(result7.estimated_amount)
                stealthio = typeof stealthio === 'number' && !isNaN(stealthio) ? stealthio.toFixed(8) : 0;
              } else {
                stealthio = 0
              }
            } catch (error) {
              stealthio = 0
            }
    
    
            // Letsexchange
            try {
    
              if (response8.ok) {
                var result8 = await response8.json();
                let amount_num=parseFloat(amount);
                let letsexchange_min=parseFloat(result8.min_amount);
                letsexchange_floating_minimum_amount=letsexchange_min;
                if (amount_num >= letsexchange_min) {
                  letsexchange = typeof result8 === 'undefined' ? 0 : parseFloat(result8.amount);
                  letsexchange = typeof letsexchange === 'number' && !isNaN(letsexchange) ? letsexchange.toFixed(8) : 0;
                } else {
                  letsexchange = 0
                }
              } else {
                letsexchange = 0
              }
            } catch (error) {
              letsexchange = 0
            }
    
            // Fixedfloat
            try {
              if (response16) {
                const min = response16.from.min;
                if (amount > min) {
                  fixedfloat = typeof response16 === 'undefined' ? 0 : parseFloat(response16.to.amount);
                  fixedfloat = typeof fixedfloat === 'number' && !isNaN(fixedfloat) ? fixedfloat.toFixed(8) : 0;
                } else {
                  fixedfloat = 0
                }
              } else {
                fixedfloat = 0
              }
            } catch (error) {
              fixedfloat = 0
            }
    
            // Fixedfloat_fixed
            try {
              if (response9) {
                const min = response9.from.min;
                if (amount > min) {
                  fixedfloat_fixed = typeof response9 === 'undefined' ? 0 : parseFloat(response9.to.amount);
                  fixedfloat_fixed = typeof fixedfloat_fixed === 'number' && !isNaN(fixedfloat_fixed) ? fixedfloat_fixed.toFixed(8) : 0;
                } else {
                  fixedfloat_fixed = 0
                }
              } else {
                fixedfloat_fixed = 0
              }
            } catch (error) {
              fixedfloat_fixed = 0
            }       
    
            // Changenow fixed
            try {
              if (response10.ok) {
                var result10 = await response10.json();
                changenow_fixed = typeof result10.estimatedAmount === 'undefined' ? 0 : parseFloat(result10.estimatedAmount);
                changenow_fixed = typeof changenow_fixed === 'number' && !isNaN(changenow_fixed) ? changenow_fixed.toFixed(8) : 0;
                changenow_fixed_rateId = result10.rateId
              } else {
                changenow_fixed = 0
                changenow_fixed_rateId = 0
              }
            } catch (error) {
              changenow_fixed = 0
            }
    
            //Stealth EX Fixed
            try {
              if (response11.ok) {
                var result11 = await response11.json();
                stealthio_fixed = typeof result11.estimated_amount === 'undefined' ? 0 : parseFloat(result11.estimated_amount)
                stealthio_fixed = typeof stealthio_fixed === 'number' && !isNaN(stealthio_fixed) ? stealthio_fixed.toFixed(8) : 0;
                stealthio_fixed_rate_id = result11.rate_id;
              } else {
                stealthio_fixed = 0
                stealthio_fixed_rate_id = 0
              }
            } catch (error) {
              stealthio_fixed = 0
              stealthio_fixed_rate_id = 0
            }
    
    
            // Exolix Fixed
            try {
              if (response12.ok) {
                var result12 = await response12.json();
                let amount_num=parseFloat(amount)
                let exolix_min=parseFloat(result12.minAmount)
                exolix_fixed_minimum_amount=exolix_min;
                //This condition checks if amount send is less then minimum amount to exchange if amount less then minimum it sets 0
                if (amount_num >= exolix_min) {
                   exolix_fixed = typeof result12.toAmount === 'undefined'? 0: parseFloat(result12.toAmount);
                   exolix_fixed = typeof exolix_fixed === 'number' && !isNaN(exolix_fixed)?exolix_fixed.toFixed(8):0;
                } else {
                  exolix_fixed = 0
                }
              } else {
                exolix_fixed = 0
              }
            } catch (error) {
              exolix_fixed = 0
            }
    
    
            // Simpleswap Fixed
            try {
              if (response13.ok) {
                var result13 = await response13.json();
                simpleswap_fixed = typeof result13 === 'undefined' ? 0 : parseFloat(result13);
                simpleswap_fixed = typeof simpleswap_fixed === 'number' && !isNaN(simpleswap_fixed) ? simpleswap_fixed.toFixed(8) : 0;
              } else {
                simpleswap_fixed = 0
              }
            } catch (error) {
              simpleswap_fixed = 0
            }
    
            // Changehero Fixed
            try {
              if (response14.ok) {
                var result14 = await response14.json();
                changehero_fixed = parseFloat(result14.result !== undefined && result14.result.length > 0 ? result14.result[0].result : 0) * parseFloat(amount);
                changehero_fixed = typeof changehero_fixed === 'number' && !isNaN(changehero_fixed) ? changehero_fixed.toFixed(8) : 0;
                changehero_fixed_rateId = result14.result[0].id
              } else {
                changehero = 0
                changehero_fixed_rateId = 0
              }
            } catch (error) {
              changehero = 0
              changehero_fixed_rateId = 0
            }
    
    
            // Letsexchange Fixed
            try {
              if (response15.ok != "undefined") {
                var result15 = await response15.json();
                let amount_num=parseFloat(amount)
                let letsexchange_min=parseFloat(result15.min_amount)
                letsexchange_fixed_minimum_amount=letsexchange_min;
                if (amount_num >= letsexchange_min) {
                  letsexchange_fixed = typeof result15 === 'undefined' ? 0 : parseFloat(result15.amount)
                  letsexchange_fixed = typeof letsexchange_fixed === 'number' && !isNaN(letsexchange_fixed) ? letsexchange_fixed.toFixed(8) : 0;
                  letsexchange_fixed_rateId = result15.rate_id;
                } else {
                  letsexchange_fixed = 0
                }
              } else {
                letsexchange_fixed = 0
              }
            } catch (error) {
              letsexchange_fixed = 0
            }
    
    
    
            //.........Creating arry of objects and finding best rate ...........//
    
            let array = [
              // 0
              { name: "changenow", visibility:changenow_floating_visibility, changenow_min:changenow_floating_minimum_amount, transaction_type:"Floating", eta:"10-60 Min", kyc:"On Occasion", rating:"4.5/5", rate: parseFloat(changenow) },
              // 1
              { name: "exolix", exolix_min:exolix_floating_minimum_amount, transaction_type:"Floating", eta:"22-46 Min", kyc:"Rarely Required", rating:"4.3/5", rate: parseFloat(exolix) },
              // 2
              { name: "godex", godex_min:godex_floating_minimum_amount, transaction_type:"Floating", eta:"14-51 Min", kyc:"Rarely Required", rating:"4.6/5", rate: parseFloat(godex) },
              // 3
              { name: "changehero", changehero_min:changehero_floating_minimum_amount, transaction_type:"Floating", eta:"12-26 Min", kyc:"On Occasion", rating:"3.7/5", rate: parseFloat(parseFloat(changehero).toFixed(8)) },
              // 4
              { name: "changelly", visibility:changelly_floating_visibility, changelly_min:changelly_floating_minimum_amount, changelly_max:changelly_floating_maximum_amount, transaction_type:"Floating", eta:"5-30 Min", kyc:"On Occasion", rating:"4.2/5", rate: parseFloat(changelly) },
              // 5
              { name: "simpleswap", simpleswap_min:simple_floating_minimum_amount, transaction_type:"Floating", eta:"9-50 Min", kyc:"Rarely Required", rating:"4.4/5", rate: parseFloat(simpleswap) },
              // 6
              { name: "stealthex",  stealthex_min:stealthex_floating_minimum_amount, transaction_type:"Floating", eta:"7-38 Min", kyc:"On Occasion", rating:"4.7/5", rate: parseFloat(stealthio) },
              // 7
              { name: "letsexchange",  letsexchange_min:letsexchange_floating_minimum_amount, transaction_type:"Floating", eta:"2-44 Min", kyc:"Not Required", rating:"4.6/5", rate: parseFloat(letsexchange) },
              // 8
              { name: "fixedfloat", transaction_type:"Floating", eta:"4-10 Min", kyc:"Not Required", rating:"4.6/5", rate: parseFloat(fixedfloat) },
              // 9
              { name: "fixedfloat", transaction_type:"Fixed", eta:"4-10 Min", kyc:"Not Required", rating:"4.6/5", rate: parseFloat(fixedfloat_fixed)},
              // 10
              { name: "changelly", visibility:changelly_fixed_visibility, changelly_min:changelly_fixed_minimum_amount, transaction_type:"Fixed", eta:"5-30 Min", kyc:"On Occasion", rating:"4.2/5", rate: parseFloat(changelly_fixed), rateId: changelly_fixed_rateId },
              // 11
              { name: "changenow",  changenow_min:changenow_fixed_minimum_amount, transaction_type:"Fixed", eta:"10-60 Min", kyc:"On Occasion", rating:"4.5/5", rate: parseFloat(changenow_fixed), rateId: changenow_fixed_rateId },
              // 12
              { name: "stealthex",   stealthex_min:stealthex_fixed_minimum_amount, transaction_type:"Fixed", eta:"7-38 Min", kyc:"On Occasion", rating:"4.7/5", rate: parseFloat(stealthio_fixed), rateId: stealthio_fixed_rate_id },
              // 13
              { name: "exolix", exolix_min:exolix_fixed_minimum_amount, transaction_type:"Fixed", eta:"22-46 Min", kyc:"Rarely Required", rating:"4.3/5", rate: parseFloat(exolix_fixed) },
              // 14
              { name: "simpleswap", simpleswap_min:simple_fixed_minimum_amount, transaction_type:"Fixed", eta:"9-50 Min", kyc:"Rarely Required", rating:"4.4/5",  rate: parseFloat(simpleswap_fixed) },
              // 15
              { name: "changehero",  changehero_min:changehero_fixed_minimum_amount, transaction_type:"Fixed", eta:"12-26 Min", kyc:"On Occasion", rating:"3.7/5",  rate: parseFloat(changehero_fixed), rateId: changehero_fixed_rateId },
              // 16
              { name: "letsexchange", letsexchange_min:letsexchange_fixed_minimum_amount, transaction_type:"Fixed", eta:"2-44 Min", kyc:"Not Required", rating:"4.6/5", rate: parseFloat(letsexchange_fixed), rateId: letsexchange_fixed_rateId },
            ];
    
            function sortArrayDescending(bestprices_array, key) {
              if(offerstype=="bestprices")
              {
                bestprices_array.sort(function (a, b) {
                  return b[key] - a[key];
                });
                console.log("Best Rate");
                return bestprices_array;
              }else if(offerstype=="fastestswap"){
                let fastestswap_array=[array[7], array[16], array[4], array[10], array[6], array[12], array[5], array[14], array[0], array[11], array[3], array[15], array[2], array[1], array[13] ];
                console.log("Fastest Swap");
                return fastestswap_array;
              }else if(offerstype=="bestrating"){
                let bestrating_array=[array[6], array[12], array[7], array[16], array[2], array[0], array[11], array[5], array[14], array[1], array[13], array[4], array[10], array[3], array[15] ];
                console.log("Best Rating");
                return bestrating_array;
              }
            }
    
            const sortedArr = sortArrayDescending(array, "rate");
    
            console.log("Best Price " + sortedArr[0].rate + sortedArr[0].name);

            const responseObj = {
              bestoffer: sortedArr[0].rate.toFixed(8),
              offersarray: sortedArr,
            }
    
            res.json(responseObj)
    
          }, responseCall)
    
          //.......................................................Api 1 Call (Changelly)
          setTimeout(() => {
            
              request(param1, async function (error, response) {
                try {
                  const data = await JSON.parse(response.body);
                  changelly_float_price = data.result[0].amountTo;
                  changelly_floating_minimum_amount=parseFloat(data.result[0].minFrom)
                  changelly_floating_maximum_amount=parseFloat(data.result[0].maxFrom)
                } catch (error) {
                  changelly_float_price = 0;
                  try {
                    const data = await JSON.parse(response.body);
                    changelly_floating_minimum_amount=parseFloat(data.error.data.limits.min.from)
                    changelly_floating_maximum_amount=parseFloat(data.error.data.limits.max.from)
                  } catch (error) {
                    changelly_floating_visibility=0;
                  }
                }
    
              })
            
          }, timeout)
    
          //.......................................................Api 2 Call (Exolix)
          setTimeout(async () => {
    
            response2 = await fetch(
              `https://exolix.com/api/v2/rate?coinFrom=${sell}&coinTo=${get}&amount=${amount}&rateType=float`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            )
          }, timeout)
    
          //.......................................................Api 3 Call (Changehero)
          setTimeout(async () => {
    
            const response16 = await fetch(`https://api.changehero.io/v2/`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "api-key": changehero_api_key,
              },
              body: JSON.stringify(param16),
            })
    
            const result16 = await response16.json();
            let changehero_min=parseFloat(result16.result)
            changehero_floating_minimum_amount=changehero_min;
            let amount_num=parseFloat(amount)
    
            if (amount_num >= changehero_min) {
              response3 = await fetch(`https://api.changehero.io/v2/`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "api-key": changehero_api_key,
                },
                body: JSON.stringify(param3),
              })
            }
    
    
          }, timeout)
    
    
    
          //.......................................................Api 4 Call (Godex)
    
          setTimeout(async () => {
            response4 = await fetch(`https://api.godex.io/api/v1/info`, {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify(param4),
            })
          }, timeout)
    
          //.......................................................Api 5 Call (Simpleswap)
          setTimeout(async () => {
    
            if(sell=="toncoin" || get=="toncoin"){
              const toncoinsell=sell=="toncoin"?"tonerc20":sell;
              const toncoinget=get=="toncoin"?"tonerc20":get;
              const response = await fetch(`https://api.simpleswap.io/get_ranges?api_key=${simpleswap_api_key}&fixed=false&currency_from=${toncoinsell}&currency_to=${toncoinget}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              }
            });
    
            const data = await response.json()
            let amount_num=parseFloat(amount)
            let simpleswap_num=parseFloat(data.min)
            simple_floating_minimum_amount=simpleswap_num;
            if (amount_num >= simpleswap_num) {
              response5 = await fetch(`http://api.simpleswap.io/get_estimated?api_key=${simpleswap_api_key}&fixed=false&currency_from=${toncoinsell}&currency_to=${toncoinget}&amount=${amount}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                }
              });
            }
    
            }else{
    
            const response = await fetch(`https://api.simpleswap.io/get_ranges?api_key=${simpleswap_api_key}&fixed=false&currency_from=${sell}&currency_to=${get}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              }
            });
    
            const data = await response.json()
    
            let amount_num=parseFloat(amount)
            let simpleswap_num=parseFloat(data.min)
            simple_floating_minimum_amount=simpleswap_num;
            if (amount_num >= simpleswap_num) {
              response5 = await fetch(`http://api.simpleswap.io/get_estimated?api_key=${simpleswap_api_key}&fixed=false&currency_from=${sell}&currency_to=${get}&amount=${amount}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                }
              });
            }
          }
    
          }, timeout)
    
          //...................................................... Api 6 Call (Changenow)
          setTimeout(async () => {
            try {
              try {
                const response17 = await fetch(
                  `https://api.changenow.io/v1/exchange-range/${sell}_${get}?api_key=${changenow_api_key}`,
                  {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                )
        
        
                const result17 = await response17.json()
                changenow_floating_minimum_amount=parseFloat(result17.minAmount);
                changenow_floating_maximum_amount=parseFloat(result17.maxAmount);
              } catch (error) {
                console.log("Changenow Floating");
                changenow_floating_minimum_amount=0;
                changenow_floating_maximum_amount=0;
                changenow_floating_visibility=0;
              }
             
              response6 = await fetch(
                  `https://api.changenow.io/v1/exchange-amount/${amount}/${sell}_${get}/?api_key=${changenow_api_key}`,
                  {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
                    }
                  }
                )    
                var result6 = await response6.json();
                changenow = parseFloat(result6.estimatedAmount).toFixed(8);
            } catch (error) {
              changenow_floating_visibility=0;
            }
            
          }, timeout)
    
          //.......................................................Api 7 Call (StealthEX)
          setTimeout(async () => {
    
            const response18 = await fetch(
              `https://api.stealthex.io/api/v2/min/${sell}/${get}?api_key=${stealthex_api_key}&fixed=false`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            )
    
            const result18 = await response18.json()
              let  amount_num=parseFloat(amount)
              let stealthex_min=parseFloat(result18.min_amount)
              stealthex_floating_minimum_amount=stealthex_min;
            if (amount_num >= stealthex_min) {
              response7 = await fetch(`https://api.stealthex.io/api/v2/estimate/${sell}/${get}?amount=${amount}&api_key=${stealthex_api_key}&fixed=false`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              })
            }
          }, timeout)
    
          //.......................................................Api 8 Call (Letsexchange)
          setTimeout(async () => {
            
            response8 = await fetch(`https://api.letsexchange.io/api/v1/info`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0b2tlbiIsImRhdGEiOnsiaWQiOjkwLCJoYXNoIjoiZXlKcGRpSTZJa2wzYmxFNE1VeHVOMU5DU25aamFEbExWVE5rYW1jOVBTSXNJblpoYkhWbElqb2lUV1ZhWWs5dGNXY3dWSEZMYm1wWGRuVjJjMXBzV0RaU1ZpdFphamxJYWtrM1EzQkhTRlpsVFdGS1JXZHVXV1pxUTJRNU9WUXlaSHBEVDJWd2NVeEdRVTFOYjBVelJIaEdSRzlwWjBsaEt6UjJWR0UxVjI1TmQweEROamRCUmxCWFdISTJRMGRpUm1Kb1ltTTlJaXdpYldGaklqb2labU0xTnpNMU0yRXlaRFJqWmpSalpXWTFZV1ZqWVRkalptSTBZall4WmpVNFpqZGtNak0wTXpVNU1XRmtaRGRrWm1Sak5HWXhaamt6TldFM01tVXlOaUo5In0sImlzcyI6Imh0dHBzOlwvXC9sZXRzLW5naW54LXN2Y1wvYXBpXC92MVwvYXBpLWtleSIsImlhdCI6MTY2ODUxNjUzNywiZXhwIjoxOTg5OTI0NTM3LCJuYmYiOjE2Njg1MTY1MzcsImp0aSI6IkRCelpBVjdBRDhMMzZTZ1IifQ.tP5L6xDINQSmWVJsmin2vrjrYFopk-cDNWGkBOlKARg"
              },
              body: JSON.stringify(param8),
            })
          }, timeout)
    
          //.......................................................Api 9 Call (Changelly Fixed Price)
          setTimeout(async () => {
    
    
              response9 = request(param9, async function (error, response) {
                try {
                  const data = await JSON.parse(response.body);
                    changelly_fixed_price = data.result[0].amountTo;
                    changelly_fixed_rateId= data.result[0].id;
                    changelly_fixed_minimum_amount=parseFloat(data.result[0].minFrom);
                } catch (error) {
                  changelly_fixed_price = 0;
                  changelly_fixed_rateId = 0;
                  try {
                    const data = await JSON.parse(response.body);
                    changelly_fixed_minimum_amount=parseFloat(data.error.data.limits.min.from)
                    changelly_fixed_maximum_amount=parseFloat(data.error.data.limits.max.from)
                  } catch (error) {
                    changelly_fixed_visibility=0;
                  }
                }
              })
    
    
    
          }, timeout)
    
          //.......................................................Api 10 Call (FixedFloat)
          setTimeout(async () => {
            // const s=sell.toUpperCase();
            // const g=get.toUpperCase();
            // let sc,gc;
            // switch(s){
            //   case "USDTERC20":
            //     sc="USDT";
            //     break;
            //   case "USDTTRC20":
            //     sc="USDTTRC";
            //     break;
            //   default:
            //       sc=s;
            //       break;
            // }
            // switch(g){
            //   case "USDTERC20":
            //     sc="USDT";
            //     break;
            //   case "USDTTRC20":
            //     gc="USDTTRC";
            //     break;
            //   default:
            //     gc=g;
            //     break;
            // }
    
            
            // const ff = new FixedFloat('g5TrAhpiFKxCSDlYkcwjLrRdLfPutWghO5Vqe7sD', '0heeFYtaCGFRma6ll7zkW4YflIxwoAFNAohS9aAg');
            // response16 = await ff.getPrice(sc, gc, amount, 'from', 'float');
          }, timeout)
    
          //.......................................................Api 11 Call (FixedFloat_fixed)
          setTimeout(async () => {
            // const s=sell.toUpperCase();
            // const g=get.toUpperCase();
            // let sc,gc;
            // switch(s){
            //   case "USDTERC20":
            //     sc="USDT";
            //     break;
            //   case "USDTTRC20":
            //     sc="USDTTRC";
            //     break;
            //   default:
            //       sc=s;
            //       break;
            // }
            // switch(g){
            //   case "USDTERC20":
            //     sc="USDT";
            //     break;
            //   case "USDTTRC20":
            //     gc="USDTTRC";
            //     break;
            //   default:
            //     gc=g;
            //     break;
            // }
            // const ff = new FixedFloat('g5TrAhpiFKxCSDlYkcwjLrRdLfPutWghO5Vqe7sD', '0heeFYtaCGFRma6ll7zkW4YflIxwoAFNAohS9aAg');
            // response9 = await ff.getPrice(sc, gc, amount, 'from', 'fixed');
          }, timeout)
          
    
          //.......................................................Api 10 Call (Changenow Fixed Price)
          setTimeout(async () => {
    
            const response18 = await fetch(
              `https://api.changenow.io/v1/min-amount/${sell}_${get}?api_key=${changenow_api_key}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            )
    
    
            const result18 = await response18.json()
            let amount_num=parseFloat(amount)
            let changenow_min=parseFloat(result18.minAmount)
            changenow_fixed_minimum_amount=changenow_min;
            if (amount_num >= changenow_min) {
              response10 = await fetch(
                `https://api.changenow.io/v1/exchange-amount/fixed-rate/${amount}/${sell}_${get}?api_key=${changenow_api_key}&useRateId=true`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              )
            }
          }, timeout)
    
          //.......................................................Api 11 Call (StealthEX Fixed Price)
          setTimeout(async () => {
    
            const response19 = await fetch(
              `https://api.stealthex.io/api/v2/min/${sell}/${get}?api_key=${stealthex_api_key}&fixed=true`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            )
            const result19 = await response19.json()
              let amount_num=parseFloat(amount)
            let stealthex_min=parseFloat(result19.min_amount)
            stealthex_fixed_minimum_amount=stealthex_min;
            if (amount_num >= stealthex_min) {
              response11 = await fetch(`https://api.stealthex.io/api/v2/estimate/${sell}/${get}?amount=${amount}&api_key=${stealthex_api_key}&fixed=true`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              })
            }
          }, timeout)
    
          //.......................................................Api 12 Call (Exolix Fixed)
          setTimeout(async () => {
    
            response12 = await fetch(
              `https://exolix.com/api/v2/rate?coinFrom=${sell}&coinTo=${get}&amount=${amount}&rateType=fixed`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            )
          }, timeout)
    
          //.......................................................Api 13 Call (Simpleswap Fixed)
          setTimeout(async () => {
    
            if(sell=="toncoin" || get=="toncoin"){
              const toncoinsell=sell=="toncoin"?"tonerc20":sell;
              const toncoinget=get=="toncoin"?"tonerc20":get;
              const response = await fetch(`https://api.simpleswap.io/get_ranges?api_key=${simpleswap_api_key}&fixed=true&currency_from=${toncoinsell}&currency_to=${toncoinget}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                }
              });
      
              const data = await response.json()
      
              let amount_num=parseFloat(amount)
              let simpleswap_num=parseFloat(data.min)
              simple_fixed_minimum_amount=simpleswap_num;
              simple_fixed_minimum_amount=simpleswap_num;

              if(amount_num>=simpleswap_num)
      {
              response13 = await fetch(`http://api.simpleswap.io/get_estimated?api_key=${simpleswap_api_key}&fixed=true&currency_from=${toncoinsell}&currency_to=${toncoinget}&amount=${amount}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                }
              })
            }
            }else{
              const response = await fetch(`https://api.simpleswap.io/get_ranges?api_key=${simpleswap_api_key}&fixed=true&currency_from=${sell}&currency_to=${get}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                }
              });
      
              const data = await response.json()
      
              let amount_num=parseFloat(amount)
              let simpleswap_num=parseFloat(data.min)
              simple_fixed_minimum_amount=simpleswap_num;
      
              if(amount_num>=simpleswap_num)
      {
              response13 = await fetch(`http://api.simpleswap.io/get_estimated?api_key=${simpleswap_api_key}&fixed=true&currency_from=${sell}&currency_to=${get}&amount=${amount}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                }
              })
            }
            }
    
          }, timeout)
    
          //.......................................................Api 14 Call (Changehero Fixed)
          setTimeout(async () => {
    
            const response17 = await fetch(`https://api.changehero.io/v2/`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "api-key": changehero_api_key,
              },
              body: JSON.stringify(param16),
            })
    
            const result17 = await response17.json();
            let changehero_min=parseFloat(result17.result);
            changehero_fixed_minimum_amount=changehero_min;
            let amount_num=parseFloat(amount)
            if (amount_num >= changehero_min) {
              response14 = await fetch(`https://api.changehero.io/v2/`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "api-key": changehero_api_key,
                },
                body: JSON.stringify(param5),
              })
            }
          }, timeout)
    
          //.......................................................Api 15 Call (Letsexchange Fixed)
          setTimeout(async () => {
            response15 = await fetch(`https://api.letsexchange.io/api/v1/info`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0b2tlbiIsImRhdGEiOnsiaWQiOjkwLCJoYXNoIjoiZXlKcGRpSTZJa2wzYmxFNE1VeHVOMU5DU25aamFEbExWVE5rYW1jOVBTSXNJblpoYkhWbElqb2lUV1ZhWWs5dGNXY3dWSEZMYm1wWGRuVjJjMXBzV0RaU1ZpdFphamxJYWtrM1EzQkhTRlpsVFdGS1JXZHVXV1pxUTJRNU9WUXlaSHBEVDJWd2NVeEdRVTFOYjBVelJIaEdSRzlwWjBsaEt6UjJWR0UxVjI1TmQweEROamRCUmxCWFdISTJRMGRpUm1Kb1ltTTlJaXdpYldGaklqb2labU0xTnpNMU0yRXlaRFJqWmpSalpXWTFZV1ZqWVRkalptSTBZall4WmpVNFpqZGtNak0wTXpVNU1XRmtaRGRrWm1Sak5HWXhaamt6TldFM01tVXlOaUo5In0sImlzcyI6Imh0dHBzOlwvXC9sZXRzLW5naW54LXN2Y1wvYXBpXC92MVwvYXBpLWtleSIsImlhdCI6MTY2ODUxNjUzNywiZXhwIjoxOTg5OTI0NTM3LCJuYmYiOjE2Njg1MTY1MzcsImp0aSI6IkRCelpBVjdBRDhMMzZTZ1IifQ.tP5L6xDINQSmWVJsmin2vrjrYFopk-cDNWGkBOlKARg"
              },
              body: JSON.stringify(param10),
            })
          }, timeout)
    
    
        } catch (error) {
          // res.json({ hightprice: "server error" })
          console.log(error)
        }
      }
    
  };

}
export default offerController;
