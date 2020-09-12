

const mediaQuery = () => {
    if (window.matchMedia("(max-width: 769px)").matches) {
        return "bottom";
    } else {
        return "right";
    }
}
let currentlyPlaying;


const placement = mediaQuery();


const songNotFoundCuteTippyBox = tippy(document.querySelector("#artistSongInputFields"), {
    content: "Sorry, it looks like you misspelled the song or artist name.. Please, please try that again! (We'll try our best to find it!)",
    animation: "perspective-extreme",
    placement: placement,
    maxWidth: 200,

    trigger: "manual",
    delay: [500, 200],
});


const similarNotFoundCuteTippyBox = tippy(document.querySelector("#songListSection"), {
    content: "Similar songs not found. We really tried. The song is probably not popular enough, so we can't make an educated recommendation. Maybe check the spelling again?",
    animation: "perspective-extreme",
    placement: placement,
    maxWidth: 200,

    trigger: "manual",
    delay: [500, 200],
});


const timerAsync = (milliseconds) => {
    return new Promise((resolve, reject) => {
        if (parseInt(milliseconds)) {
            setTimeout(() => resolve(), milliseconds);
        } else {
            reject();
        }
    })
}


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
            format: "json",
        }
    })
    console.log("LastFM API: ", "Raw response for track info", lastFMSearchResponse)
    return lastFMSearchResponse;
}

const lastFMGetSimilarTracks = async (lastFMSearchResponse) => {


    try {
        let i = 0;
        let j = 0;
        let lastFMSimilarTracks;

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
            })

            if (!lastFMSimilarTracks.similartracks.track.length) {

                console.log("LastFM API: ", "Raw Response for similar tracks: ", lastFMSimilarTracks)

                await timerAsync(2000);

                j++;
                if (j >= 2) {

                    setTimeout(() => similarNotFoundCuteTippyBox.show(), 2000)


                    setTimeout(() => similarNotFoundCuteTippyBox.hide(), 15000)
                    break;
                }
            } else {
                i++;
            }
        }

        console.log("LastFM API: ", "Raw Response for similar tracks: ", lastFMSimilarTracks)
        const similarTracks = [];
        for (let i = 0; i < lastFMSimilarTracks.similartracks.track.length; i++) {
            similarTracks.push([lastFMSimilarTracks.similartracks.track[i].artist.name, lastFMSimilarTracks.similartracks.track[i].name])
        }



        return similarTracks;
    } catch (error) {



        setTimeout(() => songNotFoundCuteTippyBox.show(), 500)


        setTimeout(() => songNotFoundCuteTippyBox.hide(), 12000)
    }
}






const youTubeSearch = async (searchQuery) => {
    const youTubeSearchResult = await $.ajax({
        type: 'GET',

        url: 'http://167.172.223.24:3003/http://167.172.223.24:3002/api/search',
        dataType: "json",
        data: {
            q: searchQuery,
            page: '1'
        }
    })


    return youTubeSearchResult.results[0].video.id;
}









const geniusGetSongURLbyName = async (songName) => {

    const geniusSearchResponse = await $.ajax({
        url: "https://api.genius.com/search",
        type: "GET",
        data: {
            q: songName,
            access_token: "39mbxzJoZqsELd5bHonlLHTdSRSj3vqWGn3pJ8mYRSad_y4K8maYbOKqgle3YeWA"
        }
    })





    console.log("GeniusAPI: ", "Raw response for Genius song lyrics", geniusSearchResponse)



    songURL = geniusSearchResponse.response.hits[0].result.url;

    return songURL;
}







const geniusGetLyricsBySongURL = async (geniusSongUrl) => {
    const regexATagsOpeningFull = new RegExp("<a[\\s\\S]*?>|</a>|<p>|</p>|<!--/", "g");



    let songHTML = await $.ajax({

        url: `http://167.172.223.24:3003/${geniusSongUrl}`,
        type: "GET",
        dataType: "html"
    })

    songHTML = songHTML.split("sse-->");

    const songLyricsArr = songHTML[3].replace(regexATagsOpeningFull, "").trim().split("<br>");



    return songLyricsArr;
}








