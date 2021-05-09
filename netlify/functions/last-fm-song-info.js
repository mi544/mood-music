const axios = require('axios')

exports.handler = async (event) => {
  try {
    const { artist, track } = event.queryStringParameters

    const { data: songData } = await axios.get('https://ws.audioscrobbler.com/2.0/', {
      params: {
        method: 'track.getInfo',
        autocorrect: '1',
        api_key: process.env.LASTFM_API_KEY,
        artist,
        track,
        format: 'json',
      },
    })

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
