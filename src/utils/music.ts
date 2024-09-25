import { Token, GetArtistTopTracks } from "../types/spotify";
import { Track, Lyrics, Snippet } from "../types/musixmatch";

export const getSpotifyToken = async (): Promise<string> => {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env["SPOTIFY_CLIENT_ID"]}:${process.env["SPOTIFY_CLIENT_SECRET"]}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  if (!response.ok) {
    throw new Error("Failed to get Spotify token");
  }

  const json = await response.json();
  const tokenResponse: Token.TokenResponse = Token.Convert.toTokenResponse(
    JSON.stringify(json)
  );

  return tokenResponse.access_token;
};

export function formatLyrics(lyrics: string): string {
  const cleanedLyrics = lyrics
    .split("\n")
    .filter(
      (line) =>
        !line.includes("******* This Lyrics is NOT for Commercial use *******")
    )
    .join("\n");

  return `"${cleanedLyrics}"`;
}

export async function getTrack(
  trackName: string,
  artistName: string
): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.musixmatch.com/ws/1.1/track.search?q_track=${encodeURIComponent(
        trackName
      )}&q_artist=${encodeURIComponent(artistName)}&apikey=${
        process.env["MUSIXMATCH_API_KEY"]
      }`
    );

    if (!response.ok) {
      throw new Error(`Error fetching track: ${response.statusText}`);
    }

    const json = await response.json();

    const trackResponse: Track.TrackResponse = Track.Convert.toTrackResponse(
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

export async function getSnippet(
  commontrack_id: number
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.musixmatch.com/ws/1.1/track.snippet.get?commontrack_id=${commontrack_id}&apikey=${process.env["MUSIXMATCH_API_KEY"]}`
    );

    if (!response.ok) {
      throw new Error(`Error fetching snippet: ${response.statusText}`);
    }

    const json = await response.json();

    const snippetResponse: Snippet.GetSnippetResponse =
      Snippet.Convert.toGetSnippetResponse(JSON.stringify(json));

    return snippetResponse.message.body.snippet.snippet_body;
  } catch (error) {
    console.error("Error in getSnippet:", error);
    return null;
  }
}

export async function getLyrics(commontrack_id: number): Promise<string> {
  try {
    const response = await fetch(
      `https://api.musixmatch.com/ws/1.1/track.lyrics.get?commontrack_id=${commontrack_id}&apikey=${process.env["MUSIXMATCH_API_KEY"]}`
    );

    if (!response.ok) {
      throw new Error(`Error fetching lyrics: ${response.statusText}`);
    }

    const json = await response.json();

    const lyricsResponse: Lyrics.LyricsResponse =
      Lyrics.Convert.toLyricsResponse(JSON.stringify(json));

    const rawLyrics = lyricsResponse.message.body.lyrics.lyrics_body;

    return formatLyrics(rawLyrics);
  } catch (error) {
    console.error("Error in getLyrics:", error);
    throw new Error("Failed to get lyrics");
  }
}

export async function getArtistTopTracks(
  artistId: string,
  tracksNumber: number
): Promise<string[]> {
  try {
    const token = await getSpotifyToken();
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/top-tracks`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch artist top tracks: ${response.status} ${response.statusText}`
      );
    }

    const json = await response.json();
    const topTracksResponse: GetArtistTopTracks.ArtistTopTracksResponse =
      GetArtistTopTracks.Convert.toArtistTopTracksResponse(
        JSON.stringify(json)
      );

    topTracksResponse.tracks;
    return topTracksResponse.tracks
      .slice(0, tracksNumber)
      .map((track) => track.name);
  } catch (error) {
    console.error("Error in getArtistTopTracks:", error);
    throw new Error("Failed to get artist top tracks");
  }
}
