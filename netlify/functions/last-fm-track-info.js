const axios = require('axios')
const { LASTFM_API_KEY } = process.env

exports.handler = async (event) => {
  try {
    const { artist, track } = event.queryStringParameters
    if (!artist || !track) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          status: 'error',
          message: '`artist` or `track` parameter missing',
        }),
      }
    }

    // LastFM API reliably fails (~5 in 10 times), responding with
    // a status of song not found even when the song
    // can be found through search
    // takes ~1-5+ additional requests after an unsuccessful one
    // to get the song data
    let counter = 0
    let songResponse = null

    while (true) {
      counter += 1
      if (counter > 15) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            status: 'error',
            message: 'Song not found',
          }),
        }
      }

      // request song info

      songResponse = await axios.get('https://ws.audioscrobbler.com/2.0/', {
        params: {
          method: 'track.getInfo',
          autocorrect: '1',
          api_key: LASTFM_API_KEY,
          artist,
          track,
          format: 'json',
        },
      })

      if (!songResponse.data.error) {
        break
      }

      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    const songData = songResponse.data

    return {
      statusCode: 200,
      body: JSON.stringify(songData),
    }
  } catch (err) {
    return {
      statusCode: 500,
    }
  }
}
