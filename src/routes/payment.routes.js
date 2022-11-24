import { Router } from 'express';
import { readOne, readMany } from '../controllers/payment.controllers.js';
import parseQueryParams from '../middlewares/parseQueryParams.js';

const router = Router();

router.get('/', parseQueryParams, readMany);
router.get('/:id',  readOne);

export default router;
