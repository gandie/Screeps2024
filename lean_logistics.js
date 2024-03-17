var leanLogistics = {

    /** @param {Creep} creep **/
    run: function(creep) {


        if(creep.memory.shipping && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.shipping = false;
            creep.say('🔄 fetch');
        }
        if(!creep.memory.shipping && creep.store.getFreeCapacity() == 0) {
            creep.memory.shipping = true;
            creep.say('⚡ shipping');
        }

        if (creep.memory.shipping) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            if(!targets.length) {
                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_CONTAINER &&
                               structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
            }
            if(!targets.length) {
                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_TOWER &&
                               structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
            }
            if (targets.length) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#0000ff'}});
                }
            }            
        } else {
            const target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
            if(target) {
                if(creep.pickup(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }            
        }
    }
};

module.exports = leanLogistics;