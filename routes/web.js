import express from 'express'
import offerController from '../controllers/offerController.js';


const router=express.Router();

//Home Page Price Controller
router.post('/pricecheck', offerController.offers)

//Offer Controller
router.post('/offers', offerController.homeprice)


export default router