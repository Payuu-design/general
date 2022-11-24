import { Router } from 'express';
import user from './user.routes.js';
import payConcept from './payConcept.routes.js';
import bill from './bill.routes.js';
import payMeth from './payMeth.routes.js';
import payment from './payment.routes.js';
import campus from './campus.routes.js';

const router = Router();

router.use('/users', user);
router.use('/pay-concepts', payConcept);
router.use('/bills', bill);
router.use('/pay-methods', payMeth);
router.use('/payments', payment);
router.use('/campuses', campus);

export default router;
