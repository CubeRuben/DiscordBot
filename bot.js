const Discord = require("discord.js");
const bot = new Discord.Client();
const fs = require('fs');
const login = require('./login.json');
const translate = require('translate-google');

var prefix = ".";

var answersOnPing = [ "Yes?", "No", "Maybe", "No you", "Maybe we will drink the VODKA", "Yes", "Yes you may", "Stay me alone", "I want to die" ];
var badWords = [ ];

function sendWedhook(message, channel, username, avatar) 
{
    channel.createWebhook(username, avatar)
    .then(webhook => {
        webhook.send(message);
        webhook.delete();
    })
}

bot.on('ready', () => {
    console.log("Bot loaded");

    badWords = fs.readFileSync("bad_words.txt").toString().toUpperCase().split(' ');
});

bot.on('message', (message) => {
    let args = message.content.toUpperCase().replace('   ', ' ').replace('  ', ' ').split(' ');
    
    if ((message.member != null) && (message.author.id != bot.user.id)) 
    {
        if (message.content.replace('!', '').includes(message.guild.members.get(bot.user.id).toString())) 
        {
            message.channel.send(message.member + ", " + answersOnPing[Math.floor(Math.random() * answersOnPing.length)]);
            return;
        }

        for (let i = 0; i < badWords.length; i++) 
        {
            if (message.content.toUpperCase().includes(badWords[i])) 
            {
                message.guild.channels.get('676438061135167519').send("**User** " + message.member + " **use bad word** " + badWords[i] + " **in channel** " + message.channel + " **in message** " + message.url);
                break;
            }
        }

        //Обработчик команд
        switch (args[0]) 
        {
            case prefix + "TRANSLATE":
                translate(message.content.substring(args[0].length + args[1].length + 2, message.content.length), { to: args[1] }).then(res => sendWedhook(res, message.channel, message.author.username, message.author.avatarURL)).catch(err => message.channel.send(err));
            break;
            case prefix + "LANG":
                if (args[1] = "RU"){
                    if (message.member.roles.get('676436972872400916')){
                        message.member.removeRole('676436972872400916');
                        message.channel.send("**Роль успешна удалена**");
                    }else{
                        message.member.addRole('676436972872400916'); 
                        message.channel.send("**Роль успешна добавлена**");
                    }
                }
            break;
            case prefix + "LANG":
                if (args[1] = "EN"){
                    if (message.member.roles.get('676843539128385540')){
                        message.member.removeRole('676843539128385540');
                        message.channel.send("**Role successfully deleted**");
                    }else{
                        message.member.addRole('676843539128385540');
                        message.channel.send("**Role successfully added**");
                    }
                }
            break;
            case prefix + "ADDBADWORD":
                if (message.member.hasPermission("READ_MESSAGE_HISTORY")) 
                {
                    if (args[1]) 
                    { 
                        let string = fs.readFileSync("bad_words.txt").toString();
                        
                        if (!string.includes(args[1])) 
                        { 
                            fs.writeFileSync("bad_words.txt", string + " " + args[1]);  
                            badWords.push(args[1]);
                            message.channel.send("**Successfully added**");
                        } 
                        else 
                        {
                            message.channel.send("**Already added**");
                        }
                    } 
                    else 
                    {
                        message.channel.send("**Missing bad word**");
                    }
                }
            break;
            case prefix + "REMOVEBADWORD":
                if (message.member.hasPermission("READ_MESSAGE_HISTORY")) 
                {
                    if (args[1]) 
                    {
                        let string = fs.readFileSync("bad_words.txt").toString();

                        if (string.includes(args[1])) 
                        {
                            fs.writeFileSync("bad_words.txt", string.replace(args[1], '').replace('  ', ' '));
                            badWords.splice(badWords.indexOf(args[1]));
                            message.channel.send("**Successfully removed**");
                        } 
                        else 
                        {
                            message.channel.send("**Bad words list is not including this word**");
                        }
                    } 
                    else 
                    {
                        message.channel.send("**Missing bad word**");
                    }
                }
            break;
        }
    }
});

//Лог об удалённом сообщении
bot.on('messageDelete', message => {
    if (message.member != null) 
    {
        if ((message.author != bot.user) && (message.member.roles.get('657244197841141770') == null)) 
        {
            bot.channels.get('676438061135167519').send("**User:** " + message.member + "\n**Channel:** " + message.channel + "\n**Message content:** " + message.content + "\n");
        }
    }
});

//Приветственное сообщение
bot.on('guildMemberAdd', member => {
    member.user.send("```fix\nWelcome to Discord server\nType help to see list of commands\n```");
});

//Логирование бота
bot.login(login.token);