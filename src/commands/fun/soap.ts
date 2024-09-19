import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("jabon")
  .setDescription("Jabon?");

export async function execute(interaction: CommandInteraction): Promise<void> {
  await interaction.reply(
    "!BUU¡ ¿Te asusté? Soy una pastilla de jabón 🧼 solo aquí para recordarte que te metas en la 🚿 ducha y salgas porque el olor a través de la pantalla no es muy agradable, ¡Cambio y fuera!"
  );
}
