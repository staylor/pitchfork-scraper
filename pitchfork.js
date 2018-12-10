import { URL } from 'url';
import fetch from 'node-fetch';
import cheerio from 'cheerio';
import minimist from 'minimist';
import sqlite from 'sqlite';
import SQL from 'sql-template-strings';
import Promise from 'bluebird';

/* eslint-disable no-console */

const maxPages = 2000;

const parseReview = (db, $) => async (i, review) => {
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

  return db
    .run(
      SQL`INSERT OR REPLACE INTO albums (name, date, image, url) VALUES (${title}, ${date}, ${image}, ${url})`
    )
    .then(async ({ stmt }) => {
      console.log('Inserted:', stmt.lastID);
      const albumId = stmt.lastID;

      // console.log(title, artists);

      await Promise.all(
        artists.map(artist =>
          db
            .run(SQL`INSERT OR REPLACE INTO artists (name) VALUES (${artist})`)
            .then(({ stmt: st }) => st.lastID)
        )
      ).then(artistIds =>
        Promise.all(
          artistIds.map(artistId =>
            db.run(
              SQL`INSERT OR REPLACE INTO album_artists (album_id, artist_id) VALUES (${albumId}, ${artistId})`
            )
          )
        )
      );

      await Promise.all(
        genres.map(genre =>
          db
            .run(SQL`INSERT OR REPLACE INTO genres (name) VALUES (${genre})`)
            .then(({ stmt: st }) => st.lastID)
        )
      ).then(genreIds =>
        Promise.all(
          genreIds.map(genreId =>
            db.run(
              SQL`INSERT OR REPLACE INTO album_genres (album_id, genre_id) VALUES (${albumId}, ${genreId})`
            )
          )
        )
      );

      return Promise.resolve();
    });
};

const request = (db, base, i = 1) => {
  const url = `${base}?page=${i}`;

  console.log('Fetching:', url);
  return fetch(url)
    .then(r => r.text())
    .then(r => {
      const $ = cheerio.load(r);
      const iter = parseReview(db, $);
      const reviews = $('.review');
      if (reviews.length === 0) {
        return Promise.resolve();
      }
      reviews.each(iter);

      if (i < maxPages) {
        return request(db, base, i + 1);
      }
      return Promise.resolve();
    });
};

const pageRows = async (db, rows) => {
  const queries = [];
  const promises = rows.splice(0, 25).map(row =>
    fetch(row.url)
      .then(r => r.text())
      .then(review => {
        const $ = cheerio.load(review);
        const score = $('.score-box .score')
          .eq(0)
          .text();
        queries.push(SQL`UPDATE albums SET score = ${score} WHERE album_id = ${row.album_id}`);
        console.log('Will set', row.album_id, 'score to', score);
      })
      .catch(() => Promise.resolve())
  );

  await Promise.all(promises);
  await Promise.all(queries.map(query => db.run(query)));

  if (rows.length > 0) {
    return pageRows(db, rows);
  }
  return Promise.resolve();
};

(async () => {
  const argv = minimist(process.argv.slice(2));
  let base;
  let doRequest = true;
  let offset = 0;
  let limit = -1;

  if (argv.reviews) {
    base = 'https://pitchfork.com/reviews/albums/';
  } else if (argv.best) {
    base = 'https://pitchfork.com/reviews/best/albums/';
  } else if (argv.scores) {
    doRequest = false;
    offset = argv.offset || 0;
    limit = argv.limit || -1;
  } else {
    throw new Error('You must specify a flag to request data.');
  }

  const db = await sqlite.open('./database.sqlite', { Promise, cached: true });

  if (argv.fresh) {
    await db.migrate({ force: 'last' });
  }

  if (doRequest) {
    await request(db, base);
  }

  const rows = await db.all(
    SQL`SELECT album_id, url FROM albums ORDER BY album_id DESC LIMIT ${limit} OFFSET ${offset}`
  );

  await pageRows(db, rows);

  const data = await db.all(SQL`SELECT * FROM albums LIMIT 10`);
  console.log(data);
})();