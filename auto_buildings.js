var auto_buildings = {

    run: function(room) {
        //console.log(`auto_buildings called for room: ${room}`)
        var cur_room = Game.rooms[room]
        var cur_controller = cur_room.controller
        if (!cur_room.memory.build_tasks) {
            cur_room.memory.build_tasks = {}
        }

        // level 1 buildings: roads to both sources
        if (cur_controller.level >= 1) {
            if (!cur_room.memory.build_tasks.road_first_source) {
                // XXX: this can be wrapped to build-road function!
                var spawn = cur_room.find(FIND_MY_SPAWNS)[0]
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
                var spawn = cur_room.find(FIND_MY_SPAWNS)[0]
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
        // level 2 buildings: 5 extensions!
        if (cur_controller.level >= 2) {
            var spawn = cur_room.find(FIND_MY_SPAWNS)[0]
            /*
            for (let x_coord = -2; x_coord < 3; x_coord + 2) {
                console.log(x_coord)
            }
            */
        }
    }
};

module.exports = auto_buildings;
