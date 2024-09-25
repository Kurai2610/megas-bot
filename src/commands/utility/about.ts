import {
  CommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("about")
  .setDescription("Muestra información sobre el bot");

export async function execute(interaction: CommandInteraction): Promise<void> {
  const botAvatarURL = interaction.client.user?.displayAvatarURL();

  const embed = new EmbedBuilder()
    .setColor(0xa67ba6)
    .setTitle("Sobre Sable")
    .setDescription(
      `¡Hola! Soy Sable, un bot de Discord creado por <@${process.env["OWNER_ID"]}>.`
    )
    .setThumbnail(botAvatarURL)
    .addFields(
      {
        name: "Código Fuente",
        value: "[GitHub](https://github.com/Kurai2610/sable)",
        inline: true,
      },
      {
        name: "Características",
        value: "Moderación, Juegos, Utilidades y más.",
        inline: true,
      },
      {
        name: "Versión",
        value: "0.0.1",
        inline: true,
      },
      {
        name: "Lenguaje",
        value: "TypeScript",
        inline: true,
      },
      {
        name: "Servidor de Soporte",
        value: "[Únete aquí](https://discord.gg/7UFkPA6D6q)",
        inline: true,
      }
    )
    .setImage(
      "https://static1.srcdn.com/wordpress/wp-content/uploads/2024/02/sable-ward-from-dead-by-daylight.jpg"
    )
    .setTimestamp(new Date())
    .setFooter({ text: "Sable Bot", iconURL: botAvatarURL });

  await interaction.reply({ embeds: [embed] });
}
