![header](assets/github/header.png)

# Mood Music

### *I don't have anything to hide, but I don't have anything to show you either.*

![Updated](https://img.shields.io/static/v1?label=updated&message=July%2013th%202020&color=00D1B2&style=flat-square)

# Index

1. [Contributing](#contributing)
2. [Browser extensions](#browser-extensions)
3. **[Replacements/alternatives](#replacementsalternatives)**
    1. [Disclaimer](#disclaimer)
    2. [Web-based products](#web-based-products)
    3. [Operating systems](#operating-systems)
    4. [Desktop applications](#desktop-apps)
    5. [Mobile applications](#mobile-apps)
    6. [Hardware](#hardware)
4. [Useful links, tools, and advice](#useful-links-tools-and-advice)
    1. [Resources](#resources)
    1. [Books](#books)
    1. [Blog posts](#blog-posts)
    1. [News articles](#news-articles)
5. [The lighter side](#the-lighter-side)
6. [Closing remarks](#closing-remarks)


# Resourses Used

| Name | Description |
| ---- | ----------- |
| [jQuery](https://jquery.com/) ![jQuery Badge](https://img.shields.io/static/v1?label=Library&message=jQuery&color=E63946&style=for-the-badge&logo=javascript) | We used [jQuery](https://jquery.com/) in this Project to target HTML elements, pull/assign attributes and make ajax calls to APIs and webpages.
| [Tippy.JS](https://atomiks.github.io/tippyjs/) ![Tippy.JS Badge](https://img.shields.io/static/v1?label=Library&message=Tippy.JS&color=E63946&style=for-the-badge&logo=javascript) | Based on [Popper.JS](https://popper.js.org/), this library allow you to use tooltips, popovers, dropdowns and menus out of the box, with little to no additional adjustments necessary.<br />We made use of tooltips to notify the user if we couldn't find a song requested or if it wasn't popular enough for us to give aN educated recommendation on it.
| [Bulma](https://bulma.io/) ![Bulma Badge](https://img.shields.io/static/v1?label=Library&message=Tippy.JS&color=E63946&style=for-the-badge&logo=css3) | [Bulma](https://github.com/jgthms/bulma) is a free open-source CSS framework based on Flexbox. It was created with mobile responsiveness in mind, which was ideal for us.<br />We used [Bulma](https://github.com/jgthms/bulma) to build our pages' layout quickly and almost effortlessly thanks to the extensive list of classes provided by the framework.<br />Thanks to [Bulma](https://github.com/jgthms/bulma) we had more time to focus on fine-tuning styling of particular elements, and we had more time to dedicate to discussing, experimenting and using various APIs through JavaScript.
| [LastFM API](https://www.last.fm/api/) ![LastFM Badge](https://img.shields.io/static/v1?label=API&message=LastFM&color=E63946&style=for-the-badge&logo=a-frame) | [LastFM](https://www.last.fm/) is a service that allows anyone to "scrobble" their music while listening to it, essentially recording and keeping a complete list of all the music they ever listened to, how many times they did it and at what exact time of the day they did it. [LastFM](https://www.last.fm/) is used by millions of users every day, and, because of that, it has an extensive collection of similar songs that people like. It has an open and free API that allows to request information about songs, get similar songs based on one song passed, get tag information and even update profile information through the API.<br />We made use of [LastFM's](https://www.last.fm/) _Track.getInfo_ and _Track.getSimilar_ API methods. We set a limit to 30 songs a query, and after the user enters their favorite song, we then display similar songs received from [LastFM](https://www.last.fm/) in a list in our app.
| [YouTube Scrape](https://github.com/HermanFassett/youtube-scrape) ![YouTube Scrape Badge](https://img.shields.io/static/v1?label=API&message=YouTube%20Scrape&color=E63946&style=for-the-badge&logo=a-frame) | here we talk about why and what for we used youTube scraper
| [Genius.com](genius.com) ![Genius.com Badge](https://img.shields.io/static/v1?label=API&message=genius.com&color=E63946&style=for-the-badge&logo=a-frame) | We used a mix of Genius.com API and scraping ...
| [CORS Anywhere](https://github.com/Rob--W/cors-anywhere) ![CORS Anywhere Badge](https://img.shields.io/static/v1?label=proxy&message=cors%20anywhere&color=E63946&style=for-the-badge&logo=server%20fault) | we used this [https://cors-anywhere.herokuapp.com/](https://cors-anywhere.herokuapp.com/) CORS headers this and that talk about the requirement was that it's client-side only
***

it also doesn't use cookies at all youtube-nocookie etc..

using regex to parse scraped lyrics etc.

# Replacements/alternatives

### *Disclaimer*

1. Only **privacy/security** focused alternatives will be suggested.
2. Many replacements are based off [this Wikipedia article (List of Google products)](https://en.wikipedia.org/wiki/List_of_Google_products)
3. Products from companies such as Microsoft, Apple, Yahoo, Amazon, etc. will *not* be recommended unless there is a very good reason to. This includes companies/apps/services they own.
4. Controversial services will have a disclaimer attached if needed.
5. 5-eyes, 9-eyes, and 14-eyes services **will** be listed, and marked as such. This means the company, not the server IP.
    - **5**: Australia, Canada, New Zealand, UK, USA
    - **9**: Denmark, France, Netherlands, Norway
    - **14**: Germany, Belgium, Italy, Sweden, Spain
    - [What are 5-eyes, 9-eyes, and 14-eyes?](https://www.privacytools.io/providers/#ukusa)


## Web-based products
[![Back to top](https://img.shields.io/badge/Back%20to%20top-lightgrey?style=flat-square)](#index)
