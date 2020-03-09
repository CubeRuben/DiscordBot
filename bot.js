const { Client, MessageEmbed, Webhook } = require('discord.js');
const fs = require('fs');
const login = require('./login.json');
const translate = require('translate-google');
//const YTDL = require('ytdl-core-discord');
//const YTCheck = require('ytdl-core');
//const YTSR = require('yt-search');

const bot = new Client();
const prefix = ".";
const textAnswersOnPing = ["Yes?", "No", "Maybe", "No you", "Yes", "Yes you may", "Stay me alone", "I want to die"];
const imageAnswersOnPing = [
    "http://scp-ru.wdfiles.com/local--files/scp-173/scp-173_th.jpg",
    "https://pm1.narvii.com/6779/410e87bbef4d158dc1b002162bb7b255843127afv2_hq.jpg",
    "https://scp-ru.wdfiles.com/local--files/scp-106/106emergenceklay.jpg",
    "https://i.pinimg.com/originals/ac/0c/e4/ac0ce4f6178c50e80fe13697c5ef60dc.png"
];
var badWords = []
var voiceConnection;
var translateWebhook;
var musicLine = [];

async function sendTranslate(message, channel, username, avatar) {
    translateWebhook.edit({ channel: channel }).then(() => {
        translateWebhook.send(message);
    });
}

function langRole(message, roleName) {
    roleForAdd = message.guild.roles.cache.find(role => role.name == roleName);
    if (message.member.roles.cache.get(roleForAdd.id)) {
        message.member.roles.remove(roleForAdd, "LANG");
        message.channel.send("**Role removed**");
    } else {
        message.member.roles.add(roleForAdd, "LANG");
        message.channel.send("**Role added**");
    }
}

function joinToVoice(message) {
    if (!message.member.voice.channel) {
        message.channel.send(`**You is not in voice chat**`);
        return false;
    }

    if (voiceConnection) {
        if (voiceConnection.channel.members.size <= 1) {
            leaveFromVoice();
            joinToVoice(message.member.voice.channel);
        }

        message.channel.send(`**Already joined**`);
        return false;
    }

    message.member.voice.channel.join().then(con => {
        voiceConnection = con;
    });
    message.channel.send(`**Joined to \`${message.member.voice.channel.name}\`**`);
    return true;
}

function leaveFromVoice() {
    voiceConnection.disconnect();
    voiceConnection = null;
}

function searchMusic(name, message) {
    if (YTCheck.validateURL(name)) {
        musicLine.push(name);
        playMusic(name, message);
        return;
    }

    YTSR(name, (err, res) => {
        if (err) {
            message.send("**Nothing founded**");
            return;
        }

        musicLine.push(res.videos[0].url);
        playMusic(res.videos[0].url, message);
    });
}

function playMusic(url, message) {
    YTCheck.getInfo(url, (err, info) => {
        if (err) {
            console.log(err);
        }
        const embed = new MessageEmbed()
            .setTitle(`**${info.title}**`)
            .setURL(url)
            .setColor("#FF0000");
        message.channel.send(embed);
    });

    YTDL(url, { filter: "audioonly" }).then(res => {
        voiceConnection.play(res, { type: 'opus' });
        voiceConnection.broadcast.setVolume(0);
    });
}

bot.on('ready', () => {
    console.log("Bot loaded");
    bot.user.setActivity('SCP: Data Unlocked', { type: "PLAYING" })
    badWords = fs.readFileSync("bad_words.txt").toString().toUpperCase().split(' ');
    bot.guilds.cache.get('655442973378740263').fetchWebhooks().then(webhooks => {
        translateWebhook = webhooks.get('686538386890293277');
    });
});

