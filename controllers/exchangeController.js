import crypto from 'crypto';
import request from "request";
import fetch from "node-fetch";
import dotenv from 'dotenv';
import {db} from '../database/connectdb.js';
dotenv.config();

class exchangeController{

    // *********************** Floating Transactions ************************* //

    static changellyFloatingTransaction = async (req, res) => {
        const {sell, get, sellname, getname, selllogo, getlogo,  amount, recieving_Address, refund_Address, email, rateId ,extraid, refextraid, expirytime} = req.body;
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
        
          const paramx = {
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
        
          request(paramx, async function (error, response) {
            const data = await JSON.parse(response.body);
            try {
              if(data.result.id){
                var sql="INSERT INTO changelly_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid,	status, recipient_address, refund_address, deposit_address, email	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                db.query(sql,[data.result.id, expirytime, sell, get, sellname, getname, selllogo, getlogo, amount, data.result.amountExpectedTo, extraid, refextraid, data.result.status, recieving_Address, refund_Address, data.result.payinAddress, email], function(error, result){
                  if (error) throw error;
                })
              }
              res.json({
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
                email:email,
                transaction_type:"Floating"
              });
            } catch (error) {
              res.json(data);              
            }
          })
    }

    static changenowFloatingTransaction = async (req, res)=>{

        const { sell, get, sellname, getname, selllogo, getlogo, amount, recieving_Address, refund_Address, email, extraid ,refextraid, expirytime} = req.body

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
        console.log(data);
        try {
          if(data.id){
            var sql="INSERT INTO changenow_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, deposit_address, email	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(sql,[data.id, expirytime, sell, get, sellname, getname, selllogo, getlogo, amount, data.amount, extraid, refextraid, "Waiting", recieving_Address, refund_Address, data.payinAddress, email ], function(error, result){
              if (error) throw error;
            })
          }
          res.json({
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
            email:email	,
            transaction_type:"Floating"
          });
        } catch (error) {
          res.json(data);
        }
    }

    static changeheroFloatingTransaction = async (req, res)=>{
        const { sell, get, sellname, getname, selllogo, getlogo, amount, recieving_Address, refund_Address, email, rateId, extraid, refextraid, expirytime } = req.body

        console.log(req.body)
      
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
      
      
        const data = await response.json()
        try {
          if(data.result.id){
            var sql="INSERT INTO changehero_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, deposit_address, email	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(sql,[data.result.id, expirytime, sell, get, sellname, getname, selllogo, getlogo, amount, data.result.amountExpectedTo, extraid, refextraid, data.result.status, recieving_Address, refund_Address, data.result.payinAddress, email ], function(error, result){
              if (error) throw error;
            })
          }
          res.json({
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

            email:email,
            
            transaction_type:"Floating"
          });
        } catch (error) {
          res.json(data);
        }      
      
    }

    static stealthexFloatingTransaction = async (req, res)=>{
        const { sell, get, sellname, getname, selllogo, getlogo, amount, recieving_Address, refund_Address, email, rateId, extraid , refextraid, expirytime} = req.body

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
      
        const response = await fetch(url, options)
        const data = await response.json()
        
        try {
          if(data.id){
            var sql="INSERT INTO stealthex_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, deposit_address, email	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(sql,[data.id, expirytime, sell, get, sellname, getname, selllogo, getlogo, amount, data.amount_to, extraid, refextraid, data.status, recieving_Address, refund_Address, data.address_from, email ], function(error, result){
              if (error) throw error;
            })
          }
          res.json({
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

            email:email,
            
            transaction_type:"Floating"
          });
        } catch (error) {
          res.json(data);
        }
    }

    static exolixFloatingTransaction = async (req, res)=>{
        const { sell, get, sellname, getname, selllogo, getlogo, amount, recieving_Address, refund_Address, email, rateId, extraid , refextraid, expirytime} = req.body

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
      
        const response = await fetch(url, options)
        const data = await response.json()
        try {
          if(data.id){
            var sql="INSERT INTO exolix_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, deposit_address, email	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(sql,[data.id, expirytime, sell, get, sellname, getname, selllogo, getlogo, amount, data.amountTo, extraid, refextraid, data.status, recieving_Address, refund_Address, data.depositAddress, email ], function(error, result){
              if (error) throw error;
            })
          }
          res.json({
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

            email:email,
            
            transaction_type:"Floating"
          });
        } catch (error) {
          res.json(data)
        }
    }

    static simpleswapFloatingTransaction = async (req, res)=>{
        const { sell, get, sellname, getname, selllogo, getlogo, amount, recieving_Address, refund_Address, email, rateId, extraid, refextraid, expirytime } = req.body

        console.log(req.body)
      
        const url = "https://api.simpleswap.io/create_exchange?api_key=ae57f22d-7a23-4dbe-9881-624b2e147759";
      
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
      
        const data = await response.json()
      
        try {
          if(data.id){
            var sql="INSERT INTO simpleswap_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, deposit_address, email	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(sql,[data.id, expirytime, sell, get, sellname, getname, selllogo, getlogo, amount, data.amount_to, extraid, refextraid, data.status, recieving_Address, refund_Address, data.address_from, email ], function(error, result){
              if (error) throw error;
            })
          }
          res.json({
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

            email:email,
            
            transaction_type:"Floating"
          });
        } catch (error) {
          res.json(data);
        }
    }

    static godexFloatingTransaction = async (req, res)=>{
        const { sell, get, sellname, getname, selllogo, getlogo, amount, recieving_Address, refund_Address, email, rateId, extraid, refextraid, expirytime } = req.body
      
        const url = "https://api.godex.io/api/v1/transaction?affiliate_id=sZnGAGyVu";
      
        const params = {
      
          coin_from: sell.toUpperCase(),
          coin_to: get.toUpperCase(),
          deposit_amount: amount,
          withdrawal: recieving_Address,
          withdrawal_extra_id: extraid!=undefined?extraid:"",
          return: refund_Address,
          return_extra_id:refextraid!=undefined?refextraid:"" 
      
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
      
        const data = await response.json()
      
        try {
          if(data.transaction_id){
            var sql="INSERT INTO godex_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, deposit_address, email	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(sql,[data.transaction_id, expirytime, sell, get, sellname, getname, selllogo, getlogo, amount, data.withdrawal_amount, extraid, refextraid, data.status, recieving_Address, refund_Address, data.deposit, email ], function(error, result){
              if (error) throw error;
            })
          }
          res.json({
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

            email:email,
            
            transaction_type:"Floating"
          });
        } catch (error) {
          res.json(data)
        }
    }

    static letsexchangeFloatingTransaction = async (req, res)=>{
        const { sell, get, sellname, getname, selllogo, getlogo, amount, recieving_Address, refund_Address, email, rateId, extraid,  refextraid, expirytime} = req.body

  const url = "https://api.letsexchange.io/api/v1/transaction";

  const params = {

    float: "false",
    coin_from: sell.toUpperCase(),
    coin_to: get.toUpperCase(),
    deposit_amount: amount,
    withdrawal: recieving_Address,
    withdrawal_extra_id: extraid!=undefined?extraid:"",
    return: refund_Address,
    return_extra_id:refextraid

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

  const data = await response.json()

  try {
    if(data.transaction_id){
      var sql="INSERT INTO letsexchange_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, deposit_address, email	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      db.query(sql,[data.transaction_id, expirytime, sell, get, sellname, getname, selllogo, getlogo, amount, data.withdrawal_amount, extraid, refextraid, data.status, recieving_Address, refund_Address, data.deposit, email ], function(error, result){
        if (error) throw error;
      })
    }
    res.json({
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

      email:email,
      
      transaction_type:"Floating"
    });
    
  } catch (error) {
    res.json(data);
  }
    }

    // *********************** Fixed Transactions ************************* //

    static changellyFixedTransaction = async (req, res)=>{
        const {sell, get, sellname, getname, selllogo, getlogo, amount, recieving_Address, refund_Address, email, rateId ,extraid, refextraid, expirytime} = req.body;
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
            const data = await JSON.parse(response.body);
            try {
              if(data.result.id){
                var sql="INSERT INTO changelly_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid,	status, recipient_address, refund_address, deposit_address, email, transaction_type	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                db.query(sql,[data.result.id, expirytime, sell, get, sellname, getname, selllogo, getlogo, amount, data.result.amountExpectedTo, extraid, refextraid, data.result.status, recieving_Address, refund_Address, data.result.payinAddress, email, "Fixed"], function(error, result){
                  if (error) throw error;
                })
              }
              res.json({
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
          
                email:email,

                transaction_type:"Fixed"
              });
            } catch (error) {
              res.json(data);
            }
          })
    }

    static changenowFixedTransaction = async (req, res)=>{

  const { sell, get, sellname, getname, selllogo, getlogo, amount, recieving_Address, refund_Address, email, rateId, extraid , refextraid, expirytime} = req.body

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
  const data = await response.json()

  try {
    if(data.id){
      var sql="INSERT INTO changenow_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid, status,  recipient_address, refund_address, deposit_address, email, transaction_type	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      db.query(sql,[data.id, expirytime, sell, get, sellname, getname, selllogo, getlogo, amount, data.amount, extraid, refextraid, data.status, recieving_Address, refund_Address, data.payinAddress, email, "Fixed" ], function(error, result){
        if (error) throw error;
      })
    }

    res.json({
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

      email:email,

      transaction_type:"Fixed"
    });

  } catch (error) {
    res.json(data);
  }
    }

    static changeheroFixedTransaction = async (req, res)=>{
  const { sell, get, sellname, getname, selllogo, getlogo, amount, recieving_Address, refund_Address, email, rateId, extraid, refextraid, expirytime } = req.body

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

  const response = await fetch(url, options)


  const data = await response.json()

  try {
    if(data.result.id){
      var sql="INSERT INTO changehero_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, deposit_address, email, transaction_type	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      db.query(sql,[data.result.id, expirytime, sell, get, sellname, getname, selllogo, getlogo, amount, data.result.amountExpectedTo, extraid, refextraid, data.result.status, recieving_Address, refund_Address, data.result.payinAddress, email, "Fixed" ], function(error, result){
        if (error) throw error;
      })
    }
      res.json({
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

      email:email,

      transaction_type:"Fixed"
    });
  } catch (error) {
    res.json(data);
  }   
    }

    static stealthexFixedTransaction = async (req, res)=>{
   const { sell, get, sellname, getname, selllogo, getlogo, amount, recieving_Address, refund_Address, email, rateId, extraid, refextraid, expirytime } = req.body

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
  const data = await response.json()
  try {
    if(data.id){
      var sql="INSERT INTO stealthex_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, deposit_address, email, transaction_type	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      db.query(sql,[data.id, expirytime, sell, get, sellname, getname, selllogo, getlogo, amount, data.amount_to, extraid, refextraid, data.status, recieving_Address, refund_Address, data.address_from, email, "Fixed" ], function(error, result){
        if (error) throw error;
      })
    }
    res.json({
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

      email:email,

      transaction_type:"Fixed"
    });
  } catch (error) {
    res.json(data);
  }
}

    static exolixFixedTransaction = async (req, res)=>{
        const { sell, get, sellname, getname, selllogo, getlogo, amount, recieving_Address, refund_Address, email, rateId, extraid , refextraid, expirytime  } = req.body

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
        const data = await response.json()
        try {
          if(data.id){
            var sql="INSERT INTO exolix_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, deposit_address, email, transaction_type	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(sql,[data.id, expirytime, sell, get, sellname, getname, selllogo, getlogo, amount, data.amountTo, extraid, refextraid, data.status, recieving_Address, refund_Address, data.depositAddress, email, "Fixed" ], function(error, result){
              if (error) throw error;
            })
          }
          res.json({
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
      
            email:email,
      
            transaction_type:"Fixed"
          });
        } catch (error) {
          res.json(data);
        }
    }

    static simpleswapFixedTransaction = async (req, res)=>{
    
    const { sell, get, sellname, getname, selllogo, getlogo, amount, recieving_Address, refund_Address, email, rateId, extraid, refextraid, expirytime } = req.body
  
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

  const data = await response.json()
  try {
    if(data.id){
      var sql="INSERT INTO simpleswap_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, deposit_address, email, transaction_type	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      db.query(sql,[data.id, expirytime, sell, get, sellname, getname, selllogo, getlogo, amount, data.amount_to, extraid, refextraid, data.status, recieving_Address, refund_Address, data.address_from, email, "Fixed" ], function(error, result){
        if (error) throw error;
      })
    }
    res.json({
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

      email:email,

      transaction_type:"Fixed"
    });
  } catch (error) {
    res.json(data);
  }

    }

    static letsexchangeFixedTransaction = async (req, res)=>{
        const { sell, get, sellname, getname, selllogo, getlogo, amount, recieving_Address, refund_Address, email, rateId, extraid, refextraid, expirytime } = req.body

        const url = "https://api.letsexchange.io/api/v1/transaction";
      
        const params = {
      
          float: "true",
          coin_from: sell.toUpperCase(),
          coin_to: get.toUpperCase(),
          deposit_amount: amount,
          withdrawal: recieving_Address,
          withdrawal_extra_id: extraid!=undefined?extraid:"",
          return: refund_Address,
          return_extra_id:refextraid,
          rate_id: rateId
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
      
      
        const data = await response.json()
      
        try {
          if(data.transaction_id){
            var sql="INSERT INTO letsexchange_transactions(transaction_id, expiry_time,	sell_coin,	get_coin, sell_coin_name, get_coin_name, sell_coin_logo, get_coin_logo,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, deposit_address, email, transaction_type	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(sql,[data.transaction_id, expirytime, sell, get, sellname, getname, selllogo, getlogo, amount, data.withdrawal_amount, extraid, refextraid, data.status, recieving_Address, refund_Address,  data.deposit, email, "Fixed" ], function(error, result){
              if (error) throw error;
            })
          }
          res.json({
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
      
            email:email,
      
            transaction_type:"Fixed"
          });
        } catch (error) {
          res.json(data);
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
      console.log(id)

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
        res.json(data)
    }

}


export default exchangeController;