export namespace track {
  // To parse this data:
  //
  //   import { Convert, TrackResponse } from "./file";
  //
  //   const trackResponse = Convert.toTrackResponse(json);
  //
  // These functions will throw an error if the JSON doesn't
  // match the expected interface, even if the JSON is valid.

  export interface TrackResponse {
    message: Message;
  }

  export interface Message {
    header: Header;
    body: Body;
  }

  export interface Body {
    track_list: TrackList[];
  }

  export interface TrackList {
    track: Track;
  }

  export interface Track {
    track_id: number;
    track_name: string;
    track_name_translation_list: TrackNameTranslationList[];
    track_rating: number;
    commontrack_id: number;
    instrumental: number;
    explicit: number;
    has_lyrics: number;
    has_subtitles: number;
    has_richsync: number;
    num_favourite: number;
    album_id: number;
    album_name: string;
    artist_id: number;
    artist_name: string;
    track_share_url: string;
    track_edit_url: string;
    restricted: number;
    updated_time: Date;
    primary_genres: PrimaryGenres;
  }

  export interface PrimaryGenres {
    music_genre_list: MusicGenreList[];
  }

  export interface MusicGenreList {
    music_genre: MusicGenre;
  }

  export interface MusicGenre {
    music_genre_id: number;
    music_genre_parent_id: number;
    music_genre_name: string;
    music_genre_name_extended: string;
    music_genre_vanity: string;
  }

  export interface TrackNameTranslationList {
    track_name_translation: TrackNameTranslation;
  }

  export interface TrackNameTranslation {
    language: string;
    translation: string;
  }

  export interface Header {
    status_code: number;
    execute_time: number;
    available: number;
  }

  // Converts JSON strings to/from your types
  // and asserts the results of JSON.parse at runtime
  export class Convert {
    public static toTrackResponse(json: string): TrackResponse {
      return cast(JSON.parse(json), r("TrackResponse"));
    }

    public static trackResponseToJson(value: TrackResponse): string {
      return JSON.stringify(uncast(value, r("TrackResponse")), null, 2);
    }
  }

  function invalidValue(typ: any, val: any, key: any, parent: any = ""): never {
    const prettyTyp = prettyTypeName(typ);
    const parentText = parent ? ` on ${parent}` : "";
    const keyText = key ? ` for key "${key}"` : "";
    throw Error(
      `Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(
        val
      )}`
    );
  }

  function prettyTypeName(typ: any): string {
    if (Array.isArray(typ)) {
      if (typ.length === 2 && typ[0] === undefined) {
        return `an optional ${prettyTypeName(typ[1])}`;
      } else {
        return `one of [${typ
          .map((a) => {
            return prettyTypeName(a);
          })
          .join(", ")}]`;
      }
    } else if (typeof typ === "object" && typ.literal !== undefined) {
      return typ.literal;
    } else {
      return typeof typ;
    }
  }

