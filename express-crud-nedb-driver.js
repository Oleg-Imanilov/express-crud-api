const Datastore = require('nedb');
const path = require('path');

const PATH_PREFIX = process.env.db || 'data';
const _db = {};

const collection = (table) => {
    if(!_db[table]) {
        _db[table] = new Datastore({ filename: path.resolve(PATH_PREFIX, `${table}.nedb`), autoload: true });
    }
    return _db[table];
}

const create = (table, doc) => {
    return new Promise((accept, reject) => {
        collection(table).insert(doc, (err, docs) => {
            if (!err) {
                accept(docs);
            } else {
                console.error('DB error:' + err);
                reject({ status: 500, message: 'DB error' })
            }
        });
    })
}

const update = (table, _id, newObj) => {
    return new Promise((accept, reject) => {
        collection(table).update({ _id }, { $set: newObj }, { multi: false, returnUpdatedDocs: true }, (err, numAffected, doc) => {
            if (!err) {
                if (numAffected === 1) {
                    accept(doc);
                } else {
                    reject({ status: 404, message: `Record with id = ${_id} - not found` });
                }
            } else {
                console.error('DB error:' + err);
                reject({ status: 500, message: `Something wrong updating record with id ${_id}` });
            }
        });
    })
}

const findAll = (table) => {
    return new Promise((accept, reject) => {
        collection(table).find({}, (err, docs) => {
            if (!err) {
                accept(docs);
            } else {
                console.error('DB error:' + err);
                reject({ status: 500, message: 'DB error' })
            }
        });
    })
}

const findOne = (table, _id) => {
    return new Promise((accept, reject) => {
        collection(table).find({ _id }, (err, docs) => {
            if (!err) {
                if (!docs || docs.length === 0) {
                    reject({ status: 404, message: `Record not found with id = ${_id}` });
                } else {
                    accept(docs[0]);
                }
            } else {
                console.error('DB error:' + err);
                reject({ status: 500, message: `Something went wrong while retrieving record with id = ${_id}` });
            }
        });
    })
}

const remove = (table, _id) => {
    return new Promise((accept, reject) => {
        collection(table).remove({ _id }, {}, (err, numRemoved) => {
            if (!err) {
                if (numRemoved === 1) {
                    accept({});
                } else {
                    reject({ status: 404, message: `Record with id = ${_id} - not found` })
                }
            } else {
                console.error('DB error:' + err);
                reject({ status: 500, message: `Something went wrong while deleting record with id = ${_id}` })
            }
        });
    })
}

module.exports =  {
    create,
    update,
    findAll,
    findOne,
    remove, 
    collection
}

