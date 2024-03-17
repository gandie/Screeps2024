var leanLogistics = {

    /** @param {Creep} creep **/
    run: function(creep) {

        var colleagues = _.filter(
            Game.creeps,
            (othercreep) => (
                (othercreep.memory.role == creep.memory.role) &&
                (othercreep.memory.room == creep.memory.room) &&
                (othercreep.name != creep.name)
            )
        )

        if(creep.memory.shipping && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.shipping = false;
            creep.say('🔄 fetch');
        }
        if(!creep.memory.shipping && creep.store.getFreeCapacity() == 0) {
            creep.memory.shipping = true;
            creep.memory.cur_pickup_tgt = null;
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
                        return structure.structureType == STRUCTURE_TOWER &&
                               structure.store.getFreeCapacity(RESOURCE_ENERGY) > 100;
                    }
                });
            }
            if(!targets.length) {
                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER ||
                                structure.structureType == STRUCTURE_STORAGE ) &&
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

            var target = Game.getObjectById(creep.memory.cur_pickup_tgt);
            if (!target) {
                var targets = creep.room.find(FIND_DROPPED_RESOURCES);
                for (var tgt_index in targets) {
                    var cur_tgt = targets[tgt_index];
                    var taken = false;
                    for (var colleague_index in colleagues) {
                        var cur_colleague = colleagues[colleague_index];
                        if (cur_colleague.memory.cur_pickup_tgt == cur_tgt.id) {
                            taken = true;
                        }
                    }
                    if (!taken) {
                        creep.memory.cur_pickup_tgt = cur_tgt.id;
                        break;
                    }
                }
            } else {
                if(creep.pickup(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }

        }
    }
};

module.exports = leanLogistics;