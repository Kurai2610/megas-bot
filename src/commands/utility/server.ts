import {
  CommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("server")
  .setDescription("Muestra información del servidor");

export async function execute(interaction: CommandInteraction): Promise<void> {
  if (interaction.guild) {
    const embed = new EmbedBuilder()
      .setColor(0xa67ba6)
      .setTitle("Información del Servidor")
      .setDescription(
        `Este servidor es ${interaction.guild.name} y tiene ${interaction.guild.memberCount} miembros. 🏠`
      )
      .setTimestamp(new Date())
      .setFooter({ text: "Información del Servidor" });

    await interaction.reply({ embeds: [embed] });
  } else {
    await interaction.reply("Guild information is not available. 😵‍💫");
  }
}
