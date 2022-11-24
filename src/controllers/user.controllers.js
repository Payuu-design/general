import pool from '../services/db.js';
import {
    readOne as readElement,
    readMany as readElements,
    deleteOne as deleteElement,
} from '../helpers/crud.js';

// USERS

export async function readOne(req, res) {
    const { id } = req.params;
    let user;
    
    try {
        user = await readElement(
            'user',
            {
                'user': ['id', 'name', 'email', 'doc_number'],
                'campus': ['campus'],
            },
            ['LEFT JOIN campus ON user.campus_id = campus.id'],
            { 'user.id': id },
            pool
        );
    } catch (err) {
        if(err.message === 'Not found') {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }

    res.status(200).json({ user });
}

export async function readMany(req, res) {
    const { where, limit, order } = req.query;

    let users;
    
    try {
        users = await readElements(
            'user',
            {
                'user': ['id', 'name', 'email', 'doc_number'],
                'campus': ['campus'],
            },
            ['LEFT JOIN campus ON user.campus_id = campus.id'],
            where, limit, order, pool
        );
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }

    res.status(200).json(users || []);
}

// PAYMENT METHODS

export async function readPayMeth(req, res) {
    const { id, payMethId } = req.params;
    let payMeth;
    try {
        payMeth = await readElement(
            'payment_method',
            {
                'payment_method': ['id', 'owner', 'card_number', 'exp_year', 'exp_month'],
                'card_type': ['card_type'],
            },
            ['LEFT JOIN card_type ON payment_method.card_type_id = card_type.id'],
            { 'payment_method.id': payMethId, 'payment_method.user_id': id },
            pool
        );
    } catch (err) {
        console.log(err);
        if (err.message === 'Not found') {
            return res.status(404).json({ message: 'Payment method not found' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
    res.status(200).json(payMeth);
}

export async function readPayMeths(req, res) {
    const { id } = req.params;
    const { where, limit, order } = req.query;

    let payMeths;
    try {
        payMeths = await readElements(
            'payment_method',
            {
                'payment_method': ['id', 'owner', 'card_number', 'exp_year', 'exp_month'],
                'card_type': ['card_type'],
            },
            ['LEFT JOIN card_type ON payment_method.card_type_id = card_type.id'],
            { ...where, 'payment_method.user_id': id },
            limit, order, pool
        );
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
    res.status(200).json(payMeths || []);
}

export async function deletePayMeth(req, res) {
    const { id, payMethId } = req.params;
    
    let payMeth;
    try {
        payMeth = await readElement(
            'payment_method', { 'payment_method': ['id'] }, [], { 'id': payMethId, 'user_id': id }, pool
        );
        await deleteElement('payment_method', { 'id': payMethId, 'user_id': id }, pool);
    } catch (err) {
        if (err.message === 'Not found') {
            return res.status(404).json({ message: 'Payment method not found' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }

    res.status(200).json({
        message: 'Payment method deleted',
        payMeth
    });
}

// PAYMENT CONCEPT PERSONS

export async function readBill(req, res) {
    const { id, billId } = req.params;
    let bill;

    try {
        bill = await readElement(
            'bill',
            {
                'bill': ['id', 'ref_number', 'pay_before', 'completed'],
                'payment_concept': ['id', 'payment_concept', 'amount', 'code'],
            },
            [
                'JOIN payment_concept ON bill.payment_concept_id = payment_concept.id'
            ],
            { 'bill.id': billId, 'user_id': id },
            pool
        );
    } catch (err) {
        console.log(err);
        if (err.message === 'Not found') {
            return res.status(404).json({ message: 'Payment concept not found' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
    
    bill.payment_concept = {
        id: bill.payment_concept_id,
        payment_concept: bill.payment_concept,
        amount: bill.amount,
        code: bill.code,
    }
    delete bill.payment_concept_id;
    delete bill.amount;
    delete bill.code;
    
    res.status(200).json(bill);
}

export async function readBills(req, res) {
    const { id } = req.params;
    const { where, limit, order } = req.query;
    let bills;

    try {
        bills = await readElements(
            'bill',
            {
                'bill': ['id', 'ref_number', 'pay_before', 'completed'],
                'payment_concept': ['id', 'payment_concept', 'amount', 'code'],
            },
            [
                'JOIN payment_concept ON bill.payment_concept_id = payment_concept.id'
            ],
            { ...where, 'user_id': id },
            limit, order, pool
        );
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }

    // console.log(bills);
    for (let i = 0; i < bills.length; i++) {
        bills[i].payment_concept = {
            id: bills[i].payment_concept_id,
            payment_concept: bills[i].payment_concept,
            amount: bills[i].amount,
            code: bills[i].code
        }
        delete bills[i].payment_concept_id;
        delete bills[i].amount;
        delete bills[i].code;
    }
    
    res.status(200).json(bills || []);
}

// PAYMENTS

export async function readPayment(req, res) {
    const { id, paymentId } = req.params;
    let payment;

    try {
        payment = await readElement(
            'payment',
            {
                'payment': ['id', 'date', 'gateway_date', 'ref_number', 'num_installments'],
                'payment_settled': ['amount', 'charge', 'effective_date', 'fulfilled', 'successful'],
                'bill': ['id', 'ref_number', 'pay_before', 'completed'],
                'payment_concept': ['id', 'payment_concept', 'amount', 'code'],
            },
            [
                'LEFT JOIN payment_settled ON payment.id = payment_settled.payment_id',
                'LEFT JOIN bill ON payment.bill_id = bill.id',
                'LEFT JOIN payment_concept ON bill.payment_concept_id = payment_concept.id'
            ],
            { 'payment.id': paymentId, 'user_id': id },
            pool
        );
    } catch(err) {
        console.log(err);
        if(err.message === 'Not found') {
            return res.status(404).json({ message: 'Payment not found' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
    
    payment.payment_concept = {
        id: payment.payment_concept_id,
        payment_concept: payment.payment_concept,
        amount: payment.amount,
        code: payment.code,
    };
    delete payment.payment_concept_id;
    delete payment.amount;
    delete payment.code;

    payment.bill = {
        id: payment.bill_id,
        ref_number: payment.bill_ref_number,
        pay_before: payment.pay_before,
        completed: payment.completed,
    }
    delete payment.bill_id;
    delete payment.bill_ref_number;
    delete payment.pay_before;
    delete payment.completed;
    
    res.status(200).json(payment);
}

export async function readPayments(req, res) {
    const { id } = req.params;
    const { where, limit, order } = req.query;
    let payments;

    try {
        payments = await readElements(
            'payment',
            {
                'payment': ['id', 'date', 'gateway_date', 'ref_number', 'num_installments'],
                'payment_settled': ['amount', 'charge', 'effective_date', 'fulfilled', 'successful'],
                'bill': ['id', 'ref_number', 'pay_before', 'completed'],
                'payment_concept': ['id', 'payment_concept', 'amount', 'code'],
            },
            [
                'LEFT JOIN payment_settled ON payment.id = payment_settled.payment_id',
                'LEFT JOIN bill ON payment.bill_id = bill.id',
                'LEFT JOIN payment_concept ON bill.payment_concept_id = payment_concept.id'
            ],
            { ...where, 'user_id': id },
            limit, order, pool
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
            code: payments[i].code,
        };
        delete payments[i].payment_concept_id;
        delete payments[i].amount;
        delete payments[i].code;

        payments[i].bill = {
            id: payments[i].bill_id,
            ref_number: payments[i].bill_ref_number,
            pay_before: payments[i].pay_before,
            completed: payments[i].completed,
        }
        delete payments[i].bill_id;
        delete payments[i].bill_ref_number;
        delete payments[i].pay_before;
        delete payments[i].completed;
    }

    res.status(200).json(payments || []);
}
