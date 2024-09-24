import { SlashCommandBuilder, EmbedBuilder } from "@discordjs/builders";
import {
  CommandInteraction,
  CommandInteractionOptionResolver,
} from "discord.js";
import { config } from "dotenv";
import { track, lyrics } from "../../types/musixmatch";

config();

const SPOTIFY_CLIENT_ID = process.env["SPOTIFY_CLIENT_ID"];
const SPOTIFY_CLIENT_SECRET = process.env["SPOTIFY_CLIENT_SECRET"];
const MUSIXMATCH_API_KEY = process.env["MUSIXMATCH_API_KEY"];

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

async function getRandomSongFromPlaylist(playlistId: string): Promise<{
  name: string;
  artist: string;
  album: string;
  url: string;
  image: string;
}> {
  const accessToken = await getSpotifyAccessToken();
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

async function getTrack(
  trackName: string,
  artistName: string
): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.musixmatch.com/ws/1.1/track.search?q_track=${encodeURIComponent(
        trackName
      )}&q_artist=${encodeURIComponent(
        artistName
      )}&apikey=${MUSIXMATCH_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Error fetching track: ${response.statusText}`);
    }

    const json = await response.json();

    const trackResponse: track.TrackResponse = track.Convert.toTrackResponse(
      JSON.stringify(json)
    );

    if (trackResponse.message.body.track_list.length === 0) {
      return null;
    }

    return trackResponse.message.body.track_list[0].track.commontrack_id;
  } catch (error) {
    console.error("Error in getTrack:", error);
    return null;
  }
}

function formatLyrics(lyrics: string): string {
  const cleanedLyrics = lyrics
    .split("\n")
    .filter(
      (line) =>
        !line.includes("******* This Lyrics is NOT for Commercial use *******")
    )
    .join("\n");

  return `"${cleanedLyrics}"`;
}

async function getLyrics(commontrack_id: number): Promise<string> {
  try {
    const response = await fetch(
      `https://api.musixmatch.com/ws/1.1/track.lyrics.get?commontrack_id=${commontrack_id}&apikey=${MUSIXMATCH_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Error fetching lyrics: ${response.statusText}`);
    }

    const json = await response.json();

    const lyricsResponse: lyrics.LyricsResponse =
      lyrics.Convert.toLyricsResponse(JSON.stringify(json));

    const rawLyrics = lyricsResponse.message.body.lyrics.lyrics_body;

    return formatLyrics(rawLyrics);
  } catch (error) {
    console.error("Error in getLyrics:", error);
    throw new Error("Failed to get lyrics");
  }
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
