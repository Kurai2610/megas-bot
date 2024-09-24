import { SlashCommandBuilder } from "@discordjs/builders";
import {
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("match")
  .setDescription("Crea un match entre dos usuarios")
  .addUserOption((option) =>
    option
      .setName("user1")
      .setDescription("El primer usuario")
      .setRequired(true)
  )
  .addUserOption((option) =>
    option
      .setName("user2")
      .setDescription("El segundo usuario")
      .setRequired(true)
  );

export async function execute(interaction: CommandInteraction): Promise<void> {
  const user1 = (
    interaction.options as CommandInteractionOptionResolver
  ).getUser("user1");
  const user2 = (
    interaction.options as CommandInteractionOptionResolver
  ).getUser("user2");

  let percentage: string;

  const specialUser1Id = "780991353177243698";
  const specialUser2Id = "690544499037962242";

  if (
    (user1 &&
      user1.id === specialUser1Id &&
      user2 &&
      user2.id === specialUser2Id) ||
    (user1 &&
      user1.id === specialUser2Id &&
      user2 &&
      user2.id === specialUser1Id)
  ) {
    percentage = "100.00";
  } else {
    percentage = (Math.random() * 100).toFixed(2);
  }

  await interaction.reply(
    `💖 El match entre ${user1} y ${user2} es de ${percentage}% 💘`
  );
}
