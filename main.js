// static mining creeps, aka "lean"
// harvesters have no CARRY body parts, so they drop
// energy to the ground, which is picked up by logistics.
// upgrader and builder pick energy from container
// which is expected to be present
var lean_harvester = require('lean_harvester')
var lean_logistics = require('lean_logistics')
var lean_upgrader = require('lean_upgrader')
var lean_builder = require('lean_builder')

// WIP: remote ( working in other room ) creeps
var remote_miner = require('remote_miner')

// continued tutorial stuff
var roleHarvester = require('harvester')
var roleUpgrader = require('upgrader')
var roleBuilder = require('builder')

// room based stuff
var towers = require('towers')
var auto_buildings = require('auto_buildings')
var room_balancer = require('room_balancer')
var spawner = require('spawner')
var room_initializer = require('room_initializer')


var role_map = {
    lean_harvester,
    lean_logistics,
    lean_upgrader,
    lean_builder,
    'harvester': roleHarvester,
    'upgrader': roleUpgrader,
    'builder': roleBuilder,
}

module.exports.loop = function () {

    for(let room in Game.rooms) {
        // WIP: There should be an initializer or something an we should
        // switch to calculating possible mining spots and assign them
        // via room memory. The spice must flow.

        room_initializer.run(room)

        spawner.run(room)
        room_balancer.run(room)
        auto_buildings.run(room)
        towers.run(room)
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        for (var role_name in role_map) {
            var role_strat = role_map[role_name]
            if (creep.memory.role == role_name) {
                role_strat.run(creep)
                break
            }
        }
    }
}
