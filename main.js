// static mining creeps
var lean_harvester = require('lean_harvester');
var lean_logistics = require('lean_logistics');
var lean_upgrader = require('lean_upgrader');
var lean_builder = require('lean_builder');

// remote ( working in other room ) creeps
var remote_miner = require('remote_miner');

// continued tutorial stuff
var roleHarvester = require('harvester');
var roleUpgrader = require('upgrader');
var roleBuilder = require('builder');
var spawner = require('spawner');
var tower = require('tower');

// WIP: also create construction sites automatically omfg
var auto_buildings = require('auto_buildings');

module.exports.loop = function () {

    // XXX: will move into room loop
    tower.run();

    for(var room in Game.rooms) {
        var cur_room = Game.rooms[room];
        // Make sure each room has memory.sources
        // and memory.spawn_limits set, both are needed
        // in spawner
        // XXX: Maybe this deserves its own module for room memory bookkeeping?
        if (!cur_room.memory.sources) {
            cur_room.memory = {
                sources: {
                    0: {
                        cur: 0,
                        limit: 2,
                    },
                    1: {
                        cur: 0,
                        limit: 2,
                    },
                }
            }
        }
        if (!cur_room.memory.spawn_limits) {
            cur_room.memory.spawn_limits = {
                harvester: 0,
                lean_harvester: 0,
                upgrader: 0,
                lean_upgrader: 0,
                builder: 0,
                lean_builder: 0,
                lean_logistics: 0,
            }
        }
        spawner.run(room);
        auto_buildings.run(room);
    }

    // XXX: what about this one?
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
        if(creep.memory.role == 'lean_upgrader') {
            lean_upgrader.run(creep);
        }
        if(creep.memory.role == 'lean_builder') {
            lean_builder.run(creep);
        }
    }
}
