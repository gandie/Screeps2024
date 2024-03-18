var towers = {
    run: function(room) {

        var cur_room = Game.rooms[room]
        var towers = cur_room.find(
            FIND_MY_STRUCTURES,
            {
                filter: { structureType: STRUCTURE_TOWER },
            },
        )

        for (let tower_idx in towers) {
            var tower = towers[tower_idx]
            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
            });
            if(closestDamagedStructure) {
                tower.repair(closestDamagedStructure);
            }
    
            var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if(closestHostile) {
                tower.attack(closestHostile);
            }
        }

    }
}

module.exports = towers;
