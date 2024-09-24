import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  type ClientOptions,
} from "discord.js";
import type { Command } from "./types/command";
import dotenv from "dotenv";

dotenv.config();

export class ExtendedClient extends Client {
  commands: Collection<string, Command>;

  constructor(options: ClientOptions) {
    super(options);
    this.commands = new Collection();
  }
}

export const client = new ExtendedClient({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, () => {
  console.log("✨ Bot is ready and operational! ✨");
  console.log(`Logged in as ${client.user?.tag}!`);
  console.log(`Connected to ${client.guilds.cache.size} servers.`);
  console.log(`Ping: ${client.ws.ping}ms`);
});

client.login(process.env["DISCORD_TOKEN"]);
