import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("server")
  .setDescription("Muestra información del servidor");

export async function execute(interaction: CommandInteraction): Promise<void> {
  if (interaction.guild) {
    await interaction.reply(
      `Este servidor es ${interaction.guild.name} y tiene ${interaction.guild.memberCount} miembros. 🏠`
    );
  } else {
    await interaction.reply("Guild information is not available. 😵‍💫");
  }
}
