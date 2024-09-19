import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

export const data = new SlashCommandBuilder()
  .setName("zero")
  .setDescription("ya zero");

export async function execute(interaction: CommandInteraction): Promise<void> {
  await interaction.reply(`CALLATE ZERO PARECES PUTA`);
}
