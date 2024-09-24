import { REST, Routes } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
dotenv.config();
console.log("DISCORD_TOKEN:", process.env["DISCORD_TOKEN"]);
console.log("CLIENT_ID:", process.env["CLIENT_ID"]);
const token = process.env["DISCORD_TOKEN"];
const clientId = process.env["CLIENT_ID"];
const guildId = process.env["GUILD_ID"];

if (!token) {
  console.error("Missing DISCORD_TOKEN in .env file");
  process.exit(1);
}

if (!clientId) {
  console.error("Missing DISCORD_CLIENT_ID in .env file");
  process.exit(1);
}

if (!guildId) {
  console.error("Missing DISCORD_GUILD_ID in .env file");
  process.exit(1);
}

interface Command {
  data: {
    toJSON: () => any;
  };
  execute: (...args: any[]) => void;
}

const commands: Command[] = [];

const folderPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(folderPath);

const commandPromises = [];

for (const folder of commandFolders) {
  const commandsPath = path.join(folderPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    commandPromises.push(
      import(filePath)
        .then((command) => {
          if ("data" in command && "execute" in command) {
            commands.push(command.data.toJSON());
            console.log(`Loaded command: ${command.data.name}`);
          } else {
            console.log(
              `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
            );
          }
        })
        .catch((error) => {
          console.error(
            `[ERROR] Failed to load command at ${filePath}:`,
            error
          );
        })
    );
  }
}

Promise.all(commandPromises).then(async () => {
  const rest = new REST().setToken(token);

  try {
    console.log("Started refreshing application (/) commands.");

    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      {
        body: commands,
      }
    );

    console.log("Successfully reloaded application (/) commands.");
    console.log(data);
  } catch (error) {
    console.error(error);
  }
});
