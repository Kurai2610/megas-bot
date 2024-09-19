import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("chiste")
  .setDescription("Envía un chiste aleatorio");

export async function execute(interaction: CommandInteraction) {
  const jokes = [
    "Qué le dijo un pavo a una gallina? Hola. Jajajajajajaja",
    "Cómo que llama la fobia a santa claus? Claustrofobia XDxdxdxDXDDXdxxd",
    "Por qué superman huele rico? Porque se puso superfume XDXDXdxdxd",
    "Que le dijo un semáforo a otro semáforo? No me mires que me estoy cambiando Xxdxdxdxd",
  ];

  const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
  await interaction.reply(randomJoke);
}
