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

    run: function(room) {
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

        // XXX: Improve this!
        // Make sure each room has memory.sources
        // and memory.spawn_limits set, both are needed
        if (!cur_room.memory.sources) {
            let sources = cur_room.find(FIND_SOURCES)
            var new_sources = {}
            for (var source_idx in sources) {
                new_sources[source_idx] = {
                    cur: 0,
                    limit: 2,
                }
            }
            cur_room.memory.sources = new_sources
            console.log(`Sources memory initialized for room ${room}`)
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


    }
}

module.exports = room_initializer
