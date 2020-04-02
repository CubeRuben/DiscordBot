const { Client, MessageEmbed, Webhook, MessageAttachment} = require('discord.js');
const fs = require('fs');
const {token} = require('./login.json');
const translate = require('translate-google');
const YTDL = require('ytdl-core-discord');
const YTCheck = require('ytdl-core');
const YTSR = require('yt-search');

const bot = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER', 'GUILD_MEMBER'] });
const prefix = ".";
const textAnswersOnPing = ["Yes?", "No", "Maybe", "No you", "Yes", "Yes you may", "Leave me alone", "I want to die"];
const imageAnswersOnPing = [
    "http://scp-ru.wdfiles.com/local--files/scp-173/scp-173_th.jpg",
    "https://pm1.narvii.com/6779/410e87bbef4d158dc1b002162bb7b255843127afv2_hq.jpg",
    "https://scp-ru.wdfiles.com/local--files/scp-106/106emergenceklay.jpg",
    "https://i.pinimg.com/originals/ac/0c/e4/ac0ce4f6178c50e80fe13697c5ef60dc.png",
    "https://lurkmore.so/images/6/61/Scplogo-1.png",
    "https://sun9-60.userapi.com/c830709/v830709516/5f7ee/EVEZ0iCrtnE.jpg?ava=1",
    "https://sun9-48.userapi.com/c845420/v845420702/15067c/Yqq4aQ5RGsc.jpg?ava=1",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaEjKEAvI4ehvT2BRUNvF4kiK7dxrBtSrErrHhALJ2KXC7yiYp&s"

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
        let embed = new MessageEmbed()
        .setTitle(`Role removed`)
        message.channel.send(embed);
    } else {
        message.member.roles.add(roleForAdd, "LANG");
        let embed = new MessageEmbed()
        .setTitle(`Role added`)
        message.channel.send(embed);
    }
}

function joinToVoice(message) {
    if (!message.member.voice.channel) {
        let embed = new MessageEmbed()
        .setTitle(`You are not in the voice channel`)
        message.channel.send(embed)
        return false;
    }

    if (voiceConnection) {
        if (voiceConnection.channel.members.size <= 1) {
            leaveFromVoice();
            joinToVoice(message.member.voice.channel);
        }

        
        let embed = new MessageEmbed()
        .setTitle(`Already joined`)
        message.channel.send(embed);
        return false;
    }

    message.member.voice.channel.join().then(con => {
        voiceConnection = con;
    });
    let embed = new MessageEmbed()
    .setTitle(`Joined to \`${message.member.voice.channel.name}\``)
    message.channel.send(embed);
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
            let embed = new MessageEmbed()
            .setTitle("Nothing founded")
            message.channel.send(embed);
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
            .setThumbnail(info.player_response.videoDetails.thumbnail.thumbnails[2].url)
            .addField("Author", info.player_response.videoDetails.author, true)
            .addField("Time", Math.floor(info.player_response.videoDetails.lengthSeconds / 60) + ':' + info.player_response.videoDetails.lengthSeconds % 60, true)
            .addField(`View`, info.player_response.videoDetails.viewCount, true)
            .setColor("#FF0000");
        message.channel.send(embed);
    });

    YTDL(url, { filter: "audioonly" }).then(res => {
        voiceConnection.play(res, { type: 'opus' });
        voiceConnection.broadcast.setVolume(0);
    });
}
/*function stop(){
    voiceConnection.dispather.pause();
}
function start(){
    voiceConnection.dispather.resume();
}*/
bot.on('ready', () => {
    console.log("Bot loaded");
    bot.user.setActivity('SCP: Data Unlocked', { type: "PLAYING" })
    badWords = fs.readFileSync("bad_words.txt").toString().toUpperCase().split(' ');
    bot.guilds.cache.get('655442973378740263').fetchWebhooks().then(webhooks => {
        translateWebhook = webhooks.get('686538386890293277');
    });
});
bot.on('messageReactionAdd', (messageReaction, user) => {
    if(messageReaction.message.channel.id !== "693916521457516564") return;
    if(user.id == "676436045620838420") return;
    let embed = new MessageEmbed()
    .setAuthor("Была поставлена реакция", user.avatarURL())
    .setColor("GREEN")
    .addField("Эмодзи", messageReaction.emoji.name, true)
    .addField("Пользователем", user, true)
    .addField("Собщение", messageReaction.message.content)
    messageReaction.message.author.send(embed);
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
    if(message.channel.id == "657478442551345212"){
        if(message.attachments.size == "1") return;
        message.react('🟢');
        message.react('🟡');
        message.react('🟠');
        message.react('🔴');
    }
    if(message.channel.id == "693916521457516564"){
        message.react('❓');
        message.react('❔');
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
        case prefix + "MESSAGEDEVS":
            if(!args[1]){
                let embed = new MessageEmbed()
                .setTitle("You did not write an offer");
                message.channel.send(embed);
                return;
            }
            let mess = args.splice(1).join(' ');
            let embed1 = new MessageEmbed()
            .setTitle("Commmunity message")
            .addField("User", message.author, true)
            .addField("Channel", message.channel, true)
            .setDescription(`**Message:** ${mess}`)
            .setTimestamp();
            const communitymessages = message.guild.channels.cache.find(ch => ch.name == 'community-messages');
            communitymessages.send(embed1);
            break;
        case prefix + "HELP":  
                let embed = new MessageEmbed()
                let title = "Bot commands";
                let field1 = "For everyone:";
                let field2 = "**.lang (language name)** - Get access to channel with this language\n**.translate/.tr (language to translate) (text to translate)** - Translate message\n**.messagedevs (message)** - Sends your offer to developers\n**.badwords** - List of bad words\n**.join** - Connect the bot to the voice channels\n**.leave** - Disconnect the bot from the voice channels\n**.play (URL or video name)** - Search and play the video\n**.stop** - Stops video playback";
                if(args[1] == "RU"){
                    let embedRU = new MessageEmbed()
                    .setTitle("Команды бота")
                    .addField("Для всех", "**.lang (язык)** - Выдаёт доступ к каналам данного языка\n**.translate/.tr/.tran (на язык) (текст)** - Переводит текст\n**.messagedevs (сообщениe)** - Отправляет разработчикам ваше сообщение \n**.badwords** - Выдаёт список плохих слов\n**.join** - Присоединение бота к голосовым каналам\n**.leave** - Отключение бота от голосовых каналов\n**.play (URL или название видео)** - Производит поиск и воспроизведение видео\n**.stop** - Останавливает воспроизведение видео")
                    message.channel.send(embedRU)
                }else{
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
            case prefix + "REMOVEBADWORD":
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
                break;
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

            case prefix + "JOIN":
                joinToVoice(message);
                break;
            case prefix + "LEAVE":
                leaveFromVoice();
                break;
            case prefix + "PLAY":
                {
                    if (!message.member.voice.channel) {
                        let embed = new MessageEmbed()
                        .setTitle(`You is not in voice chat`)
                        message.channel.send(embed);
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
                /*case prefix + "STOP":
                    stop()
                break;
                case prefix + "START":
                    start()
                break;*/
    }

});

//Лог об удаленом сообщение
bot.on(`messageDelete`, message => {
    const logs = message.guild.channels.cache.find(ch => ch.name == 'logs');
    if(message.attachments.size == "1") return;
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
    if(oldMessage.attachments.size == "1") return;
    let embed = new MessageEmbed()
        .setAuthor("Message Edited", newMessage.author.avatarURL)
        .addField("Old Message", oldMessage.content, true)
        .addField("New Message", newMessage.content, true)
        .addField("s", "d")
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
bot.login(token);