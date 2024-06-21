import crypto from 'crypto';
import request from "request";
import fetch from "node-fetch";
import dotenv from 'dotenv';
import {db} from '../database/connectdb.js';
dotenv.config();

class exchangeController{

    // *********************** Floating Transactions ************************* //

    static changellyFloatingTransaction = async (req, res) => {
        const {sell, get, amount, recieving_Address, refund_Address, email, rateId ,extraid, refextraid} = req.body;
        const privateKeyString = "308204be020100300d06092a864886f70d0101010500048204a8308204a40201000282010100b6f7638ac5b811561dc071820c7c764da95ddfb63dafb1f9b96f4d1577ae63f6c7010dd041b5bc314002f0a8536ea29c619de7487b3a98944607674b3905274c40f1f36cb58e9925c2c90846f40cf3f7d10983e01ab0354ded5de57bcac6dc31b47b0bac5f79c7e7947db9bc4a7e18e46a94f291c8055576e00825510731d5b89c5936c8d48106ff837fca0881b721f7c09a272bc316c74c8e56e0dfa69b0cdf3153b671a732506b043363443ff0677f615be06f4519ee07a130d5936e71c87761838296e667122ead027d72431ba8e0b75afe6249c5e4cf1152309e9eb392a8d4d02a6b84443801745731db6b548b7a392d4783c4e168a3a9f0235c84ebf7b902030100010282010029ecabf17b76befa359d08255d89136e9e35757283d603790e65938b2cbe58078ef80ddb3f834e1916ead58c2c79f866cef368b0b213ee2c639384b6b6dd18711f9c9143c2a2673340dbe1baa867636bd089569f7e5e0c08cc302cca5ddf8d4b1268f376cef5cfb99fcbe34862e55bfcd2f34855e1385fa9fa91c3433adbcf75b7821d6299f198edc7472da9fd401ab3f29887ca8e1105389351691ef2925a14b7a960c85d887f233feac28c5248cf8c20360bdcf86423fd0f18a9c7678ff3fac8b155f1a4d4e356260f336a8a94449a8a7fad36314f8005c23fd196a8f9d2aa57bf0bed3ae93ac4b095a2abc311eee8e6f44fefb6def929ca7e371af2685b1502818100e45e992dab2a73ca02855ee71ab2c8b6cbe5c356892ca2f6fba6e642fb7e75221b8f48574ea7419e33850e1938d6fbd16306a4e32d75b4f7d109523751694cd620214a0073a682c1ce9ed005c4d4fef212ac8f7b351c4772b32461e9555b22f7e1e67398d6666b7c34dff08426c8d144470ae60509cae038d558ce8a5236be9702818100cd1a7efa1353a0c5b42c0fb3e4477fba8cac7076aac21c1fd4a07558c629253f592304ab611a72daf24c562c27dcaf0d46751366840274438886b0ca3309008d73b4953d887a7e27dab38086864eff3071bd7daf5812b058de591c484f6c51d249561b5453b6529dc5e54a9ffaa6982726abaa3c51508701a31a43055932162f02818100b521e72316e9440fcd3215d4fe13222a02cd89c300685c15c4025c0e72c59988650d9f964837574f7093af5c07fe549b7e8ccd89b70bee6ec4e93cc1cd9bd4aaddaf29aff40af5195d960f6f13f0d10a160fb27a49e4d532bfae32ceccb9cda18916ad47637eb6f03c4c06cbfaab3b788954b69ef66668b40b5c35edf6499f9f02818100a82ca69b14c7c896f372017a269efdbb8fe740dbfc8de713ae7bd75c703782a41bc99be58e5c6a7ade9bfb387f82f34236587f0cdb074c1fa7cd911e6a9462109a24230eee5e4a1d11b58798467e75be5a34dedeac9fbe5b500dcf23f783c0df6564a64a11cdf8960793480a3f32e4a58d8ecaaa649e5be4dac108dd54d2bddf02818069e9b896d061a7449202370c9fe028c5a4a83890510861184c7d712e4749ff8d8185d0702d7894d2609b50cfd7d3fab44f84be6d2935904f136018123979e6cca03648d855cf53b658aead3144bd4debc48fb395fae656743851da0bd25c1a016284a0343149529f6aa5deeee5ea57f923064ecba9dfa093aaded8803070f32d";
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
                var sql="INSERT INTO changelly_transactions(transaction_id,	sell_coin,	get_coin,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid,	status, recipient_address, refund_address	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                db.query(sql,[data.result.id, sell, get, amount, data.result.amountExpectedTo, extraid, refextraid, data.result.status, recieving_Address, refund_Address], function(error, result){
                  if (error) throw error;
                })
              }
              res.json(data);
            } catch (error) {
              res.json(data);              
            }
          })



    }

    static changenowFloatingTransaction = async (req, res)=>{

        const { sell, get, amount, recieving_Address, refund_Address, email, extraid ,refextraid} = req.body

        const url = "https://api.changenow.io/v1/transactions/3016eb278f481714c943980dec2bfc595f8a2160e8eabd0228dc02cc627a184c";
      
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
        try {
          if(data.id){
            var sql="INSERT INTO changenow_transactions(transaction_id,	sell_coin,	get_coin,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, email	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(sql,[data.id, sell, get, amount, data.amount, extraid, refextraid, data.status, recieving_Address, refund_Address, email ], function(error, result){
              if (error) throw error;
            })
          }
          res.json(data);
        } catch (error) {
          res.json(data);
        }
    }

    static changeheroFloatingTransaction = async (req, res)=>{
        const { sell, get, amount, recieving_Address, refund_Address, email, rateId, extraid, refextraid } = req.body

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
            "api-key": "46799cd819854116907d2a6f54926157"
          },
          body: JSON.stringify(params)
        }
      
        const response = await fetch(url, options)
      
      
        const data = await response.json()
        try {
          if(data.result.id){
            var sql="INSERT INTO changehero_transactions(transaction_id,	sell_coin,	get_coin,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, email	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(sql,[data.result.id, sell, get, amount, data.result.amountExpectedTo, extraid, refextraid, data.result.status, recieving_Address, refund_Address, email ], function(error, result){
              if (error) throw error;
            })
          }
          res.json(data);
        } catch (error) {
          res.json(data);
        }      
      
    }

    static stealthexFloatingTransaction = async (req, res)=>{
        const { sell, get, amount, recieving_Address, refund_Address, email, rateId, extraid , refextraid} = req.body

        const url = "https://api.stealthex.io/api/v2/exchange?api_key=fc69c031-976a-4e7f-b3db-e18f758bed5d";
      
        const params = {
      
          currency_from: sell,
          currency_to: get,
          address_to: recieving_Address,
          extra_id_to: extraid,
          amount_from: amount,
          fixed: false,
          refund_address: refund_Address,
          refund_extra_id:refextraid,
          api_key: "6cbd846e-a085-4505-afeb-8fca0d650c58",
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
            var sql="INSERT INTO stealthex_transactions(transaction_id,	sell_coin,	get_coin,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, email	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(sql,[data.id, sell, get, amount, data.amount_to, extraid, refextraid, data.status, recieving_Address, refund_Address, email ], function(error, result){
              if (error) throw error;
            })
          }
          res.json(data)
        } catch (error) {
          res.json(data)
        }
    }

    static exolixFloatingTransaction = async (req, res)=>{
        const { sell, get, amount, recieving_Address, refund_Address, email, rateId, extraid , refextraid } = req.body

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
            "Authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRyYXp0aWs5OUBnbWFpbC5jb20iLCJzdWIiOjI1NzE2LCJpYXQiOjE2Njg1MTUxNTQsImV4cCI6MTgyNjMwMzE1NH0.X42sQ6iHsGiP0nXA9o_ln89CiuOYnLx5vLqF4M-hf54"
          },
          body: JSON.stringify(params)
        }
      
        const response = await fetch(url, options)
        const data = await response.json()
        try {
          if(data.id){
            var sql="INSERT INTO exolix_transactions(transaction_id,	sell_coin,	get_coin,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, email	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(sql,[data.id, sell, get, amount, data.amountTo, extraid, refextraid, data.status, recieving_Address, refund_Address, email ], function(error, result){
              if (error) throw error;
            })
          }
          res.json(data)
        } catch (error) {
          res.json(data)
        }
    }

    static simpleswapFloatingTransaction = async (req, res)=>{
        const { sell, get, amount, recieving_Address, refund_Address, email, rateId, extraid, refextraid } = req.body

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
            "api_key": "ae57f22d-7a23-4dbe-9881-624b2e147759"
          },
          body: JSON.stringify(params)
        }
      
        const response = await fetch(url, options)
      
        const data = await response.json()
      
        try {
          if(data.id){
            var sql="INSERT INTO simpleswap_transactions(transaction_id,	sell_coin,	get_coin,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, email	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(sql,[data.id, sell, get, amount, data.amount_to, extraid, refextraid, data.status, recieving_Address, refund_Address, email ], function(error, result){
              if (error) throw error;
            })
          }
          res.json(data)
        } catch (error) {
          res.json(data)
        }
    }

    static godexFloatingTransaction = async (req, res)=>{
        const { sell, get, amount, recieving_Address, refund_Address, email, rateId, extraid, refextraid } = req.body

        console.log(req.body)
      
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
            "public-key": "lPM1O83kxGXJn9C0IgtKb8E/3EN1kWX3PnLF3EGl6NaFN8cvxi+kj9j+18kum12pdDWIbpTqy6/kVRMxGsE=a7f7a513cbc3ecbeb81eda9cff3182f3"
          },
          body: JSON.stringify(params)
        }
      
        const response = await fetch(url, options)
      
      
        const data = await response.json()
      
        try {
          if(data.transaction_id){
            var sql="INSERT INTO godex_transactions(transaction_id,	sell_coin,	get_coin,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, email	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(sql,[data.transaction_id, sell, get, amount, data.withdrawal_amount, extraid, refextraid, data.status, recieving_Address, refund_Address, email ], function(error, result){
              if (error) throw error;
            })
          }
          res.json(data)
        } catch (error) {
          res.json(data)
        }
    }

    static letsexchangeFloatingTransaction = async (req, res)=>{
        const { sell, get, amount, recieving_Address, refund_Address, email, rateId, extraid,  refextraid} = req.body

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
      "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0b2tlbiIsImRhdGEiOnsiaWQiOjE3NCwiaGFzaCI6ImV5SnBkaUk2SWxJNGRXTlhWMlZvU1c5bVFVOU9NVlY2WmpSQmFuYzlQU0lzSW5aaGJIVmxJam9pYmxaR2FWcDJWM1pYWVZsa1hDOW9LMnBXWlZsb2JVdzBkVGgzZVhVMGIzTnlaVmxDTm5SQlJVSXhPVE5NZEVadFZsVnROR3RQSzI0MVVHaDRhblpRWjJnMlZqbFFNekpIT0RCNVV6VjFSekJLY0ZVMmFtTnFhM0pqT0cxeE5sRnlNa0l3UVhOblUwUllaelpyUFNJc0ltMWhZeUk2SWpVd01qazBNVFU1T1RWaU9UWTJPR0l5T0dGbFpEVmhZMlJsTWpReU1HUTNPVEV3TkROall6STVabVUzTnprNU5HUmxORGMwTkdFNU1XWTROemRqTjJNaWZRPT0ifSwiaXNzIjoiaHR0cHM6XC9cL2xldHMtbmdpbngtc3ZjXC9hcGlcL3YxXC9hcGkta2V5IiwiaWF0IjoxNjgzMTgyMjI4LCJleHAiOjIwMDQ1OTAyMjgsIm5iZiI6MTY4MzE4MjIyOCwianRpIjoiUkZVa1hFb0Nwd2xncUc0WiJ9._oAGxTTtlx1yDWkHHmQLYiVZ5FY50Urtn2CmLv4gW28",
      "Accept": "application/json",
    },
    body: JSON.stringify(params)
  }

  const response = await fetch(url, options)


  const data = await response.json()

  try {
    if(data.transaction_id){
      var sql="INSERT INTO letsexchange_transactions(transaction_id,	sell_coin,	get_coin,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, email	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      db.query(sql,[data.transaction_id, sell, get, amount, data.withdrawal_amount, extraid, refextraid, data.status, recieving_Address, refund_Address, email ], function(error, result){
        if (error) throw error;
      })
    }
    res.json(data)
  } catch (error) {
    res.json(data)
  }
    }

    // *********************** Fixed Transactions ************************* //

    static changellyFixedTransaction = async (req, res)=>{
        const {sell, get, amount, recieving_Address, refund_Address, email, rateId ,extraid, refextraid} = req.body;
        const privateKeyString = "308204be020100300d06092a864886f70d0101010500048204a8308204a40201000282010100b6f7638ac5b811561dc071820c7c764da95ddfb63dafb1f9b96f4d1577ae63f6c7010dd041b5bc314002f0a8536ea29c619de7487b3a98944607674b3905274c40f1f36cb58e9925c2c90846f40cf3f7d10983e01ab0354ded5de57bcac6dc31b47b0bac5f79c7e7947db9bc4a7e18e46a94f291c8055576e00825510731d5b89c5936c8d48106ff837fca0881b721f7c09a272bc316c74c8e56e0dfa69b0cdf3153b671a732506b043363443ff0677f615be06f4519ee07a130d5936e71c87761838296e667122ead027d72431ba8e0b75afe6249c5e4cf1152309e9eb392a8d4d02a6b84443801745731db6b548b7a392d4783c4e168a3a9f0235c84ebf7b902030100010282010029ecabf17b76befa359d08255d89136e9e35757283d603790e65938b2cbe58078ef80ddb3f834e1916ead58c2c79f866cef368b0b213ee2c639384b6b6dd18711f9c9143c2a2673340dbe1baa867636bd089569f7e5e0c08cc302cca5ddf8d4b1268f376cef5cfb99fcbe34862e55bfcd2f34855e1385fa9fa91c3433adbcf75b7821d6299f198edc7472da9fd401ab3f29887ca8e1105389351691ef2925a14b7a960c85d887f233feac28c5248cf8c20360bdcf86423fd0f18a9c7678ff3fac8b155f1a4d4e356260f336a8a94449a8a7fad36314f8005c23fd196a8f9d2aa57bf0bed3ae93ac4b095a2abc311eee8e6f44fefb6def929ca7e371af2685b1502818100e45e992dab2a73ca02855ee71ab2c8b6cbe5c356892ca2f6fba6e642fb7e75221b8f48574ea7419e33850e1938d6fbd16306a4e32d75b4f7d109523751694cd620214a0073a682c1ce9ed005c4d4fef212ac8f7b351c4772b32461e9555b22f7e1e67398d6666b7c34dff08426c8d144470ae60509cae038d558ce8a5236be9702818100cd1a7efa1353a0c5b42c0fb3e4477fba8cac7076aac21c1fd4a07558c629253f592304ab611a72daf24c562c27dcaf0d46751366840274438886b0ca3309008d73b4953d887a7e27dab38086864eff3071bd7daf5812b058de591c484f6c51d249561b5453b6529dc5e54a9ffaa6982726abaa3c51508701a31a43055932162f02818100b521e72316e9440fcd3215d4fe13222a02cd89c300685c15c4025c0e72c59988650d9f964837574f7093af5c07fe549b7e8ccd89b70bee6ec4e93cc1cd9bd4aaddaf29aff40af5195d960f6f13f0d10a160fb27a49e4d532bfae32ceccb9cda18916ad47637eb6f03c4c06cbfaab3b788954b69ef66668b40b5c35edf6499f9f02818100a82ca69b14c7c896f372017a269efdbb8fe740dbfc8de713ae7bd75c703782a41bc99be58e5c6a7ade9bfb387f82f34236587f0cdb074c1fa7cd911e6a9462109a24230eee5e4a1d11b58798467e75be5a34dedeac9fbe5b500dcf23f783c0df6564a64a11cdf8960793480a3f32e4a58d8ecaaa649e5be4dac108dd54d2bddf02818069e9b896d061a7449202370c9fe028c5a4a83890510861184c7d712e4749ff8d8185d0702d7894d2609b50cfd7d3fab44f84be6d2935904f136018123979e6cca03648d855cf53b658aead3144bd4debc48fb395fae656743851da0bd25c1a016284a0343149529f6aa5deeee5ea57f923064ecba9dfa093aaded8803070f32d";
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
                var sql="INSERT INTO changelly_transactions(transaction_id,	sell_coin,	get_coin,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid,	status, transaction_type, recipient_address, refund_address	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                db.query(sql,[data.result.id, sell, get, amount, data.result.amountExpectedTo, extraid, refextraid, data.result.status, "Fixed", recieving_Address, refund_Address], function(error, result){
                  if (error) throw error;
                })
              }
              res.json(data);
            } catch (error) {
              res.json(data);
            }
          })
    }

    static changenowFixedTransaction = async (req, res)=>{

  const { sell, get, amount, recieving_Address, refund_Address, email, rateId, extraid , refextraid} = req.body

  const url = "https://api.changenow.io/v1/transactions/fixed-rate/3016eb278f481714c943980dec2bfc595f8a2160e8eabd0228dc02cc627a184c";

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
      var sql="INSERT INTO changenow_transactions(transaction_id,	sell_coin,	get_coin,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid, status,  recipient_address, refund_address, email, transaction_type	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      db.query(sql,[data.id, sell, get, amount, data.amount, extraid, refextraid, data.status, recieving_Address, refund_Address, email, "Fixed" ], function(error, result){
        if (error) throw error;
      })
    }
    res.json(data);
  } catch (error) {
    res.json(data);
  }
    }

    static changeheroFixedTransaction = async (req, res)=>{
  const { sell, get, amount, recieving_Address, refund_Address, email, rateId, extraid, refextraid } = req.body

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
      "api-key": "46799cd819854116907d2a6f54926157"
    },
    body: JSON.stringify(params)
  }

  const response = await fetch(url, options)


  const data = await response.json()

  try {
    if(data.result.id){
      var sql="INSERT INTO changehero_transactions(transaction_id,	sell_coin,	get_coin,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, email, transaction_type	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      db.query(sql,[data.result.id, sell, get, amount, data.result.amountExpectedTo, extraid, refextraid, data.result.status, recieving_Address, refund_Address, email, "Fixed" ], function(error, result){
        if (error) throw error;
      })
    }
    res.json(data);
  } catch (error) {
    res.json(data);
  }   
    }

    static stealthexFixedTransaction = async (req, res)=>{
   const { sell, get, amount, recieving_Address, refund_Address, email, rateId, extraid, refextraid } = req.body

  const url = "https://api.stealthex.io/api/v2/exchange?api_key=fc69c031-976a-4e7f-b3db-e18f758bed5d";

  const params = {
    currency_from: sell,
    currency_to: get,
    address_to: recieving_Address,
    extra_id_to: extraid,
    amount_from: amount,
    fixed: true,
    refund_address: refund_Address,
    refund_extra_id:refextraid,
    api_key: "6cbd846e-a085-4505-afeb-8fca0d650c58",
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
      var sql="INSERT INTO stealthex_transactions(transaction_id,	sell_coin,	get_coin,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, email, transaction_type	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      db.query(sql,[data.id, sell, get, amount, data.amount_to, extraid, refextraid, data.status, recieving_Address, refund_Address, email, "Fixed" ], function(error, result){
        if (error) throw error;
      })
    }
    res.json(data)
  } catch (error) {
    res.json(data)
  }
}

    static exolixFixedTransaction = async (req, res)=>{
        const { sell, get, amount, recieving_Address, refund_Address, email, rateId, extraid , refextraid  } = req.body

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
            "Authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRyYXp0aWs5OUBnbWFpbC5jb20iLCJzdWIiOjI1NzE2LCJpYXQiOjE2Njg1MTUxNTQsImV4cCI6MTgyNjMwMzE1NH0.X42sQ6iHsGiP0nXA9o_ln89CiuOYnLx5vLqF4M-hf54"
          },
          body: JSON.stringify(params)
        }
      
        const response = await fetch(url, options)
        const data = await response.json()
        try {
          if(data.id){
            var sql="INSERT INTO exolix_transactions(transaction_id,	sell_coin,	get_coin,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, email, transaction_type	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(sql,[data.id, sell, get, amount, data.amountTo, extraid, refextraid, data.status, recieving_Address, refund_Address, email, "Fixed" ], function(error, result){
              if (error) throw error;
            })
          }
          res.json(data)
        } catch (error) {
          res.json(data)
        }
    }

    static simpleswapFixedTransaction = async (req, res)=>{
    
    const { sell, get, amount, recieving_Address, refund_Address, email, rateId, extraid, refextraid } = req.body
  
  const url = "https://api.simpleswap.io/create_exchange?api_key=ae57f22d-7a23-4dbe-9881-624b2e147759";

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
      "api_key": "ae57f22d-7a23-4dbe-9881-624b2e147759"
    },
    body: JSON.stringify(params)
  }

  const response = await fetch(url, options)

  const data = await response.json()
  try {
    if(data.id){
      var sql="INSERT INTO simpleswap_transactions(transaction_id,	sell_coin,	get_coin,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, email, transaction_type	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      db.query(sql,[data.id, sell, get, amount, data.amount_to, extraid, refextraid, data.status, recieving_Address, refund_Address, email, "Fixed" ], function(error, result){
        if (error) throw error;
      })
    }
    res.json(data)
  } catch (error) {
    res.json(data)
  }

    }

    static letsexchangeFixedTransaction = async (req, res)=>{
        const { sell, get, amount, recieving_Address, refund_Address, email, rateId, extraid, refextraid } = req.body

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
            "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0b2tlbiIsImRhdGEiOnsiaWQiOjE3NCwiaGFzaCI6ImV5SnBkaUk2SWxJNGRXTlhWMlZvU1c5bVFVOU9NVlY2WmpSQmFuYzlQU0lzSW5aaGJIVmxJam9pYmxaR2FWcDJWM1pYWVZsa1hDOW9LMnBXWlZsb2JVdzBkVGgzZVhVMGIzTnlaVmxDTm5SQlJVSXhPVE5NZEVadFZsVnROR3RQSzI0MVVHaDRhblpRWjJnMlZqbFFNekpIT0RCNVV6VjFSekJLY0ZVMmFtTnFhM0pqT0cxeE5sRnlNa0l3UVhOblUwUllaelpyUFNJc0ltMWhZeUk2SWpVd01qazBNVFU1T1RWaU9UWTJPR0l5T0dGbFpEVmhZMlJsTWpReU1HUTNPVEV3TkROall6STVabVUzTnprNU5HUmxORGMwTkdFNU1XWTROemRqTjJNaWZRPT0ifSwiaXNzIjoiaHR0cHM6XC9cL2xldHMtbmdpbngtc3ZjXC9hcGlcL3YxXC9hcGkta2V5IiwiaWF0IjoxNjgzMTgyMjI4LCJleHAiOjIwMDQ1OTAyMjgsIm5iZiI6MTY4MzE4MjIyOCwianRpIjoiUkZVa1hFb0Nwd2xncUc0WiJ9._oAGxTTtlx1yDWkHHmQLYiVZ5FY50Urtn2CmLv4gW28",
            "Accept": "application/json",
          },
          body: JSON.stringify(params)
        }
      
        const response = await fetch(url, options)
      
      
        const data = await response.json()
      
        try {
          if(data.transaction_id){
            var sql="INSERT INTO letsexchange_transactions(transaction_id,	sell_coin,	get_coin,	sell_amount,	get_amount,	recipient_extraid,	refund_extraid, status, recipient_address, refund_address, email, transaction_type	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(sql,[data.transaction_id, sell, get, amount, data.withdrawal_amount, extraid, refextraid, data.status, recieving_Address, refund_Address, email, "Fixed" ], function(error, result){
              if (error) throw error;
            })
          }
          res.json(data)
        } catch (error) {
          res.json(data)
        }
    }

    // *********************** Fetching Transactions From Database ************************* //

    static getChangellyTransactions = async (req, res)=>{

          var sql="Select * FROM changelly_transactions ORDER BY id DESC";
          db.query(sql, function(error, result){
            if (error) throw error;
            return res.json(result);
          })
        }
    
    static getChangenowTransactions = async (req, res)=>{

          var sql="Select * FROM changenow_transactions ORDER BY id DESC";
          db.query(sql, function(error, result){
            if (error) throw error;
            return res.json(result);
          })
        }

    static getChangeheroTransactions = async (req, res)=>{

          var sql="Select * FROM changehero_transactions ORDER BY id DESC";
          db.query(sql, function(error, result){
            if (error) throw error;
            return res.json(result);
          })
        }

    static getExolixTransactions = async (req, res)=>{

          var sql="Select * FROM exolix_transactions ORDER BY id DESC";
          db.query(sql, function(error, result){
            if (error) throw error;
            return res.json(result);
          })
        }

    static getLetsexchangeTransactions = async (req, res)=>{

          var sql="Select * FROM letsexchange_transactions ORDER BY id DESC";
          db.query(sql, function(error, result){
            if (error) throw error;
            return res.json(result);
          })
        }

    static getSimpleswapTransactions = async (req, res)=>{

          var sql="Select * FROM simpleswap_transactions ORDER BY id DESC";
          db.query(sql, function(error, result){
            if (error) throw error;
            return res.json(result);
          })
        }

    static getGodexTransactions = async (req, res)=>{

          var sql="Select * FROM godex_transactions ORDER BY id DESC";
          db.query(sql, function(error, result){
            if (error) throw error;
            return res.json(result);
          })
        }

    static getStealthexTransactions = async (req, res)=>{

          var sql="Select * FROM stealthex_transactions ORDER BY id DESC";
          db.query(sql, function(error, result){
            if (error) throw error;
            return res.json(result);
          })
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