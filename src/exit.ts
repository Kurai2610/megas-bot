import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

// Crea una nueva instancia del cliente
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log("Bot está listo");

  // ID del servidor al que el bot debería salir
  const guildId = "1051256666596851835";

  // Obtén la guild (servidor) usando su ID
  const guild = client.guilds.cache.get(guildId);

  if (guild) {
    guild
      .leave()
      .then(() => console.log(`Bot ha salido del servidor ${guildId}`))
      .catch(console.error);
  } else {
    console.log(`No se encontró el servidor con ID ${guildId}`);
  }
});

// Inicia sesión en Discord con el token del bot
client.login(process.env["DISCORD_TOKEN"]);
