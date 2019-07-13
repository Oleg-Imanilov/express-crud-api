// TBD...
module.exports = {
    string: {
        o2s: o => o,
        s2o: s => s,
        type: { type: 'string'}
    },
    number: {
        o2s: o => o.toString(10),
        s2o: s => parseFloat(s),
        type: { type: 'number'}
    },
    date: { // format: 'yyyy-month-date'
        o2s: o => `${o.getFullYear()}-${o.getMonth() + 1}-${o.getDate()}`,
        s2o: s => { const [year, month, date] = s.split(/[\/ \t-]+/); return new Date(year, month - 1, date) },
        type: { type: 'number'}
    },
    datetime: { // format: 'yyyy-month-date h:m:s'
        o2s: o => `${o.getFullYear()}-${o.getMonth() + 1}-${o.getDate()} ${o.getHours()}:${o.getMinutes()}:${o.getSeconds()}`,
        s2o: s => { const [year, month, date, h, m, sec] = s.split(/[\/-: \t]+/); return new Date(year, month - 1, date, h, m, sec) }
    },
    json: {
        o2s: o => JSON.stringify(o),
        s2o: s => JSON.parse(s)
    },
    array: {
        o2s: o => JSON.stringify(o),
        s2o: s => JSON.parse(s)
    }    
}