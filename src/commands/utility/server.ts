import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("server")
  .setDescription("Muestra información del servidor");

export async function execute(interaction: CommandInteraction) {
  if (interaction.guild) {
    await interaction.reply(
      `This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`
    );
  } else {
    await interaction.reply("Guild information is not available.");
  }
}
