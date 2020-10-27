// Media Queries in JS
// need to know where to show the tippy boxes (cute ones)
const mediaQuery = () => {
  if (window.matchMedia("(max-width: 769px)").matches) {
    return "bottom";
  } else {
    return "right";
  }
};
let currentlyPlaying;

// running a media query check
const placement = mediaQuery();

// Misspelled song/artist name tippy box (cute one)
const songNotFoundCuteTippyBox = tippy(document.querySelector("#artistSongInputFields"), {
  content:
    "Sorry, it looks like you misspelled the song or artist name.. Please, please try that again! (We'll try our best to find it!)",
  animation: "perspective-extreme",
  placement: placement,
  maxWidth: 200,
  // showOnCreate: true,
  trigger: "manual",
  delay: [500, 200]
});

// Not found similar songs tippy box (cute one)
const similarNotFoundCuteTippyBox = tippy(document.querySelector("#songListSection"), {
  content:
    "Similar songs not found. We really tried. The song is probably not popular enough, so we can't make an educated recommendation. Maybe check the spelling again?",
  animation: "perspective-extreme",
  placement: placement,
  maxWidth: 200,
  // showOnCreate: true,
  trigger: "manual",
  delay: [500, 200]
});

const timerAsync = milliseconds => {
  return new Promise((resolve, reject) => {
    if (parseInt(milliseconds)) {
      setTimeout(() => resolve(), milliseconds);
    } else {
      reject();
    }
  });
};

// LastFM API
const lastFMGetTrackInfo = async (artist, track) => {
  const lastFMSearchResponse = await $.ajax({
    url: "https://ws.audioscrobbler.com/2.0/",
    method: "GET",
    data: {
      method: "track.getInfo",
      autocorrect: "1",
      api_key: "0288ec49437b4cf920a1f4c62e1f1f2a",
      artist: artist,
      track: track,
      format: "json"
    }
  });
  console.log("LastFM API: ", "Raw response for track info", lastFMSearchResponse);
  return lastFMSearchResponse;
};

const lastFMGetSimilarTracks = async lastFMSearchResponse => {
  // try catch block to catch an error if the array passed turns out empty
  // (invalid song/artist name passed to the previous function - lastFMGetTrackInfo)
  try {
    let i = 0;
    let j = 0;
    let lastFMSimilarTracks;
    // while loop to keep requesting if invalid result received
    while (i < 1) {
      lastFMSimilarTracks = await $.ajax({
        url: "https://ws.audioscrobbler.com/2.0/",
        method: "GET",
        data: {
          method: "track.getsimilar",
          artist: lastFMSearchResponse.track.artist.name,
          track: lastFMSearchResponse.track.name,
          api_key: "0288ec49437b4cf920a1f4c62e1f1f2a",
          format: "json",
          limit: "30"
        }
      });

      if (!lastFMSimilarTracks.similartracks.track.length) {
        console.log("--------------------ERROR--Similar-Tracks-----------------");
        console.log(
          "LastFM API: ",
          "Raw Response for similar tracks: ",
          lastFMSimilarTracks
        );
        console.log(
          "LastFM API: ",
          "Empty Similar Tracks returned\nRETRYING IN 2 SECONDS!"
        );
        await timerAsync(2000);
        console.log("LastFM API: ", "RETRYING NOW!");
        j++;
        if (j >= 2) {
          // timeout for smoother experience
          setTimeout(() => similarNotFoundCuteTippyBox.show(), 2000);

          // timeout 10 seconds and hide the tooltip (if not already closed by then)
          setTimeout(() => similarNotFoundCuteTippyBox.hide(), 15000);
          break;
        }
      } else {
        i++;
      }
    }

    console.log("LastFM API: ", "Raw Response for similar tracks: ", lastFMSimilarTracks);
    const similarTracks = [];
    for (let i = 0; i < lastFMSimilarTracks.similartracks.track.length; i++) {
      similarTracks.push([
        lastFMSimilarTracks.similartracks.track[i].artist.name,
        lastFMSimilarTracks.similartracks.track[i].name
      ]);
    }

    console.log("LastFM API: ", "Similar Tracks Array: ", similarTracks);

    return similarTracks;
  } catch (error) {
    // trigger this if the user entered a song or artist name incorrectly

    // timeout for smoother experience
    setTimeout(() => songNotFoundCuteTippyBox.show(), 500);

    // timeout 10 seconds and hide the tooltip (if not already closed by then)
    setTimeout(() => songNotFoundCuteTippyBox.hide(), 12000);
  }
};
// /!LastFM Api

