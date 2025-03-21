import crypto from 'crypto';
import request from "request";
import fetch from "node-fetch";
import dotenv from 'dotenv';
import {db} from '../database/connectdb.js';
import {createLogger, format, transports} from 'winston';
const { combine, timestamp, printf } = format;

dotenv.config();

// Define custom log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

//Function for calculating percentage;
function calculatePercentage(Number, PercentageOf){
  const divide=(PercentageOf/100);
  const multiply=divide*Number
  const figureAfterPercentage=multiply;
  console.log("Divide Figure:", divide, "Multiply:", multiply, "Profit:", figureAfterPercentage);
  return figureAfterPercentage;
}

async function fetchProfitPercantage(sql, exchangeName){

return new Promise((resolve, reject) => {
            db.query(sql, [exchangeName], (error, result) => {
                if (error) {
                    reject(0);
                } else {
                    resolve(parseFloat(result[0].profit_percent));
                }
            });
        });
}

// Function for calculating percentge of profit
async function calculateProfitInBTC(exchangeName, sellCoin, sendingAmount, exchangeType){
    let sendAmount=parseFloat(sendingAmount);
    // Fetching changelly profit percentage from database
    const sql="SELECT * FROM exchange_links WHERE exchange_name=?";
    let profitPercent;
    let amountInBTC;
    let profit=0;

    profitPercent=await fetchProfitPercantage(sql, exchangeName);
    
      try {
        if(sellCoin=="btc"){

          profit=calculatePercentage(sendAmount, profitPercent);

        }else{
          switch (exchangeName) {
            case "changelly":
              // Calling Changelly Api for converting sentding amount to BTC
              const privateKeyString = process.env.CHANGELLY_PRIVATE_KEY;
              const privateKey = crypto.createPrivateKey({
                  key: privateKeyString,
                  format: "der",
                  type: "pkcs8",
                  encoding: "hex",
                });
          
              const publicKey = crypto.createPublicKey(privateKey).export({
                  type: "pkcs1",
                  format: "der",
                });
              
              if (exchangeType=="Floating") {          
                const message = {
                  jsonrpc: "2.0",
                  id: "test",
                  method: "getExchangeAmount",
                  params: {
                    from: sellCoin,
                    to: "btc",
                    amountFrom: sendAmount,
                  },
                };
          
                const signature = crypto.sign(
                  "sha256",
                  Buffer.from(JSON.stringify(message)),
                  {
                    key: privateKey,
                    type: "pkcs8",
                    format: "der",
                  }
                );
          
                const param = {
                  method: "POST",
                  url: "https://api.changelly.com/v2",
                  headers: {
                    "Content-Type": "application/json",
                    "X-Api-Key": crypto
                      .createHash("sha256")
                      .update(publicKey)
                      .digest("base64"),
                    "X-Api-Signature": signature.toString("base64"),
                  },
                  body: JSON.stringify(message),
                };
          
          
                // Wrapping the request in a promise
                const data = await new Promise((resolve, reject) => {
                  request(param, (error, response) => {
                    if (error) {
                      return profit;
                    } else {
                      resolve(JSON.parse(response.body));
                    }
                  });
                });
          
                    amountInBTC = parseFloat(data.result[0].amountTo);
                    profit=calculatePercentage(amountInBTC, profitPercent);
          
              }else{
          
                const message = {
              
                  jsonrpc: "2.0",
                  id: "test",
                  method: "getFixRateForAmount",
                  params: [
                    {
                      from: sellCoin,
                      to: "btc",
                      amountFrom: sendAmount
                    }
                  ]
                }
          
                const signature = crypto.sign(
                  "sha256",
                  Buffer.from(JSON.stringify(message)),
                  {
                    key: privateKey,
                    type: "pkcs8",
                    format: "der",
                  }
                );
          
                const param = {
                  method: "POST",
                  url: "https://api.changelly.com/v2",
                  headers: {
                    "Content-Type": "application/json",
                    "X-Api-Key": crypto
                      .createHash("sha256")
                      .update(publicKey)
                      .digest("base64"),
                    "X-Api-Signature": signature.toString("base64"),
                  },
                  body: JSON.stringify(message),
                };
          
                // Wrapping the request in a promise
                const data = await new Promise((resolve, reject) => {
                  request(param, (error, response) => {
                    if (error) {
                      return profit;
                    } else {
                      resolve(JSON.parse(response.body));
                    }
                  });
                });
          
                    amountInBTC = parseFloat(data.result[0].amountTo);
                    profit=calculatePercentage(amountInBTC, profitPercent);
              }
              break;
            case "changenow":
              if (exchangeType=="Floating") {
                const response = await fetch(
                  `https://api.changenow.io/v1/exchange-amount/${sendAmount}/${sellCoin}_btc/?api_key=${process.env.CHANGENOW}`,
                  {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  })
          
                const data=await response.json();
                amountInBTC=parseFloat(data.estimatedAmount);
                 profit=calculatePercentage(amountInBTC, profitPercent);
                
              }else{
                const response = await fetch(
                  `https://api.changenow.io/v1/exchange-amount/fixed-rate/${sendAmount}/${sellCoin}_btc/?api_key=${process.env.CHANGENOW}`,
                  {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  })
          
                const data=await response.json();
                amountInBTC=parseFloat(data.estimatedAmount);
                profit=calculatePercentage(amountInBTC, profitPercent);
              }
              break;
            case "changehero":
              if (exchangeType=="Floating") {
    
                  const param = {
                    jsonrpc: "2.0",
                    method: "getExchangeAmount",
                    params: {
                      from: sellCoin,
                      to: "btc",
                      amount:sendAmount
                    },
                  };
          
                  const response = await fetch(
                    `https://api.changehero.io/v2/`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "api-key": process.env.CHANGEHERO,
                      },
                      body: JSON.stringify(param),
                    }
                  )    
          
                const data=await response.json();
                amountInBTC=parseFloat(data.result);
                profit=calculatePercentage(amountInBTC, profitPercent);
                
              }else{
                const param = {
                  jsonrpc: "2.0",
                  method: "getFixRate",
                  params: {
                    from: sellCoin,
                    to: "btc",
                    amount:sendAmount
                  },
                };
    
                const response = await fetch(
                  `https://api.changehero.io/v2/`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "api-key": process.env.CHANGEHERO,
                    },
                    body: JSON.stringify(param),
                  }
                )    
        
              const data=await response.json();
              amountInBTC=parseFloat(data.result[0].result);
              profit=calculatePercentage(amountInBTC, profitPercent);
              }
              
              break;
            case "exolix":
              if (exchangeType=="Floating") {
        
                const response =await fetch(
                  `https://exolix.com/api/v2/rate?coinFrom=${sellCoin}&coinTo=btc&amount=${sendAmount}&rateType=float`,
                  {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                )   
        
              const data=await response.json();
              amountInBTC=parseFloat(data.toAmount);
              profit=calculatePercentage(amountInBTC, profitPercent);
              
            }else{
              const response =await fetch(
                `https://exolix.com/api/v2/rate?coinFrom=${sellCoin}&coinTo=btc&amount=${sendAmount}&rateType=fixed`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              )   
      
            const data=await response.json();
            amountInBTC=parseFloat(data.toAmount);
            profit=calculatePercentage(amountInBTC, profitPercent);
            }
              
              break;
            case "godex":
              if (exchangeType=="Floating") {
        
                const param = {
                  from: sellCoin.toUpperCase(),
                  to: "BTC",
                  amount: sendAmount,
                };
        
                const response = await fetch(
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
    
              const data=await response.json();
              amountInBTC=parseFloat(data.amount);
              profit=calculatePercentage(amountInBTC, profitPercent);
              
            }
              
              break;
            case "stealthex":
    
              if (exchangeType=="Floating") {
                const response = await fetch(`https://api.stealthex.io/api/v2/estimate/${sellCoin}/btc?amount=${sendAmount}&api_key=${process.env.STEALTHEX}&fixed=false`, {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  })
        
              const data=await response.json();
              amountInBTC=parseFloat(data.estimated_amount);
              profit=calculatePercentage(amountInBTC, profitPercent);
              
            }else{
              const response = await fetch(`https://api.stealthex.io/api/v2/estimate/${sellCoin}/btc?amount=${sendAmount}&api_key=${process.env.STEALTHEX}&fixed=true`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              })
    
             const data=await response.json();
             amountInBTC=parseFloat(data.estimated_amount);
             profit=calculatePercentage(amountInBTC, profitPercent);
            }
              
              break;
            case "letsexchange":
              if (exchangeType=="Floating") {
    
                  let toncoinsell,param;
                  if(sellCoin=="toncoin"){
                    toncoinsell=sellCoin=="toncoin"?"TON-ERC20":sellCoin;            
                     param = {
                      from: toncoinsell,
                      to: "btc",
                      amount: sendAmount,
                      float: false
                    }
                
                
                  }else{
                    param = {
                     from: sellCoin,
                     to: "btc",
                     amount: sendAmount,
                     float: false
                   };
                 }
                  
                const response = await fetch(`https://api.letsexchange.io/api/v1/info`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": process.env.LETSEXCHANGE
                    },
                    body: JSON.stringify(param)
                  })
        
                  const data=await response.json();
                  amountInBTC=parseFloat(data.amount);
                  profit=calculatePercentage(amountInBTC, profitPercent);
              
            }else{
              let toncoinsell,param;
              if(sellCoin=="toncoin"){
                toncoinsell=sellCoin=="toncoin"?"TON-ERC20":sellCoin;            
                 param = {
                  from: toncoinsell,
                  to: "btc",
                  amount: sendAmount,
                  float: true
                }
            
            
              }else{
                param = {
                 from: sellCoin,
                 to: "btc",
                 amount: sendAmount,
                 float: true
               };
             }
              
            const response = await fetch(`https://api.letsexchange.io/api/v1/info`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": process.env.LETSEXCHANGE
                },
                body: JSON.stringify(param)
              })
    
              const data=await response.json();
              amountInBTC=parseFloat(data.amount);
              profit=calculatePercentage(amountInBTC, profitPercent);
            }
              
              break;
            case "simpleswap":
              if (exchangeType=="Floating") {
    
                  let sellcoin=sellCoin=="toncoin"?"tonerc20":sellCoin;
          
                  const response = await fetch(`https://api.simpleswap.io/get_estimated?api_key=${process.env.SIMPLESWAP}&fixed=false&currency_from=${sellcoin}&currency_to=btc&amount=${sendAmount}`, {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
                    }
                  });
        
                 const data=await response.json();
                 console.log("Simpleswap rate response", data);
                 amountInBTC=parseFloat(data);
                 profit=calculatePercentage(amountInBTC, profitPercent);
              
            }else{
    
              let sellcoin=sellCoin=="toncoin"?"tonerc20":sellCoin;
          
              const response = await fetch(`https://api.simpleswap.io/get_estimated?api_key=${process.env.SIMPLESWAP}&fixed=true&currency_from=${sellcoin}&currency_to=btc&amount=${sendAmount}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                }
              });
    
             const data=await response.json();
             amountInBTC=parseFloat(data);
             profit=calculatePercentage(amountInBTC, profitPercent);
            }
              
              break;
          }
        }
        return profit;
      } catch (error) {
        return profit;
      }
    
}

class exchangeController{

    // *********************** Floating Transactions ************************* //

    static changellyFloatingTransaction = async (req, res) => {
        const {sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo,  amount, recieving_Address, refund_Address, email, rateId ,extraid, refextraid, expirytime} = req.body;
        let profit=await calculateProfitInBTC("changelly", sell, amount, "Floating");
        if(!profit){
          profit=0;
        }

        // Create the logger
        const logger = createLogger({
                    format: combine(
                        timestamp(),
                        logFormat
                    ),
                    transports: [
                        new transports.Console(),
                        new transports.File({ filename: './logs/exchangeErrorLogs/changelly.log' })
                    ]
            });

        const privateKeyString = process.env.CHANGELLY_PRIVATE_KEY;
        const privateKey = crypto.createPrivateKey({
            key: privateKeyString,
            format: "der",
            type: "pkcs8",
            encoding: "hex",
          });

        const publicKey = crypto.createPublicKey(privateKey).export({
            type: "pkcs1",
            format: "der",
          });
        
        const message = {
            jsonrpc: "2.0",
            id: "test",
            method: "createTransaction",
            params: {
              from: sell,
              to: get,
              address: recieving_Address,
              extraId: extraid,
              amountFrom: amount,
              refundAddress: refund_Address,
              refundExtraId: refextraid
            }
          };

          if (refextraid === '') {
            // Remove refundExtraId property from params
            delete message.params.refundExtraId;
          }
        
          if (extraid === '') {
            // Remove refundExtraId property from params
            delete message.params.extraId;
          }
        
          const signature = crypto.sign(
            "sha256",
            Buffer.from(JSON.stringify(message)),
            {
              key: privateKey,
              type: "pkcs8",
              format: "der",
            }
          );
        
          const paramCreateExchange = {
            method: "POST",
            url: "https://api.changelly.com/v2",
            headers: {
              "Content-Type": "application/json",
              "X-Api-Key": crypto
                .createHash("sha256")
                .update(publicKey)
                .digest("base64"),
              "X-Api-Signature": signature.toString("base64"),
            },
            body: JSON.stringify(message),
          };
        
          request(paramCreateExchange, async function (error, response) {
              if (error) throw new Error();
            
            const data = await JSON.parse(response.body);

            if(data.error){
              const errorString=JSON.stringify(data.error);
              const stringData=JSON.stringify(data);
              const requestBody=JSON.stringify(paramCreateExchange);
              const proxyRequestBody=JSON.stringify(req.body);
              logger.error(`Error: ${errorString} || response:${stringData} requestURL:https://api.changelly.com/v2, reauestBody${requestBody} proxyRequestBody:${proxyRequestBody} `);
              return res.status(404).json(data);
            }

            try {
              if(data.result.id){
                var sql="INSERT INTO changelly_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_network, get_coin_network, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount, deposit_extraid,	recipient_extraid,	refund_extraid,	status, recipient_address, refund_address, deposit_address, email, average_profit_percent	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                db.query(sql,[data.result.id, expirytime, sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, data.result.amountExpectedTo, data.result.payinExtraId, extraid, refextraid, data.result.status, recieving_Address, refund_Address, data.result.payinAddress, email, profit], function(error, result){
                  if (error) throw new Error();
                })
              }
              return res.status(200).json({
                transaction_id:data.result.id,	
                sell_coin:sell,	
                get_coin:get,	
                sell_amount:amount,	
                get_amount:data.result.amountExpectedTo,	
                recipient_extraid:extraid,	
                refund_extraid:refextraid,	
                status:data.result.status, 
                recipient_address:recieving_Address, 
                refund_address:refund_Address, 
                deposit_address:data.result.payinAddress,
                deposit_extraid:data.result.payinExtraId?data.result.payinExtraId:null,
                email:email,
                transaction_type:"Floating"
              });

            } catch (error) {
              let stringData=JSON.stringify(data);
              let requestBody=JSON.stringify(paramCreateExchange);
              const proxyRequestBody=JSON.stringify(req.body);
              logger.error(`Error: ${error} || response:${stringData} requestURL:https://api.changelly.com/v2, reauestBody:${requestBody} proxyRequestBody:${proxyRequestBody}`);
              return res.status(502).json();             
            }
          })
    }

    static changenowFloatingTransaction = async (req, res)=>{

        const { sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, recieving_Address, refund_Address, email, extraid ,refextraid, expirytime} = req.body
        let profit=await calculateProfitInBTC("changenow", sell, amount, "Floating");
        if(!profit){
          //Dont Do any thing
          profit=0;
        }

        // Create the logger
        const logger = createLogger({
                  format: combine(
                      timestamp(),
                      logFormat
                  ),
                  transports: [
                      new transports.Console(),
                      new transports.File({ filename: './logs/exchangeErrorLogs/changenow.log' })
                  ]
          });

        const url = `https://api.changenow.io/v1/transactions/${process.env.CHANGENOW}`;
      
        const params = {
          from: sell,
          to: get,
          address: recieving_Address,
          amount: amount,
          extraId: extraid,
          userId: "",
          contactEmail: email,
          refundAddress: refund_Address,
          refundExtraId: refextraid
        }
      
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params)
        }
      
        const response = await fetch(url, options)
        const data = await response.json();

        //Exchange Api error
        if (data.error){
          const errorString=JSON.stringify(data.error);
          const stringResponse=JSON.stringify(data);
          const requestBody=JSON.stringify(options);
          const proxyRequestBody=JSON.stringify(req.body);
          logger.error(`Error: ${errorString} || response${stringResponse} requestURL:${url}, reauestBody${requestBody} proxyRequestBody:${proxyRequestBody}`);
          return res.status(404).json(data);
        }

        try {
          if(data.id){
            var sql="INSERT INTO changenow_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_network, get_coin_network, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount, deposit_extraid,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, deposit_address, email, average_profit_percent	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(sql,[data.id, expirytime, sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, data.amount,data.payinExtraId, extraid, refextraid, "waiting", recieving_Address, refund_Address, data.payinAddress, email, profit ], function(error, result){
              if (error) throw new Error();
            })
          
          return res.status(200).json({
            transaction_id:data.id,	
            sell_coin:sell,	
            get_coin:get,	
            sell_amount:amount,	
            get_amount:data.amount,	
            recipient_extraid:extraid,	
            refund_extraid:refextraid,	
            status:data.status, 
            recipient_address:recieving_Address, 
            refund_address:refund_Address, 
            deposit_address:data.payinAddress,
            deposit_extraid:data.payinExtraId?data.payinExtraId:null,
            email:email	,
            transaction_type:"Floating",
          });
        }
        } catch (error) {
          const stringResponse=JSON.stringify(data);
          const requestBody=JSON.stringify(options);
          const proxyRequestBody=JSON.stringify(req.body);
          logger.error(`Error: ${error} || response${stringResponse} requestURL:${url}, reauestBody${requestBody} proxyRequestBody:${proxyRequestBody}`);
          //Exchange response invalid
          return res.status(502).json();
        }
    }

    static changeheroFloatingTransaction = async (req, res)=>{
        const { sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, recieving_Address, refund_Address, email, rateId, extraid, refextraid, expirytime } = req.body;
        let profit=await calculateProfitInBTC("changehero", sell, amount, "Floating");
        
        if(!profit){
          profit=0;
        }
                  // Create the logger
                  const logger = createLogger({
                    format: combine(
                        timestamp(),
                        logFormat
                    ),
                    transports: [
                        new transports.Console(),
                        new transports.File({ filename: './logs/exchangeErrorLogs/changehero.log' })
                    ]
            });

        const url = "https://api.changehero.io/v2/";
      
        const params = {
      
          jsonrpc: "2.0",
          method: "createTransaction",
          params: {
            from: sell,
            to: get,
            address: recieving_Address,
            extraId: extraid,
            amount: amount,
            refundAddress: refund_Address,
            refundExtraId: refextraid
          }
        }
      
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": process.env.CHANGEHERO
          },
          body: JSON.stringify(params)
        }
      
        const response = await fetch(url, options)
      
      
        const data = await response.json();

        if (data.error){
          const errorString=JSON.stringify(data.error);
          const stringResponse=JSON.stringify(data);
          const requestBody=JSON.stringify(options);
          const proxyRequestBody=JSON.stringify(req.body);
          logger.error(`Error: ${errorString} || response${stringResponse} requestURL:${url}, reauestBody${requestBody} proxyRequestBody:${proxyRequestBody}`);
          return res.status(404).json(data);
        }

        try {
          if(data.result.id){
            var sql="INSERT INTO changehero_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_network, get_coin_network, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount, deposit_extraid,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, deposit_address, email, average_profit_percent	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(sql,[data.result.id, expirytime, sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, data.result.amountExpectedTo, data.result.payinExtraId, extraid, refextraid, data.result.status, recieving_Address, refund_Address, data.result.payinAddress, email, profit ], function(error, result){
              if (error) throw new Error();
            })
          
          return res.status(200).json({
            transaction_id:data.result.id,	

            sell_coin:sell,	
            get_coin:get,	
            sell_amount:amount,

            get_amount:data.result.amountExpectedTo,	

            recipient_extraid:extraid,	
            refund_extraid:refextraid,

            status:data.result.status, 

            recipient_address:recieving_Address, 
            refund_address:refund_Address,

            deposit_address:data.result.payinAddress,
            deposit_extraid:data.result.payinExtraId?data.result.payinExtraId:null,
            email:email,
            
            transaction_type:"Floating"
          })}
        } catch (error) {
          const stringResponse=JSON.stringify(data);
          const requestBody=JSON.stringify(options);
          const proxyRequestBody=JSON.stringify(req.body);
          logger.error(`Error: ${error} || response${stringResponse} requestURL:${url}, reuestBody${requestBody} proxyRequestBody:${proxyRequestBody}`);
          //Exchange response invalid
          return res.status(502).json();
        }      
      
    }

    static stealthexFloatingTransaction = async (req, res)=>{
        const { sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, recieving_Address, refund_Address, email, rateId, extraid , refextraid, expirytime} = req.body;
        let profit=await calculateProfitInBTC("stealthex", sell, amount, "Floating");
        if(!profit){
          profit=0;
        }
        // Create the logger
  const logger = createLogger({
    format: combine(
        timestamp(),
        logFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: './logs/exchangeErrorLogs/stealthex.log' })
    ]
});
        const url = `https://api.stealthex.io/api/v2/exchange?api_key=${process.env.STEALTHEX}`;
      
        const params = {
      
          currency_from: sell,
          currency_to: get,
          address_to: recieving_Address,
          extra_id_to: extraid,
          amount_from: amount,
          fixed: false,
          refund_address: refund_Address,
          refund_extra_id:refextraid,
          api_key: process.env.STEALTHEX,
        }
      
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params)
        }
      
        const response = await fetch(url, options);
        const data = await response.json();
        if(data.err){
          const errorString=JSON.stringify(data.err);
          const stringResponse=JSON.stringify(data);
          const requestBody=JSON.stringify(options);
          const proxyRequestBody=JSON.stringify(req.body);
          logger.error(`Error: ${errorString} || response${stringResponse} requestURL:${url}, reauestBody${requestBody} proxyRequestBody:${proxyRequestBody}`);
          return res.status(404).json(data);
        }
        
        try {

          if(data.id){
            var sql="INSERT INTO stealthex_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_network, get_coin_network, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount, deposit_extraid,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, deposit_address, email, average_profit_percent	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(sql,[data.id, expirytime, sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, data.amount_to, data.extra_id_from, extraid, refextraid, data.status, recieving_Address, refund_Address, data.address_from, email, profit ], function(error, result){
              if (error) throw new Error();
            })
          
          return res.status(200).json({
            transaction_id:data.id,	

            sell_coin:sell,	
            get_coin:get,	
            sell_amount:amount,

            get_amount:data.amount_to,	

            recipient_extraid:extraid,	
            refund_extraid:refextraid,

            status:data.status, 

            recipient_address:recieving_Address, 
            refund_address:refund_Address,

            deposit_address:data.address_from,
            deposit_extraid:data.extra_id_from?data.extra_id_from:null,

            email:email,
            
            transaction_type:"Floating"
          })}

        } catch (error) {
          const stringResponse=JSON.stringify(data);
          const requestBody=JSON.stringify(options);
          const proxyRequestBody=JSON.stringify(req.body);
          logger.error(`Error: ${error} || response${stringResponse} requestURL:${url}, reauestBody${requestBody} proxyRequestBody:${proxyRequestBody}`);
          //Exchange response invalid
          return res.status(502).json();
        }
    }

    static exolixFloatingTransaction = async (req, res)=>{
        const { sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, recieving_Address, refund_Address, email, rateId, extraid , refextraid, expirytime} = req.body;
        let profit=await calculateProfitInBTC("exolix", sell, amount, "Floating");
        if(!profit){
          profit=0;
        }
                // Create the logger
  const logger = createLogger({
    format: combine(
        timestamp(),
        logFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: './logs/exchangeErrorLogs/exolix.log' })
    ]
});

        const url = "https://exolix.com/api/v2/transactions";
      
        const params = {
      
          coinFrom: sell.toUpperCase(),
          coinTo: get.toUpperCase(),
          amount: amount,
          withdrawalAddress: recieving_Address,
          withdrawalExtraId: extraid,
          rateType: "float",
          refundAddress: refund_Address,
          refundExtraId: refextraid
        }
      
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization":process.env.EXOLIX
          },
          body: JSON.stringify(params)
        }
      
        const response = await fetch(url, options);
        const data = await response.json();

        if(data.error || data.message){
          const stringResponse=JSON.stringify(data);
          const requestBody=JSON.stringify(options);
          const proxyRequestBody=JSON.stringify(req.body);
          logger.error(`Error: ${stringResponse} || response${stringResponse} requestURL:${url}, reauestBody${requestBody} proxyRequestBody:${proxyRequestBody}`);
          return res.status(404).json(data);
        }

        try {
          if(data.id){
            var sql="INSERT INTO exolix_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_network, get_coin_network sell_coin_logo, get_coin_logo,	sell_amount,	get_amount, deposit_extraid,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, deposit_address, email, average_profit_percent	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(sql,[data.id, expirytime, sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, data.amountTo, data.depositExtraId, extraid, refextraid, data.status, recieving_Address, refund_Address, data.depositAddress, email, profit ], function(error, result){
              if (error) throw new Error();
            })
          
          return res.status(200).json({
            transaction_id:data.id,	
            sell_coin:sell,	
            get_coin:get,	
            sell_amount:amount,
            get_amount:data.amountTo,	
            recipient_extraid:extraid,	
            refund_extraid:refextraid,
            status:data.status, 
            recipient_address:recieving_Address, 
            refund_address:refund_Address,
            deposit_address:data.depositAddress,
            deposit_extraid:data.depositExtraId?data.depositExtraId:null,
            email:email,
            transaction_type:"Floating"
          })};

        } catch (error) {
          const stringResponse=JSON.stringify(data);
          const requestBody=JSON.stringify(options);
          const proxyRequestBody=JSON.stringify(req.body);
          logger.error(`Error: ${error} || response${stringResponse} requestURL:${url}, reauestBody${requestBody} proxyRequestBody:${proxyRequestBody}`);
          //Exchange response invalid
          return res.status(502).json();
        }
    }

    static simpleswapFloatingTransaction = async (req, res)=>{
        const { sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, recieving_Address, refund_Address, email, rateId, extraid, refextraid, expirytime } = req.body;
        
        let profit=await calculateProfitInBTC("simpleswap", sell, amount, "Floating");
        if(!profit){
          profit=0;
        }

        const url = "https://api.simpleswap.io/create_exchange?api_key=ae57f22d-7a23-4dbe-9881-624b2e147759";
      
                        // Create the logger
  const logger = createLogger({
    format: combine(
        timestamp(),
        logFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: './logs/exchangeErrorLogs/simpleswap.log' })
    ]
});
        const params = {
      
          fixed: false,
          currency_from: sell,
          currency_to: get,
          amount: amount,
          address_to: recieving_Address,
          extra_id_to: extraid,
          user_refund_address: refund_Address,
          user_refund_extra_id: refextraid
        }
      
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api_key": process.env.SIMPLESWAP
          },
          body: JSON.stringify(params)
        }
        const response = await fetch(url, options)
        const data = await response.json();
        
        if(data.error){
          const errorString=JSON.stringify(data.error);
          const stringResponse=JSON.stringify(data);
          const requestBody=JSON.stringify(options);
          const proxyRequestBody=JSON.stringify(req.body);
          logger.error(`Error: ${errorString} || response${stringResponse} requestURL:${url}, reauestBody${requestBody} proxyRequestBody:${proxyRequestBody}`);
          return res.status(404).json(data);
        }

        try {
          if(data.id){
            var sql="INSERT INTO simpleswap_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_network, get_coin_network, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount, deposit_extraid,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, deposit_address, email, average_profit_percent	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(sql,[data.id, expirytime, sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, data.amount_to,data.extra_id_from, extraid, refextraid, data.status, recieving_Address, refund_Address, data.address_from, email, profit ], function(error, result){
              if (error) throw new Error();
            })
          
          return res.status(200).json({
            transaction_id:data.id,	
            sell_coin:sell,	
            get_coin:get,	
            sell_amount:amount,
            get_amount:data.amount_to,	
            recipient_extraid:extraid,	
            refund_extraid:refextraid,
            status:data.status, 
            recipient_address:recieving_Address, 
            refund_address:refund_Address,
            deposit_address:data.address_from,
            deposit_extraid:data.extra_id_from?data.extra_id_from:null,
            email:email,
            transaction_type:"Floating"
          })}

        } catch (error) {
          const stringResponse=JSON.stringify(data);
          const requestBody=JSON.stringify(options);
          const proxyRequestBody=JSON.stringify(req.body);
          logger.error(`Error: ${error} || response${stringResponse} requestURL:${url}, reauestBody${requestBody} proxyRequestBody:${proxyRequestBody}`);
          //Exchange response invalid
          return res.status(502).json();
        }
    }

    static godexFloatingTransaction = async (req, res)=>{
        const { sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, recieving_Address, refund_Address, email, rateId, extraid, refextraid, expirytime } = req.body;
        let profit=await calculateProfitInBTC("godex", sell, amount, "Floating");
        if(!profit){
          profit=0;
        }
        // Create the logger
  const logger = createLogger({
    format: combine(
        timestamp(),
        logFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: './logs/exchangeErrorLogs/godex.log' })
    ]
});
        const url = "https://api.godex.io/api/v1/transaction";
      
        const params = {
      
          coin_from: sell.toUpperCase(),
          coin_to: get.toUpperCase(),
          deposit_amount: amount,
          withdrawal: recieving_Address,
          withdrawal_extra_id: extraid!=undefined?extraid:"",
          return: refund_Address,
          return_extra_id:refextraid!=undefined?refextraid:"",
          affiliate_id:process.env.GODEX_AFFILIATE_ID
      
        }
      
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "public-key": process.env.GODEX
          },
          body: JSON.stringify(params)
        }
      
        const response = await fetch(url, options)
      
        const data = await response.json();

        if(data.validation){
          const errorString=JSON.stringify(data.validation);
          const stringResponse=JSON.stringify(data);
          const requestBody=JSON.stringify(options);
          const proxyRequestBody=JSON.stringify(req.body);
          logger.error(`Error: ${errorString} || response${stringResponse} requestURL:${url}, reauestBody${requestBody} proxyRequestBody:${proxyRequestBody}`);
          return res.status(404).json(data);
        }
      
        try {
          if(data.transaction_id){
            var sql="INSERT INTO godex_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_network, get_coin_network, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount, deposit_extraid,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, deposit_address, email, average_profit_percent	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(sql,[data.transaction_id, expirytime, sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, data.withdrawal_amount, data.deposit_extra_id, extraid, refextraid, data.status, recieving_Address, refund_Address, data.deposit, email, profit ], function(error, result){
              if (error) throw new Error();
            })
          
        return res.status(200).json({
            transaction_id:data.transaction_id,	
            sell_coin:sell,	
            get_coin:get,	
            sell_amount:amount,
            get_amount:data.withdrawal_amount,	
            recipient_extraid:extraid,	
            refund_extraid:refextraid,
            status:data.status, 
            recipient_address:recieving_Address, 
            refund_address:refund_Address,
            deposit_address:data.deposit,
            deposit_extraid:data.deposit_extra_id?data.deposit_extra_id:null,
            email:email,  
            transaction_type:"Floating"
          })}

        } catch (error) {
          const stringResponse=JSON.stringify(data);
          const requestBody=JSON.stringify(options);
          const proxyRequestBody=JSON.stringify(req.body);
          logger.error(`Error: ${error} || response${stringResponse} requestURL:${url}, reauestBody${requestBody} ${proxyRequestBody}`);
          //Exchange response invalid
          return res.status(502).json();
        }
    }

    static letsexchangeFloatingTransaction = async (req, res)=>{
        const { sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, recieving_Address, refund_Address, email, rateId, extraid,  refextraid, expirytime} = req.body;
        if(!profit){
          profit=0;
        }
        
        // Create the logger
        const logger = createLogger({
          format: combine(
              timestamp(),
              logFormat
          ),
          transports: [
              new transports.Console(),
              new transports.File({ filename: './logs/exchangeErrorLogs/letsexchange.log' })
          ]
      });
        const url = "https://api.letsexchange.io/api/v1/transaction";

  const params = {

    float: true,
    coin_from: sell.toUpperCase(),
    coin_to: get.toUpperCase(),
    deposit_amount: amount,
    withdrawal: recieving_Address,
    withdrawal_extra_id: extraid!=undefined?extraid:"",
    return: refund_Address,
    return_extra_id:refextraid,
    affiliate_id:process.env.LETSEXCHANGE_AFFILIATE_ID

  }

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": process.env.LETSEXCHANGE,
      "Accept": "application/json",
    },
    body: JSON.stringify(params)
  }

  const response = await fetch(url, options)

  const data = await response.json();

  if(data.error){
    const errorString=JSON.stringify(data.error);
    const stringResponse=JSON.stringify(data);
    const requestBody=JSON.stringify(options);
    const proxyRequestBody=JSON.stringify(req.body);
    logger.error(`Error: ${errorString} || response${stringResponse} requestURL:${url}, reauestBody${requestBody} proxyRequestBody:${proxyRequestBody}`);
    return res.status(404).json(data);
  }

  try {
    if(data.transaction_id){
      let profit=await calculateProfitInBTC("letsexchange", sell, amount, "Floating");
      var sql="INSERT INTO letsexchange_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_network, get_coin_network, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount, deposit_extraid,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, deposit_address, email, average_profit_percent	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      db.query(sql,[data.transaction_id, expirytime, sell, get, sellname, getname,sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, data.withdrawal_amount, data.deposit_extra_id, extraid, refextraid, data.status, recieving_Address, refund_Address, data.deposit, email, profit ], function(error, result){
        if (error) throw new Error();
      })
    
    return res.status(200).json({
      transaction_id:data.transaction_id,	
      sell_coin:sell,	
      get_coin:get,	
      sell_amount:amount,
      get_amount:data.withdrawal_amount,	
      recipient_extraid:extraid,	
      refund_extraid:refextraid,
      status:data.status, 
      recipient_address:recieving_Address, 
      refund_address:refund_Address,
      deposit_address:data.deposit,
      deposit_extraid:data.deposit_extra_id?data.deposit_extra_id:null,
      email:email, 
      transaction_type:"Floating"
    })}
    
  } catch (error) {
    const stringResponse=JSON.stringify(data);
    const requestBody=JSON.stringify(options);
    const proxyRequestBody=JSON.stringify(req.body);
    logger.error(`Error: ${error} || response${stringResponse} requestURL:${url}, reauestBody${requestBody} proxyRequestBody:${proxyRequestBody}`);
    //Exchange response invalid
    return res.status(502).json();
  }
    }

    // *********************** Fixed Transactions ************************* //

    static changellyFixedTransaction = async (req, res)=>{
        const {sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, recieving_Address, refund_Address, email, rateId ,extraid, refextraid, expirytime} = req.body;
        let profit=await calculateProfitInBTC("changelly", sell, amount, "Fixed");
        if(!profit){
          profit=0;
        }
        // Create the logger
        const logger = createLogger({
          format: combine(
              timestamp(),
              logFormat
          ),
          transports: [
              new transports.Console(),
              new transports.File({ filename: './logs/exchangeErrorLogs/changelly.log' })
          ]
        });
        
        const privateKeyString = process.env.CHANGELLY_PRIVATE_KEY;
        const privateKey = crypto.createPrivateKey({
            key: privateKeyString,
            format: "der",
            type: "pkcs8",
            encoding: "hex",
          });
        
          const publicKey = crypto.createPublicKey(privateKey).export({
            type: "pkcs1",
            format: "der",
          });
        
          const message = {
            jsonrpc: "2.0",
            id: "test",
            method: "createFixTransaction",
            params: {
              from: sell,
              to: get,
              address: recieving_Address,
              extraId: extraid,
              amountFrom: amount,
              rateId: rateId,
              refundAddress: refund_Address,
              refundExtraId: refextraid
            }
          };
        
          if (refextraid === '') {
            // Remove refundExtraId property from params
            delete message.params.refundExtraId;
          }
        
          if (extraid === '') {
            // Remove refundExtraId property from params
            delete message.params.extraId;
          }
        
          const signature = crypto.sign(
            "sha256",
            Buffer.from(JSON.stringify(message)),
            {
              key: privateKey,
              type: "pkcs8",
              format: "der",
            }
          );
        
          const paramy = {
            method: "POST",
            url: "https://api.changelly.com/v2",
            headers: {
              "Content-Type": "application/json",
              "X-Api-Key": crypto
                .createHash("sha256")
                .update(publicKey)
                .digest("base64"),
              "X-Api-Signature": signature.toString("base64"),
            },
            body: JSON.stringify(message),
          };
        
          request(paramy, async function (error, response) {

            if (error) throw new Error();

            const data = await JSON.parse(response.body);

            if(data.error){
              const errorString=JSON.stringify(data.error);
              const responseString=JSON.stringify(data);
              const requestBody=JSON.stringify(paramy);
              const proxyRequestBody=JSON.stringify(req.body);
              logger.error(`Error: ${errorString} || response:${responseString} requestURL:https://api.changelly.com/v2, reauestBody${requestBody} proxyRequestBody:${proxyRequestBody}`);
              return res.status(404).json(data);
          }

            try {
              if(data.result.id){
                var sql="INSERT INTO changelly_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_network, get_coin_network, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount, deposit_extraid,	recipient_extraid,	refund_extraid,	status, recipient_address, refund_address, deposit_address, email, transaction_type, average_profit_percent	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                db.query(sql,[data.result.id, expirytime, sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, data.result.amountExpectedTo, data.result.payinExtraId, extraid, refextraid, data.result.status, recieving_Address, refund_Address, data.result.payinAddress, email, "Fixed", profit], function(error, result){
                  if (error) throw new Error();
                })
              }
              return res.status(200).json({
                transaction_id:data.result.id,	
                sell_coin:sell,	
                get_coin:get,	
                sell_amount:amount,
                get_amount:data.result.amountExpectedTo,	
                recipient_extraid:extraid,	
                refund_extraid:refextraid,
                status: data.result.status, 
                recipient_address:recieving_Address, 
                refund_address:refund_Address,
                deposit_address:data.result.payinAddress,
                deposit_extraid:data.result.payinExtraId?data.result.payinExtraId:null,
                email:email,
                transaction_type:"Fixed"
              });
            } catch (error) {
              const stringData=JSON.stringify(data);
              const requestBody=JSON.stringify(paramy);
              const proxyRequestBody=JSON.stringify(req.body);
              logger.error(`Error: ${error}, response:${stringData} || requestURL:https://api.changelly.com/v2, reauestBody${requestBody} proxyRequestBody:${proxyRequestBody}`);
              return res.status(502).json();
            }
          })
    }

    static changenowFixedTransaction = async (req, res)=>{
      let profit=await calculateProfitInBTC("changenow", sell, amount, "Fixed");
      if(!profit){
        profit=0;
      }
  const { sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, recieving_Address, refund_Address, email, rateId, extraid , refextraid, expirytime} = req.body

          // Create the logger
          const logger = createLogger({
            format: combine(
                timestamp(),
                logFormat
            ),
            transports: [
                new transports.Console(),
                new transports.File({ filename: './logs/exchangeErrorLogs/changenow.log' })
            ]
    });

  const url = `https://api.changenow.io/v1/transactions/fixed-rate/${process.env.CHANGENOW}`;

  const params = {
    from: sell,
    to: get,
    address: recieving_Address,
    amount: amount,
    extraId: extraid,
    userId: "",
    contactEmail: email,
    refundAddress: refund_Address,
    refundExtraId: refextraid,
    rateId: rateId
  }

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params)
  }

  const response = await fetch(url, options)
  const data = await response.json();
          //Exchange Api error
          if (data.error){
            const errorString=JSON.stringify(data.error);
            const stringResponse=JSON.stringify(data);
            const requestBody=JSON.stringify(options);
            const proxyRequestBody=JSON.stringify(req.body);
            logger.error(`Error: ${errorString} || response${stringResponse} requestURL:${url}, reauestBody${requestBody} proxyRequestBody:${proxyRequestBody}`);
            return res.status(404).json(data);
          }
  try {
    if(data.id){
      var sql="INSERT INTO changenow_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_network, get_coin_network, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount, deposit_extraid,	recipient_extraid,	refund_extraid, status,  recipient_address, refund_address, deposit_address, email, transaction_type, average_profit_percent	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      db.query(sql,[data.id, expirytime, sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, data.amount, data.payinExtraId, extraid, refextraid, "waiting", recieving_Address, refund_Address, data.payinAddress, email, "Fixed", profit ], function(error, result){
        if (error) throw new Error();;
      })
    

    return res.status(200).json({
      transaction_id:data.id,	

      sell_coin:sell,	
      get_coin:get,	
      sell_amount:amount,

      get_amount:data.amount,	

      recipient_extraid:extraid,	
      refund_extraid:refextraid,

      status: data.status, 

      recipient_address:recieving_Address, 
      refund_address:refund_Address,

      deposit_address:data.payinAddress,
      deposit_extraid:data.payinExtraId?data.payinExtraId:null,

      email:email,

      transaction_type:"Fixed"
    })}

  } catch (error) {
          const stringResponse=JSON.stringify(data);
          const requestBody=JSON.stringify(options);
          const proxyRequestBody=JSON.stringify(req.body);
          logger.error(`Error: ${error} || response${stringResponse} requestURL:${url}, reauestBody${requestBody} proxyRequestBody:${proxyRequestBody}`);
          //Exchange response invalid
          return res.status(502).json();
  }
    }

  static changeheroFixedTransaction = async (req, res)=>{
  const { sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, recieving_Address, refund_Address, email, rateId, extraid, refextraid, expirytime } = req.body;
  let profit=await calculateProfitInBTC("changehero", sell, amount, "Fixed");
  if(!profit){
    profit=0;
  }
                  // Create the logger
                  const logger = createLogger({
                    format: combine(
                        timestamp(),
                        logFormat
                    ),
                    transports: [
                        new transports.Console(),
                        new transports.File({ filename: './logs/exchangeErrorLogs/changehero.log' })
                    ]
            });
  const url = "https://api.changehero.io/v2/";

  const params = {

    jsonrpc: "2.0",
    method: "createFixTransaction",
    params: {
      rateId: rateId,
      from: sell,
      to: get,
      address: recieving_Address,
      extraId: extraid,
      amount: amount,
      refundAddress: refund_Address,
      refundExtraId: refextraid
    }

  }

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": `${process.env.CHANGEHERO}`
    },
    body: JSON.stringify(params)
  }

  const response = await fetch(url, options);


  const data = await response.json();
  if (data.error){
    const errorString=JSON.stringify(data.error);
    const stringResponse=JSON.stringify(data);
    const requestBody=JSON.stringify(options);
    const proxyRequestBody=JSON.stringify(req.body);
    logger.error(`Error: ${errorString} || response${stringResponse} requestURL:${url}, reauestBody${requestBody} proxyRequestBody:${proxyRequestBody}`);
    return res.status(404).json(data);
  }

  try {
    if(data.result.id){
      var sql="INSERT INTO changehero_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_network, get_coin_network, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount, deposit_extraid,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, deposit_address, email, transaction_type, average_profit_percent	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      db.query(sql,[data.result.id, expirytime, sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, data.result.amountExpectedTo, data.result.payinExtraId, extraid, refextraid, data.result.status, recieving_Address, refund_Address, data.result.payinAddress, email, "Fixed", profit ], function(error, result){
        if (error) throw new Error();
      })
    
      return res.status(200).json({
      transaction_id:data.result.id,	

      sell_coin:sell,	
      get_coin:get,	
      sell_amount:amount,

      get_amount:data.result.amountExpectedTo,	

      recipient_extraid:extraid,	
      refund_extraid:refextraid,

      status: data.result.status, 

      recipient_address:recieving_Address, 
      refund_address:refund_Address,

      deposit_address:data.result.payinAddress,
      deposit_extraid:data.result.payinExtraId?data.result.payinExtraId:null,

      email:email,

      transaction_type:"Fixed"
    })}
  } catch (error) {
    const stringResponse=JSON.stringify(data);
    const requestBody=JSON.stringify(options);
    const proxyRequestBody=JSON.stringify(req.body);
    logger.error(`Error: ${error} || response${stringResponse} requestURL:${url}, reauestBody${requestBody} proxyRequestBody:${proxyRequestBody}`);
    //Exchange response invalid
    return res.status(502).json();
  }   
    }

  static stealthexFixedTransaction = async (req, res)=>{
  const { sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, recieving_Address, refund_Address, email, rateId, extraid, refextraid, expirytime } = req.body;
  if(!profit){
    profit=0;
  }
  // Create the logger
  const logger = createLogger({
                      format: combine(
                          timestamp(),
                          logFormat
                      ),
                      transports: [
                          new transports.Console(),
                          new transports.File({ filename: './logs/exchangeErrorLogs/stealthex.log' })
                      ]
              });

  const url = `https://api.stealthex.io/api/v2/exchange?api_key=${process.env.STEALTHEX}`;

  const params = {
    currency_from: sell,
    currency_to: get,
    address_to: recieving_Address,
    extra_id_to: extraid,
    amount_from: amount,
    fixed: true,
    refund_address: refund_Address,
    refund_extra_id:refextraid,
    api_key: process.env.STEALTHEX,
    rate_id: rateId
  }

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params)
  }

  const response = await fetch(url, options)
  const data = await response.json();

  if(data.err){
    const errorString=JSON.stringify(data.err);
    const stringResponse=JSON.stringify(data);
    const requestBody=JSON.stringify(options);
    const proxyRequestBody=JSON.stringify(req.body);
    logger.error(`Error: ${errorString} || response${stringResponse} requestURL:${url}, reauestBody${requestBody} proxyRequestBody:${proxyRequestBody}`);
    return res.status(404).json(data);
  }


  try {
    if(data.id){
      let profit=await calculateProfitInBTC("stealthex", sell, amount, "Fixed");
      var sql="INSERT INTO stealthex_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_network, get_coin_network, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount, deposit_extraid,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, deposit_address, email, transaction_type, average_profit_percent	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      db.query(sql,[data.id, expirytime, sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, data.amount_to, data.extra_id_from, extraid, refextraid, data.status, recieving_Address, refund_Address, data.address_from, email, "Fixed", profit ], function(error, result){
        if (error) throw new Error();
      })
    
    return res.status(200).json({
      transaction_id:data.id,	
      sell_coin:sell,	
      get_coin:get,	
      sell_amount:amount,
      get_amount:data.amount_to,	
      recipient_extraid:extraid,	
      refund_extraid:refextraid,
      status: data.status, 
      recipient_address:recieving_Address, 
      refund_address:refund_Address,
      deposit_address: data.address_from,
      deposit_extraid:data.extra_id_from?data.extra_id_from:null,
      email:email,
      transaction_type:"Fixed"
    })}
  } catch (error) {
    const stringResponse=JSON.stringify(data);
    const requestBody=JSON.stringify(options);
    const proxyRequestBody=JSON.stringify(req.body);
    logger.error(`Error: ${error} || response${stringResponse} requestURL:${url}, reauestBody${requestBody} proxyRequestBody:${proxyRequestBody}`);
    //Exchange response invalid
    return res.status(502).json();
  }
}

    static exolixFixedTransaction = async (req, res)=>{
        const { sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, recieving_Address, refund_Address, email, rateId, extraid , refextraid, expirytime  } = req.body;
        if(!profit){
          profit=0;
        }

        // Create the logger
                const logger = createLogger({
                  format: combine(
                      timestamp(),
                      logFormat
                  ),
                  transports: [
                      new transports.Console(),
                      new transports.File({ filename: './logs/exchangeErrorLogs/exolix.log' })
                  ]
              });

        const url = "https://exolix.com/api/v2/transactions";
      
        const params = {
      
          coinFrom: sell.toUpperCase(),
          coinTo: get.toUpperCase(),
          amount: amount,
          withdrawalAddress: recieving_Address,
          withdrawalExtraId: extraid,
          rateType: "fixed",
          refundAddress: refund_Address,
          refundExtraId: refextraid
      
        }
      
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": process.env.EXOLIX
          },
          body: JSON.stringify(params)
        }
      
        const response = await fetch(url, options)
        const data = await response.json();

        if(data.error || data.message){
          const stringResponse=JSON.stringify(data);
          const requestBody=JSON.stringify(options);
          const proxyRequestBody=JSON.stringify(req.body);
          logger.error(`Error: ${stringResponse} || response${stringResponse} requestURL:${url}, reauestBody${requestBody} proxyRequestBody:${proxyRequestBody}`);
          return res.status(404).json(data);
        }

        try {
          if(data.id){
            let profit=await calculateProfitInBTC("exolix", sell, amount, "Fixed");
            var sql="INSERT INTO exolix_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_network, get_coin_network, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount, deposit_extraid,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, deposit_address, email, transaction_type, average_profit_percent	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(sql,[data.id, expirytime, sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, data.amountTo, data.depositExtraId, extraid, refextraid, data.status, recieving_Address, refund_Address, data.depositAddress, email, "Fixed", profit ], function(error, result){
              if (error) throw new Error();
            })
          
          return res.status(200).json({
            transaction_id:data.id,	
            sell_coin:sell,	
            get_coin:get,	
            sell_amount:amount,
            get_amount:data.amountTo,	
            recipient_extraid:extraid,	
            refund_extraid:refextraid,
            status: data.status, 
            recipient_address:recieving_Address, 
            refund_address:refund_Address,  
            deposit_address: data.depositAddress,
            deposit_extraid:data.depositExtraId?data.depositExtraId:null,
            email:email,
            transaction_type:"Fixed"
          })}
        } catch (error) {
          const stringResponse=JSON.stringify(data);
          const requestBody=JSON.stringify(options);
          const proxyRequestBody=JSON.stringify(req.body);
          logger.error(`Error: ${error} || response${stringResponse} requestURL:${url}, reauestBody${requestBody} proxyRequestBody:${proxyRequestBody}`);
          //Exchange response invalid
          return res.status(502).json();
        }
    }

    static simpleswapFixedTransaction = async (req, res)=>{
    const { sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, recieving_Address, refund_Address, email, rateId, extraid, refextraid, expirytime } = req.body;
    let profit=await calculateProfitInBTC("simpleswap", sell, amount, "Fixed");
    if(!profit){
      profit=0;
    }
  // Create the logger
  const logger = createLogger({
    format: combine(
        timestamp(),
        logFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: './logs/exchangeErrorLogs/simpleswap.log' })
    ]
});
  const url = `https://api.simpleswap.io/create_exchange?api_key=${process.env.SIMPLESWAP}`;

  const params = {

    fixed: true,
    currency_from: sell,
    currency_to: get,
    amount: amount,
    address_to: recieving_Address,
    extra_id_to: extraid,
    extra_id:extraid,
    user_refund_address: refund_Address,
    user_refund_extra_id: refextraid
  }

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api_key":process.env.SIMPLESWAP
    },
    body: JSON.stringify(params)
  }

  const response = await fetch(url, options)

  const data = await response.json();

  if(data.error){
    const errorString=JSON.stringify(data.error);
    const stringResponse=JSON.stringify(data);
    const requestBody=JSON.stringify(options);
    const proxyRequestBody=JSON.stringify(req.body);
    logger.error(`Error: ${errorString} || response${stringResponse} requestURL:${url}, reauestBody${requestBody} proxyRequestBody:${proxyRequestBody}`);
    return res.status(404).json(data);
  }

  try {
    if(data.id){
      var sql="INSERT INTO simpleswap_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_network, get_coin_network, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount, deposit_extraid,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, deposit_address, email, transaction_type, average_profit_percent	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      db.query(sql,[data.id, expirytime, sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, data.amount_to, data.extra_id_from, extraid, refextraid, data.status, recieving_Address, refund_Address, data.address_from, email, "Fixed", profit ], function(error, result){
        if (error) throw new Error();
      })
    
    return res.status(200).json({
      transaction_id:data.id,	
      sell_coin:sell,	
      get_coin:get,	
      sell_amount:amount,
      get_amount: data.amount_to,	
      recipient_extraid:extraid,	
      refund_extraid:refextraid,
      status: data.status, 
      recipient_address:recieving_Address, 
      refund_address:refund_Address,
      deposit_address:  data.address_from,
      deposit_extraid:data.extra_id_from?data.extra_id_from:null,
      email:email,
      transaction_type:"Fixed"
    })}

  } catch (error) {
    const stringResponse=JSON.stringify(data);
    const requestBody=JSON.stringify(options);
    const proxyRequestBody=JSON.stringify(req.body);
    logger.error(`Error: ${error} || response${stringResponse} requestURL:${url}, reauestBody${requestBody} proxyRequestBody:${proxyRequestBody}`);
    //Exchange response invalid
    return res.status(502).json();
  }

    }

    static letsexchangeFixedTransaction = async (req, res)=>{
        const { sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, recieving_Address, refund_Address, email, rateId, extraid, refextraid, expirytime } = req.body;
        let profit=await calculateProfitInBTC("letsexchange", sell, amount, "Floating");
        if(!profit){
          profit=0;
        }

        // Create the logger
                const logger = createLogger({
                  format: combine(
                      timestamp(),
                      logFormat
                  ),
                  transports: [
                      new transports.Console(),
                      new transports.File({ filename: './logs/exchangeErrorLogs/letsexchange.log' })
                  ]
              });

        const url = "https://api.letsexchange.io/api/v1/transaction";
      
        const params = {
      
          float: false,
          coin_from: sell.toUpperCase(),
          coin_to: get.toUpperCase(),
          deposit_amount: amount,
          withdrawal: recieving_Address,
          withdrawal_extra_id: extraid!=undefined?extraid:"",
          return: refund_Address,
          return_extra_id:refextraid,
          rate_id: rateId,
          affiliate_id:process.env.LETSEXCHANGE_AFFILIATE_ID
        }
      
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": process.env.LETSEXCHANGE,
            "Accept": "application/json",
          },
          body: JSON.stringify(params)
        }
      
        const response = await fetch(url, options);
        const data = await response.json();

        if(data.error){
          const errorString=JSON.stringify(data.error);
          const stringResponse=JSON.stringify(data);
          const requestBody=JSON.stringify(options);
          const proxyRequestBody=JSON.stringify(req.body);
          logger.error(`Error: ${errorString} || response${stringResponse} requestURL:${url}, reauestBody${requestBody} proxyRequestBody${proxyRequestBody}`);
          return res.status(404).json(data);
        }

        try {
          if(data.transaction_id){
            var sql="INSERT INTO letsexchange_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_network, get_coin_network, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount, deposit_extraid,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, deposit_address, email, transaction_type, average_profit_percent	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(sql,[data.transaction_id, expirytime, sell, get, sellname, getname, sellcoinnetwork, getcoinnetwork, selllogo, getlogo, amount, data.withdrawal_amount, data.deposit_extra_id, extraid, refextraid, data.status, recieving_Address, refund_Address,  data.deposit, email, "Fixed", profit ], function(error, result){
              if (error) throw new Error();
            })
          
          return res.status(200).json({
            transaction_id:data.transaction_id,	
            sell_coin:sell,	
            get_coin:get,	
            sell_amount:amount,
            get_amount: data.withdrawal_amount,	
            recipient_extraid:extraid,	
            refund_extraid:refextraid,
            status: data.status, 
            recipient_address:recieving_Address, 
            refund_address:refund_Address,
            deposit_address:  data.deposit,
            deposit_extraid:data.deposit_extra_id?data.deposit_extra_id:null,
            email:email,
            transaction_type:"Fixed"
          })}

        } catch (error) {
              const stringResponse=JSON.stringify(data);
    const requestBody=JSON.stringify(options);
    const proxyRequestBody=JSON.stringify(req.body);
    logger.error(`Error: ${error} || response${stringResponse} requestURL:${url}, reauestBody${requestBody} proxyRequestBody:${proxyRequestBody}`);
    //Exchange response invalid
    return res.status(502).json();
        }
    }

    // *********************** Fetching Transactions From Database ************************* //

    static getChangellyTransactions = async (req, res)=>{

      const { period, status } = req.body; // Get the period from query parameters
      let sql = "SELECT * FROM changelly_transactions";
    const currentTime = new Date();
    let startTime;
    let statusCondition = "";

    switch (period) {
        case 'current_hour':
            startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), currentTime.getHours());
            break;
        case 'current_day':
            startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
            break;
        case 'current_week':
            startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate() - currentTime.getDay());
            break;
        case 'current_month':
            startTime = new Date(currentTime.getFullYear(), currentTime.getMonth());
            break;
        case 'current_year':
            startTime = new Date(currentTime.getFullYear(), 0);
            break;
        case 'all':
        default:
            startTime = null;
    }

    if (status === 'finished') {
        statusCondition = "status = 'finished'";
    } else if (status === 'pending') {
        statusCondition = "status != 'finished'";
    }

    if (startTime) {
        sql += ` WHERE time >= ?${statusCondition ? ' AND ' + statusCondition : ''}`;
    } else if (statusCondition) {
        sql += ` WHERE ${statusCondition}`;
    }

    sql += " ORDER BY id DESC";

    db.query(sql, startTime ? [startTime] : [], function (error, result) {
        if (error) throw error;
        return res.json(result);
    });
        }
    
    static getChangenowTransactions = async (req, res)=>{
      const { period, status } = req.body; // Get the period from query parameters
          var sql="Select * FROM changenow_transactions";

          const currentTime = new Date();
          let startTime;
          let statusCondition = "";
      
          switch (period) {
              case 'current_hour':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), currentTime.getHours());
                  break;
              case 'current_day':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
                  break;
              case 'current_week':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate() - currentTime.getDay());
                  break;
              case 'current_month':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth());
                  break;
              case 'current_year':
                  startTime = new Date(currentTime.getFullYear(), 0);
                  break;
              case 'all':
              default:
                  startTime = null;
          }
      
          if (status === 'finished') {
              statusCondition = "status = 'finished'";
          } else if (status === 'pending') {
              statusCondition = "status != 'finished'";
          }
      
          if (startTime) {
              sql += ` WHERE time >= ?${statusCondition ? ' AND ' + statusCondition : ''}`;
          } else if (statusCondition) {
              sql += ` WHERE ${statusCondition}`;
          }
      
          sql += " ORDER BY id DESC";

          db.query(sql, startTime ? [startTime] : [], function(error, result){
            if (error) throw error;
            return res.json(result);
          })
        }

    static getChangeheroTransactions = async (req, res)=>{
      const { period, status } = req.body; // Get the period from query parameters

          var sql="Select * FROM changehero_transactions";

          const currentTime = new Date();
          let startTime;
          let statusCondition = "";
      
          switch (period) {
              case 'current_hour':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), currentTime.getHours());
                  break;
              case 'current_day':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
                  break;
              case 'current_week':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate() - currentTime.getDay());
                  break;
              case 'current_month':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth());
                  break;
              case 'current_year':
                  startTime = new Date(currentTime.getFullYear(), 0);
                  break;
              case 'all':
              default:
                  startTime = null;
          }
      
          if (status === 'finished') {
              statusCondition = "status = 'finished'";
          } else if (status === 'pending') {
              statusCondition = "status != 'finished'";
          }
      
          if (startTime) {
              sql += ` WHERE time >= ?${statusCondition ? ' AND ' + statusCondition : ''}`;
          } else if (statusCondition) {
              sql += ` WHERE ${statusCondition}`;
          }
      
          sql += " ORDER BY id DESC";

          db.query(sql, startTime ? [startTime] : [], function(error, result){
            if (error) throw error;
            return res.json(result);
          })
        }

    static getExolixTransactions = async (req, res)=>{

      const { period, status } = req.body; // Get the period from query parameters

          var sql="Select * FROM exolix_transactions";

          const currentTime = new Date();
          let startTime;
          let statusCondition = "";
      
          switch (period) {
              case 'current_hour':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), currentTime.getHours());
                  break;
              case 'current_day':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
                  break;
              case 'current_week':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate() - currentTime.getDay());
                  break;
              case 'current_month':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth());
                  break;
              case 'current_year':
                  startTime = new Date(currentTime.getFullYear(), 0);
                  break;
              case 'all':
              default:
                  startTime = null;
          }
      
          if (status === 'success') {
              statusCondition = "status = 'success'";
          } else if (status === 'pending') {
              statusCondition = "status != 'success'";
          }
      
          if (startTime) {
              sql += ` WHERE time >= ?${statusCondition ? ' AND ' + statusCondition : ''}`;
          } else if (statusCondition) {
              sql += ` WHERE ${statusCondition}`;
          }
      
          sql += " ORDER BY id DESC";

          db.query(sql, startTime ? [startTime] : [], function(error, result){
            if (error) throw error;
            return res.json(result);
          })
        }

    static getLetsexchangeTransactions = async (req, res)=>{

      const { period, status } = req.body; // Get the period from query parameters

          var sql="Select * FROM letsexchange_transactions";

          const currentTime = new Date();
          let startTime;
          let statusCondition = "";
      
          switch (period) {
              case 'current_hour':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), currentTime.getHours());
                  break;
              case 'current_day':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
                  break;
              case 'current_week':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate() - currentTime.getDay());
                  break;
              case 'current_month':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth());
                  break;
              case 'current_year':
                  startTime = new Date(currentTime.getFullYear(), 0);
                  break;
              case 'all':
              default:
                  startTime = null;
          }
      
          if (status === 'success') {
              statusCondition = "status = 'success'";
          } else if (status === 'pending') {
              statusCondition = "status != 'success'";
          }
      
          if (startTime) {
              sql += ` WHERE time >= ?${statusCondition ? ' AND ' + statusCondition : ''}`;
          } else if (statusCondition) {
              sql += ` WHERE ${statusCondition}`;
          }
      
          sql += " ORDER BY id DESC";

          db.query(sql, startTime ? [startTime] : [], function(error, result){
            if (error) throw error;
            return res.json(result);
          })
        }

    static getSimpleswapTransactions = async (req, res)=>{

      const { period, status } = req.body; // Get the period from query parameters

          var sql="Select * FROM simpleswap_transactions";

          const currentTime = new Date();
          let startTime;
          let statusCondition = "";
      
          switch (period) {
              case 'current_hour':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), currentTime.getHours());
                  break;
              case 'current_day':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
                  break;
              case 'current_week':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate() - currentTime.getDay());
                  break;
              case 'current_month':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth());
                  break;
              case 'current_year':
                  startTime = new Date(currentTime.getFullYear(), 0);
                  break;
              case 'all':
              default:
                  startTime = null;
          }
      
          if (status === 'finished') {
              statusCondition = "status = 'finished'";
          } else if (status === 'pending') {
              statusCondition = "status != 'finished'";
          }
      
          if (startTime) {
              sql += ` WHERE time >= ?${statusCondition ? ' AND ' + statusCondition : ''}`;
          } else if (statusCondition) {
              sql += ` WHERE ${statusCondition}`;
          }
      
          sql += " ORDER BY id DESC";

          db.query(sql, startTime ? [startTime] : [], function(error, result){
            if (error) throw error;
            return res.json(result);
          })
        }

    static getGodexTransactions = async (req, res)=>{

      const { period, status } = req.body; // Get the period from query parameters

          var sql="Select * FROM godex_transactions";

          const currentTime = new Date();
          let startTime;
          let statusCondition = "";
      
          switch (period) {
              case 'current_hour':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), currentTime.getHours());
                  break;
              case 'current_day':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
                  break;
              case 'current_week':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate() - currentTime.getDay());
                  break;
              case 'current_month':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth());
                  break;
              case 'current_year':
                  startTime = new Date(currentTime.getFullYear(), 0);
                  break;
              case 'all':
              default:
                  startTime = null;
          }
      
          if (status === 'finished') {
              statusCondition = "status = 'finished'";
          } else if (status === 'pending') {
              statusCondition = "status != 'finished'";
          }
      
          if (startTime) {
              sql += ` WHERE time >= ?${statusCondition ? ' AND ' + statusCondition : ''}`;
          } else if (statusCondition) {
              sql += ` WHERE ${statusCondition}`;
          }
      
          sql += " ORDER BY id DESC";

          db.query(sql, startTime ? [startTime] : [], function(error, result){
            if (error) throw error;
            return res.json(result);
          })
        }

    static getStealthexTransactions = async (req, res)=>{

      const { period, status } = req.body; // Get the period from query parameters

          var sql="Select * FROM stealthex_transactions";

          const currentTime = new Date();
          let startTime;
          let statusCondition = "";
      
          switch (period) {
              case 'current_hour':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), currentTime.getHours());
                  break;
              case 'current_day':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
                  break;
              case 'current_week':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate() - currentTime.getDay());
                  break;
              case 'current_month':
                  startTime = new Date(currentTime.getFullYear(), currentTime.getMonth());
                  break;
              case 'current_year':
                  startTime = new Date(currentTime.getFullYear(), 0);
                  break;
              case 'all':
              default:
                  startTime = null;
          }
      
          if (status === 'finished') {
              statusCondition = "status = 'finished'";
          } else if (status === 'pending') {
              statusCondition = "status != 'finished'";
          }
      
          if (startTime) {
              sql += ` WHERE time >= ?${statusCondition ? ' AND ' + statusCondition : ''}`;
          } else if (statusCondition) {
              sql += ` WHERE ${statusCondition}`;
          }
      
          sql += " ORDER BY id DESC";

          db.query(sql, startTime ? [startTime] : [], function(error, result){
            if (error) throw error;
            return res.json(result);
          })
        }

    // *********************** Check Transaction Status ************************* //
    static checkChangellyTransactionStatus=async (req, res)=>{ 
      const {id}=req.body;
      var sql="SELECT * FROM changelly_transactions WHERE transaction_id=?";
      db.query(sql,[id], function(error, result){
        if (error){
         return res.json({tx:[], message:"This transaction does't exist"})
        }else{
          return res.json({tx:result[0], message:"Transaction found"})
        }
      })
    }
    static checkChangenowTransactionStatus=async (req, res)=>{
      const {id}=req.body;
      var sql="SELECT * FROM changenow_transactions WHERE transaction_id=?";
      db.query(sql,[id], function(error, result){
        if (error){
         return res.json({tx:[], message:"This transaction does't exist"})
        }else{
          let transaction=result[0];
          return res.json({tx:transaction, message:"Transaction found"})
        }
      })
    }
    static checkChangeheroTransactionStatus=async (req, res)=>{
      const {id}=req.body;
      var sql="SELECT * FROM changehero_transactions WHERE transaction_id=?";
      db.query(sql,[id], function(error, result){
        console.log(id);
        if (error){
         return res.json({tx:[], message:"This transaction does't exist"})
        }else{
          console.log(result[0]);
          return res.json({tx:result[0], message:"Transaction found"})
        }
      })
    }
    static checkExolixTransactionStatus=async (req, res)=>{
      const {id}=req.body;
      var sql="SELECT * FROM exolix_transactions WHERE transaction_id=?";
      db.query(sql,[id], function(error, result){
        if (error){
         return res.json({tx:[], message:"This transaction does't exist"})
        }else{
          return res.json({tx:result[0], message:"Transaction found"})
        }
      })
    }
    static checkLetsexchangeTransactionStatus=async (req, res)=>{
      const {id}=req.body;
      var sql="SELECT * FROM letsexchange_transactions WHERE transaction_id=?";
      db.query(sql,[id], function(error, result){
        if (error){
         return res.json({tx:[], message:"This transaction does't exist"})
        }else{
          return res.json({tx:result[0], message:"Transaction found"})
        }
      })
    }
    static checkSimpleswapTransactionStatus=async (req, res)=>{
      const {id}=req.body;
      var sql="SELECT * FROM simpleswap_transactions WHERE transaction_id=?";
      db.query(sql,[id], function(error, result){
        if (error){
         return res.json({tx:[], message:"This transaction does't exist"})
        }else{
          return res.json({tx:result[0], message:"Transaction found"})
        }
      })
    }
    static checkGodexTransactionStatus=async (req, res)=>{
      const {id}=req.body;
      var sql="SELECT * FROM godex_transactions WHERE transaction_id=?";
      db.query(sql,[id], function(error, result){
        if (error){
         return res.json({tx:[], message:"This transaction does't exist"})
        }else{
         return res.json({tx:result[0], message:"Transaction found"})
        }
      })
    }
    static checkStealthexTransactionStatus=async (req, res)=>{
      const {id}=req.body;
      var sql="SELECT * FROM stealthex_transactions WHERE transaction_id=?";
      db.query(sql,[id], function(error, result){
        if (error){
         return res.json({tx:[], message:"This transaction does't exist"})
        }else{
         return res.json({tx:result[0], message:"Transaction found"})
        }
      })
    }

    
    // *********************** Check Transaction Status Using Transaction ID ************************* //

    static checkTransactionStatus=async (req, res)=>{

      const {id}=req.body;
      var sql1="SELECT * FROM changelly_transactions WHERE transaction_id=?";
      var sql2="SELECT * FROM changenow_transactions WHERE transaction_id=?";
      var sql3="SELECT * FROM changehero_transactions WHERE transaction_id=?";
      var sql4="SELECT * FROM exolix_transactions WHERE transaction_id=?";
      var sql5="SELECT * FROM letsexchange_transactions WHERE transaction_id=?";
      var sql6="SELECT * FROM simpleswap_transactions WHERE transaction_id=?";
      var sql7="SELECT * FROM godex_transactions WHERE transaction_id=?";
      var sql8="SELECT * FROM stealthex_transactions WHERE transaction_id=?";

      let array=[sql1, sql2, sql3, sql4, sql5, sql6, sql7, sql8,];

      let SqlPromises = array.map((sql, index)=>{

        return new Promise((resolve, reject) => {

        db.query(sql,[id], function(error, result){
          if (error){
            return res.json({tx:{}, message:"Transaction Not Found!"});
         }else{
          resolve(result);
          }
        })
      });
      });

      // Wait for all Promises to resolve
      const results = await Promise.all(SqlPromises);

      // Find the first non-empty result
      const transaction = results.find(result => result.length > 0);

      if(transaction){
        return res.json({tx:transaction[0], message:"Transaction Found"});
      }else{
        return res.json({tx:{}, message:"Transaction Not Found!"});
      }
    }

    // *********************** Validating Wallet Address ************************* //
    static validateWalletAddress = async (req, res)=>{
      const { curr, address, extraid } = req.body;
      const url=`https://api.changenow.io/v2/validate/address?currency=${curr}&address=${(extraid!=""?address+"&extraId="+extraid:address)}`;
    
        const options={
        method:"GET",
        headers:{
          "Content-Type":"application/json"
        }
    }
        const response=await fetch(url,options);
        const data=await response.json();
        console.log(data);
        res.json(data)
    }

}


export default exchangeController;