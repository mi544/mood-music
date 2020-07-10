// Function that gets us our track mbid
function getTrackInfo() {
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
function getSimilarSong(response) {


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





// youtube API
function youtubeSearch(searchQ) {
    $.ajax({
            type: 'GET',
            url: 'https://www.googleapis.com/youtube/v3/search',
            data: {
                key: 'AIzaSyDcZydHg3A14jzQpXUnM7HElOVHptJIpU0',
                q: searchQ,
                part: 'snippet',
                maxResults: 5,
                type: 'video',
                videoEmbeddable: true,
            }
        })
        .then(function (response) {
            console.log(response);
        });
}


// Genius API
var regex = new RegExp(`<div class="lyrics">(.|\n)*<!--sse-->(.|\n)*<!--/sse-->`);

function geniusLyricsParser() {
    $.ajax({
            url: "https://cors-anywhere.herokuapp.com/https://genius.com/Slopps-my-crib-lyrics",
            type: "GET",
            dataType: "html"
        })

        .then(function (response) {
            var lyrics = response.match(regex)[0].slice(55, response.match(regex)[0].length - 11).trim();
            for (var i = 0; lyrics.search("<br>") !== -1; i++) {
                lyrics = lyrics.replace("<br>", "");
            }
            for (var i = 0; lyrics.search("<p>") !== -1; i++) {
                lyrics = lyrics.replace("<p>", "");
            }
            for (var i = 0; lyrics.search("</p>") !== -1; i++) {
                lyrics = lyrics.replace("</p>", "");
            }
            console.log(lyrics);



        });
}

geniusLyricsParser();