import fs from 'fs';
import fetch from 'node-fetch';
import cheerio from 'cheerio';

/* eslint-disable no-console */

const base = 'https://pitchfork.com/reviews/best/albums/';
const maxPages = 75;
const items = [];

const parseReview = $ => (i, review) => {
  const $r = $(review);
  const title = $r.find('.review__title-album').text();
  const artists = $r
    .find('.review__title-artist li')
    .map((_, node) => $(node).text())
    .get();
  const genres = $r
    .find('.genre-list__link')
    .map((_, node) => $(node).text())
    .get();
  const date = $r.find('.pub-date').attr('datetime');
  const image = $r.find('.review__artwork img').attr('src');
  const href = $r.find('.review__link').attr('href');
  const url = new URL(href, 'https://pitchfork.com').href;

  items.push({ title, artists, genres, date, image, url });
};

const request = (i = 1) => {
  const url = `${base}?page=${i}`;

  console.log('Fetching: ', url);
  return fetch(url)
    .then(r => r.text())
    .then(r => {
      const $ = cheerio.load(r);
      const iter = parseReview($);
      const reviews = $('.review');
      if (reviews.length === 0) {
        return Promise.resolve();
      }
      reviews.each(iter);

      if (i < maxPages) {
        return request(i + 1);
      }
      return Promise.resolve();
    });
};

const scoreRequest = async item => {
  const review = await fetch(item.url).then(r => r.text());
  console.log('Fetched: ', item.url);
  const $ = cheerio.load(review);
  return parseFloat($('.score-box .score').text());
};

(async () => {
  await request();

  const scored = [];
  await Promise.all(
    items.map(async album => {
      const score = await scoreRequest(album);
      console.log(score);
      scored.push({ ...album, score });
    })
  );

  fs.writeFileSync('best-new-albums.json', JSON.stringify(scored, null, 2));
})();