  function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
      const map: any = {};
      typ.props.forEach((p: any) => (map[p.json] = { key: p.js, typ: p.typ }));
      typ.jsonToJS = map;
    }
    return typ.jsonToJS;
  }

  function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
      const map: any = {};
      typ.props.forEach((p: any) => (map[p.js] = { key: p.json, typ: p.typ }));
      typ.jsToJSON = map;
    }
    return typ.jsToJSON;
  }

  function transform(
    val: any,
    typ: any,
    getProps: any,
    key: any = "",
    parent: any = ""
  ): any {
    function transformPrimitive(typ: string, val: any): any {
      if (typeof typ === typeof val) return val;
      return invalidValue(typ, val, key, parent);
    }

    function transformUnion(typs: any[], val: any): any {
      // val must validate against one typ in typs
      const l = typs.length;
      for (let i = 0; i < l; i++) {
        const typ = typs[i];
        try {
          return transform(val, typ, getProps);
        } catch (_) {}
      }
      return invalidValue(typs, val, key, parent);
    }

    function transformEnum(cases: string[], val: any): any {
      if (cases.indexOf(val) !== -1) return val;
      return invalidValue(
        cases.map((a) => {
          return l(a);
        }),
        val,
        key,
        parent
      );
    }

    function transformArray(typ: any, val: any): any {
      // val must be an array with no invalid elements
      if (!Array.isArray(val))
        return invalidValue(l("array"), val, key, parent);
      return val.map((el) => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
      if (val === null) {
        return null;
      }
      const d = new Date(val);
      if (isNaN(d.valueOf())) {
        return invalidValue(l("Date"), val, key, parent);
      }
      return d;
    }

    function transformObject(
      props: { [k: string]: any },
      additional: any,
      val: any
    ): any {
      if (val === null || typeof val !== "object" || Array.isArray(val)) {
        return invalidValue(l(ref || "object"), val, key, parent);
      }
      const result: any = {};
      Object.getOwnPropertyNames(props).forEach((key) => {
        const prop = props[key];
        const v = Object.prototype.hasOwnProperty.call(val, key)
          ? val[key]
          : undefined;
        result[prop.key] = transform(v, prop.typ, getProps, key, ref);
      });
      Object.getOwnPropertyNames(val).forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(props, key)) {
          result[key] = transform(val[key], additional, getProps, key, ref);
        }
      });
      return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
      if (val === null) return val;
      return invalidValue(typ, val, key, parent);
    }
    if (typ === false) return invalidValue(typ, val, key, parent);
    let ref: any = undefined;
    while (typeof typ === "object" && typ.ref !== undefined) {
      ref = typ.ref;
      typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
      return typ.hasOwnProperty("unionMembers")
        ? transformUnion(typ.unionMembers, val)
        : typ.hasOwnProperty("arrayItems")
        ? transformArray(typ.arrayItems, val)
        : typ.hasOwnProperty("props")
        ? transformObject(getProps(typ), typ.additional, val)
        : invalidValue(typ, val, key, parent);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
  }

  function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
  }

  function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
  }

  function l(typ: any) {
    return { literal: typ };
  }

  function a(typ: any) {
    return { arrayItems: typ };
  }

  function o(props: any[], additional: any) {
    return { props, additional };
  }

  function r(name: string) {
    return { ref: name };
  }

  const typeMap: any = {
    TrackResponse: o(
      [{ json: "message", js: "message", typ: r("Message") }],
      false
    ),
    Message: o(
      [
        { json: "header", js: "header", typ: r("Header") },
        { json: "body", js: "body", typ: r("Body") },
      ],
      false
    ),
    Body: o(
      [{ json: "track_list", js: "track_list", typ: a(r("TrackList")) }],
      false
    ),
    TrackList: o([{ json: "track", js: "track", typ: r("Track") }], false),
    Track: o(
      [
        { json: "track_id", js: "track_id", typ: 0 },
        { json: "track_name", js: "track_name", typ: "" },
        {
          json: "track_name_translation_list",
          js: "track_name_translation_list",
          typ: a(r("TrackNameTranslationList")),
        },
        { json: "track_rating", js: "track_rating", typ: 0 },
        { json: "commontrack_id", js: "commontrack_id", typ: 0 },
        { json: "instrumental", js: "instrumental", typ: 0 },
        { json: "explicit", js: "explicit", typ: 0 },
        { json: "has_lyrics", js: "has_lyrics", typ: 0 },
        { json: "has_subtitles", js: "has_subtitles", typ: 0 },
        { json: "has_richsync", js: "has_richsync", typ: 0 },
        { json: "num_favourite", js: "num_favourite", typ: 0 },
        { json: "album_id", js: "album_id", typ: 0 },
        { json: "album_name", js: "album_name", typ: "" },
        { json: "artist_id", js: "artist_id", typ: 0 },
        { json: "artist_name", js: "artist_name", typ: "" },
        { json: "track_share_url", js: "track_share_url", typ: "" },
        { json: "track_edit_url", js: "track_edit_url", typ: "" },
        { json: "restricted", js: "restricted", typ: 0 },
        { json: "updated_time", js: "updated_time", typ: Date },
        {
          json: "primary_genres",
          js: "primary_genres",
          typ: r("PrimaryGenres"),
        },
      ],
      false
    ),
    PrimaryGenres: o(
      [
        {
          json: "music_genre_list",
          js: "music_genre_list",
          typ: a(r("MusicGenreList")),
        },
      ],
      false
    ),
    MusicGenreList: o(
      [{ json: "music_genre", js: "music_genre", typ: r("MusicGenre") }],
      false
    ),
    MusicGenre: o(
      [
        { json: "music_genre_id", js: "music_genre_id", typ: 0 },
        { json: "music_genre_parent_id", js: "music_genre_parent_id", typ: 0 },
        { json: "music_genre_name", js: "music_genre_name", typ: "" },
        {
          json: "music_genre_name_extended",
          js: "music_genre_name_extended",
          typ: "",
        },
        { json: "music_genre_vanity", js: "music_genre_vanity", typ: "" },
      ],
      false
    ),
    TrackNameTranslationList: o(
      [
        {
          json: "track_name_translation",
          js: "track_name_translation",
          typ: r("TrackNameTranslation"),
        },
      ],
      false
    ),
    TrackNameTranslation: o(
      [
        { json: "language", js: "language", typ: "" },
        { json: "translation", js: "translation", typ: "" },
      ],
      false
    ),
    Header: o(
      [
        { json: "status_code", js: "status_code", typ: 0 },
        { json: "execute_time", js: "execute_time", typ: 3.14 },
        { json: "available", js: "available", typ: 0 },
      ],
      false
    ),
  };
}

