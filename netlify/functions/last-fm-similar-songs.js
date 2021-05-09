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

    const { data: similarSongsData } = await axios.get(
      'https://ws.audioscrobbler.com/2.0/',
      {
        params: {
          method: 'track.getsimilar',
          autocorrect: '1',
          api_key: LASTFM_API_KEY,
          artist,
          track,
          limit: '30',
          format: 'json',
        },
      }
    )

    return {
      statusCode: 200,
      body: JSON.stringify(similarSongsData),
    }
  } catch (err) {
    return {
      statusCode: 500,
    }
  }
}
