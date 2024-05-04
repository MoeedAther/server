import crypto from 'crypto';
import request from "request";
import fetch from "node-fetch";
import dotenv from 'dotenv';
dotenv.config();


class offerController {

  static homeprice = async (req, res) => {
    const { sel, get, amount } = req.body;
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
