import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("chiste")
  .setDescription("Envía un chiste aleatorio");

export async function execute(interaction: CommandInteraction): Promise<void> {
  const jokes = [
    "Qué le dijo un pavo a una gallina? Hola. Jajajajajajaja",
    "Cómo que llama la fobia a santa claus? Claustrofobia",
    "Por qué superman huele rico? Porque se puso superfume",
    "Que le dijo un semáforo a otro semáforo? No me mires que me estoy cambiando",
    "Qué le dijo un pez a otro pez? Nada, porque no hablan",
    "Qué es negro por dentro y blanco por fuera? Obama en la casa blanca",
    "Cual es la diferencia entre una gorda y el warzone? Que el warzone si corre",
    "Saben porque la gente no cruzaba el mar rojo? Porque esperaban a que se pusiera en verde",
  ];

  const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
  await interaction.reply(randomJoke);
}
