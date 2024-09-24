import {
  CommandInteraction,
  CommandInteractionOptionResolver,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("8ball")
  .setDescription(
    "Este comando proporciona una respuesta aleatoria a la pregunta de un usuario"
  )
  .addStringOption((option) =>
    option
      .setName("pregunta")
      .setDescription("La pregunta que quieres hacer")
      .setRequired(true)
  );

export async function execute(interaction: CommandInteraction): Promise<void> {
  const question = (
    interaction.options as CommandInteractionOptionResolver
  ).getString("pregunta");

  if (!question) {
    await interaction.reply({
      content: "Por favor, proporciona una pregunta válida.",
      ephemeral: true,
    });
    return;
  }

  const response = await fetch("https://nekos.life/api/v2/8ball");
  const data: { response: string; url: string } = (await response.json()) as {
    response: string;
    url: string;
  };

  const botAvatarURL = interaction.client.user?.displayAvatarURL() || "";

  const embed = new EmbedBuilder()
    .setTitle("🎱 8ball")
    .setDescription(`Pregunta: ${question}\nRespuesta: ${data.response}`)
    .setImage(data.url)
    .setColor(0xa67ba6)
    .setFooter({
      text: "Powered by @kurai26",
      iconURL: botAvatarURL,
    })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
