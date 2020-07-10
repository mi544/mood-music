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

function geniusGetLyrics() {
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




// Genius API

// Parsing lyrics
var regex = new RegExp(`<div class="lyrics">(.|\n)*<!--sse-->(.|\n)*<!--/sse-->`);
var songURL;

// var songNameForGenius = "my crib by slopps";
function geniusLyricsParser(songURL) {
    // TODO
    var check = false;
    $.ajax({
            url: "https://api.genius.com/search",
            type: "GET",
            data: {
                q: songNameForGenius,
                access_token: "39mbxzJoZqsELd5bHonlLHTdSRSj3vqWGn3pJ8mYRSad_y4K8maYbOKqgle3YeWA"
            }
        })


        .then(function (response) {
            console.log("GeniusAPI: ", "Searching for: ", songNameForGenius);
            console.log("GeniusAPI: ", response.response.hits.length, " results found.");

            console.log("GeniusAPI: ", "[0] Full title: ", response.response.hits[0].result.full_title);
            console.log("GeniusAPI: ", "[0] URL: ", response.response.hits[0].result.url);

            // TODO rename vars
            songURL = response.response.hits[0].result.url;
            console.log("this is songURL", songURL);
        })


        .then(
            function () {
                $.ajax({
                        // TODO
                        url: `https://cors-anywhere.herokuapp.com/${songURL}`,
                        type: "GET",
                        dataType: "html"
                    })

                    .then(function (response) {
                        var responseM = response.split("\n").map(function (row, j, arr) {
                            if (check === false) {
                                if (row.trim() === '<div class="lyrics">') {
                                    check = true;
                                    console.log(row);
                                    return row;

                                }
                            } else if (check === true) {
                                if (row.trim() === "<!--/sse-->") {
                                    check = false;
                                } else {
                                    return row
                                };
                            }


                        });



                        console.log(responseM);

                        // var lyrics = response.match(regex)[0].slice(55, response.match(regex)[0].length - 11).trim();
                        // for (var i = 0; lyrics.search("<br>") !== -1; i++) {
                        //     lyrics = lyrics.replace("<br>", "");
                        // }
                        // for (var i = 0; lyrics.search("<p>") !== -1; i++) {
                        //     lyrics = lyrics.replace("<p>", "");
                        // }
                        // for (var i = 0; lyrics.search("</p>") !== -1; i++) {
                        //     lyrics = lyrics.replace("</p>", "");
                        // }

                        // console.log(lyrics);
                        // document.write(lyrics);
                    })




            }
        );
}

// geniusLyricsParser();