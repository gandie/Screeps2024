const helpers = require('helpers')

var leanLogistics = {
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

        this.cfg.limit = 4
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

        if (creep.spawning) {
            return
        }

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
                const closest = creep.pos.findClosestByRange(targets);
                if(creep.transfer(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closest, {visualizePathStyle: {stroke: '#0000ff'}});
                }
            }            
        } else {

            var target = Game.getObjectById(creep.memory.cur_pickup_tgt);
            if (!target) {
                let pickup_tgts = colleagues.map((colleague) => (colleague.memory.cur_pickup_tgt))
                var targets = creep.room.find(FIND_DROPPED_RESOURCES).filter(
                    r => pickup_tgts.indexOf(r.id) == -1
                )
                if(targets.length) {
                    target = creep.pos.findClosestByRange(targets)
                    creep.memory.cur_pickup_tgt = target.id
                }

            }
            if (target) {
                if(creep.pickup(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#0000ff'}});
                }
            }

        }
    }
};

module.exports = leanLogistics;