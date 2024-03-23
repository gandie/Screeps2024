const helpers = {
    bodyCost: function(body) {
        let sum = 0
        for (let item of body) {
            sum += BODYPART_COST[item]
        }
        return sum
    }
}

module.exports = helpers;
