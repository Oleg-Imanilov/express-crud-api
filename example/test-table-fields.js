const { Field } = require('..');

module.exports = [
    Field({
        name: 'minimal',
    }),
    Field({
        name: 'date',
        label: 'Date',
        type: 'string',
        required: true
    }),
    Field({ name: 'description', label: 'Description', defval: 'N/A' }),
    Field({
        name: 'amount',
        label: 'Amount',
        type: 'number'
    }),
    Field({
        name: 'tags',
        label: 'Comma separated tags',
        type: 'array'
    })
];