const fs = require('fs');
const path = require('path');

const PATH_PREFIX = process.env.db || 'data';
const _db = {};

const testDir = (table) => {
    if (!_db[table]) {
        const dir = path.resolve(PATH_PREFIX, table);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true }, (err) => {
                if (err) throw err;
            });
        }
        const stats = fs.statSync(dir);
        if (!stats.isDirectory()) {
            throw 'FS problem';
        }
        _db[table] = { dir, id: Date.now() };
    }
    return _db[table];
}

const fName = (table, id) => {
    const dir = path.resolve(PATH_PREFIX, table);
    return path.resolve(dir, id + '.json');
}

const create = (table, doc) => {
    return new Promise((accept, reject) => {
        try {
            testDir(table);
            const _id = _db[table].id++;
            const fileName = fName(table, _id);
            doc._id = _id;
            fs.writeFileSync(fileName, JSON.stringify(doc, null, 2));
            accept(doc);
        } catch (err) {
            console.error('FS error:' + err);
            reject({ status: 500, message: 'FS error' })
        }
    });
}

const update = (table, _id, newObj) => {
    return new Promise((accept, reject) => {
        try {
            testDir(table);
            const fileName = fName(table, _id);
            const txt = fs.readFileSync(fileName);
            const doc = JSON.parse(txt);
            Object.assign(doc, newObj);
            doc._id = _id; // be sure not to change _id
            fs.writeFileSync(fileName, JSON.stringify(doc, null, 2));
            accept(doc);
        } catch (err) {
            console.error('FS error:' + err);
            reject({ status: 500, message: 'FS error' })
        }
    });
}

const findAll = (table) => {
    return new Promise((accept, reject) => {
        try {
            const { dir } = testDir(table);
            const files = fs.readdirSync(dir);
            const docs = files.filter(f => f.match(/\.json$/).index>0).map((f) => {
                const txt = fs.readFileSync(path.resolve(dir,f));
                return JSON.parse(txt);
            });
            accept(docs);
        } catch (err) {
            console.error('FS error:' + err);
            reject({ status: 500, message: 'FS error' })
        }
    });
}

const findOne = (table, _id) => {
    return new Promise((accept, reject) => {
        try {
            testDir(table);
            const fileName = fName(table, _id);
            const txt = fs.readFileSync(fileName);
            const doc = JSON.parse(txt);
            accept(doc);
        } catch (err) {
            console.error('FS error:' + err);
            reject({ status: 500, message: 'FS error' })
        }
    })
}

const remove = (table, _id) => {
    return new Promise((accept, reject) => {
        try {
            testDir(table);
            const fileName = fName(table, _id);
            fs.unlinkSync(fileName);
            accept({});
        } catch (err) {
            console.error('FS error:' + err);
            reject({ status: 500, message: 'FS error' })
        }
    });
}

module.exports = {
    create,
    update,
    findAll,
    findOne,
    remove
}

