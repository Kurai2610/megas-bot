import {
  CommandInteraction,
  SlashCommandBuilder,
  CommandInteractionOptionResolver,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("say")
  .setDescription("Repite lo que digas")
  .addStringOption((option) =>
    option
      .setName("mensaje")
      .setDescription("El mensaje que quieres que repita")
      .setRequired(true)
  );

export async function execute(interaction: CommandInteraction): Promise<void> {
  const message = (
    interaction.options as CommandInteractionOptionResolver
  ).getString("mensaje");

  if (message) {
    await interaction.reply(message);
  } else {
    await interaction.reply("No message provided.");
  }
}
