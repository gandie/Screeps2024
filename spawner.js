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

        //console.log("Cur room energy: " + cur_room.energyAvailable + "/" + cur_room.energyCapacityAvailable);

        for(var name in Memory.creeps) {

            if(!Game.creeps[name]) {
                // XXX: Make this room aware as soon as all creeps have room in memory
                if (Memory.creeps[name].role == 'lean_harvester') {
                    Memory.rooms[Memory.creeps[name].room].sources[Memory.creeps[name].source].cur -= 1;
                }
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
    
        var roles = {
            harvester: {
                limit: 2,
                body: [WORK,CARRY,MOVE],
                upgrade_tmpl: [WORK,MOVE],
                memory: {
                    role: "harvester",
                    room: room,
                },
            },
            lean_harvester: {
                limit: 1,
                body: [WORK,MOVE],
                upgrade_tmpl: [WORK],
                memory: {
                    role: "lean_harvester",
                    room: room,
                },
            },
            lean_logistics: {
                limit: 1,
                body: [CARRY,MOVE],
                upgrade_tmpl: [CARRY,MOVE],
                memory: {
                    role: "lean_logistics",
                    room: room,
                },
            },
            builder: {
                limit: 1,
                body: [WORK,CARRY,MOVE],
                upgrade_tmpl: [WORK,MOVE],
                memory: {
                    role: "builder",
                    room: room,
                },
            },
            upgrader: {
                limit: 2,
                body: [WORK,CARRY,MOVE],
                upgrade_tmpl: [WORK,MOVE],
                memory: {
                    role: "upgrader",
                    room: room,
                },
            },
        }

        for(var role in roles) {
            var role_settings = roles[role];
            var upgrade_tmpl = role_settings.upgrade_tmpl;
            while (bodyCost(role_settings.body) < cur_room.energyAvailable - bodyCost(upgrade_tmpl)) {
                role_settings.body.push(...upgrade_tmpl);
            }
        }
    
        for(var role in roles) {
            var role_settings = roles[role];
            var role_creeps =  _.filter(Game.creeps, (creep) => creep.memory.role == role);
            if (role_creeps.length < role_settings.limit) {
                var newName = role + Game.time;
                console.log("Spawning new: " + newName);

                if (role == 'lean_harvester') {
                    for(var source_index in cur_room.memory.sources) {
                        var cur_source = cur_room.memory.sources[source_index];
                        if (cur_source.cur < cur_source.limit) {
                            cur_source.cur += 1;
                            //Memory.rooms[room].sources[source_index].cur += 1;
                            role_settings.memory['source'] = source_index;
                            console.log("lean_harvester found source: " + source_index)
                            break;
                        }
                    }
                }

                Game.spawns['Home'].spawnCreep(
                    role_settings.body,
                    newName,
                    {
                        memory: role_settings.memory,
                    }
                )
            }
        }

    }
}


module.exports = spawner;
