import { SlashCommandBuilder, EmbedBuilder } from "@discordjs/builders";
import {
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import { getTrack, getLyrics, getSpotifyToken } from "../../utils/music";

async function getRandomSongFromPlaylist(playlistId: string): Promise<{
  name: string;
  artist: string;
  album: string;
  url: string;
  image: string;
}> {
  const accessToken = await getSpotifyToken();
  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const data = (await response.json()) as {
    items: {
      track: {
        name: string;
        artists: { name: string }[];
        album: { name: string; images: { url: string }[] };
        external_urls: { spotify: string };
      };
    }[];
  };
  const tracks = data.items;
  const randomTrack = tracks[Math.floor(Math.random() * tracks.length)].track;
  return {
    name: randomTrack.name,
    artist: randomTrack.artists[0].name,
    album: randomTrack.album.name,
    url: randomTrack.external_urls.spotify,
    image: randomTrack.album.images[0].url,
  };
}

export const data = new SlashCommandBuilder()
  .setName("todaysong")
  .setDescription("Obtiene una canción aleatoria de una playlist de Spotify")
  .addStringOption((option) =>
    option
      .setName("playlist")
      .setDescription("Selecciona la playlist")
      .setRequired(true)
      .addChoices(
        { name: "Kurai", value: "kurai" },
        { name: "Zero", value: "zero" }
      )
  );

export async function execute(interaction: CommandInteraction) {
  try {
    const playlistOption = (
      interaction.options as CommandInteractionOptionResolver
    ).getString("playlist");

    const playlistConfig: { [key: string]: { id: string; message: string } } = {
      kurai: {
        id: "1Nn3Rw7V3aUzLnI052R7HV",
        message: "Kurai cree que debes escuchar esta canción! 🎸",
      },
      zero: {
        id: "46O2UhwvR8HtJaElN6jnVa",
        message: "Zero insiste en que debes escuchar esta canción! 🎧",
      },
    };

    if (!playlistOption || !playlistConfig[playlistOption]) {
      await interaction.reply("❌ Opción de playlist no válida.");
      return;
    }

    const config = playlistConfig[playlistOption];
    const randomSong = await getRandomSongFromPlaylist(config.id);
    const trackId = await getTrack(randomSong.name, randomSong.artist);
    let lyrics = "Letra no disponible :(";

    if (trackId) {
      try {
        lyrics = await getLyrics(trackId);
      } catch (error) {
        console.error("Error fetching lyrics:", error);
      }
    }

    const botAvatarURL = interaction.client.user?.displayAvatarURL() || "";

    const embed = new EmbedBuilder()
      .setTitle("🎵 Tu canción aleatoria")
      .setDescription(config.message)
      .addFields(
        { name: "Título", value: randomSong.name, inline: true },
        { name: "Artista", value: randomSong.artist, inline: true },
        { name: "Álbum", value: randomSong.album, inline: true },
        { name: "Letra", value: lyrics, inline: false }
      )
      .setURL(randomSong.url)
      .setThumbnail(randomSong.image)
      .setColor(0xa67ba6)
      .setFooter({
        text: "Powered by Spotify & Musixmatch",
        iconURL: botAvatarURL,
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error(error);
    await interaction.reply(
      "❌ Hubo un error al obtener una canción aleatoria."
    );
  }
}
