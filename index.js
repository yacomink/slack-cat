'use strict';

const fs = require('fs');
const path = require('path');
const Config = require('./core/config.js');
const Router = require('./core/router.js');
const SlackCatBot = require('./core/slack-cat-bot.js');
const Server = require('./core/server.js');

// Global Base Modules.
global.BaseModule = require('./core/base-module.js');
global.BaseStorageModule = require('./core/base-storage-module.js');

const testMsg = {
  type: 'message',
  channel: 'C7XPH1X8V',
  user: 'U7YMR8S3H',
  text: '',
  ts: '1510420686.000031',
  source_team: 'T7XPH1Q4V',
  team: 'T7XPH1Q4V',
};

const testReaction = {
  type: 'reaction_added',
  user: 'U7YMR8S3H',
  item: {
    type: 'message',
    channel: 'C7XPH1X8V',
    ts: '1519401099.000639',
  },
  reaction: '',
  item_user: 'U94UFE802',
  event_ts: '1519405945.000295',
  ts: '1519405945.000295',
};

const testMemberJoin = {
  type: 'member_joined_channel',
  user: 'U7YMR8S3H',
  channel: 'C9F93HK45',
  channel_type: 'C',
  team: 'T7XPH1Q4V',
  event_ts: '1519690078.000194',
  ts: '1519690078.000194',
};

class SlackCat {
  constructor(pathToModules, configPath, dbPath) {
    this.pathToModules = pathToModules;
    this.dbPath = dbPath;

    global.STORAGE_PATH = dbPath;
    global.config = new Config(configPath);    
  }

  start() {
    // Run debug cmds.
    if (process.argv.length > 2) {
      this.runDebugCommand();
      return;
    }

    const bot = new SlackCatBot({
      token: config.getKey('slack_api'), // Add a bot https://my.slack.com/services/new/bot and put the token
      name: 'SlackCat',
    });

    const server = new Server();        
    const router = new Router(bot, this.pathToModules, server);
    server.start();

    bot.on('start', () => {
      console.info('Starting server in ' + config.getKey("node_env") + ' mode.');
    });

    bot.on('message', data => {
      router.handle(data);
    });
  }

  runDebugCommand() {
    // Reaction debug msg
    const MockBot = require(path.join(__dirname + '/core', 'mock-bot.js'));
    const router = new Router(new MockBot(), this.pathToModules, new Server());

    if (process.argv[2].includes('member_joined_channel')) {
      router.handle(testMemberJoin);
      return;
    }

    if (process.argv[2].includes(':')) {
      testReaction.reaction = process.argv[2].replace(new RegExp(':', 'g'), '');
      console.log('Executing reaction: ' + testReaction.reaction);
      router.handle(testReaction);
      return;
    }

    // Regular debug message
    testMsg.text = process.argv.splice(2, process.argv.length - 1).join(' ');
    router.handle(testMsg);
    return;
  }
}

module.exports = SlackCat;
