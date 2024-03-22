function bodyCost(body) {
    let sum = 0;
    for (let i in body)
        sum += BODYPART_COST[body[i]];
    return sum
}
var room_balancer = {
    calc_upgrade_limit: function(role) {
        // XXX: this must cooperate with room_balancer.update_spawn_limits()
        // 1500 game ticks time to live per creep
        // 3000 energy per 300 game ticks per source
        let work_parts = 1 + Math.ceil(
            (3000) /
            (300 * HARVEST_POWER)
        )
        return work_parts
    },
    upgrade_bodies: function(cur_room) {
        // Upgrade calculator
        // There should be some way to calculate wether we can afford waiting
        // for better creep or if we are in some kind of emergency mode, e.g. we
        // dont generate income as we have no harvesters/logistics
        for(var role in cur_room.memory.spawn_cfg) {
            var role_settings = cur_room.memory.spawn_cfg[role];
            var upgrade_tmpl = role_settings.upgrade_tmpl;

            // energyAvailable is our default energy limit trying to build
            // creep as soon as possible
            var energy_limit = cur_room.energyAvailable;

            if (role_settings.vital) {
                var creeps = _.filter(
                    Game.creeps,
                    (creep) => (
                        (creep.memory.room == cur_room.name) &&
                        (creep.memory.role == role)
                    )
                )
                // this might be too naive:
                // maybe also consider ttl and pairs of lean harvesters and logistics
                if (creeps.length) {
                    energy_limit = cur_room.energyCapacityAvailable
                }
            }

            const upgrade_limit = this.calc_upgrade_limit(role)
            let upgrade_count = 0
            while (
                bodyCost(role_settings.body) < energy_limit - bodyCost(upgrade_tmpl) &&
                upgrade_count < upgrade_limit
            ) {
                upgrade_count++
                role_settings.body.push(...upgrade_tmpl)
            }
        }
    },
    update_spawn_limits: function(cur_room) {
        let sources = cur_room.find(FIND_SOURCES)
        let lean_harvesters = _.filter(
            Game.creeps,
            (creep) => (creep.memory.role == "lean_harvester") && (creep.room == cur_room)
        )
        let work_parts
        if (lean_harvesters.length > 0) {
            weakest_harvester = lean_harvesters.reduce(
                (prev, cur) => cur.body.length < prev.body.length ? cur : prev
            )
            work_parts = weakest_harvester.body.length - 1
        } else {
            work_parts = 1
        }
        // 1500 game ticks time to live per creep
        // 3000 energy per 300 game ticks per source
        let harvesters_needed = Math.ceil(
            (3000 * sources.length) /
            (work_parts * HARVEST_POWER * 300)
        )

        cur_room.memory.spawn_limits.lean_harvester = harvesters_needed

    },
    run: function(room) {
        var cur_room = Game.rooms[room]
        var cur_controller = cur_room.controller
        this.upgrade_bodies(cur_room)
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
            if (has_storage && storages[0].store.getUsedCapacity(RESOURCE_ENERGY) > 100000) {
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
