const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setlien')
		.setDescription('Défnir le lien des tier-list'),
	async execute(interaction) {
		return interaction.reply('shesh!');
	},
};
