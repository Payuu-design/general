import pool from '../services/db.js';
import {
    readOne as readElement,
    readMany as readElements,
} from '../helpers/crud.js';

export async function readOne(req, res) {
    const { id } = req.params;
    let payMeth;
    
    try {
        payMeth = await readElement(
            'payment_method',
            {
                'payment_method': ['id', 'owner', 'card_number', 'exp_month', 'exp_year'],
                'card_type': ['card_type'],
                'user': ['id', 'email'],
            },
            [
                'LEFT JOIN card_type ON payment_method.card_type_id = card_type.id',
                'LEFT JOIN user ON payment_method.user_id = user.id'
            ],
            { 'payment_method.id': id },
            pool
        );
    } catch (err) {
        console.log(err);
        if (err.message === 'Not found') {
            return res.status(404).json({ message: 'Payment method not found' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
    
    payMeth.user = { id: payMeth.user_id, email: payMeth.email };
    delete payMeth.user_id;
    delete payMeth.email;
    
    res.status(200).json(payMeth);
}

export async function readMany(req, res) {
    const { where, limit, order } = req.query;
    let payMeths;

    try {
        payMeths = await readElements(
            'payment_method',
            {
                'payment_method': ['id', 'owner', 'card_number', 'exp_month', 'exp_year'],
                'card_type': ['card_type'],
                'user': ['id', 'email'],
            },
            [
                'LEFT JOIN card_type ON payment_method.card_type_id = card_type.id',
                'LEFT JOIN user ON payment_method.user_id = user.id'
            ],
            where, limit, order, pool
        );
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }

    for(let i = 0; i < payMeths.length; i++) {
        payMeths[i].user = { id: payMeths[i].user_id, email: payMeths[i].email };
        delete payMeths[i].user_id;
        delete payMeths[i].email;
    }
    
    res.status(200).json(payMeths || []);
}
