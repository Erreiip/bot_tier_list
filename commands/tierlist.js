const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tierlist')
		.setDescription('regarder ou faire des Tier List'),
	async execute(interaction) {
		return interaction.reply('shesh!');
	},
};
