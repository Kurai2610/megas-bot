import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

export const data = new SlashCommandBuilder()
  .setName("about")
  .setDescription("Muestra información sobre el bot");

export async function execute(interaction: CommandInteraction): Promise<void> {
  await interaction.reply(
    `¡Hola! Soy Sable, un bot de Discord creado por <@${process.env["OWNER_ID"]}>. Puedes ver mi código fuente en [GitHub](https://github.com/Kurai2610/megas-bot). 🤖`
  );
}
