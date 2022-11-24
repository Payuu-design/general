import pool from '../services/db.js';
import {
    readOne as readElement,
    readMany as readElements
} from '../helpers/crud.js';

export async function readOne(req, res) {
    const { id } = req.params;
    let bill;
    try {
        bill = await readElement(
            'bill',
            {
                'bill': ['id', 'ref_number', 'pay_before', 'completed'],
                'payment_concept': ['id', 'payment_concept', 'amount', 'code'],
                'user': ['id', 'email'],
                'campus': ['campus']
            },
            [
                'LEFT JOIN payment_concept ON bill.payment_concept_id = payment_concept.id',
                'LEFT JOIN user ON bill.user_id = user.id',
                'LEFT JOIN campus ON user.campus_id = campus.id'
            ],
            { 'bill.id': id },
            pool
        );
    } catch(err) {
        console.log(err);
        if(err.message === 'Not found') {
            return res.status(404).json({ message: 'Payment concept not found' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
    bill.payment_concept = {
        id: bill.payment_concept_id,
        payment_concept: bill.payment_concept,
        amount: bill.amount,
        code: bill.code
    };
    delete bill.payment_concept_id;
    delete bill.amount;
    delete bill.code;

    bill.user = {
        id: bill.user_id,
        email: bill.email
    }
    delete bill.user_id;
    delete bill.email;
    
    res.status(200).json(bill);
}

export async function readMany(req, res) {
    const { where, limit, order } = req.query;
    let bills;
    try {
        bills = await readElements(
            'bill',
            {
                'bill': ['id', 'ref_number', 'pay_before', 'completed'],
                'payment_concept': ['id', 'payment_concept', 'amount', 'code'],
                'user': ['id', 'email'],
                'campus': ['campus']
            },
            [
                'LEFT JOIN payment_concept ON bill.payment_concept_id = payment_concept.id',
                'LEFT JOIN user ON bill.user_id = user.id',
                'LEFT JOIN campus ON user.campus_id = campus.id'
            ],
            where, limit, order, pool
        );
    } catch(err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }

    for(let i = 0; i < bills.length; i++) {
        bills[i].payment_concept = {
            id: bills[i].payment_concept_id,
            payment_concept: bills[i].payment_concept,
            amount: bills[i].amount,
            code: bills[i].code
        };
        delete bills[i].payment_concept_id;
        delete bills[i].amount;
        delete bills[i].code;

        bills[i].user = {
            id: bills[i].user_id,
            email: bills[i].email
        }
        delete bills[i].user_id;
        delete bills[i].email;
    }
    
    res.status(200).json(bills);
}
