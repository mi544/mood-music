class BaseApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
  }

  async get(url) {
    const response = await fetch(`${this.baseUrl}/${url}`)
    if (response.status !== 200) {
      throw Error(`Status code ${response.status}`)
    }
    return await response.json()
  }
}

const serverlessClient = new BaseApiClient(import.meta.env.VITE_SERVERLESS_URL)

const getTrackDetails = async (artist, track) => {
  try {
    const songDetails = await serverlessClient.get(
      `last-fm-track-info?artist=${artist}&track=${track}`
    )
    return songDetails.track
  } catch (err) {
    return null
  }
}

const getSimilarTracks = async (artist, track) => {
  try {
    const similarTracksData = await serverlessClient.get(
      `last-fm-similar-tracks?artist=${artist}&track=${track}`
    )
    return similarTracksData.similartracks.track
  } catch (err) {
    return null
  }
}

const getVideo = async (artist, track) => {
  try {
    const searchData = await serverlessClient.get(
      `youtube-search?artist=${artist}&track=${track}`
    )
    return searchData[0].video
  } catch (err) {
    return null
  }
}

const getLyrics = async (artist, track) => {
  try {
    const lyricsData = await serverlessClient.get(
      `genius-lyrics?artist=${artist}&track=${track}`
    )
    return lyricsData
  } catch (err) {
    return null
  }
}

export { getSimilarTracks, getTrackDetails, getVideo, getLyrics }
