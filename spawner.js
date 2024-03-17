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
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
    
        var roles = {
            harvester: {
                limit: 2,
                body: [WORK,CARRY,MOVE],
            },
            builder: {
                limit: 2,
                body: [WORK,CARRY,MOVE],
            },
            upgrader: {
                limit: 3,
                body: [WORK,CARRY,MOVE],
            },
        }

        for(var role in roles) {
            var role_settings = roles[role];
            while (bodyCost(role_settings.body) < cur_room.energyAvailable - 150) {
                role_settings.body.push(WORK);
                role_settings.body.push(MOVE);
            }
        }
    
        for(var role in roles) {
            var role_settings = roles[role];
            var role_creeps =  _.filter(Game.creeps, (creep) => creep.memory.role == role);
            if (role_creeps.length < role_settings.limit) {
                var newName = role + Game.time;
                console.log("Spawning new: " + newName);
                Game.spawns['Home'].spawnCreep(
                    role_settings.body,
                    newName,
                    {
                        memory: {
                            role: role,
                        },
                    }
                )
            }
        }

    }
}


module.exports = spawner;
