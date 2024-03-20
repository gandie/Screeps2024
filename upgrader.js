var roleUpgrader = {

    /** @param {Creep} creep **/
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
