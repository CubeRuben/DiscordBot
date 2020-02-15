const Discord = require("discord.js");
const bot = new Discord.Client();
const fs = require('fs');
const login = require('./login.json');
const translate = require('translate-google');
var prefix = ".";
var answersOnPing = [ "Yes?", "No", "Maybe", "No you", "Maybe we will drink the VODKA", "Yes", "Yes you may", "Stay me alone", "I want to die" ];
var badWords = []

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
        const helpru = new Discord.RichEmbed()
        .setTitle("Помощь в командах")
        .setDescription(".lang en / ru - команда выдача ролей English/Russian.\n.translate (язык) (текст) - команда переводчика Google.\nВ скором времени команды будут добавляться.\n")
        .setColor("#000000")
        .setTimestamp()
        const helpen = new Discord.RichEmbed()
        .setTitle("Help in commands")
        .setDescription(".lang en\ru - gives you these roles English/Russian.\n.translate (language) (text) - language on which you will translate your text.\nNew commands will be soon.")
        //Обработчик команд
        switch (args[0]) 
        {
            case prefix + "TRANSLATE":
                translate(message.content.substring(args[0].length + args[1].length + 2, message.content.length), { to: args[1] }).then(res => sendWedhook(res, message.channel, message.author.username,  )).catch(err => message.channel.send(err));
            break;
            case prefix + "TREN":
                msgID = message.id//писваивание переменой значение Id сообщения
                if (message.member.roles.get('657244197841141770', '673529272857788447', '673928965894701107', )){
                    translate(message.content.substring(args[0].length + 1, message.content.length), { to: "EN" }).then(res => sendWedhook(res, message.channel, message.author.username, message.author.avatarURL)).catch(err => message.channel.send(err));
                    message.delete(msgID)//удаление сообщение отправителя
                }
            break;
            case prefix + "TRRU":
                msgID = message.id//писваивание переменой значение Id сообщения
                if (message.member.roles.get('657244197841141770', '673529272857788447', '673928965894701107')){
                    translate(message.content.substring(args[0].length + 1, message.content.length), { to: "RU" }).then(res => sendWedhook(res, message.channel, message.author.username, message.author.avatarURL)).catch(err => message.channel.send(err));
                    message.delete(msgID)//удаление сообщение отправителя
                }
            break;
            case prefix + "HELP":
                if(args[1] == "RU"){
                    message.channel.send("```.lang en/ru - выдаёт роли English/Russian.\n.translate (язык на который переводим) (текст) - команда переводчика Google.\nВ скором времени команды будут добавляться```");
                }else{
                    message.channel.send(helpen)
                }
                break;
            case prefix + "ADDBADWORD":
                if (message.member.roles.get('657244197841141770', '673529272857788447'))
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
                }else{
                    message.channel.send("**Access denied**");
                }
            break;
            case prefix + "REMOVEBADWORD":
                if (message.member.roles.get('657244197841141770', '673529272857788447'))
                {
                    if (args[1]) 
                    {
                        let string = fs.readFileSync("bad_words.txt").toString();

                        if (string.includes(args[1])) 
                        {
                            fs.writeFileSync("bad_words.txt", string.replace(args[1], '').replace(' ', ''));
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
                }else{
                    message.channel.send("**Access denied**");
                }
            break;
            case prefix + "LANG":
                if (args[1] == "EN"){
                    if (message.member.roles.get('676436972872400916')){
                        message.member.removeRole('676843539128385540');
                        message.channel.send("**Role successfully removed**");
                    }else{
                        message.member.addRole('676843539128385540');
                        message.channel.send("**Role successfully added**");
                    }
                }else if (args[1] == "RU"){
                    if (message.member.roles.get('676436972872400916')){
                        message.member.removeRole('676436972872400916');
                        message.channel.send("**Роль успешно удалена**");
                        message.channel.send(message.content);
                    }else{
                        message.member.addRole('676436972872400916');
                        message.channel.send("**Роль успешно добавлена**");
                    }
                }
             break;
        
        }   
    }
});
//Лог об удаленом сообщение
bot.on(`messageDelete`, message => {
    const logs = message.guild.channels.find(channel => channel.name === "logs");
    if(!logs) return;
    let embedDel =  new Discord.RichEmbed()
    .setAuthor(`Messeage Deleted | ${message.author.tag}`, message.avatarURL)
    .setDescription(message.content)
    .addField("Channel", message.channel, true)
    .addField("Message ID", message.id, true)
    .setColor("#00FFFF")
    .setFooter("Message Deleted")
    .setTimestamp();

    logs.send(embedDel).catch(() => console.error);

});
//Лог об  изменёным сообщение
bot.on(`messageUpdate`, async(oldMessage, newMessage) => {
    const logs = oldMessage.guild.channels.find(channel => channel.name === "logs");
    if(!logs) return;
    let embedUp =  new Discord.RichEmbed()
    .setAuthor(`Messeage Edited | ${newMessage.author.tag}`, newMessage.avatarURL)
    .addField("Old Message", oldMessage.content)
    .addField("New Message", newMessage.content)
    .addField("Channel", newMessage.id, true)
    .addField("Message ID", newMessage.id, true)
    .setColor("#00FF00")
    .setFooter("Message Edited")
    .setTimestamp();

    logs.send(embedUp).catch(() => console.error);

});


//Приветственное сообщение
bot.on('guildMemberAdd', member => {
    member.user.send("```fix\nWelcome to Discord server\nType .help to see list of commands\n```");
});

//Логирование бота
bot.login(login.token);