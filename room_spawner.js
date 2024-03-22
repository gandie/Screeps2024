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

        for(var role in cur_room.memory.spawn_cfg) {

            if (cur_spawn.spawning) {
                break
            }

            var role_settings = cur_room.memory.spawn_cfg[role];
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
