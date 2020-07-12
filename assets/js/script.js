// Function that gets us our track mbid
const lastFMGetTrackInfo = async (artist, track) => {
    var lastFMSearchResponse = await $.ajax({
        url: "http://ws.audioscrobbler.com/2.0/",
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
        url: "http://ws.audioscrobbler.com/2.0/",
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
    console.log(similarTracks)
}



function youtubeSearch(searchQ) {
    $.ajax({
            type: 'GET',
            url: 'http://youtube-scrape.herokuapp.com/api/search',
            data: {
                q: searchQ,
                page: '1'
            }
        })
        .then(function (response) {
            console.log(response);
        });
}



// Genius API

// Searches for songs through geniusAPI
// Returns a URL of the first result
const geniusGetSongURLbyName = async (songNameForGenius = "my crib by slopps") => {
    // requesting search results from genius.com
    var geniusSearchResponse = await $.ajax({
        url: "https://api.genius.com/search",
        type: "GET",
        data: {
            q: songNameForGenius,
            access_token: "39mbxzJoZqsELd5bHonlLHTdSRSj3vqWGn3pJ8mYRSad_y4K8maYbOKqgle3YeWA"
        }
    })

    // TODO DEPLOY remove verbose logging (optionally)
    console.log("GeniusAPI: ", "Searching for: ", songNameForGenius);
    console.log("GeniusAPI: ", geniusSearchResponse.response.hits.length, " results found.");
    // TODO TALK always return first only?
    console.log("Only returning the first result.");

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
const geniusGetLyricsBySongURL = async (songURL) => {
    var regexATagsOpeningFull = new RegExp("<a[\\s\\S]*?>|</a>|<p>|</p>|<!--/", "g");

    // requesting the html page of the songURL
    // assigning the response of the call to geniusSearchResponse
    var songHTML = await $.ajax({
        url: `https://cors-anywhere.herokuapp.com/${songURL}`,
        type: "GET",
        dataType: "html"
    })

    songHTML = songHTML.split("sse-->");

    var songLyricsArr = songHTML[3].replace(regexATagsOpeningFull, "").trim().split("<br>");

    console.log(songLyricsArr);

    return songLyricsArr;
}



// TODO jsdoc
const generateLyrics = (lyricsArray) => {

    var lyricsSection = $("#lyrics-section");
    lyricsSection.empty();

    for (item of lyricsArray) {
        lyricsSection.append($("<span>").attr("class", "lyrics-line").text(item));
    }

}

// // function for calling lastFM data
// (async function () {

// })()


(async () => {
    // lastFM calls
    // lastFMGetTrackInfo("plini", "electric sunrise")
    var result = await lastFMGetTrackInfo("animals as leaders", "CAFO")
    lastFMGetSimilarTracks(result)

    // genius calls
    var songURL = await geniusGetSongURLbyName("baby got back");
    // var songURL = await geniusGetSongURLbyName();
    var lyricsArray = await geniusGetLyricsBySongURL(songURL);
    // generateLyrics(lyricsArray);
})();