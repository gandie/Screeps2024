const helpers = require('helpers')

var leanHarvester = {
    calc_config: function(cur_room, level) {
        const containers = cur_room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER)
            }
        })
        const has_container = containers.length != 0

        if (!has_container) {
            return
        }

        let lean_harvesters = _.filter(
            Game.creeps,
            (creep) => (creep.memory.role == "lean_harvester") && (creep.room == cur_room)
        )

        let work_parts = 1

        if (lean_harvesters.length > 0) {
            weakest_harvester = lean_harvesters.reduce(
                (prev, cur) => cur.body.length < prev.body.length ? cur : prev
            )
            work_parts = weakest_harvester.body.length - 1
        }

        const sources = cur_room.find(FIND_SOURCES)
        const harvesters_needed = Math.ceil(
            (3000 * sources.length) /
            (work_parts * HARVEST_POWER * 300)
        )

        this.cfg.limit = harvesters_needed
        let energy_limit = cur_room.energyAvailable
        const upgrade_limit = 1 + Math.ceil(
            (3000) /
            (300 * HARVEST_POWER)
        )

        let upgrade_count = 0
        while (
            helpers.bodyCost(this.cfg.body) < energy_limit - helpers.bodyCost(this.cfg.upgrade_tmpl) &&
            upgrade_count < upgrade_limit
        ) {
            upgrade_count++
            this.cfg.body.push(...this.cfg.upgrade_tmpl)
        }

    },
    run: function(creep) {
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