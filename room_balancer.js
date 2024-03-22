var room_balancer = {

    update_spawn_limits: function(cur_room) {
        let sources = cur_room.find(FIND_SOURCES)
        let lean_harvesters = _.filter(
            Game.creeps,
            (creep) => (creep.memory.role == "lean_harvester") && (creep.room == cur_room)
        )
        weakest_harvester = lean_harvesters.reduce(
            (prev, cur) => cur.body.length < prev.body.length ? cur : prev
        )
        // 1500 game ticks time to live per creep
        // 3000 energy per 300 game ticks per source
        let work_parts = weakest_harvester.body.length - 1
        let harvesters_needed = Math.ceil(
            (3000 * sources.length) /
            (work_parts * HARVEST_POWER * 300)
        )

        cur_room.memory.spawn_limits.lean_harvester = harvesters_needed

    },
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

        let mining_spots = cur_room.memory.mining_spots
        let mining_spots_count = Object.keys(mining_spots).length

        if (cur_controller.level >= 1) {

            let harvester_count = Math.floor(mining_spots_count / 3)

            cur_room.memory.spawn_limits.harvester = harvester_count

            let rem_count = mining_spots_count - harvester_count
            let upgrader_count = Math.floor(rem_count / 2)

            cur_room.memory.spawn_limits.upgrader = upgrader_count
            if (construction_pending) {
                cur_room.memory.spawn_limits.builder = upgrader_count
            } else {
                cur_room.memory.spawn_limits.builder = 0
            }
        }

        if (cur_controller.level >= 2) {
            if (has_container) {
                cur_room.memory.spawn_limits.harvester = 0
                cur_room.memory.spawn_limits.upgrader = 0
                cur_room.memory.spawn_limits.builder = 0

                cur_room.memory.spawn_limits.lean_harvester = mining_spots_count
                cur_room.memory.spawn_limits.lean_logistics = 4
                cur_room.memory.spawn_limits.lean_upgrader = 6
                cur_room.memory.spawn_limits.lean_builder = 0

                this.update_spawn_limits(cur_room)
            }
            if (construction_pending && has_container) {
                cur_room.memory.spawn_limits.lean_builder = 3
            }
        }

        if (cur_controller.level >= 4) {
            if (has_storage && storages[0].store.getUsedCapacity(RESOURCE_ENERGY) > 10000) {
                cur_room.memory.switches.lvl4_filledstorage = true
                cur_room.memory.spawn_limits.lean_upgrader = 8
            } else {
                cur_room.memory.switches.lvl4_filledstorage = false
                cur_room.memory.spawn_limits.lean_upgrader = 6
            }
        }

    }
}

module.exports = room_balancer
