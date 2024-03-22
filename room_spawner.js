function bodyCost(body)
{
    let sum = 0;
    for (let i in body)
        sum += BODYPART_COST[body[i]];
    return sum;
}

var spawner = {

    find_mining_slot: function(cur_room, role) {
        let sources = cur_room.find(FIND_SOURCES)
        let free_spots = []

        for (let source of sources) {
            free_spots.push(
                _.filter(
                    cur_room.memory.mining_spots,
                    (spot) => (spot.cur == 0) && (spot.source_id == source.id)
                )
            )
        }

        // pick the longest spot list
        let spots_to_use = free_spots.reduce(
            (prev, curr) => prev.length > curr.length ? prev : curr
        )

        if (!spots_to_use.length) {
            console.log("No spots available for role: " + role)
            return null
        }

        let spot = spots_to_use[0]
        let mining_spot_idx = cur_room.memory.mining_spots.indexOf(spot)

        return {mining_spot_idx: mining_spot_idx, spot: spot}

    },
    calc_upper_work_limit: function() {
        // 1500 game ticks time to live per creep
        // 3000 energy per 300 game ticks per source
        let work_parts = 1 + Math.ceil(
            (3000) /
            (300 * HARVEST_POWER)
        )
        return work_parts
    },
    run: function(room) {

        var cur_room = Game.rooms[room]
        const cur_spawn = cur_room.find(FIND_MY_SPAWNS)[0]
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                if ((Memory.creeps[name].use_mining_spot)) {
                    Memory.rooms[Memory.creeps[name].room].mining_spots[Memory.creeps[name].mining_spot_idx].cur -= 1
                }
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }

        var roles = {
            harvester: {
                body: [WORK,CARRY,MOVE],
                upgrade_tmpl: [WORK,MOVE],
                vital: true,
                memory: {
                    role: "harvester",
                    use_mining_spot: true,
                },
            },
            lean_harvester: {
                body: [WORK,MOVE],
                upgrade_tmpl: [WORK],
                vital: true,
                memory: {
                    role: "lean_harvester",
                    use_mining_spot: true,
                },
            },
            lean_logistics: {
                body: [CARRY,MOVE],
                upgrade_tmpl: [CARRY,MOVE],
                vital: true,
                memory: {
                    role: "lean_logistics",
                },
            },
            lean_upgrader: {
                body: [WORK,CARRY,MOVE],
                upgrade_tmpl: [WORK,CARRY,MOVE,MOVE],
                vital: false,
                memory: {
                    role: "lean_upgrader",
                },
            },
            lean_builder: {
                body: [WORK,CARRY,MOVE],
                upgrade_tmpl: [WORK,CARRY,MOVE,MOVE],
                vital: false,
                memory: {
                    role: "lean_builder",
                },
            },
            builder: {
                body: [WORK,CARRY,MOVE],
                upgrade_tmpl: [WORK,MOVE],
                vital: false,
                memory: {
                    role: "builder",
                    use_mining_spot: true,
                },
            },
            upgrader: {
                body: [WORK,CARRY,MOVE],
                upgrade_tmpl: [WORK,MOVE],
                vital: false,
                memory: {
                    role: "upgrader",
                    use_mining_spot: true,
                },
            },
        }

        // XXX: This guy needs an upgrade: We need upper limits on body costs,
        // because with growing extensions we dont want to spend too much
        // energy on upgrading lean_harvesters and other creeps.
        // Upgrade calculator
        // There should be some way to calculate wether we can afford waiting
        // for better creep or if we are in some kind of emergency mode, e.g. we
        // dont generate income as we have no harvesters/logistics
        for(var role in roles) {
            var role_settings = roles[role];
            var upgrade_tmpl = role_settings.upgrade_tmpl;

            // energyAvailable is our default energy limit trying to build
            // creep as soon as possible
            var energy_limit = cur_room.energyAvailable;

            if (role_settings.vital) {
                var creeps = _.filter(
                    Game.creeps,
                    (creep) => (
                        (creep.memory.room == room) &&
                        (creep.memory.role == role)
                    )
                )
                // this might be too naive:
                // maybe also consider ttl and pairs of lean harvesters and logistics
                if (creeps.length) {
                    energy_limit = cur_room.energyCapacityAvailable
                }
            }

            while (
                bodyCost(role_settings.body) < energy_limit - bodyCost(upgrade_tmpl) &&
                role_settings.body.filter(item => item == WORK).length <= this.calc_upper_work_limit()
                ) {
                role_settings.body.push(...upgrade_tmpl);
            }
        }

        for(var role in roles) {

            if (cur_spawn.spawning) {
                break
            }

            var role_settings = roles[role];
            var role_creeps =  _.filter(
                Game.creeps,
                (creep) => (creep.memory.role == role) && (creep.memory.room == room)
            );
            var role_limit = cur_room.memory.spawn_limits[role];

            if (role_creeps.length < role_limit) {
                var newName = role + Game.time;

                role_settings.memory['room'] = room

                var canspawn = cur_spawn.spawnCreep(
                    role_settings.body,
                    newName,
                    {
                        memory: role_settings.memory,
                        dryRun: true,
                    }
                )
                if ((canspawn == 0) && (role_settings.memory.use_mining_spot)) {
                    let res = this.find_mining_slot(cur_room, role)
                    if (!res) {
                        canspawn = 1
                    } else {
                        res.spot.cur += 1
                        role_settings.memory['mining_spot_idx'] = res.mining_spot_idx
                        console.log(`Mining spot assigned ${res.mining_spot_idx}`)
                    }
                }

                if (canspawn == 0) {
                    console.log("Spawning new: " + newName);
                    cur_spawn.spawnCreep(
                        role_settings.body,
                        newName,
                        {
                            memory: role_settings.memory,
                        }
                    )
                    return
                }
            }
        }
    }
}


module.exports = spawner;
