var leanHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {

        let mining_spot = creep.room.memory.mining_spots[creep.memory.mining_spot_idx]
        let target = creep.room.getPositionAt(mining_spot.x, mining_spot.y)
        let source = Game.getObjectById(mining_spot.source_id)
        if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#00ff00'}});
        }

    }
};

module.exports = leanHarvester;