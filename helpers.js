const helpers = {
    bodyCost: function(body) {
        return body.reduce((a, b) => a + b, 0)
    }
}

module.exports = helpers;
