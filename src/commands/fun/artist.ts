import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { SearchArtist, GetArtist } from "../../types/spotify";
import {
  getArtistTopTracks,
  getSnippet,
  getSpotifyToken,
  getTrack,
} from "../../utils/music";

export const data = new SlashCommandBuilder()
  .setName("artist")
  .setDescription("Mira la información de un artista musical")
  .addStringOption((option) =>
    option
      .setName("nombre")
      .setDescription("Nombre del artista")
      .setRequired(true)
      .setAutocomplete(true)
  );

export async function autocompleteArtist(
  interaction: AutocompleteInteraction
): Promise<void> {
  let focusedValue = interaction.options.getFocused();
  if (!focusedValue) {
    focusedValue = "Gustavo Cerati";
  }

  const token = await getSpotifyToken();
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      focusedValue
    )}&type=artist&limit=5`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch artist: ${response.status} ${response.statusText}`
    );
  }
  const json = await response.json();
  const artistResponse: SearchArtist.SearchArtistResponse =
    SearchArtist.Convert.toSearchArtistResponse(JSON.stringify(json));

  const artists = artistResponse.artists.items.map((artist) => ({
    name: artist.name,
    value: artist.id,
  }));

  await interaction.respond(artists).catch(() => {});
}

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const artistId = interaction.options.getString("nombre");

  if (!artistId) {
    await interaction.reply("No artist provided.");
    return;
  }

  const token = await getSpotifyToken();
  const response = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch artist: ${response.status} ${response.statusText}`
    );
  }

  const json = await response.json();
  const artistResponse: GetArtist.GetArtistResponse =
    GetArtist.Convert.toGetArtistResponse(JSON.stringify(json));
  const artistTracks = await getArtistTopTracks(artistId, 5);
  const randomTrack =
    artistTracks[Math.floor(Math.random() * artistTracks.length)];
  const commonTrackId = await getTrack(randomTrack, artistResponse.name);

  let snippet;

  if (commonTrackId) {
    snippet = await getSnippet(commonTrackId);
  }
  const botAvatarURL = interaction.client.user?.displayAvatarURL();

  const embed = new EmbedBuilder()
    .setTitle(artistResponse.name)
    .setURL(artistResponse.external_urls.spotify)
    .setThumbnail(artistResponse.images[0].url)
    .addFields([
      {
        name: "Followers",
        value: artistResponse.followers.total.toString(),
        inline: true,
      },
      {
        name: "Genres",
        value: artistResponse.genres.join(", "),
        inline: true,
      },
      {
        name: "Popularity",
        value: artistResponse.popularity.toString(),
        inline: true,
      },
    ])
    .setColor(0xa67ba6)
    .setFooter({
      text: "Powered by Spotify & Musixmatch",
      iconURL: botAvatarURL,
    })
    .setTimestamp();

  if (snippet) {
    embed.addFields({
      name: "Snippet",
      value: `\`\`\`"${snippet}"\`\`\``,
      inline: false,
    });
  }

  await interaction.reply({ embeds: [embed] });
}
