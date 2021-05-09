const axios = require('axios')
const { GENIUS_API_KEY } = process.env

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

    // this format works best with Genius
    const fullTitle = `${track} ${artist}`

    // request search results grom Genius API
    const { data: searchData } = await axios.get('https://api.genius.com/search', {
      params: {
        q: fullTitle,
        access_token: GENIUS_API_KEY,
      },
    })

    if (!searchData.response.hits.length) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          status: 'error',
          message: 'No lyrics found for this song',
        }),
      }
    }

    const songData = {
      id: searchData.response.hits[0].result.id,
      title: searchData.response.hits[0].result.full_title,
      artist: searchData.response.hits[0].result.primary_artist.name,
      url: searchData.response.hits[0].result.url,
      lyrics: null,
    }

    // about 3 in 10 times does not display lyrics, but request succeeds
    // keep requesting until lyrics are found
    // takes ~1-3 additional requests after an unsuccessful one
    // to get the lyrics
    let counter = 0
    let lyricsSectionHTML = ''

    while (true) {
      counter += 1
      if (counter > 6) {
        throw Error('Too many unsuccessful attempts')
      }

      // request song HTML code
      const { data: songHTML } = await axios.get(songData.url)
      // get everything from inside of <div class="lyrics">
      lyricsSectionHTML = songHTML.match(/<div class="lyrics">([\s\S]*?)<\/div>/i)?.[1]
      // break out of the loop if lyrics are found
      if (lyricsSectionHTML) {
        break
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    const regexHTMLCleanup = /<\/?a.*?>|<\/?p>|<!--\/?sse-->/gi

    songData.lyrics = lyricsSectionHTML
      .replace(/\n/g, '') // converts lyrics into 1 line
      .replace(regexHTMLCleanup, '') // removes HTML tags
      .trim() // gets rid of any leftover whitespace
      .split('<br>') // every line of lyrics is followed by a <br>
      .filter((x) => x) // removes any empty elements

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
