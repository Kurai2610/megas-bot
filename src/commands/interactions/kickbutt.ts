import { EmbedBuilder, SlashCommandBuilder } from "@discordjs/builders";
import {
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import { Convert, type GIFResponse } from "../../types/giphy";

const GIPHY_API_KEY = process.env["GIPHY_API_KEY"];

export const data = new SlashCommandBuilder()
  .setName("kickbutt")
  .setDescription("Patea a un usuario")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("El usuario a patear")
      .setRequired(true)
  );

async function getRandomGif(): Promise<string> {
  try {
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/random?api_key=${GIPHY_API_KEY}&tag=anime+kick&rating=g`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch GIF: ${response.status} ${response.statusText}`
      );
    }

    const json = await response.json();

    const gifResponse: GIFResponse = Convert.toGIFResponse(
      JSON.stringify(json)
    );

    if (!gifResponse.data) {
      throw new Error("No GIF found");
    }

    return gifResponse.data.images.original.url;
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred while fetching the GIF");
  }
}

export async function execute(interaction: CommandInteraction): Promise<void> {
  try {
    const user = (
      interaction.options as CommandInteractionOptionResolver
    ).getUser("user");

    if (!user) {
      await interaction.reply({
        content: "❌ **No se ha encontrado al usuario**",
        ephemeral: true,
      });
      return;
    }

    const gifUrl = await getRandomGif();
    const botAvatarURL = interaction.client.user?.displayAvatarURL() || "";

    const embed = new EmbedBuilder()
      .setDescription(
        `**${interaction.user.globalName}** pateó a **${user.globalName}**`
      )
      .setImage(gifUrl)
      .setColor(0xa67ba6)
      .setFooter({
        text: "Powered by GIPHY",
        iconURL: botAvatarURL,
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "⚠️ **Ocurrió un error al intentar obtener el GIF**",
      ephemeral: true,
    });
  }
}
