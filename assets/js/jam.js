import $ from 'jquery'
import { getBoxPlacementSide, initTippyBoxWithEl, showTippyBox } from './utils.js'
import { getSimilarSongs, getSongDetails, getVideo, getLyrics } from './serviceClients.js'

const tippyBoxes = {}

const searchForSong = async (artist, track, resetAndSearch = true) => {
  if (resetAndSearch) $('#song-list-section').empty()
  $('#lyrics-section').empty()
  $('#iframe-container').empty()

  let verifiedArtist = artist
  let verifiedTrack = track

  if (resetAndSearch) {
    const userEnteredSongEl = $('<li>')
      .attr({
        class: 'song-item user-entered-song listened-to-song',
        id: 'currently-selected',
        'data-artist': artist,
        'data-track': track,
        'data-user-entered': true,
      })
      .text(`${track} by ${artist}`)
      .css({ borderBottom: '1px solid black' })

    $('#song-list-section').append(userEnteredSongEl)

    const songDetails = await getSongDetails(artist, track)
    if (!songDetails) {
      showTippyBox(tippyBoxes.songNotFound, 250, 8250)
      return false
    }

    userEnteredSongEl.css({ borderBottom: 'none' })

    verifiedArtist = songDetails.artist.name
    verifiedTrack = songDetails.name

    getSimilarSongs(verifiedArtist, verifiedTrack).then((similarSongs) => {
      if (!similarSongs) {
        showTippyBox(tippyBoxes.similarNotFound, 250, 8250)
        return false
      }
      const similarSongsFormatted = similarSongs.map((song) => ({
        artist: song.artist.name,
        track: song.name,
      }))

      similarSongsFormatted.forEach((song) => {
        $('#song-list-section').append(
          $('<li>')
            .attr({
              class: 'song-item',
              'data-artist': song.artist,
              'data-track': song.track,
            })
            .text(`${song.track} by ${song.artist}`)
        )
      })

      $('#song-list-section')
        .children(':last-child')
        .css({ borderBottom: '1px solid black' })
    })
  }

  getLyrics(verifiedArtist, verifiedTrack).then((songLyrics) => {
    if (!songLyrics) {
      showTippyBox(tippyBoxes.lyricsNotFound, 250, 8250)
      return false
    }

    songLyrics.lyrics.forEach((line) => {
      $('#lyrics-section').append($('<span>').attr('class', 'lyrics-line').html(line))
    })
  })

  getVideo(verifiedArtist, verifiedTrack).then((songVideo) => {
    if (!songVideo) {
      showTippyBox(tippyBoxes.videoNotFound, 250, 8250)
      return false
    }

    $('#iframe-container').append(
      $('<iframe>').attr({
        src: `https://www.youtube-nocookie.com/embed/${songVideo.id}?modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&fs=0&color=white&autohide=0`,
        frameborder: '0',
        allow: 'autoplay; fullscreen; encrypted-media',
        allowfullscreen: '',
      })
    )
  })
}

const onMount = () => {
  const placement = getBoxPlacementSide()

  tippyBoxes.songNotFound = initTippyBoxWithEl(
    '#search-form',
    "Sorry, it looks like you misspelled the song or artist name.. Please, please try that again! (We'll try our best to find it!)",
    placement
  )

  tippyBoxes.similarNotFound = initTippyBoxWithEl(
    '#song-list-section',
    "Similar songs not found. We really tried. The song is probably not popular enough, so we can't make an educated recommendation. Maybe check the spelling again?",
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
      return
    } else if (!songVal) {
      showTippyBox(tippyBoxes.noSongName, 250, 2250)
      return
    }

    searchForSong(artistVal, songVal)
  })

  $('#song-list-section').on('click', '.song-item', (e) => {
    const track = $(e.target).data('track')
    const artist = $(e.target).data('artist')
    const isUserEntered = $(e.target).data('user-entered')

    $('#currently-selected').attr('id', '')

    $(e.target).attr({ id: 'currently-selected' })
    if (isUserEntered) {
      $(e.target).attr({ class: 'song-item user-entered-song listened-to-song' })
    } else {
      $(e.target).attr({ class: 'song-item listened-to-song' })
    }

    searchForSong(track, artist, false)
  })
}

onMount()
