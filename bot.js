const Discord = require("discord.js");
const bot = new Discord.Client();
const fs = require('fs');
const login = require('./login.json');
const translate = require('translate-google');
var prefix = ".";
var answersOnPing = ["Yes?", "No", "Maybe", "No you", "Maybe we will drink the VODKA", "Yes", "Yes you may", "Stay me alone", "I want to die"];
var badWords = []

function sendWedhook(message, channel, username, avatar) {
    channel.createWebhook(username, avatar)
        .then(webhook => {
            webhook.send(message);
            webhook.delete();
        })
}

function langRole(message, roleName) {
    roleForAdd = message.guild.roles.find(role => role.name == roleName);
    if (message.member.roles.get(roleForAdd.id)) {
        message.member.removeRole(roleForAdd);
        message.channel.send("**Role removed**");
    } else {
        message.member.addRole(roleForAdd);
        message.channel.send("**Role added**");
    }
}

bot.on('ready', () => {
    console.log("Bot loaded");
    bot.user.setActivity('SCP: Data Unlocked', { type: "PLAYING" })
    badWords = fs.readFileSync("bad_words.txt").toString().toUpperCase().split(' ');
});

bot.on('message', (message) => {
    if (!message.member || message.author.bot) {
        return;
    }

    let args = message.content.toUpperCase().replace('   ', ' ').replace('  ', ' ').split(' ');

    if (message.content.replace('!', '').includes(message.guild.members.get(bot.user.id).toString())) {
        message.channel.send(message.member + ", " + answersOnPing[Math.floor(Math.random() * answersOnPing.length)]);
        return;
    }

    for (let i = 0; i < badWords.length; i++) {
        if (message.content.toUpperCase().includes(badWords[i])) {
            let embed = new Discord.RichEmbed()
                .setAuthor("Bad Word", message.author.avatarURL)
                .addField("Message", `\`${message.content}\``)
                .addField("Channel", message.channel, true)
                .addField("User", message.author, true)
                .setColor("#00FFFF")
                .setFooter("SCP-079 Logs")
                .setTimestamp();
            message.guild.channels.get('676438061135167519').send(embed);
            break;
        }
    }

    //Обработчик команд
    switch (args[0]) {
        case prefix + "TR":
        case prefix + "TRAN":
        case prefix + "TRANSLATE":
            translate(message.content.substring(args[0].length + args[1].length + 2, message.content.length), { to: args[1] }).then(res => sendWedhook(res, message.channel, message.author.username, message.author.avatarURL)).catch(err => message.channel.send(err));
            break;
        case prefix + "HELP":
            if (args[1] == "RU" || args[1] == "RUS" || args[1] == "RUSSIAN"){
            let embedru = new Discord.RichEmbed()
                .setTitle("Bot commands")
                .addField("For everyone:", "**.lang (Имя языка)** - Получить доступ к этому чату на этом языке\n**.translate/.tr (на язык) (текст)** - Переводит сообщение\n**.badwords** - Присылает сообщение с плохими словами", false);
            message.channel.send(embedru);
            }else{
            let embed = new Discord.RichEmbed()
                .setTitle("Bot commands")
                .addField("For everyone:", "**.lang (language name)** - Get access to chat with this language\n**.translate/.tr (language to translate) (text to translate)** - Translate message\n**.badwords** - List of bad words", false);
            message.channel.send(embed); }
            break;
        case prefix + "ADDBADWORD":
            if (message.member.roles.get("673529272857788447", "657244197841141770")) {
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
            if (message.member.roles.get("673529272857788447", "657244197841141770")) {
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
            message.channel.send(`**Bad words:** ${ fs.readFileSync("bad_words.txt").toString() }`);
            break;
        case prefix + "BADWORDS":
            message.channel.send(`**Bad words:** ${ fs.readFileSync("bad_words.txt").toString() }`);
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
                    let embed = new Discord.RichEmbed()
                    .setTitle("Language name undefined")
                    message.channel.send(embed);
                    break;
            }
            break;
    }

});

//Лог об удаленом сообщение
bot.on(`messageDelete`, message => {
    let embed = new Discord.RichEmbed()
    .setAuthor(`Message Deleted`, message.author.avatarURL)
    .addField("Mesasge", message.content)
    .addField("Channel", message.channel, true)
    .addField("User", message.author, true)
    .setColor("#00FFFF")
    .setFooter("SCP-079 Logs System")
    .setTimestamp();
    message.guild.channels.get('676438061135167519').send(embed);
});
//Лог об изменённом сообщении
bot.on(`messageUpdate`, (oldMessage, newMessage) => {
    if(oldMessage.content === newMessage.content) return; 
    let embed = new Discord.RichEmbed()
    .setAuthor("Message Edited", newMessage.author.avatarURL)
    .addField("Old Message", oldMessage.content, true)
    .addField("New Message", newMessage.content, true)
    .addBlankField()
    .addField("Channel", newMessage.channel, true)
    .addField("User", newMessage.author, true)
    .setFooter("SCP-079 Logs System")
    .setColor("#00FF00")
    .setTimestamp();
    newMessage.guild.channels.get('676438061135167519').send(embed).catch(err => console.error(err));
});


//Приветственное сообщение
bot.on('guildMemberAdd', member => {
    const Welcome = new Discord.RichEmbed()
    .setTitle("Welcome to Discord server\nType .help to see list of commands")
    member.user.send(Welcome);
});

//Логирование бота
bot.login(login.token);
