

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



//------------------------------------------------------------//
//                 Données                                    //
//------------------------------------------------------------//

var nbFeu;

var lastGuild;

var request = new XMLHttpRequest();
var motTrigger;


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
    console.log('Error' + c);
});


client.on( 'messageCreate', async message => {

    if ( ! message.author.bot ) return;


    lastChannelId = message.channel.id;

    lastGuild   = message.guild;

    console.log(lastChannelId);

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

    if ( interaction.customId === 'ajouter' ) {
        const chan = await creerChannel("tierlist", interaction);
        
        await interaction.update({ content: 'Un channel a été crée', components: [] });
        await attendreRep( chan );
    }

    if ( interaction.customId === 'regarder' ) {
    
        let jsonIn = fs.readFileSync('tierlist.json', 'utf8');

        if ( ! jsonIn == "" ) {
            jsonIn = JSON.parse(jsonIn);

            for ( var cpt = 0; cpt < jsonIn.url.length; cpt++ ) {
                interaction.channel.send(jsonIn.url[cpt].url);
            }
        }
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
};

async function sendToJSON( url ) {

    var obj = {
        url : []
    };

    obj.url.push({url : url});

    let jsonIn = fs.readFileSync('tierlist.json', 'utf8');

    if ( ! jsonIn == "" ) {
        jsonIn = JSON.parse(jsonIn);

        for ( var cpt = 0; cpt < jsonIn.url.length; cpt++ ) {
            obj.url.push({url :jsonIn.url[cpt].url});
        }
    }

    var json = JSON.stringify(obj);

    fs.writeFile('tierlist.json', json, err => {
        
        console.log("New data added");
    });

};

async function attendreRep( chan ) {

    const collecteur = new Discord.MessageCollector(chan);
    collecteur.on ( 'collect', message => {
        if ( message.attachments.size > 0 ) {
            sendToJSON(message.attachments.first().url);
            chan.delete();
        } else {
            chan.delete();
            return;
        }
    });
}

async function creerChannel( nom, interaction ) {

    var chan = await interaction.guild.channels  .create(nom);

    chan.send( 'Postez cette image dans le salon' );

    lastChannelId = chan.id;

    return chan;
    
}


