import { Router } from 'express';
import {
    readOne, readMany,
    readPayMeth, readPayMeths, deletePayMeth,
    readBill, readBills,
    readPayment, readPayments,
} from '../controllers/user.controllers.js';
import parseQueryParams from '../middlewares/parseQueryParams.js';

const router = Router();

router.get('/', parseQueryParams, readMany);
router.get('/:id', readOne);

router.get('/:id/pay-methods', parseQueryParams, readPayMeths);
router.get('/:id/pay-methods/:payMethId', readPayMeth);
router.delete('/:id/pay-methods/:payMethId', deletePayMeth);

router.get('/:id/bills', parseQueryParams, readBills);
router.get('/:id/bills/:billId', readBill);

router.get('/:id/payments', parseQueryParams, readPayments);
router.get('/:id/payments/:paymentId', readPayment);

export default router;
