function bodyCost(body)
{
    let sum = 0;
    for (let i in body)
        sum += BODYPART_COST[body[i]];
    return sum;
}

var spawner = {
    run: function(room) {

        var cur_room = Game.rooms[room];
        const cur_spawn = cur_room.find(FIND_MY_SPAWNS)[0];

        // Make sure each room has memory.sources
        // and memory.spawn_limits set, both are needed
        if (!cur_room.memory.sources) {
            cur_room.memory = {
                sources: {
                    0: {
                        cur: 0,
                        limit: 2,
                    },
                    1: {
                        cur: 0,
                        limit: 2,
                    },
                }
            }
        }
        if (!cur_room.memory.spawn_limits) {
            cur_room.memory.spawn_limits = {
                harvester: 0,
                lean_harvester: 0,
                upgrader: 0,
                lean_upgrader: 0,
                builder: 0,
                lean_builder: 0,
                lean_logistics: 0,
            }
        }

        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                if (Memory.creeps[name].role == 'lean_harvester') {
                    if (Memory.creeps[name].source) {
                        Memory.rooms[Memory.creeps[name].room].sources[Memory.creeps[name].source].cur -= 1;
                    }
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
                    room: room,
                },
            },
            lean_harvester: {
                body: [WORK,MOVE],
                upgrade_tmpl: [WORK],
                vital: true,
                memory: {
                    role: "lean_harvester",
                    room: room,
                },
            },
            lean_logistics: {
                body: [CARRY,MOVE],
                upgrade_tmpl: [CARRY,MOVE],
                vital: true,
                memory: {
                    role: "lean_logistics",
                    room: room,
                },
            },
            lean_upgrader: {
                body: [WORK,CARRY,MOVE],
                upgrade_tmpl: [WORK,CARRY,MOVE,MOVE],
                vital: false,
                memory: {
                    role: "lean_upgrader",
                    room: room,
                },
            },
            lean_builder: {
                body: [WORK,CARRY,MOVE],
                upgrade_tmpl: [WORK,CARRY,MOVE,MOVE],
                vital: false,
                memory: {
                    role: "lean_builder",
                    room: room,
                },
            },
            builder: {
                body: [WORK,CARRY,MOVE],
                upgrade_tmpl: [WORK,MOVE],
                vital: false,
                memory: {
                    role: "builder",
                    room: room,
                },
            },
            upgrader: {
                body: [WORK,CARRY,MOVE],
                upgrade_tmpl: [WORK,MOVE],
                vital: false,
                memory: {
                    role: "upgrader",
                    room: room,
                },
            },
        }

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

            while (bodyCost(role_settings.body) < energy_limit - bodyCost(upgrade_tmpl)) {
                role_settings.body.push(...upgrade_tmpl);
            }
        }

        if (!cur_spawn.spawning) {
            for(var role in roles) {
                var role_settings = roles[role];
                var role_creeps =  _.filter(
                    Game.creeps,
                    (creep) => (creep.memory.role == role) && (creep.memory.room == room)
                );
                var role_limit = cur_room.memory.spawn_limits[role];

                // limit override for builder: dont spawn if nothing to build
                if (role == 'builder' || role == 'lean_builder') {
                    if (!cur_room.find(FIND_CONSTRUCTION_SITES).length) {
                        role_limit = 0;
                    }
                }

                if (role_creeps.length < role_limit) {
                    var newName = role + Game.time;
    
                    var canspawn = cur_spawn.spawnCreep(
                        role_settings.body,
                        newName,
                        {
                            memory: role_settings.memory,
                            dryRun: true,
                        }
                    )
                    if (canspawn == 0) {
                        console.log("Spawning new: " + newName);
                        cur_spawn.spawnCreep(
                            role_settings.body,
                            newName,
                            {
                                memory: role_settings.memory,
                            }
                        )
                        // lean_harvester track which source they are mining, so we prepare
                        // room and creep memory
                        if (role == 'lean_harvester') {
                            for(var source_index in cur_room.memory.sources) {
                                var cur_source = cur_room.memory.sources[source_index];
                                if (cur_source.cur < cur_source.limit) {
                                    cur_source.cur += 1;
                                    role_settings.memory['source'] = source_index;
                                    console.log("lean_harvester found source: " + source_index)
                                    break;
                                }
                            }
                        }
                    }
                    return;
                }
            }
        }
    }
}


module.exports = spawner;