// YouTube
const youTubeSearch = async searchQuery => {
  const youTubeSearchResult = await $.ajax({
    type: "GET",
    // no-cors headers requests a youtube scraper
    url: "https://youtube-parse.tk/api/search",
    dataType: "json",
    data: {
      q: searchQuery,
      page: "1"
    }
  });

  // returning the ID of the first result from YouTube
  return youTubeSearchResult.results[0].video.id;
};
// /! YouTube

// Genius API

// Searches for songs through geniusAPI
// Returns a URL of the first result
const geniusGetSongURLbyName = async songName => {
  // requesting search results from genius.com
  const geniusSearchResponse = await $.ajax({
    url: "https://api.genius.com/search",
    type: "GET",
    data: {
      q: songName,
      access_token: "39mbxzJoZqsELd5bHonlLHTdSRSj3vqWGn3pJ8mYRSad_y4K8maYbOKqgle3YeWA"
    }
  });

  console.log("GeniusAPI: ", "Searching for: ", songName);
  console.log(
    "GeniusAPI: ",
    geniusSearchResponse.response.hits.length,
    " results found."
  );

  console.log("GeniusAPI: ", "Only returning the first result.");
  console.log("GeniusAPI: ", "Raw response for Genius song lyrics", geniusSearchResponse);
  console.log(
    "GeniusAPI: ",
    "[0] Full title: ",
    geniusSearchResponse.response.hits[0].result.full_title
  );
  console.log(
    "GeniusAPI: ",
    "[0] Song URL: ",
    geniusSearchResponse.response.hits[0].result.url
  );

  songURL = geniusSearchResponse.response.hits[0].result.url;

  return songURL;
};

// Requests an html page for any given URL
// (made to work only with genius songs webpages)
// Returns song lyrics as an array
// where one item of the array equals one line of lyrics
const geniusGetLyricsBySongURL = async geniusSongUrl => {
  const regexATagsOpeningFull = new RegExp("<a[\\s\\S]*?>|</a>|<p>|</p>|<!--/", "g");

  // requesting the html page of the geniusSongUrl
  // assigning the response of the call to geniusSearchResponse
  let songHTML = await $.ajax({
    // no-cors headers
    url: `https://no-cors.tk/${geniusSongUrl}`,
    type: "GET",
    dataType: "html"
  });

  songHTML = songHTML.split("sse-->");

  const songLyricsArr = songHTML[3]
    .replace(regexATagsOpeningFull, "")
    .trim()
    .split("<br>");

  console.log(songLyricsArr);

  return songLyricsArr;
};
// /!Genius API

// Generates similar songs to the one entered
// takes 2 positional arguments
// :similar song list as an array (1 song - 1 item)
// :name of the currently entered song
const generateSimilarSongs = (similarSongsArray, artistNameSongNameArr) => {
  const artistName = artistNameSongNameArr[0];
  const songName = artistNameSongNameArr[1];

  const songListSection = $("#songListSection");
  songListSection.empty();

  const userEnteredSong = $("<li>")
    .attr({
      class: "song-item userEnteredSong listenedToSong",
      id: "currentlySelected",
      "data-artist": artistName,
      "data-song": songName,
      "data-user-entered": true
    })
    .text(songName + " by " + artistName);
  currentlyPlaying = userEnteredSong;
  songListSection.append(userEnteredSong);

  for (const artistNameSongName of similarSongsArray) {
    songListSection.append(
      $("<li>")
        .attr({
          class: "song-item",
          "data-artist": artistNameSongName[0],
          "data-song": artistNameSongName[1]
        })
        .text(artistNameSongName[1] + " by " + artistNameSongName[0])
    );
  }

  // adding bottom border to the last li element
  $(songListSection.children()[songListSection.children().length - 1]).attr(
    "style",
    "border-bottom: 1px solid black"
  );
};

// Generates lyrics on the page
// takes 1 positional argument
// :lyrics as an array (1 line - 1 item)
const generateLyrics = geniusLyricsArray => {
  const lyricsSection = $("#lyricsSection");
  lyricsSection.empty();

  for (const item of geniusLyricsArray) {
    lyricsSection.append($("<span>").attr("class", "lyrics-line").html(item));
  }
};

