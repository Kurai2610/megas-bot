import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { Events } from "discord.js";
import { client, ExtendedClient } from "./client";
import { autocompleteArtist } from "./commands/fun/artist";
dotenv.config();

const folderPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(folderPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(folderPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    import(filePath)
      .then((command) => {
        if ("data" in command && "execute" in command) {
          client.commands.set(command.data.name, command);
        } else {
          console.log(
            `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
          );
        }
      })
      .catch((error) => {
        console.error(`[ERROR] Failed to load command at ${filePath}:`, error);
      });
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isAutocomplete()) return;

  if (interaction.commandName === "artist") {
    await autocompleteArtist(interaction);
  }
  return;
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = (interaction.client as ExtendedClient).commands.get(
    interaction.commandName
  );

  if (!command) {
    console.error(` ${interaction.commandName} command not found`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

client.login(process.env["DISCORD_TOKEN"]);
