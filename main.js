var roleHarvester = require('harvester');
var roleUpgrader = require('upgrader');
var roleBuilder = require('builder');
var spawner = require('spawner');
var tower = require('tower');

module.exports.loop = function () {

    tower.run();

    for(var room in Game.rooms) {
        var cur_room = Game.rooms[room];
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
    }
}
