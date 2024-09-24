import {
  CommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("¡Responde con Pong!");

export async function execute(interaction: CommandInteraction): Promise<void> {
  const ping = interaction.client.ws.ping;
  const serverCount = interaction.client.guilds.cache.size;
  const botName = interaction.client.user?.username;
  const botAvatarURL = interaction.client.user?.displayAvatarURL() || "";

  const embed = new EmbedBuilder()
    .setTitle("Pong!")
    .setDescription(
      `🏓 Pong! ${botName} tiene un ping de ${ping}ms y está en ${serverCount} servidores.`
    )
    .setColor(0xa67ba6)
    .setFooter({
      text: "Powered by @kurai26",
      iconURL: botAvatarURL,
    })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
