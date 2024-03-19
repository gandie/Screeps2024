var auto_buildings = {

    clear_flags: function() {
        var flags = cur_room.find(FIND_FLAGS)
        for (let flag of flags) {
            flag.remove()
        }
    },
    build_road: function(room, from, to) {
        let mypath = room.findPath(
            from.pos,
            to.pos,
            {
                ignoreCreeps: true,
            }
        )
        mypath.splice(-1, 1)
        for (let path_pos of mypath) {
            let room_pos = room.getPositionAt(path_pos.x, path_pos.y)
            room_pos.createConstructionSite(STRUCTURE_ROAD)
        }
    },
    create_grid: function(pos, room) {
        let ops = []
        let combs = []

        for (let dist = 2; dist < 5; dist = dist + 2) {
            for (let mul = -1; mul < 2; mul++) {
                ops.push(dist * mul)
            }
        }

        for (let x of ops) {
            for (let y of ops) {
                let roompos = room.getPositionAt(
                    pos.x + x,
                    pos.y + y
                )
                if (room.lookForAt(LOOK_STRUCTURES, roompos).length) {
                    continue
                }
                if (room.lookForAt(LOOK_CONSTRUCTION_SITES, roompos).length) {
                    continue
                }
                combs.push(roompos)
            }
        }

        combs.sort((a, b) => {
            return pos.getRangeTo(a) - pos.getRangeTo(b)
        })

        return combs

    },
    run: function(room) {
        var cur_room = Game.rooms[room]
        var cur_controller = cur_room.controller
        var spawn = cur_room.find(FIND_MY_SPAWNS)[0]
        
        var construction_sites = cur_room.find(FIND_CONSTRUCTION_SITES)
        var construction_pending = construction_sites.length != 0

        // level 1 buildings: roads to both sources
        if (cur_controller.level >= 1) {
            if (!cur_room.memory.build_tasks.road_first_source) {
                let first_source = cur_room.find(FIND_SOURCES)[0]
                this.build_road(cur_room, spawn, first_source)
                cur_room.memory.build_tasks.road_first_source = true
            }
            if (!construction_pending && !cur_room.memory.build_tasks.road_second_source) {
                let second_source = cur_room.find(FIND_SOURCES)[1]
                this.build_road(cur_room, spawn, second_source)
                cur_room.memory.build_tasks.road_second_source = true
            }
        }
        // level 2 buildings: 5 extensions! road to controller
        if (cur_controller.level >= 2) {
            if (!construction_pending && !cur_room.memory.build_tasks.lvl2_extensions) {
                let grid = this.create_grid(spawn.pos, cur_room)
                for (let pos of grid) {
                    let res = pos.createConstructionSite(STRUCTURE_EXTENSION)
                }
                cur_room.memory.build_tasks.lvl2_extensions = true
            }
            if (!construction_pending && !cur_room.memory.build_tasks.lvl2_road_to_controller) {
                this.build_road(cur_room, spawn, cur_controller)
                cur_room.memory.build_tasks.lvl2_road_to_controller = true
            }
        }

        // another 5 extensions, tower
        if (cur_controller.level >= 3) {
            if (!construction_pending && !cur_room.memory.build_tasks.lvl3_extensions) {
                let grid = this.create_grid(spawn.pos, cur_room)
                for (let pos of grid) {
                    let res = pos.createConstructionSite(STRUCTURE_EXTENSION)
                }
                cur_room.memory.build_tasks.lvl3_extensions = true
            }

            if (!construction_pending && !cur_room.memory.build_tasks.lvl3_tower) {
                let grid = this.create_grid(spawn.pos, cur_room)
                for (let pos of grid) {
                    let res = pos.createConstructionSite(STRUCTURE_TOWER)
                }
                cur_room.memory.build_tasks.lvl3_tower = true
            }
            if (!construction_pending && !cur_room.memory.build_tasks.lvl3_container) {
                let grid = this.create_grid(spawn.pos, cur_room)
                for (let pos of grid) {
                    let res = pos.createConstructionSite(STRUCTURE_CONTAINER)
                    if (res == 0) {
                        break
                    }
                }
                cur_room.memory.build_tasks.lvl3_container = true
            }
        }
    }
};

module.exports = auto_buildings;