const generateSimilarSongs = (similarSongsArray, artistNameSongNameArr) => {

    const artistName = artistNameSongNameArr[0];
    const songName = artistNameSongNameArr[1];

    const songListSection = $("#songListSection");
    songListSection.empty();

    const userEnteredSong = $("<li>").attr({
        class: "song-item userEnteredSong listenedToSong",
        id: "currentlySelected",
        "data-artist": artistName,
        "data-song": songName,
        "data-user-entered": true
    }).text(songName + " by " + artistName);
    currentlyPlaying = userEnteredSong;
    songListSection.append(userEnteredSong);

    for (const artistNameSongName of similarSongsArray) {
        songListSection.append($("<li>").attr({
            class: "song-item",
            "data-artist": artistNameSongName[0],
            "data-song": artistNameSongName[1]
        }).text(artistNameSongName[1] + " by " +
            artistNameSongName[0]));
    }


    $(songListSection.children()[songListSection.children().length - 1]).attr("style", "border-bottom: 1px solid black");
}





const generateLyrics = (geniusLyricsArray) => {
    const lyricsSection = $("#lyricsSection");
    lyricsSection.empty();

    for (const item of geniusLyricsArray) {
        lyricsSection.append($("<span>").attr("class", "lyrics-line").html(item));
    }

}





const generateAllSongElements = async (artistNameSongNameArr = null) => {
    const youTube = async () => {

        const now = Date.now()

        const youTubeId = await youTubeSearch(songInfo.track.name + " " + songInfo.track.artist.name);

        youTubeIframeSection.empty();
        youTubeIframeSection.append($("<iframe>").attr({
            src: `https://www.youtube-nocookie.com/embed/${youTubeId}?modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&fs=0&color=white&autohide=0`,
            frameborder: "0",
            allow: "autoplay; fullscreen; encrypted-media",
            allowfullscreen: ""
        }))


    }

    const genius = async () => {

        const now = Date.now()

        const geniusSongURL = await geniusGetSongURLbyName(songInfo.track.artist.name + " " + songInfo.track.name);

        const geniusLyricsArray = await geniusGetLyricsBySongURL(geniusSongURL);

        generateLyrics(geniusLyricsArray);

    }

    const lastFM = async () => {

        const now = Date.now()

        const lastFMSimilarSongsArray = await lastFMGetSimilarTracks(songInfo);

        generateSimilarSongs(lastFMSimilarSongsArray, [songInfo.track.artist.name, songInfo.track.name]);

    }

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

        return false;

    }

    if (!songUser) {

        return false;

    }




    const songInfo = await lastFMGetTrackInfo(artistUser, songUser);
    if (!artistNameSongNameArr) {
        lastFM();
    }
    youTube();
    genius();
}




$("#searchButton").on("click", () => {
    event.preventDefault();

    generateAllSongElements();
});


$("#songListSection").on("click", ".song-item", (event) => {
    const songName = $(event.target).data("song");
    const artistName = $(event.target).data("artist");

    const currentSong = $(currentlyPlaying).data("song");
    const currentName = $(currentlyPlaying).data("artist");
    const isUserEntered = $(currentlyPlaying).data("user-entered");


    if (currentName === artistName && currentSong === songName) {
        return false;
    }




    if (isUserEntered) {
        $(currentlyPlaying).attr({
            "class": "song-item userEnteredSong listenedToSong",
            "id": ""
        });
    } else {
        $(currentlyPlaying).attr({
            "class": "song-item listenedToSong",
            "id": ""
        });
    }



    if ($(event.target).data("user-entered")) {
        $(event.target).attr({
            "class": "song-item userEnteredSong listenedToSong",
            "id": "currentlySelected"
        })
    } else {
        $(event.target).attr({
            "class": "song-item listenedToSong",
            "id": "currentlySelected"
        })
    }

    currentlyPlaying = $(event.target)

    generateAllSongElements([artistName, songName]);

})