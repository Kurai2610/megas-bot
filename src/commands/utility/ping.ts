import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("¡Responde con Pong!");

export async function execute(interaction: CommandInteraction): Promise<void> {
  await interaction.reply("Pong! 🏓");
}
