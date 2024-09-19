import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { config } from "dotenv";

config();

const SPOTIFY_PLAYLIST_ID = "5bUI9cSA9YN97ryOqmSSvP";
const SPOTIFY_CLIENT_ID = process.env["SPOTIFY_CLIENT_ID"];
const SPOTIFY_CLIENT_SECRET = process.env["SPOTIFY_CLIENT_SECRET"];

async function getSpotifyAccessToken(): Promise<string> {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });
  const data: { access_token: string } = (await response.json()) as any;
  return data.access_token;
}

async function getRandomSongFromPlaylist(): Promise<{
  name: string;
  artist: string;
  album: string;
  url: string;
}> {
  const accessToken = await getSpotifyAccessToken();
  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${SPOTIFY_PLAYLIST_ID}/tracks`,
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
        album: { name: string };
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
  };
}

export const data = new SlashCommandBuilder()
  .setName("todaysong")
  .setDescription("Obtiene una canción aleatoria de una playlist de Spotify");

export async function execute(interaction: CommandInteraction) {
  try {
    const randomSong = await getRandomSongFromPlaylist();
    await interaction.reply(
      `🎵 **Tu canción aleatoria es:**\n\n` +
        `**Título:** ${randomSong.name}\n` +
        `**Artista:** ${randomSong.artist}\n` +
        `**Álbum:** ${randomSong.album}\n` +
        `🔗 [Escuchar en Spotify](${randomSong.url})`
    );
  } catch (error) {
    console.error(error);
    await interaction.reply(
      "❌ Hubo un error al obtener una canción aleatoria."
    );
  }
}
