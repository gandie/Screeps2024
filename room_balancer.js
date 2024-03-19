var room_balancer = {
    run: function(room) {
        var cur_room = Game.rooms[room]
        var cur_controller = cur_room.controller

        var containers = cur_room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER)
            }
        })
        var has_container = containers.length != 0

        var storages = cur_room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_STORAGE)
            }
        })
        var has_storage = storages.length != 0

        var construction_sites = cur_room.find(FIND_CONSTRUCTION_SITES)
        var construction_pending = construction_sites.length != 0

        if (cur_controller.level >= 1) {
            cur_room.memory.spawn_limits.harvester = 2
            cur_room.memory.spawn_limits.upgrader = 2
            if (construction_pending) {
                cur_room.memory.spawn_limits.builder = 3
            } else {
                cur_room.memory.spawn_limits.builder = 0
            }
        }

        if (cur_controller.level >= 3) {
            if (has_container) {
                cur_room.memory.spawn_limits.harvester = 0
                cur_room.memory.spawn_limits.upgrader = 0
                cur_room.memory.spawn_limits.builder = 0

                cur_room.memory.spawn_limits.lean_harvester = 2
                cur_room.memory.spawn_limits.lean_logistics = 2
                cur_room.memory.spawn_limits.lean_upgrader = 1
                cur_room.memory.spawn_limits.lean_builder = 0
            }
            if (construction_pending && has_container) {
                cur_room.memory.spawn_limits.lean_builder = 1
            }
        }

        if (cur_controller.level >= 4) {
            if (has_storage && storages[0].store.getUsedCapacity(RESOURCE_ENERGY) > 10000) {
                cur_room.memory.switches.lvl4_filledstorage = true
                cur_room.memory.spawn_limits.lean_upgrader = 5
            } else {
                cur_room.memory.switches.lvl4_filledstorage = false
                cur_room.memory.spawn_limits.lean_upgrader = 3
            }
        }

    }
}

module.exports = room_balancer
