let room_initializer = {

    find_mining_spots: function(cur_room) {
        let positions = []
        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {
                let pos = cur_room.getPositionAt(x, y)
                positions.push(pos)
            }
        }

        let sources = cur_room.find(FIND_SOURCES)
        let neighbours = []
        for (let source of sources) {
            for (let pos of positions) {
                if (!source.pos.isNearTo(pos)) {
                    continue
                }
                pos.source_id = source.id
                neighbours.push(pos)
            }
        }

        let mining_spots = []
        for (let neighbour of neighbours) {
            if (neighbour.lookFor(LOOK_TERRAIN) != 'plain') {
                continue
            }
            neighbour.cur = 0
            mining_spots.push(neighbour)
        }
        return mining_spots
    },

    run: function(room, role_map) {
        let cur_room = Game.rooms[room]
        // global switches used by several modules

        if (!cur_room.memory.mining_spots) {
            cur_room.memory.mining_spots = this.find_mining_spots(cur_room)
        }

        if (!cur_room.memory.switches) {
            cur_room.memory.switches = {
                'lvl4_filledstorage': false,
            }
        }

        // auto building task tracking
        if (!cur_room.memory.build_tasks) {
            cur_room.memory.build_tasks = {}
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
            console.log(`Spawn limit memory initialized for room ${room}`)
        }


        let spawn_cfg = {
            harvester: {
                body: [WORK,CARRY,MOVE],
                upgrade_tmpl: [WORK,MOVE],
                vital: true,
                memory: {
                    role: "harvester",
                    use_mining_spot: true,
                },
                limit: 0,
            },
            lean_harvester: {
                body: [WORK,MOVE],
                upgrade_tmpl: [WORK],
                vital: true,
                memory: {
                    role: "lean_harvester",
                    use_mining_spot: true,
                },
                limit: 0,
            },
            lean_logistics: {
                body: [CARRY,MOVE],
                upgrade_tmpl: [CARRY,MOVE],
                vital: true,
                memory: {
                    role: "lean_logistics",
                },
                limit: 0,
            },
            lean_upgrader: {
                body: [WORK,CARRY,MOVE],
                upgrade_tmpl: [WORK,CARRY,MOVE,MOVE],
                vital: false,
                memory: {
                    role: "lean_upgrader",
                },
                limit: 0,
            },
            lean_builder: {
                body: [WORK,CARRY,MOVE],
                upgrade_tmpl: [WORK,CARRY,MOVE,MOVE],
                vital: false,
                memory: {
                    role: "lean_builder",
                },
                limit: 0,
            },
            builder: {
                body: [WORK,CARRY,MOVE],
                upgrade_tmpl: [WORK,MOVE],
                vital: false,
                memory: {
                    role: "builder",
                    use_mining_spot: true,
                },
                limit: 0,
            },
            upgrader: {
                body: [WORK,CARRY,MOVE],
                upgrade_tmpl: [WORK,MOVE],
                vital: false,
                memory: {
                    role: "upgrader",
                    use_mining_spot: true,
                },
                limit: 0,
            }
        }
        cur_room.memory.spawn_cfg = spawn_cfg
        // XXX: for now we use this hack to get a CLONE of the spawn_cfg
        Object.entries(JSON.parse(JSON.stringify(spawn_cfg))).map(
            (entry) => role_map[entry[0]]['cfg'] = entry[1]// console.log(, entry[1])
        )
    }
}

module.exports = room_initializer
