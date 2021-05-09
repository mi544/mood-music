const axios = require('axios')

exports.handler = async (event) => {
  try {
    const { artist, track } = event.queryStringParameters

    const { data: similarSongsData } = await axios.get(
      'https://ws.audioscrobbler.com/2.0/',
      {
        params: {
          method: 'track.getsimilar',
          autocorrect: '1',
          api_key: process.env.LASTFM_API_KEY,
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
