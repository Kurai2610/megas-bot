import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("why")
  .setDescription("Why?");

export async function execute(interaction: CommandInteraction): Promise<void> {
  const response = await fetch("https://nekos.life/api/v2/why");
  const data: { why: string } = (await response.json()) as {
    why: string;
  };

  if (data.why) {
    await interaction.reply(data.why);
  } else {
    await interaction.reply("No response received from the API.");
  }
}
