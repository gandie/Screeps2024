const helpers = require('helpers')

var remote_miner = {
    calc_config: function(cur_room, level) {
        var containers = cur_room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER)
            }
        })
        var has_container = containers.length != 0

        if (!has_container) {
            return
        }

        this.cfg.limit = 0
        let energy_limit = cur_room.energyAvailable
        const upgrade_limit = 5
        let upgrade_count = 0
        while (
            helpers.bodyCost(this.cfg.body) < energy_limit - helpers.bodyCost(this.cfg.upgrade_tmpl) &&
            upgrade_count < upgrade_limit
        ) {
            upgrade_count++
            this.cfg.body.push(...this.cfg.upgrade_tmpl)
        }
    },
    run: function(creep) {
        console.log(`Remote miner runner called for creep: ${creep.name}`)
    }
};

module.exports = remote_miner;
