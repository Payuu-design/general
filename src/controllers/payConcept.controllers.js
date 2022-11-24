import pool from '../services/db.js';
import {
    readOne as readElement,
    readMany as readElements
} from '../helpers/crud.js';

export async function readOne(req, res) {
    const { id } = req.params;
    let payConcept;
    try {
        payConcept = await readElement(
            'payment_concept',
            { 'payment_concept': [ 'id', 'payment_concept', 'amount', 'code'] },
            null,
            { id },
            pool
        );
    } catch(err) {
        if(err.message === 'Not found') {
            return res.status(404).json({ message: 'Payment concept not found' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
    res.status(200).json(payConcept);
}

export async function readMany(req, res) {
    const { where, limit, order } = req.query;
    let payConcepts;
    try {
        payConcepts = await readElements(
            'payment_concept',
            { 'payment_concept': [ 'id', 'payment_concept', 'amount', 'code'] },
            null,
            where, limit, order, pool
        );
    } catch(err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
    res.status(200).json(payConcepts);
}
