import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("traba")
  .setDescription("Comando para ver si un usuario es un traba");

export async function execute(interaction: CommandInteraction) {
  await interaction.reply(
    Math.random() > 0.5 ? "No es un traba" : "Es un traba"
  );
}
