const Discord = require("discord.js");
const bot = new Discord.Client();
const login = require('./login.json');
const translate = require('translate-google');

var prefix = ".";

var answersOnPing = [ "Yes?", "No", "Maybe", "No you", "Maybe we will drink the VODKA", "Yes", "Yes you may", "Stay me alone", "I want to die" ];

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
});

bot.on('message', (message) => {
    let args = message.content.replace('   ', ' ').replace('  ', ' ').split(' ');
    
    if (message.member != null) 
    {
        if (message.content.replace('!', '').includes(message.guild.members.get(bot.user.id).toString())) 
        {
            message.channel.send(message.member + ", " + answersOnPing[Math.floor(Math.random() * answersOnPing.length)]);
            return;
        }

        //Обработчик команд
        switch (args[0].toUpperCase()) 
        {
            case prefix + "TRANSLATE":
                translate(message.content.substring(args[0].length + args[1].length + 2, message.content.length), { to: args[1] }).then(res => sendWedhook(res, message.channel, message.author.username, message.author.avatarURL)).catch(err => message.channel.send(err));
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