bot.on('message', (message) => {
    if (!message.member || message.author.bot) {
        return;
    }

    let args = message.content.toUpperCase().replace('   ', ' ').replace('  ', ' ').split(' ');

    if (message.content.includes(bot.user.id)) {
        if (Math.random() >= 0.75) {
            message.channel.send({ files: [imageAnswersOnPing[Math.floor(Math.random() * imageAnswersOnPing.length)]] });
            return;
        }
        message.channel.send(`${message.author}, ${textAnswersOnPing[Math.floor(Math.random() * textAnswersOnPing.length)]}`);
        return;
    }

    for (let i = 0; i < badWords.length; i++) {
        if (message.content.toUpperCase().includes(badWords[i])) {
            let embed = new MessageEmbed()
                .setAuthor("Bad Word", message.author.avatarURL)
                .addField("Message", `\`${message.content}\``)
                .addField("Channel", message.channel, true)
                .addField("User", message.author, true)
                .setColor("#00FFFF")
                .setFooter("SCP-079 Logs")
                .setTimestamp();
            const logs = message.guild.channels.cache.find(ch => ch.name === 'logs');
            logs.send(embed);
            break;
        }
    }

    //Обработчик команд
    switch (args[0]) {
        case prefix + "TR":
        case prefix + "TRAN":
        case prefix + "TRANSLATE":
            translate(message.content.substring(args[0].length + args[1].length + 2, message.content.length), { to: args[1] }).then(res => sendTranslate(res, message.channel, message.author.username, message.author.avatarURL())).catch(err => message.channel.send(err));
            break;
        case prefix + "HELP":
            {
                let embed = new MessageEmbed()
                let title = "Bot commands";
                let field1 = "For everyone:";
                let field2 = "**.lang (language name)** - Get access to channel with this language\n**.translate/.tr (language to translate) (text to translate)** - Translate message\n**.badwords** - List of bad words";
                /*if (args[1]) {
                    translate(title, { to: args[1] }).then(res => {
                        title = res;
                        translate(field1, { to: args[1] }).then(res => {
                            field1 = res;
                            translate(field2, { to: args[1] }).then(res => {
                                field2 = res;
                                embed.setTitle(title).addField(field1, field2, false);
                                message.channel.send(embed);
                            });
                        });
                    });
                } else {*/
                embed.setTitle(title).addField(field1, field2, false);
                message.channel.send(embed);
            }
            //}
            break;
        case prefix + "ADDBADWORD":
            if (message.member.hasPermission("MANAGE_CHANNELS")) {
                if (args[1]) {
                    let string = fs.readFileSync("bad_words.txt").toString();
                    if (!string.includes(args[1])) {
                        fs.writeFileSync("bad_words.txt", string + " " + args[1]);
                        badWords.push(args[1]);
                        message.channel.send("**Successfully added**");
                    } else {
                        message.channel.send("**Already added**");
                    }
                } else {
                    message.channel.send("**Missing bad word**");
                }
            }
            break;
            /*case prefix + "REMOVEBADWORD":
                if (message.member.hasPermission("MANAGE_CHANNELS")) {
                    if (args[1]) {
                        let string = fs.readFileSync("bad_words.txt").toString();

                        if (string.includes(args[1])) {
                            fs.writeFileSync("bad_words.txt", string.replace(` ${ args[1] }`, '').replace(`${ args[1] } `, '').replace(' ', ''));
                            badWords.splice(badWords.indexOf(args[1]));
                            message.channel.send("**Successfully removed**");
                        } else {
                            message.channel.send("**Bad words list is not including this word**");
                        }
                    } else {
                        message.channel.send("**Missing bad word**");
                    }
                }
                break;*/
        case prefix + "BADWORDS":
            {
                const embed = new MessageEmbed()
                    .addField("**Bad words:**", fs.readFileSync("bad_words.txt").toString(), false)
                    .setColor("#FF0000");
                message.channel.send(embed);
            }
            break;
        case prefix + "LANG":
        case prefix + "LANGUAGE":
            switch (args[1]) {
                case "ENGLISH":
                case "ENG":
                case "EN":
                    langRole(message, "English");
                    break;
                case "RUSSIAN":
                case "RUS":
                case "RU":
                    langRole(message, "Russian");
                    break;
                default:
                    let embed = new MessageEmbed()
                        .setTitle(`Language \`${args[1]}\` undefined`)
                        .setColor("#FF0000");
                    message.channel.send(embed);
                    break;
            }
            break;

            /*case prefix + "JOIN":
                joinToVoice(message);
                break;
            case prefix + "LEAVE":
                leaveFromVoice();
                break;
            case prefix + "PLAY":
                {
                    if (!message.member.voice.channel) {
                        message.channel.send("**You is not in voice chat**");
                        break;
                    }

                    if (!voiceConnection) {
                        if (joinToVoice(message)) {
                            searchMusic(message.content.substring(args[0].length, message.content.length - 1), message);
                            break;
                        }
                    }

                    searchMusic(message.content.substring(args[0].length, message.content.length - 1), message);
                }
                break;
            case prefix + "VOLUME":
                break;*/
    }

});

//Лог об удаленом сообщение
bot.on(`messageDelete`, message => {
    const logs = message.guild.channels.cache.find(ch => ch.name == 'logs');
    let embed = new MessageEmbed()
        .setAuthor(`Message Deleted`, message.author.avatarURL)
        .addField("Mesasge", message.content)
        .addField("Channel", message.channel, true)
        .addField("User", message.author, true)
        .setColor("#00FFFF")
        .setFooter("SCP-079 Logs System")
        .setTimestamp();
    logs.send(embed);
});
//Лог об изменённом сообщении
bot.on(`messageUpdate`, (oldMessage, newMessage) => {
    if (oldMessage.content == newMessage.content) return;
    let embed = new MessageEmbed()
        .setAuthor("Message Edited", newMessage.author.avatarURL)
        .addField("Old Message", oldMessage.content, true)
        .addField("New Message", newMessage.content, true)
        .addField("p", "l")
        .addField("Channel", newMessage.channel, true)
        .addField("User", newMessage.author, true)
        .setFooter("SCP-079 Logs System")
        .setColor("#00FF00")
        .setTimestamp();
    const logs = newMessage.guild.channels.cache.find(ch => ch.name === 'logs');
    logs.send(embed);
});

//Приветственное сообщение
bot.on('guildMemberAdd', member => {
    const Welcome = new MessageEmbed()
        .setTitle("Welcome to Discord server\nType .help to see list of commands")
    member.user.send(Welcome);
});

bot.on('error', error => {
    console.error(error);
});

//Логирование бота 
bot.login(login.token);