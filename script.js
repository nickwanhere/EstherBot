'use strict';

const _ = require('lodash');
const Script = require('smooch-bot').Script;

const scriptRules = require('./script.json');

var Pinboard = require('node-pinboard');

module.exports = new Script({
    processing: {
        //prompt: (bot) => bot.say('Beep boop...'),
        receive: () => 'processing'
    },

    start: {
        receive: (bot) => {
            return bot.say('So you want to learn about Nick? Just say HELLO to get started.')
                .then(() => 'speak');
        }
    },

    speak: {
        receive: (bot, message) => {

            let upperText = message.text.trim().toUpperCase();

            function updateSilent() {
                switch (upperText) {
                    case "CONNECT ME":
                        return bot.setProp("silent", true);
                    case "DISCONNECT":
                        return bot.setProp("silent", false);
                    default:
                        return Promise.resolve();
                }
            }

            function getSilent() {
                return bot.getProp("silent");
            }

            function processMessage(isSilent) {
                if (isSilent) {
                    return Promise.resolve("speak");
                }


                var dunno = [
                    `I didn't understand that.`,
                    `My creator didnt teach me that.`,
                    `I think I will just pass along the question. Hold on.`
                ];

                if(upperText.split(" ")[0] == 'DIG')
                {
                    var query = upperText.replace('DIG ','').toLowerCase();
   
                    var token = process.env.PINBOARD_TOKEN;

                    var pinboard = new Pinboard(token);

                    var reply = "Not found anything in my mind...";

                    pinboard.all({tag: query,results:5}, function(err, res) {

                        var p = Promise.resolve();

                        bot.say('How about these? :]');

                        res.forEach(function(link) {
                            p = p.then(function() {
                                return bot.say(link.description+"\n"+link.href+"\n"+link.tags);
                            });
                        });
                        return p.then(() => 'speak');

                    });

                    return false;

                }

                var response = false;
                var re = new RegExp("\\b"+upperText+"\\b","g");

                for(var key in scriptRules) {
                    if(re.test(key))
                    {
                         response=scriptRules[key];
                    }
                }

                if (!response) {
                    return bot.say(dunno[Math.floor(Math.random() * dunno.length)]).then(() => 'speak');
                }

                var lines = response.split('\n');

                var p = Promise.resolve();
                _.each(lines, function(line) {
                    line = line.trim();
                    p = p.then(function() {
                        return bot.say(line);
                    });
                })

                return p.then(() => 'speak');
            }

            return updateSilent()
                .then(getSilent)
                .then(processMessage);
        }
    }
});