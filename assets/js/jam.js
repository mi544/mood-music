import $ from 'jquery'
// `yt-player` uses EventEmitter class to extend from
// and therefore requires npm pckg `events` to be installed
// to be used on the front-end too
import YTPlayer from 'yt-player'
import { getBoxPlacementSide, initTippyBoxWithEl, showTippyBox } from './utils.js'
import {
  getSimilarTracks,
  getTrackDetails,
  getVideo,
  getLyrics,
} from './serviceClients.js'

const tippyBoxes = {}
const jamState = {
  player: null,
  userTrack: null,
  tracks: [],
  trackIndex: -2,
}

const fullReset = () => {
  // track list reset
  $('#song-list-section').empty()
  jamState.tracks.length = 0
  jamState.trackIndex = -2
  // player reset
  jamState.player.load('')
  // lyrics reset
  $('#lyrics-section').empty()
}

const generateLyrics = async (artist, track) => {
  // reset lyrics
  $('#lyrics-section').empty()

  // request lyrics
  const trackLyrics = await getLyrics(artist, track)

  if (!trackLyrics) {
    showTippyBox(tippyBoxes.lyricsNotFound, 250, 8250)
    // stop if none found
    return false
  }

  // add the lyrics to the DOM
  trackLyrics.lyrics.forEach((line) => {
    $('#lyrics-section').append($('<span>').attr('class', 'lyrics-line').html(line))
  })
}

const generateSimilarTracks = async (artist, track, userTrackEl = null) => {
  // request similar tracks
  const similarTracks = await getSimilarTracks(artist, track)

  if (!similarTracks) {
    showTippyBox(tippyBoxes.similarNotFound, 250, 8250)
    // stop if none found
    return false
  }

  userTrackEl.css({ borderBottom: 'none' })

  // add the tracks to the state
  jamState.tracks = similarTracks.map((track) => ({
    artist: track.artist.name,
    track: track.name,
  }))

  // add the tracks to the DOM
  jamState.tracks.forEach((track, index) => {
    $('#song-list-section').append(
      $('<li>')
        .attr({
          class: 'song-item',
          'data-artist': track.artist,
          'data-track': track.track,
          'data-index': index,
        })
        .text(`${track.track} by ${track.artist}`)
    )
  })

  $('#song-list-section').children(':last-child').css({ borderBottom: '1px solid black' })
}

const generateVideo = async (artist, track) => {
  // reset player
  jamState.player.load('')

  // request track video
  const trackVideo = await getVideo(artist, track)

  if (!trackVideo) {
    // stop if none found
    showTippyBox(tippyBoxes.videoNotFound, 250, 8250)
    return false
  }

  // load the video
  jamState.player.load(trackVideo.id)
  jamState.player.play()
}

const searchForTracks = async (artist, track) => {
  fullReset()

  // add user track to the state
  jamState.userTrack = { artist, track }
  jamState.trackIndex = -1

  // display it in the DOM
  const userTrackEl = $('<li>')
    .attr({
      class: 'song-item user-entered-song listened-to-song',
      id: 'currently-selected',
      'data-artist': artist,
      'data-track': track,
      'data-user-entered': true,
      'data-index': jamState.trackIndex,
    })
    .text(`${track} by ${artist}`)
    .css({ borderBottom: '1px solid black' })

  $('#song-list-section').append(userTrackEl)

  // confirm if the song exists
  const trackDetails = await getTrackDetails(artist, track)
  if (!trackDetails) {
    showTippyBox(tippyBoxes.songNotFound, 250, 8250)
    // stop if it doesn't exist
    return false
  }

  generateSimilarTracks(artist, track, userTrackEl)
  generateVideo(artist, track)
  generateLyrics(artist, track)
}

const onVideoFinish = () => {
  if (jamState.trackIndex === -2 || !jamState.tracks.length) {
    return false
  }

  if (jamState.trackIndex >= jamState.tracks.length - 1) {
    // end of similar tracks
    return false
  }

  jamState.trackIndex += 1
  const nextTrack = jamState.tracks[jamState.trackIndex]

  const previousTrackEl = $('#currently-selected')
  const nextTrackEl = $(`[data-index=${jamState.trackIndex}]`)
  previousTrackEl.attr('id', '')
  nextTrackEl.attr('id', 'currently-selected')
  nextTrackEl.attr('class', 'song-item listened-to-song')

  generateVideo(nextTrack.artist, nextTrack.track)
  generateLyrics(nextTrack.artist, nextTrack.track)
}

const onMount = () => {
  const placement = getBoxPlacementSide()

  tippyBoxes.songNotFound = initTippyBoxWithEl(
    '#search-form',
    "Sorry, it looks like the song or artist name were misspelled.. Please try that again! (We'll do our best to find it)",
    placement
  )

  tippyBoxes.similarNotFound = initTippyBoxWithEl(
    '#song-list-section',
    'Similar songs not found. The song is either not popular enough or is misspelled',
    placement
  )

  tippyBoxes.lyricsNotFound = initTippyBoxWithEl(
    '#lyrics-section',
    'Lyrics for that song not found',
    'top'
  )

  tippyBoxes.videoNotFound = initTippyBoxWithEl('#youtube-div', 'Video not found', 'top')

  tippyBoxes.noArtist = initTippyBoxWithEl(
    '#artist-name',
    'Please enter the artist name',
    placement
  )

  tippyBoxes.noSongName = initTippyBoxWithEl(
    '#song-name',
    'Please enter the song name',
    placement
  )

  $('#search-form').on('submit', (e) => {
    e.preventDefault()

    const artistVal = $('#artist-name').val().trim()
    const songVal = $('#song-name').val().trim()
    if (!artistVal) {
      showTippyBox(tippyBoxes.noArtist, 250, 2250)
      return false
    } else if (!songVal) {
      showTippyBox(tippyBoxes.noSongName, 250, 2250)
      return false
    }

    searchForTracks(artistVal, songVal)
  })

  $('#song-list-section').on('click', '.song-item', (e) => {
    const track = $(e.target).data('track')
    const artist = $(e.target).data('artist')
    const isUserEntered = $(e.target).data('user-entered')

    $('#currently-selected').attr('id', '')

    $(e.target).attr({ id: 'currently-selected' })
    if (isUserEntered) {
      jamState.trackIndex = -1
      $(e.target).attr({ class: 'song-item user-entered-song listened-to-song' })
    } else {
      jamState.trackIndex = $(e.target).data('index')
      $(e.target).attr({ class: 'song-item listened-to-song' })
    }

    generateVideo(artist, track)
    generateLyrics(artist, track)
  })

  jamState.player = new YTPlayer('#youtube-player', {
    autoplay: true,
    captions: false,
    controls: true,
    keyboard: true,
    fullscreen: false,
    annotations: false,
    modestBranding: true,
    related: true,
    timeupdateFrequency: 1000,
    playsInline: true,
    host: 'https://www.youtube-nocookie.com',
  })

  jamState.player.on('ended', onVideoFinish)
}

onMount()
