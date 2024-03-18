var auto_buildings = {

    run: function(room) {
        //console.log(`auto_buildings called for room: ${room}`)
        var cur_room = Game.rooms[room]
        var cur_controller = cur_room.controller

        if (cur_controller.level >= 1) {
            var spawn = cur_room.find(FIND_MY_SPAWNS)[0]
            var first_source = cur_room.find(FIND_SOURCES)[0]
            var mypath = cur_room.findPath(
                spawn.pos,
                first_source.pos,
                {
                    ignoreCreeps: true,
                }
            )
            for (var pos_idx in mypath) {
                var path_pos = mypath[pos_idx]
                var room_pos = cur_room.getPositionAt(path_pos.x, path_pos.y)
                room_pos.createConstructionSite(STRUCTURE_ROAD)
                //console.log(pos.x, pos.y)
            }
            //console.log(mypath)
        }
    }
};

module.exports = auto_buildings;
