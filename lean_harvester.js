var leanHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var my_source = creep.room.find(FIND_SOURCES)[creep.memory.source];
        if(creep.harvest(my_source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(my_source, {visualizePathStyle: {stroke: '#00ff00'}});
        }
    }
};

module.exports = leanHarvester;