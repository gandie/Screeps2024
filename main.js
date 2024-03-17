var roleHarvester = require('harvester');

var lean_harvester = require('lean_harvester');
var lean_logistics = require('lean_logistics');

var roleUpgrader = require('upgrader');
var roleBuilder = require('builder');
var spawner = require('spawner');
var tower = require('tower');

module.exports.loop = function () {

    tower.run();

    for(var room in Game.rooms) {
        var cur_room = Game.rooms[room];
        if (!cur_room.memory.sources) {
            cur_room.memory = {
                sources: {
                    0: {
                        cur: 0,
                        limit: 5,
                    },
                    1: {
                        cur: 0,
                        limit: 4,
                    },
                }
            }
        }
        spawner.run(room);
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];

        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if(creep.memory.role == 'lean_harvester') {
            lean_harvester.run(creep);
        }
        if(creep.memory.role == 'lean_logistics') {
            lean_logistics.run(creep);
        }
    }
}