// Requests and generates everything concurrently
// takes 1 positional optional argument
// :passing artist and song name array if something specific needs to be generated
// otherwise using values from input fields
const generateAllSongElements = async (artistNameSongNameArr = null) => {
  const youTube = async () => {
    console.log("-------------------------------------STARTING YOUTUBE FUNCTION");
    const now = Date.now();
    // async YouTube-Scraper request for search results from YouTube
    const youTubeId = await youTubeSearch(
      songInfo.track.name + " " + songInfo.track.artist.name
    );
    // Generating YouTube embed on the page
    youTubeIframeSection.empty();
    youTubeIframeSection.append(
      $("<iframe>").attr({
        src: `https://www.youtube-nocookie.com/embed/${youTubeId}?modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&fs=0&color=white&autohide=0`,
        frameborder: "0",
        allow: "autoplay; fullscreen; encrypted-media",
        allowfullscreen: ""
      })
    );
    console.log("YOUTUBE: TOOK", Date.now() - now, "ms");
  };

  const genius = async () => {
    console.log("-------------------------------------STARTING GENIUS FUNCTION");
    const now = Date.now();
    // async Genius request for song URL
    const geniusSongURL = await geniusGetSongURLbyName(
      songInfo.track.artist.name + " " + songInfo.track.name
    );
    // async Genius request for lyrics of that song
    const geniusLyricsArray = await geniusGetLyricsBySongURL(geniusSongURL);
    // Generating Genius lyrics on the page
    generateLyrics(geniusLyricsArray);
    console.log("GENIUS: TOOK", Date.now() - now, "ms");
  };

  const lastFM = async () => {
    console.log("-------------------------------------STARTING LASTFM FUNCTION");
    const now = Date.now();
    // async lastFM request for similar songs
    const lastFMSimilarSongsArray = await lastFMGetSimilarTracks(songInfo);
    // Generating lastFM similar songs on the page
    generateSimilarSongs(lastFMSimilarSongsArray, [
      songInfo.track.artist.name,
      songInfo.track.name
    ]);
    console.log("LASTFM: TOOK", Date.now() - now, "ms");
  };

  let artistUserInput = $("#artistName");
  let songUserInput = $("#songName");
  let artistUser;
  let songUser;
  if (!artistNameSongNameArr) {
    artistUser = artistUserInput.val().trim();
    artistUserInput.val("");
  } else {
    artistUser = artistNameSongNameArr[0];
  }
  if (!artistNameSongNameArr) {
    songUser = songUserInput.val().trim();
    songUserInput.val("");
  } else {
    songUser = artistNameSongNameArr[1];
  }
  const youTubeIframeSection = $("#iframe-container");

  if (!artistUser) {
    // No artist name received
    return false;
    // TODO ADD A TIPBOX
  }

  if (!songUser) {
    // No song name received
    return false;
    // TODO ADD A TIPBOX
  }

  // async lastFM request for song information
  // everything else is based on that response
  console.log("-------------------------------------STARTING LASTFM");
  const songInfo = await lastFMGetTrackInfo(artistUser, songUser);
  if (!artistNameSongNameArr) {
    lastFM();
  }
  youTube();
  genius();
};

// Search Button on click event
$("#searchButton").on("click", () => {
  event.preventDefault();

  generateAllSongElements();
});

// Song from the song list on click event
$("#songListSection").on("click", ".song-item", event => {
  const songName = $(event.target).data("song");
  const artistName = $(event.target).data("artist");

  const currentSong = $(currentlyPlaying).data("song");
  const currentName = $(currentlyPlaying).data("artist");
  const isUserEntered = $(currentlyPlaying).data("user-entered");

  if (currentName === artistName && currentSong === songName) {
    return false;
  }

  console.log("OKAAY\n\n\n\n\n", $(currentlyPlaying).data("userEntered"));

  // checking if the song the user was listening to and click from was user entered
  if (isUserEntered) {
    $(currentlyPlaying).attr({
      class: "song-item userEnteredSong listenedToSong",
      id: ""
    });
  } else {
    $(currentlyPlaying).attr({
      class: "song-item listenedToSong",
      id: ""
    });
  }

  // checking if the song the user clicked on was user entered
  if ($(event.target).data("user-entered")) {
    $(event.target).attr({
      class: "song-item userEnteredSong listenedToSong",
      id: "currentlySelected"
    });
  } else {
    $(event.target).attr({
      class: "song-item listenedToSong",
      id: "currentlySelected"
    });
  }

  currentlyPlaying = $(event.target);

  generateAllSongElements([artistName, songName]);
  // change highligh to gray as well but id is priority
});
