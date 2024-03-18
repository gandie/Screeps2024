var auto_buildings = {

    run: function(room) {
        var cur_room = Game.rooms[room]
        var cur_controller = cur_room.controller
        var spawn = cur_room.find(FIND_MY_SPAWNS)[0]
        if (!cur_room.memory.build_tasks) {
            cur_room.memory.build_tasks = {}
        }

        /* clearFlags debug function
        var flags = cur_room.find(FIND_FLAGS)
        for (i in flags) {
            flags[i].remove()
        }
        */

        // level 1 buildings: roads to both sources
        if (cur_controller.level >= 1) {
            if (!cur_room.memory.build_tasks.road_first_source) {
                // XXX: this can be wrapped to build-road function!
                var first_source = cur_room.find(FIND_SOURCES)[0]
                var mypath = cur_room.findPath(
                    spawn.pos,
                    first_source.pos,
                    {
                        ignoreCreeps: true,
                    }
                )
                mypath.splice(-1, 1)                
                for (var pos_idx in mypath) {
                    var path_pos = mypath[pos_idx]
                    var room_pos = cur_room.getPositionAt(path_pos.x, path_pos.y)
                    room_pos.createConstructionSite(STRUCTURE_ROAD)
                }
                cur_room.memory.build_tasks.road_first_source = true
            }
            if (!cur_room.memory.build_tasks.road_second_source) {
                var second_source = cur_room.find(FIND_SOURCES)[1]
                var mypath = cur_room.findPath(
                    spawn.pos,
                    second_source.pos,
                    {
                        ignoreCreeps: true,
                    }
                )
                mypath.splice(-1, 1)
                for (var pos_idx in mypath) {
                    var path_pos = mypath[pos_idx]
                    var room_pos = cur_room.getPositionAt(path_pos.x, path_pos.y)
                    room_pos.createConstructionSite(STRUCTURE_ROAD)
                }
                cur_room.memory.build_tasks.road_second_source = true
            }
        }
        // level 2 buildings: 5 extensions! road to controller
        if (cur_controller.level >= 2) {
            if (!cur_room.memory.build_tasks.lvl2_extensions) {
                for (let x_coord = -2; x_coord < 3; x_coord = x_coord + 2) {
                    for (let y_coord = -2; y_coord < 3; y_coord = y_coord + 2) {
                        if (x_coord == 0 && y_coord == 0) {
                            continue
                        }
                        var newpos = cur_room.getPositionAt(
                            spawn.pos.x + x_coord,
                            spawn.pos.y + y_coord
                        )
                        newpos.createConstructionSite(STRUCTURE_EXTENSION)
                        console.log(newpos)
                    }
                }
                cur_room.memory.build_tasks.lvl2_extensions = true
            }
            if (!cur_room.memory.build_tasks.lvl2_road_to_controller) {
                var mypath = cur_room.findPath(
                    spawn.pos,
                    cur_controller.pos,
                    {
                        ignoreCreeps: true,
                    }
                )
                mypath.splice(-1, 1)
                for (var pos_idx in mypath) {
                    var path_pos = mypath[pos_idx]
                    var room_pos = cur_room.getPositionAt(path_pos.x, path_pos.y)
                    room_pos.createConstructionSite(STRUCTURE_ROAD)
                }
                cur_room.memory.build_tasks.lvl2_road_to_controller = true
            }
        }

    }
};

module.exports = auto_buildings;
