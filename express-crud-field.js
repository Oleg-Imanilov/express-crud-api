module.exports = (opt = {}) => {
    const {name, label, defval, required, type } = opt;
    if(!name) {
        throw "name is required"
    }
    return {
        name,
        label,
        defval,
        required: !!required,
        type: type || 'string' // string | number | array
    }
}