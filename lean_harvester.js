var leanHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        console.log(`leanHarvester: ${creep.name} cfg body: ${this.cfg.body}`)
        let mining_spot = creep.room.memory.mining_spots[creep.memory.mining_spot_idx]
        let target = creep.room.getPositionAt(mining_spot.x, mining_spot.y)
        let source = Game.getObjectById(mining_spot.source_id)
        if (!creep.pos.isEqualTo(target)) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        } else {
            creep.harvest(source)
        }
    }
};

module.exports = leanHarvester;