// Function that gets us our track mbid
function lastFMGetTrackInfo() {
    var artist = "the xx";
    var song = "crystalize";
    var queryURL = `http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=0288ec49437b4cf920a1f4c62e1f1f2a&artist=${artist}&track=${song}&format=json`
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        getSimilarSong(response)
    })
}
// function that get our similar song list
function lastFMGetSimilarSongs(response) {


    $.ajax({
        url: "http://ws.audioscrobbler.com/2.0/",
        method: "GET",
        data: {
            method: "track.getsimilar",
            mbid: response.track.mbid,
            api_key: "0288ec49437b4cf920a1f4c62e1f1f2a",
            format: "json",
            limit: "10"
        }
    }).then(function (data) {
        for (var i = 0; i < data.similartracks.track.length; i++) {
            console.log(data)
            console.log(data.similartracks.track[i].name)
            console.log(data.similartracks.track[i].artist.name)
            console.log(data.similartracks.track[i].mbid)
        }
    })
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


(async () => {
    var songURL = await geniusGetSongURLbyName("baby got back");
    // var songURL = await geniusGetSongURLbyName();
    var lyricsArray = await geniusGetLyricsBySongURL(songURL);
    generateLyrics(lyricsArray);
})();