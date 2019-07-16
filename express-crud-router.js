var express = require('express')
const permitCheck = require('./express-crud-permit').check;

const sendError = (res, err) => {
    const { status = 500, message } = err;
    res.status(status).send({
        message
    })
}

/**
 * Returns express.router for a table
 * 
 * - POST /table/     - insert
 * - PUT  /table/:id  - update by id
 * - GET  /table/     - get all. // or Paginated query: [ord, dir, page, pageSize] defaults: ord = _id, dir = desc, page = 0, pageSize = (page||ord||dir) ? 10 : infinity 
 * - GET  /table/:id  - get one doc by id
 * - DELETE  /table/:id  - delete one doc by id
 * 
 * @param {string} table - table name used in file system, don't use spatial chars
 * @param {array} fields - Array of Field
 * @param {object} crudPermit - crud permit object (use allow or deny with custom functions )
 */
module.exports = (table, fields, crudPermit, driver) => {
    if (!crudPermit || !permitCheck(crudPermit)) {
        throw 'Bad crudPermit object';
    }
    const router = express.Router()
    const f2f = {};
    fields.forEach((f) => {
        if (f2f[f.name] !== undefined) {
            throw `Duplicate field name ${f}`;
        }
        f2f[f.name] = f;
    })

    router.post('/', (req, res) => {
        if (!crudPermit.canCreate(req)) {
            return sendError(res, { status: 403, message: `Forbiden operation` });
        }
        if (!req.body) {
            return sendError(res, { status: 400, message: `Object content can not be empty` });
        }
        const newObj = {};
        for (let i = 0; i < fields.length; i++) {
            const f = fields[i];
            if (req.body[f.name]) {
                newObj[f.name] = req.body[f.name];
            } else if (f.defval !== undefined) {
                newObj[f.name] = f.defval;
            } else if (f.required) {
                return sendError(res, { status: 500, message: `Missing field ${f.name}` });
            }
        }

        driver.create(table, newObj)
            .then(d => res.send(d))
            .catch((err) => {
                sendError(res, err);
            });

    });

    router.get('/', (req, res) => {
        if (!crudPermit.canFindAll(req)) {
            sendError(res, { status: 403, message: `Forbiden operation` });
        } else {
            const options = {
                page: req.query.page, 
                pageSize: req.query.pageSize, 
                ord: req.query.ord, 
                dir: req.query.dir
            }

            driver.findAll(table, options)
                .then(d => res.send(d))
                .catch((err) => {
                    sendError(res, err);
                });
        }
    });

    router.get('/:id', (req, res) => {
        if (!crudPermit.canFindOne(req)) {
            sendError(res, { status: 403, message: `Forbiden operation` });
            return;
        }
        const id = req.params.id;
        driver.findOne(table, id)
            .then(d => res.send(d))
            .catch((err) => {
                sendError(res, err);
            })

    });

    router.put('/:id', (req, res) => {
        if (!crudPermit.canUpdate(req)) {
            sendError(res, { status: 403, message: `Forbiden operation` });
            return;
        }
        // Validate Request
        if (!req.body) {
            sendError(res, { status: 400, message: `Empty body` });
            return;
        }
        const _id = req.params.id;
        const newObj = {};

        Object.keys(req.body).forEach((f) => {
            if (f2f[f]) {
                newObj[f] = req.body[f];
            }
        });

        driver.update(table, _id, newObj)
            .then(d => res.send(d))
            .catch((err) => {
                sendError(res, err);
            });

    });

    router.delete('/:id', (req, res) => {
        if (!crudPermit.canDelete(req)) {
            sendError(res, { status: 403, message: `Forbiden operation` });
            return;
        }
        const _id = req.params.id;
        driver.remove(table, _id)
        .then(d => res.send(d))
        .catch((err)=>{
            sendError(res, err);
        });
    });

    return router;
}
