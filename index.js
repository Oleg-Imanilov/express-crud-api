const swaggerUi = require('swagger-ui-express');

const Field = require('./express-crud-field');
const router = require('./express-crud-router');
const { swaggerDoc, swaggerAddTable } = require('./express-crud-swagger');
const { allow, deny } = require('./express-crud-permit');
const ALLOW_ALL = allow();

const setup = (app, apiConfig) => {
    const {
        database = 'nedb',
        title = 'API',
        description = 'Generated API',
        version = '1.0',
        apiPrefix = '/api',
        docPath = '/api-docs',
        collections
    } = apiConfig;

    let driver;
    switch (database) {
        case 'fs':
            driver = require('./express-crud-fs-driver');
            break;
        case 'nedb':
        default:
            driver = require('./express-crud-nedb-driver');
    }

    if (!collections) {
        throw 'API config must have collections array'
    }
    const swaggerDocument = swaggerDoc(title, description, version);
    collections.forEach((d) => {
        const { name, fields, permit = ALLOW_ALL } = d;
        if (!name) {
            throw `Collection must have a name`;
        }
        if (!fields) {
            throw `Collection must have fields array`;
        }
        swaggerAddTable(swaggerDocument, apiPrefix, name, fields);
        const crudRouter = router(name, fields, permit, driver);
        app.use(`${apiPrefix}/${name}`, crudRouter);
    });
    app.use(docPath, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

module.exports = {
    setup,
    Field,
    allow, deny,
    ALLOW_ALL
}