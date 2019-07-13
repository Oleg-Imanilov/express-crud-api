# express-crud-api
Easy way to create express app with crud API and swagger

## Install

```
npm install express-crud-api
```

## Example od usage

```javascript
const express = require('express');
const bodyParser = require('body-parser');

const { setup, Field } = require('express-crud-api');

const app = express();

// body parser must be set before express-crud-api setup
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//////////// !!! MAGIC STARTS !!! //////////////

const apiConfig = {
    collections: [
        {
            name: 'notes',
            fields: [
                Field({
                    name: 'text'
                }),
                Field({
                    name: 'date'
                })
            ]
        }
    ]
}

// Make sure 'app.use(bodyParser.json())' comes before
setup(app, apiConfig);

//////////////// Other app logic goes here //////////////////

// default route
app.get('/', (req, res) => { res.redirect('/api-docs'); });

// listen on port 3000
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});

```

![Screenshot 1](https://github.com/Oleg-Imanilov/express-crud-api/blob/master/docs/screen-1.png?raw=true)
