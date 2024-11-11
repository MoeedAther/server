import express from 'express'
import offerController from '../controllers/offerController.js';
import exchangeController from '../controllers/exchangeController.js';
import AdminController from '../controllers/adminController.js';
import CronController from '../controllers/cronController.js';
import SupportController from '../controllers/supportController.js';


const router=express.Router();


//Home Page Currencies Controller
router.get('/currencies', offerController.currencies)

//Home Page Price Controller
router.post('/pricecheck', offerController.homeprice)

//**************************************** Price Check Apis ************************* */
router.post('/changelly/price', offerController.changellyprice);
router.post('/changenow/price', offerController.changenowprice);
router.post('/stealthex/price', offerController.stealthexprice);
router.post('/exolix/price', offerController.exolixprice);
router.post('/simpleswap/price', offerController.simpleswapprice);
router.post('/changehero/price', offerController.changeheroprice);
router.post('/godex/price', offerController.godexprice);
router.post('/letsexchange/price', offerController.letsexchangeprice);


//Offer Controller
router.post('/offers', offerController.offers)


//.................................. Transaction APIs ......................................./

//................................. Floating Transactions .................................../

//**************************************** Changelly Float Transaction ************************* */
router.post('/createTransaction/changelly/float', exchangeController.changellyFloatingTransaction)

//************************************ Changenow Floating Transactions ************************* */
router.post('/createTransaction/changenow/float', exchangeController.changenowFloatingTransaction)

//************************************ Changehero Floating Transactions ************************* */
router.post('/createTransaction/changehero/float', exchangeController.changeheroFloatingTransaction)

//**************************************** StealthEX Float Transactions ************************* */
router.post('/createTransaction/stealthex/float', exchangeController.stealthexFloatingTransaction)

//**************************************** Exolix Float Transactions ************************* */
router.post('/createTransaction/exolix/float', exchangeController.exolixFloatingTransaction)

//**************************************** Simnpleswap Float Transactions ************************* */
router.post('/createTransaction/simpleswap/float', exchangeController.simpleswapFloatingTransaction)

//**************************************** Godex Float Transactions ************************* */
router.post('/createTransaction/godex/float', exchangeController.godexFloatingTransaction)

//**************************************** Letsexchange Float Transactions ************************* */
router.post('/createTransaction/letsexchange/float', exchangeController.letsexchangeFloatingTransaction)


//..................................... Fixed Transactions .................................../

//**************************************** Creating Fixed Transaction ************************* */
router.post('/createTransaction/changelly/fixed', exchangeController.changellyFixedTransaction)

//************************************ Changenow Fixed Transactions ************************* */
router.post('/createTransaction/changenow/fixed', exchangeController.changenowFixedTransaction)

//************************************ Changehero Fixed Transactions ************************* */
router.post('/createTransaction/changehero/fixed', exchangeController.changeheroFixedTransaction)

//**************************************** StealthEX Float Transactions ************************* */
router.post('/createTransaction/stealthex/fixed', exchangeController.stealthexFixedTransaction)

//**************************************** Exolix Fixed Transactions ************************* */
router.post('/createTransaction/exolix/fixed', exchangeController.exolixFixedTransaction)

//**************************************** Simnpleswap Fixed Transactions ************************* */
router.post('/createTransaction/simpleswap/fixed', exchangeController.simpleswapFixedTransaction)

//**************************************** Letsexchange Fixed Transactions ************************* */
router.post('/createTransaction/letsexchange/fixed', exchangeController.letsexchangeFixedTransaction)

//.................................. Wallet Address Validation ......................................./
router.post('/validate/wallet_address', exchangeController.validateWalletAddress)


//.................................. GET Transaction APIs ......................................./

//**************************************** Changelly Transactions ************************* */
router.post('/get/changelly/transactions', exchangeController.getChangellyTransactions)

//**************************************** Changenow Transactions ************************* */
router.post('/get/changenow/transactions', exchangeController.getChangenowTransactions)

