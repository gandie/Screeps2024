const helpers = require('helpers')

var roleUpgrader = {
    calc_config: function(cur_room, level) {
        var containers = cur_room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER)
            }
        })
        var has_container = containers.length != 0
        let mining_spots = cur_room.memory.mining_spots
        let mining_spots_count = Object.keys(mining_spots).length

        this.cfg.limit = Math.floor(mining_spots_count / 3)

        if ((level > 2) && has_container) {
            this.cfg.limit = 0
            return
        }

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

        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
            creep.memory.upgrading = true;
            creep.say('⚡ upgrade');
        }

        if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            let mining_spot = creep.room.memory.mining_spots[creep.memory.mining_spot_idx]
            let target = creep.room.getPositionAt(mining_spot.x, mining_spot.y)
            let source = Game.getObjectById(mining_spot.source_id)
            if (!creep.pos.isEqualTo(target)) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            } else {
                creep.harvest(source)
            }
        }
    }
};

module.exports = roleUpgrader;
