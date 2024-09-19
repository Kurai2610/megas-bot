import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("traba")
  .setDescription("Comando para ver si un usuario es un traba");

export async function execute(interaction: CommandInteraction): Promise<void> {
  const percentage = (Math.random() * 100).toFixed(2);
  await interaction.reply(`Eres un ${percentage}% travesti`);
}
