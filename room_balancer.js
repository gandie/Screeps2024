var room_balancer = {
    run: function(room) {
        var cur_room = Game.rooms[room]
        var cur_controller = cur_room.controller

        if (!cur_room.memory.switches) {
            cur_room.memory.switches = {
                'lvl4_filledstorage': false,
            }
        }

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

        console.log(
            `room balancer in ${room} control level ${cur_controller.level} ${has_container} ${has_storage}`
        )

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
