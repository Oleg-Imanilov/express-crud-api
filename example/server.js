// get dependencies
const express = require('express');
const bodyParser = require('body-parser');

process.env.db = 'nedb-data'; // default: 'data'

const { setup, Field, allow, ALLOW_ALL } = require('..'); // require('express-crud-api');

const app = express();

// body parser must be set before express-crud-api setup
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


//////////// !!! MAGIC STARTS !!! //////////////

// Override canDelete 
const allowAllButNoDelete = allow({
    canDelete: (req) => { return req.user && req.user.roles.indexOf('admin') >= 0 }
});

const apiConfig = {
    title: "My API",                // default 'API'
    description: 'Generated API',   // default 'Generated API'
    version: '1.0',                 // default '1.0'
    apiPrefix: '/api',              // default '/api'
    docPath: '/api-docs',           // default '/api-docs'
    collections: [
        {
            name: 'test',
            fields: require('./test-table-fields'),
            permit: allowAllButNoDelete // default: allowAll
        },
        {
            name: 'notes',
            fields: [
                Field({
                    name: 'text'
                })
            ],
            permit: ALLOW_ALL // default: allowAll
        }
    ]
}

const minimalConfig = {
    collections: [
        {
            name: 'notes',
            fields: [
                Field({ name: 'text' })
            ]
        }
    ]
}

// Make sure 'app.use(bodyParser.json())' comes before
setup(app, apiConfig);



//////////////// Other app logic goes here //////////////////

// default route
app.get('/', (req, res) => { res.redirect(apiConfig.docPath); });

// default route
app.get('/custom', (req, res) => { 
    // You can use any Nedb function
    collection('test').find({amount: { $gt: 10}}, (err, docs)=>{
        if(err) {
            res.status(500).send('Something bad happened');
        } else {
            res.json(docs);
        }
    });
});

// listen on port 3000
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});


