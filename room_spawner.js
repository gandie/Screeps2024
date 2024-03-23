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
    run: function(room, role_map) {
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

        const level = cur_room.controller.level
        Object.values(role_map).forEach(
            item => {
                if (item.calc_config) {
                    item.calc_config(cur_room, level)
                }
            }
        )

        if (cur_spawn.spawning) {
            return
        }

        for (const role in role_map) {
            const role_obj = role_map[role]
            const role_limit = role_obj.cfg.limit
            const role_count =  _.filter(
                Game.creeps,
                (creep) => (creep.memory.role == role) && (creep.memory.room == room)
            ).length
            if (role_count < role_limit) {
                const newName = role + Game.time
                role_obj.cfg.memory['room'] = room
                let canspawn = cur_spawn.spawnCreep(
                    role_obj.cfg.body,
                    newName,
                    {
                        memory: role_obj.cfg.memory,
                        dryRun: true,
                    }
                )
                if ((canspawn == 0) && (role_obj.cfg.memory.use_mining_spot)) {
                    let res = this.find_mining_slot(cur_room, role)
                    if (!res) {
                        canspawn = 1
                    } else {
                        res.spot.cur += 1
                        role_obj.cfg.memory['mining_spot_idx'] = res.mining_spot_idx
                        console.log(`Mining spot assigned ${res.mining_spot_idx}`)
                    }
                }
    
                if (canspawn == 0) {
                    console.log("Spawning new: " + newName);
                    cur_spawn.spawnCreep(
                        role_obj.cfg.body,
                        newName,
                        {
                            memory: role_obj.cfg.memory,
                        }
                    )
                    return
                }
            }
        }
    }
}


module.exports = spawner;
