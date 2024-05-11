import express from 'express'
import offerController from '../controllers/offerController.js';


const router=express.Router();

//Home Page Currencies Controller
router.get('/currencies', offerController.currencies)

//Home Page Price Controller
router.post('/pricecheck', offerController.homeprice)

//Offer Controller
router.post('/offers', offerController.offers)


export default router