export namespace lyrics {
  // To parse this data:
  //
  //   import { Convert, LyricsResponse } from "./file";
  //
  //   const lyricsResponse = Convert.toLyricsResponse(json);
  //
  // These functions will throw an error if the JSON doesn't
  // match the expected interface, even if the JSON is valid.

  export interface LyricsResponse {
    message: Message;
  }

  export interface Message {
    header: Header;
    body: Body;
  }

  export interface Body {
    lyrics: Lyrics;
  }

  export interface Lyrics {
    lyrics_id: number;
    explicit: number;
    lyrics_body: string;
    script_tracking_url: string;
    pixel_tracking_url: string;
    lyrics_copyright: string;
    updated_time: Date;
  }

  export interface Header {
    status_code: number;
    execute_time: number;
  }

  // Converts JSON strings to/from your types
  // and asserts the results of JSON.parse at runtime
  export class Convert {
    public static toLyricsResponse(json: string): LyricsResponse {
      return cast(JSON.parse(json), r("LyricsResponse"));
    }

    public static lyricsResponseToJson(value: LyricsResponse): string {
      return JSON.stringify(uncast(value, r("LyricsResponse")), null, 2);
    }
  }

  function invalidValue(typ: any, val: any, key: any, parent: any = ""): never {
    const prettyTyp = prettyTypeName(typ);
    const parentText = parent ? ` on ${parent}` : "";
    const keyText = key ? ` for key "${key}"` : "";
    throw Error(
      `Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(
        val
      )}`
    );
  }

  function prettyTypeName(typ: any): string {
    if (Array.isArray(typ)) {
      if (typ.length === 2 && typ[0] === undefined) {
        return `an optional ${prettyTypeName(typ[1])}`;
      } else {
        return `one of [${typ
          .map((a) => {
            return prettyTypeName(a);
          })
          .join(", ")}]`;
      }
    } else if (typeof typ === "object" && typ.literal !== undefined) {
      return typ.literal;
    } else {
      return typeof typ;
    }
  }

