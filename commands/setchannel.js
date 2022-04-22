const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setchannel')
		.setDescription('Défnir le channel'),
	async execute(interaction) {
		return interaction.reply('shesh!');
	},
};
