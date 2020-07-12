// LastFM API
const lastFMGetTrackInfo = async (artist, track) => {
    var lastFMSearchResponse = await $.ajax({
        url: "https://ws.audioscrobbler.com/2.0/",
        method: "GET",
        data: {
            method: "track.getInfo",
            autocorrect: "1",
            api_key: "0288ec49437b4cf920a1f4c62e1f1f2a",
            artist: artist,
            track: track,
            format: "json",
        }
    })
    console.log(lastFMSearchResponse)
    return lastFMSearchResponse;
}

const lastFMGetSimilarTracks = async (lastFMRes) => {

    var lastFMSimilarTracks = await $.ajax({
        url: "https://ws.audioscrobbler.com/2.0/",
        method: "GET",
        data: {
            method: "track.getsimilar",
            artist: lastFMRes.track.artist.name,
            track: lastFMRes.track.name,
            api_key: "0288ec49437b4cf920a1f4c62e1f1f2a",
            format: "json",
            limit: "10"
        }
    })
    console.log(lastFMSimilarTracks)
    var similarTracks = [];
    for (var i = 0; i < lastFMSimilarTracks.similartracks.track.length; i++) {
        similarTracks.push(lastFMSimilarTracks.similartracks.track[i].name + ' by ' + lastFMSimilarTracks.similartracks.track[i].artist.name)
    }

    console.log(similarTracks);

    return similarTracks;
}
// /!LastFM Api




// YouTube
const youTubeSearch = async (searchQuery) => {
    var youTubeSearchResult = await $.ajax({
        type: 'GET',
        url: 'https://cors-anywhere.herokuapp.com/http://youtube-scrape.herokuapp.com/api/search',
        dataType: "json",
        data: {
            q: searchQuery,
            page: '1'
        }
    })

    // returning the ID of the first result from YouTube
    return youTubeSearchResult.results[0].video.id;
}
// /! YouTube




// Genius API

// Searches for songs through geniusAPI
// Returns a URL of the first result
const geniusGetSongURLbyName = async (songName) => {
    // requesting search results from genius.com
    var geniusSearchResponse = await $.ajax({
        url: "https://api.genius.com/search",
        type: "GET",
        data: {
            q: songName,
            access_token: "39mbxzJoZqsELd5bHonlLHTdSRSj3vqWGn3pJ8mYRSad_y4K8maYbOKqgle3YeWA"
        }
    })

    // TODO DEPLOY remove verbose logging (optionally)
    console.log("GeniusAPI: ", "Searching for: ", songName);
    console.log("GeniusAPI: ", geniusSearchResponse.response.hits.length, " results found.");
    // TODO TALK always return first only?
    console.log("Only returning the first result.");
    console.log(geniusSearchResponse.response)
    console.log("GeniusAPI: ", "[0] Full title: ", geniusSearchResponse.response.hits[0].result.full_title);
    console.log("GeniusAPI: ", "[0] Song URL: ", geniusSearchResponse.response.hits[0].result.url);

    // TODO rename vars
    songURL = geniusSearchResponse.response.hits[0].result.url;

    return songURL;
}



// Requests an html page for any given URL
// (made to work only with genius songs webpages)
// Returns song lyrics as an array
// where one item of the array equals one line of lyrics
const geniusGetLyricsBySongURL = async (geniusSongUrl) => {
    var regexATagsOpeningFull = new RegExp("<a[\\s\\S]*?>|</a>|<p>|</p>|<!--/", "g");

    // requesting the html page of the geniusSongUrl
    // assigning the response of the call to geniusSearchResponse
    var songHTML = await $.ajax({
        url: `https://cors-anywhere.herokuapp.com/${geniusSongUrl}`,
        type: "GET",
        dataType: "html"
    })

    songHTML = songHTML.split("sse-->");

    var songLyricsArr = songHTML[3].replace(regexATagsOpeningFull, "").trim().split("<br>");

    console.log(songLyricsArr);

    return songLyricsArr;
}
// /!Genius API



// Generates similar songs to the one entered
// takes 2 positional arguments
// :similar song list as an array (1 song - 1 item)
// :name of the currently entered song
const generateSimilarSongs = (similarSongsArray, songName) => {

    var songListSection = $("#songListSection");
    songListSection.empty();

    songListSection.append($("<li>").attr({
        class: "song-item",
        id: "enteredSong"
    }).text(songName));

    for (item of similarSongsArray) {
        songListSection.append($("<li>").attr("class", "song-item").text(item));
    }

}


// Generates lyrics on the page
// takes 1 positional argument
// :lyrics as an array (1 line - 1 item)
const generateLyrics = (geniusLyricsArray) => {
    var lyricsSection = $("#lyricsSection");
    lyricsSection.empty();

    for (item of geniusLyricsArray) {
        lyricsSection.append($("<span>").attr("class", "lyrics-line").html(item));
    }

}


const generateAllSongElements = async () => {
    var artistUserInput = $("#artistName");
    var songUserInput = $("#songName");
    var artistUser = artistUserInput.val().trim();
    artistUserInput.val("");
    var songUser = songUserInput.val().trim();
    songUserInput.val("");
    var youTubeIframeSection = $("#iframe-container");

    // async lastFM request for song information
    // everything else is based on that response
    var songInfo = await lastFMGetTrackInfo(artistUser, songUser);
    // async lastFM request for similar songs
    var lastFMSimilarSongsArray = await lastFMGetSimilarTracks(songInfo);
    // async YouTube-Scraper request for search results from YouTube
    var youTubeId = await youTubeSearch(songInfo.track.name + " " + songInfo.track.artist.name);
    // async Genius request for song URL
    var geniusSongURL = await geniusGetSongURLbyName(songInfo.track.name + " " + songInfo.track.artist.name);
    // async Genius request for lyrics of that song
    var geniusLyricsArray = await geniusGetLyricsBySongURL(geniusSongURL);

    // Generating lastFM similar songs on the page
    generateSimilarSongs(lastFMSimilarSongsArray, songInfo.track.name + " by " + songInfo.track.artist.name);

    // Generating Genius lyrics on the page
    generateLyrics(geniusLyricsArray);

    // Generating YouTube embed on the page
    youTubeIframeSection.empty();
    youTubeIframeSection.append($("<iframe>").attr({
        src: `https://www.youtube-nocookie.com/embed/${youTubeId}?modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&fs=0&color=white&autohide=0`,
        frameborder: "0",
        gesture: "media",
        allow: "autoplay; encrypted-media",
        allowfullscreen: ""
    }))
}




// Search Button on click event
$("#searchButton").on("click", () => {
    event.preventDefault();
    generateAllSongElements();
});