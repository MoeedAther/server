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


//.................................. Support Links Apis ......................................./

router.get('/support_links/changelly', SupportController.changellySupportLinks);
router.get('/support_links/changenow', SupportController.changenowSupportLinks);
router.get('/support_links/changehero', SupportController.changeheroSupportLinks);
router.get('/support_links/exolix', SupportController.exolixSupportLinks);
router.get('/support_links/godex', SupportController.godexSupportLinks);
router.get('/support_links/letsexchange', SupportController.letsexchangeSupportLinks);
router.get('/support_links/stealthex', SupportController.stealthexSupportLinks);
router.get('/support_links/simpleswap', SupportController.simpleswapSupportLinks);




export default router