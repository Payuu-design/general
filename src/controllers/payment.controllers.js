import pool from '../services/db.js';
import {
    readOne as readElement,
    readMany as readElements
} from '../helpers/crud.js';
import { removeNull } from '../helpers/utils.js';

export async function readOne(req, res) {
    const { id } = req.params;
    let payment;

    try {
        payment = await readElement(
            'payment',
            {
                'payment': ['id', 'date', 'gateway_date', 'ref_number', 'num_installments'],
                'payment_settled': ['amount', 'charge', 'effective_date', 'fulfilled', 'successful'],
                'user': ['id', 'email'],
                'bill': ['id', 'ref_number', 'pay_before', 'completed'],
                'payment_concept': ['id', 'payment_concept', 'code', 'amount'],
                'campus': ['campus']
            },
            [
                'LEFT JOIN payment_settled ON payment.id = payment_settled.payment_id',
                'LEFT JOIN bill ON payment.bill_id = bill.id',
                'LEFT JOIN user ON bill.user_id = user.id',
                'LEFT JOIN payment_concept ON bill.payment_concept_id = payment_concept.id',
                'LEFT JOIN campus ON user.campus_id = campus.id'
            ],
            { 'payment.id': id },
            pool
        );
    } catch(err) {
        if(err.message === 'Not found') {
            return res.status(404).json({ message: 'Payment not found' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }

    payment.payment_concept = {
        id: payment.payment_concept_id,
        payment_concept: payment.payment_concept,
        amount: payment.amount,
        code: payment.code
    };
    delete payment.payment_concept_id;
    delete payment.amount;
    delete payment.code;

    payment.bill = {
        id: payment.bill_id,
        ref_number: payment.bill_ref_number,
        pay_before: payment.pay_before,
        completed: payment.completed
    };
    delete payment.bill_id;
    delete payment.bill_ref_number;
    delete payment.pay_before;
    delete payment.completed;

    payment.user = {
        id: payment.user_id,
        email: payment.user_email
    };
    delete payment.user_id;
    delete payment.user_email;
    
    res.status(200).json(payment);
}

export async function readMany(req, res) {
    const { where, limit, order } = req.query;
    let payments;

    try {
        payments = await readElements(
            'payment',
            {
                'payment': ['id', 'date', 'gateway_date', 'ref_number', 'num_installments'],
                'payment_settled': ['amount', 'charge', 'effective_date', 'fulfilled', 'successful'],
                'user': ['id', 'email'],
                'bill': ['id', 'ref_number', 'pay_before', 'completed'],
                'payment_concept': ['id', 'payment_concept', 'code', 'amount'],
                'campus': ['campus']
            },
            [
                'LEFT JOIN payment_settled ON payment.id = payment_settled.payment_id',
                'LEFT JOIN bill ON payment.bill_id = bill.id',
                'LEFT JOIN user ON bill.user_id = user.id',
                'LEFT JOIN payment_concept ON bill.payment_concept_id = payment_concept.id',
                'LEFT JOIN campus ON user.campus_id = campus.id'
            ],
            where, limit, order, pool
        );
    } catch(err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }

    for(let i = 0; i < payments.length; i++) {
        payments[i].payment_concept = {
            id: payments[i].payment_concept_id,
            payment_concept: payments[i].payment_concept,
            amount: payments[i].amount,
            code: payments[i].code
        };
        delete payments[i].payment_concept_id;
        delete payments[i].amount;
        delete payments[i].code;

        payments[i].bill = {
            id: payments[i].bill_id,
            ref_number: payments[i].bill_ref_number,
            pay_before: payments[i].pay_before,
            completed: payments[i].completed
        };
        delete payments[i].bill_id;
        delete payments[i].bill_ref_number;
        delete payments[i].pay_before;
        delete payments[i].completed;

        payments[i].user = {
            id: payments[i].user_id,
            email: payments[i].user_email
        };
        delete payments[i].user_id;
        delete payments[i].user_email;
    }

    res.status(200).json(payments || []);
}
