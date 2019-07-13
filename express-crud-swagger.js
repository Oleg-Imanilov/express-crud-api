module.exports = {
    swaggerDoc: (title, description, version) => {
        return {
            "swagger": "2.0",
            "info": { title, description, version },
            "definitions": {},
            "produces": ["application/json"],
            "paths": {}
        };
    },
    swaggerAddTable: (doc, apiPrefix, table, fields) => {
        doc.definitions[table] = {}
        const required = fields.filter((f) => { return f.required });
        if (required.length > 0) {
            doc.definitions[table].required = required.map(f => f.name);
        }
        doc.definitions[table].properties = {
            _id: { 'type': 'string' }
        };

        fields.forEach((f) => {
            if(f.type==='array') {
                doc.definitions[table].properties[f.name] = { type: 'array', items: {type: 'string'}};
            } else {
                doc.definitions[table].properties[f.name] = { type: f.type || 'string' }; 
            }
        });

        const opt = {
            tags: [table],
            parameters: [],
            responses: {}
        }

        const insertParams = fields.map((f) => {
            const ret = {
                'name': f.name,
                'in': 'formData',
                'description': f.label,
                'required': !!f.required,
            }
            if(f.type === 'array') {
                ret.type = 'array';
                ret.items = { type: 'string' }
            } else {
                ret.type = f.type || 'string'
            }   
            return ret;
        });

        doc.paths[`${apiPrefix}/${table}`] = {
            post: Object.assign({}, opt, {
                parameters: insertParams, responses: {
                    200: { 'description': `New inserted ${table}`, 'schema': { '$ref': `#/definitions/${table}` } },
                    400: { 'description': `Empty object` },
                    403: { 'description': `Forbiden operation` },
                    500: { 'description': `Database or internal error` }
                }
            }),
            get: Object.assign({}, opt, {
                responses: {
                    200: {
                        'description': `All ${table}s`, 'schema': {
                            'type': 'array',
                            items: { '$ref': `#/definitions/${table}` }
                        }
                    },
                    403: { 'description': `Forbiden operation` },
                    500: { 'description': `Database or internal error` }
                }
            })
        }

        const parameters = [{
            'name': 'id',
            'in': 'path',
            'required': true,
            'type': 'string'
        }]

        const updateParams = parameters.concat(fields.map((f) => {
            const ret = {
                'name': f.name,
                'in': 'formData',
                'required': false,
                'description': f.label,
            }
            if(f.type === 'array') {
                ret.type = 'array';
                ret.items = { type: 'string' }
            } else {
                ret.type = f.type || 'string'
            }   
            return ret;
        }));

        doc.paths[`${apiPrefix}/${table}/{id}`] = {
            put: Object.assign({}, opt, {
                parameters: updateParams, responses: {
                    200: { 'description': `Updated ${table}`, 'schema': { '$ref': `#/definitions/${table}` } },
                    400: { 'description': `Empty object` },
                    403: { 'description': `Forbiden operation` },
                    404: { 'description': `Object not found` },
                    500: { 'description': `Database or internal error` }
                }
            }),
            get: Object.assign({}, opt, {
                parameters, responses: {
                    200: { 'description': `The ${table} with Id`, 'schema': { '$ref': `#/definitions/${table}` } },
                    403: { 'description': `Forbiden operation` },
                    404: { 'description': `Object not found` },
                    500: { 'description': `Database or internal error` }
                }
            }),
            delete: Object.assign({}, opt, {
                parameters, responses: {
                    200: { 'description': 'Empty object', 'schema': {} },
                    403: { 'description': `Forbiden operation` },
                    404: { 'description': `Object not found` },
                    500: { 'description': `Database or internal error` }                    
                }
            })
        }
    }
}

