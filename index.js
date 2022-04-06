const XMLHttpRequest = require('xhr2');

const fs                           = require('node:fs');
const Discord                      = require('discord.js');
const { token, guildId, clientId } = require('./config.json');

const client = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.DIRECT_MESSAGES,
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Discord.Intents.FLAGS.GUILD_INTEGRATIONS
    ]
});

client.commands    = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}
    
const { MessageMentions: { USERS_PATTERN } } = require('discord.js');

const { MessageActionRow, MessageButton } = require('discord.js');


const path = require('path');
const { channel } = require('node:diagnostics_channel');


const requestMots  = 'http://localhost/perso/botDiscord/motTrigger.jsonc';
const requestCrash = 'http://localhost/perso/botDiscord/crash.sh';



//------------------------------------------------------------//
//                 Données                                    //
//------------------------------------------------------------//

var phrase;
var nbFeu;

var lastChannelId;

var request = new XMLHttpRequest();
var motTrigger;
var fichierCrash;


//------------------------------------------------------------//
//                 Instructions                               //
//------------------------------------------------------------//



client.login(token);

nbFeu = 0;
request.open('GET', requestMots);
request.responseType = 'json';
request.send();

request.onload = function() {
    motTrigger = request.response;
}



client.once('ready', () => {
    console.log('SSHHHESSSHHHH');
    client.user.setActivity(' faire des jeux de mots');
    client.user.setUsername('Gobelin Royal');

    const guild = client.guilds.cache.get(guildId);

    let commands

    if ( guild ) {
        commands = guild.commands;
    } else {
        commands = client.application?.commands;
    }

    commands?.create({
        name        : 'tierlist',
        description : 'permet d\'ajouter ou regarder les tier list faites'

    });
});

client.once('error', c => {
    console.log('Error');
})

client.on('messageCreate', async message => {

    if (message.author.bot) return;

    if (message.content.startsWith('ping')) {
        let personneVise = getUserFromMention(message.content.split(' ')[1]);
        let user = message.author;

        if (personneVise === undefined) return;

        message.reply('<@' + personneVise + '>' + ' T\'as le salut de la part de ' + '<@' + user + '>');
    }

    if (message.content === 'Rap')
    {
        var sRet;
        for (var i = 0; i < motTrigger.length; i++) 
            sRet += "\n" + Object.keys(motTrigger[i]).toString() + ' ' + motTrigger[1][Object.keys(motTrigger[i]).toString()];
        
        message.author.send(sRet);
    }

});

client.on( 'messageCreate', async message => {

    if ( ! message.author.bot ) return;

    console.log( lastChannelId + ' to ->' + message.channel.id);


    lastChannelId = message.channel.id;


});

client.on('messageCreate', async message => {

   if ( message.attachments.size < 1 ) return;

   console.log(message.attachments);

   
});


client.on('interactionCreate', async (interaction) => {
   
    if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

    if (interaction.commandName === 'tierlist') {

		const row = new MessageActionRow()  
			.addComponents(
				new MessageButton()
					.setCustomId('ajouter')
					.setLabel('Ajouter Tier List')
					.setStyle('SUCCESS'),
                new MessageButton()
					.setCustomId('regarder')
					.setLabel('Regarder Tier List')
					.setStyle('DANGER'),
			);

		await interaction.reply({ content: 'Choisir', components: [row] });
	}
});

client.on('interactionCreate', async (interaction) => {

    if ( !interaction.isButton() ) return;

    console.log ( interaction );

    if ( interaction.customId === 'ajouter' ) {
        
        var chan = interaction.guild.channels.create('channel_tier-list').then( channel => channel.send('Postez votre image dans ce salon') ).then ( chan => console.log(chan.id));

        await interaction.update({ content: 'Un channel a été crée', components: [] });
    }

});




function getUserFromMention(mention) {

    if (!mention) return;

    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        if (mention.startsWith('!')) {
            mention = mention.slice(1);
        }

        return client.users.cache.get(mention);
    }
}

