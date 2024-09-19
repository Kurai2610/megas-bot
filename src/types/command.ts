import type {
  ApplicationCommandOptionData,
  CommandInteraction,
} from "discord.js";

export interface Command {
  data: {
    name: string;
    description: string;
    options?: ApplicationCommandOptionData[];
  };
  execute: (interaction: CommandInteraction) => Promise<void>;
}
