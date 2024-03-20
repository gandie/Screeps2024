var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.store.getFreeCapacity() > 0) {
            let mining_spot = creep.room.memory.mining_spots[creep.memory.mining_spot_idx]
            let target = creep.room.getPositionAt(mining_spot.x, mining_spot.y)
            let source = Game.getObjectById(mining_spot.source_id)
            if (!creep.pos.isEqualTo(target)) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            } else {
                creep.harvest(source)
            }
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
    }
};

module.exports = roleHarvester;