//**************************************** Changehero Transactions ************************* */
router.post('/get/changehero/transactions', exchangeController.getChangeheroTransactions)

//**************************************** Exolix Transactions ************************* */
router.post('/get/exolix/transactions', exchangeController.getExolixTransactions)

//**************************************** Godex Transactions ************************* */
router.post('/get/godex/transactions', exchangeController.getGodexTransactions)

//**************************************** Letsexchange Transactions ************************* */
router.post('/get/letsexchange/transactions', exchangeController.getLetsexchangeTransactions)

//**************************************** Simpleswap Transactions ************************* */
router.post('/get/simpleswap/transactions', exchangeController.getSimpleswapTransactions)

//**************************************** Stealthex Transactions ************************* */
router.post('/get/stealthex/transactions', exchangeController.getStealthexTransactions)


//.................................. Admin APIs ......................................./

// Creating Admin
router.post('/create', AdminController.createAdmin);

//Admin Login
router.post('/login', AdminController.authenticateAdmin);

//Check session
router.post('/check/session', AdminController.checkSession);

//Check session
router.post('/logout', AdminController.logoutSession);

//OTP varification
router.post('/otp/verify', AdminController.otpVarification);

//.................................. Cron Job APIs ......................................./
//Get cron type data
router.post('/get/cron/status', CronController.getStatusCronData);

//Set cron type data
router.post('/set/cron/status', CronController.setStatusCronData);

//.................................. Transaction Status Apis ......................................./
router.post('/tx/changelly/status', exchangeController.checkChangellyTransactionStatus); 
router.post('/tx/changenow/status', exchangeController.checkChangenowTransactionStatus);
router.post('/tx/changehero/status', exchangeController.checkChangeheroTransactionStatus);
router.post('/tx/exolix/status', exchangeController.checkExolixTransactionStatus);
router.post('/tx/letsexchange/status', exchangeController.checkLetsexchangeTransactionStatus);
router.post('/tx/simpleswap/status', exchangeController.checkSimpleswapTransactionStatus);
router.post('/tx/godex/status', exchangeController.checkGodexTransactionStatus);
router.post('/tx/stealthex/status', exchangeController.checkStealthexTransactionStatus);

//.......................... Transaction Status Check Using Order ID .............................../
router.post('/tx/status', exchangeController.checkTransactionStatus);


//.................................. Support Links Apis ......................................./

router.get('/support_links/changelly', SupportController.changellySupportLinks);
router.get('/support_links/changenow', SupportController.changenowSupportLinks);
router.get('/support_links/changehero', SupportController.changeheroSupportLinks);
router.get('/support_links/exolix', SupportController.exolixSupportLinks);
router.get('/support_links/godex', SupportController.godexSupportLinks);
router.get('/support_links/letsexchange', SupportController.letsexchangeSupportLinks);
router.get('/support_links/stealthex', SupportController.stealthexSupportLinks);
router.get('/support_links/simpleswap', SupportController.simpleswapSupportLinks);

//............................ Exchange Profiles Update Apis................................/
router.post('/changelly_profile/update', SupportController.changellyUpdateProfile);
router.post('/changenow_profile/update', SupportController.changenowUpdateProfile);
router.post('/changehero_profile/update', SupportController.changeheroUpdateProfile);
router.post('/exolix_profile/update', SupportController.exolixUpdateProfile);
router.post('/godex_profile/update', SupportController.godexUpdateProfile);
router.post('/stealthex_profile/update', SupportController.stealthexUpdateProfile);
router.post('/letsexchange_profile/update', SupportController.letsexchangeUpdateProfile);
router.post('/simpleswap_profile/update', SupportController.simpleswapUpdateProfile);

//.................................. Coins Data......................................./
router.get('/coins-tokens', offerController.getCoinsTokens);
router.get('/coin_market_data', offerController.getcryptomarket);

//....................................... Test Route ......................................./
router.get('/test', SupportController.testApis);





export default router