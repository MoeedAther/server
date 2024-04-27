import express from 'express'
import offerController from '../controllers/offerController.js';


const router=express.Router();

//Offer Controller
router.post('/offers', offerController.offers)


export default router