  function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
      const map: any = {};
      typ.props.forEach((p: any) => (map[p.json] = { key: p.js, typ: p.typ }));
      typ.jsonToJS = map;
    }
    return typ.jsonToJS;
  }

  function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
      const map: any = {};
      typ.props.forEach((p: any) => (map[p.js] = { key: p.json, typ: p.typ }));
      typ.jsToJSON = map;
    }
    return typ.jsToJSON;
  }

  function transform(
    val: any,
    typ: any,
    getProps: any,
    key: any = "",
    parent: any = ""
  ): any {
    function transformPrimitive(typ: string, val: any): any {
      if (typeof typ === typeof val) return val;
      return invalidValue(typ, val, key, parent);
    }

    function transformUnion(typs: any[], val: any): any {
      // val must validate against one typ in typs
      const l = typs.length;
      for (let i = 0; i < l; i++) {
        const typ = typs[i];
        try {
          return transform(val, typ, getProps);
        } catch (_) {}
      }
      return invalidValue(typs, val, key, parent);
    }

    function transformEnum(cases: string[], val: any): any {
      if (cases.indexOf(val) !== -1) return val;
      return invalidValue(
        cases.map((a) => {
          return l(a);
        }),
        val,
        key,
        parent
      );
    }

    function transformArray(typ: any, val: any): any {
      // val must be an array with no invalid elements
      if (!Array.isArray(val))
        return invalidValue(l("array"), val, key, parent);
      return val.map((el) => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
      if (val === null) {
        return null;
      }
      const d = new Date(val);
      if (isNaN(d.valueOf())) {
        return invalidValue(l("Date"), val, key, parent);
      }
      return d;
    }

    function transformObject(
      props: { [k: string]: any },
      additional: any,
      val: any
    ): any {
      if (val === null || typeof val !== "object" || Array.isArray(val)) {
        return invalidValue(l(ref || "object"), val, key, parent);
      }
      const result: any = {};
      Object.getOwnPropertyNames(props).forEach((key) => {
        const prop = props[key];
        const v = Object.prototype.hasOwnProperty.call(val, key)
          ? val[key]
          : undefined;
        result[prop.key] = transform(v, prop.typ, getProps, key, ref);
      });
      Object.getOwnPropertyNames(val).forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(props, key)) {
          result[key] = transform(val[key], additional, getProps, key, ref);
        }
      });
      return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
      if (val === null) return val;
      return invalidValue(typ, val, key, parent);
    }
    if (typ === false) return invalidValue(typ, val, key, parent);
    let ref: any = undefined;
    while (typeof typ === "object" && typ.ref !== undefined) {
      ref = typ.ref;
      typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
      return typ.hasOwnProperty("unionMembers")
        ? transformUnion(typ.unionMembers, val)
        : typ.hasOwnProperty("arrayItems")
        ? transformArray(typ.arrayItems, val)
        : typ.hasOwnProperty("props")
        ? transformObject(getProps(typ), typ.additional, val)
        : invalidValue(typ, val, key, parent);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
  }

  function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
  }

  function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
  }

  function l(typ: any) {
    return { literal: typ };
  }

  function o(props: any[], additional: any) {
    return { props, additional };
  }

  function r(name: string) {
    return { ref: name };
  }

  const typeMap: any = {
    LyricsResponse: o(
      [{ json: "message", js: "message", typ: r("Message") }],
      false
    ),
    Message: o(
      [
        { json: "header", js: "header", typ: r("Header") },
        { json: "body", js: "body", typ: r("Body") },
      ],
      false
    ),
    Body: o([{ json: "lyrics", js: "lyrics", typ: r("Lyrics") }], false),
    Lyrics: o(
      [
        { json: "lyrics_id", js: "lyrics_id", typ: 0 },
        { json: "explicit", js: "explicit", typ: 0 },
        { json: "lyrics_body", js: "lyrics_body", typ: "" },
        { json: "script_tracking_url", js: "script_tracking_url", typ: "" },
        { json: "pixel_tracking_url", js: "pixel_tracking_url", typ: "" },
        { json: "lyrics_copyright", js: "lyrics_copyright", typ: "" },
        { json: "updated_time", js: "updated_time", typ: Date },
      ],
      false
    ),
    Header: o(
      [
        { json: "status_code", js: "status_code", typ: 0 },
        { json: "execute_time", js: "execute_time", typ: 3.14 },
      ],
      false
    ),
  };
}
