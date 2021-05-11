/*
MIT License

Copyright (c) 2020 Herman Fassett

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*
Changes from original made by Maksim Verkhoturov:
- Minor JavaScript improvements
- Major architectural changes
- Changes to integrate parser code into a serverless function
- Migration from `request` package to `axios`
*/

const axios = require('axios')

/**
 * Parse a channelRenderer object from youtube search results
 * @param {object} renderer - The channel renderer
 * @returns object with data to return for this channel
 */
function parseChannelRenderer(renderer) {
  let channel = {
    id: renderer.channelId,
    title: renderer.title.simpleText,
    url: `https://www.youtube.com${renderer.navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
    snippet: renderer.descriptionSnippet
      ? renderer.descriptionSnippet.runs.reduce(comb, '')
      : '',
    thumbnail_src:
      renderer.thumbnail.thumbnails[renderer.thumbnail.thumbnails.length - 1].url,
    video_count: renderer.videoCountText
      ? renderer.videoCountText.runs.reduce(comb, '')
      : '',
    subscriber_count: renderer.subscriberCountText
      ? renderer.subscriberCountText.simpleText
      : '0 subscribers',
    verified:
      (renderer.ownerBadges &&
        renderer.ownerBadges.some(
          (badge) => badge.metadataBadgeRenderer.style.indexOf('VERIFIED') > -1
        )) ||
      false,
  }

  return { channel }
}

/**
 * Parse a playlistRenderer object from youtube search results
 * @param {object} renderer - The playlist renderer
 * @returns object with data to return for this playlist
 */
function parsePlaylistRenderer(renderer) {
  let thumbnails =
    renderer.thumbnailRenderer.playlistVideoThumbnailRenderer.thumbnail.thumbnails
  let playlist = {
    id: renderer.playlistId,
    title: renderer.title.simpleText,
    url: `https://www.youtube.com${renderer.navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
    thumbnail_src: thumbnails[thumbnails.length - 1].url,
    video_count: renderer.videoCount,
  }

  let uploader = {
    username: renderer.shortBylineText.runs[0].text,
    url: `https://www.youtube.com${renderer.shortBylineText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
  }

  return { playlist: playlist, uploader: uploader }
}

/**
 * Parse a radioRenderer object from youtube search results
 * @param {object} renderer - The radio renderer
 * @returns object with data to return for this mix
 */
function parseRadioRenderer(renderer) {
  let radio = {
    id: renderer.playlistId,
    title: renderer.title.simpleText,
    url: `https://www.youtube.com${renderer.navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
    thumbnail_src:
      renderer.thumbnail.thumbnails[renderer.thumbnail.thumbnails.length - 1].url,
    video_count: renderer.videoCountText.runs.reduce(comb, ''),
  }

  let uploader = {
    username: renderer.shortBylineText ? renderer.shortBylineText.simpleText : 'YouTube',
  }

  return { radio: radio, uploader: uploader }
}

/**
 * Parse a videoRenderer object from youtube search results
 * @param {object} renderer - The video renderer
 * @returns object with data to return for this video
 */
function parseVideoRenderer(renderer) {
  let video = {
    id: renderer.videoId,
    title: renderer.title.runs.reduce(comb, ''),
    url: `https://www.youtube.com${renderer.navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
    duration: renderer.lengthText ? renderer.lengthText.simpleText : 'Live',
    snippet: renderer.descriptionSnippet
      ? renderer.descriptionSnippet.runs.reduce(
          (a, b) => a + (b.bold ? `<b>${b.text}</b>` : b.text),
          ''
        )
      : '',
    upload_date: renderer.publishedTimeText
      ? renderer.publishedTimeText.simpleText
      : 'Live',
    thumbnail_src:
      renderer.thumbnail.thumbnails[renderer.thumbnail.thumbnails.length - 1].url,
    views: renderer.viewCountText
      ? renderer.viewCountText.simpleText || renderer.viewCountText.runs.reduce(comb, '')
      : renderer.publishedTimeText
      ? '0 views'
      : '0 watching',
  }

  let uploader = {
    username: renderer.ownerText.runs[0].text,
    url: `https://www.youtube.com${renderer.ownerText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
  }
  uploader.verified =
    (renderer.ownerBadges &&
      renderer.ownerBadges.some(
        (badge) => badge.metadataBadgeRenderer.style.indexOf('VERIFIED') > -1
      )) ||
    false

  return { video: video, uploader: uploader }
}

/**
 * Combine array containing objects in format { text: "string" } to a single string
 * For use with reduce function
 * @param {string} a - Previous value
 * @param {object} b - Current object
 * @returns Previous value concatenated with new object text
 */
function comb(a, b) {
  return a + b.text
}

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

    const fullTitle = `${track} ${artist}`

    // Specify YouTube search URL
    const searchUrl = `https://www.youtube.com/results?q=${encodeURIComponent(fullTitle)}`

    // Request YouTube search results
    const { data: searchHTML } = await axios.get(searchUrl)

    const results = []

    // Get script json data from html to parse
    let match = searchHTML.match(/ytInitialData[^{]*(.*?);\s*<\/script>/s)
    if (!match || match.length <= 1) {
      match = searchHTML.match(
        /ytInitialData"[^{]*(.*);\s*window\["ytInitialPlayerResponse"\]/s
      )
    }
    const parseData = JSON.parse(match[1])
    const sectionLists =
      parseData.contents.twoColumnSearchResultsRenderer.primaryContents
        .sectionListRenderer.contents

    // Loop through all objects and parse data according to type
    sectionLists.forEach((sectionList) => {
      if (sectionList.hasOwnProperty('itemSectionRenderer')) {
        sectionList.itemSectionRenderer.contents.forEach((content) => {
          if (content.hasOwnProperty('channelRenderer')) {
            results.push(parseChannelRenderer(content.channelRenderer))
          }
          if (content.hasOwnProperty('videoRenderer')) {
            results.push(parseVideoRenderer(content.videoRenderer))
          }
          if (content.hasOwnProperty('radioRenderer')) {
            results.push(parseRadioRenderer(content.radioRenderer))
          }
          if (content.hasOwnProperty('playlistRenderer')) {
            results.push(parsePlaylistRenderer(content.playlistRenderer))
          }
        })
      }
    })

    if (!results.length) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          status: 'error',
          message: 'No songs found',
        }),
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(results),
    }
  } catch (err) {
    return {
      statusCode: 500,
    }
  }
}
