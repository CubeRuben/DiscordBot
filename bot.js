const Discord = require("discord.js");
const bot = new Discord.Client();

bot.on('ready', () => {
    console.log("Bot loaded");

});



bot.on('guildMemberAdd', member => {
    member.user.send("```fix\nWellcome to Discord server\nType help to see list of comands\n```");
});

bot.login('Njc2NDM2MDQ1NjIwODM4NDIw.XkFqMg.rZ941z4qrbyIROraeo711wrMYuQ');