-- Up
CREATE TABLE albums (
  album_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  date DATETIME NOT NULL,
  image TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  score FLOAT
);
CREATE TABLE artists (artist_id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE);
CREATE TABLE genres (genre_id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE);
CREATE TABLE album_artists (
  album_id INTEGER,
  artist_id INTEGER,
  PRIMARY KEY (album_id, artist_id),
  FOREIGN KEY (album_id) REFERENCES albums (album_id)
  ON DELETE CASCADE ON UPDATE NO ACTION,
  FOREIGN KEY (artist_id) REFERENCES artists (artist_id)
  ON DELETE CASCADE ON UPDATE NO ACTION
);
CREATE TABLE album_genres (
  album_id INTEGER,
  genre_id INTEGER,
  PRIMARY KEY (album_id, genre_id),
  FOREIGN KEY (album_id) REFERENCES albums (album_id)
  ON DELETE CASCADE ON UPDATE NO ACTION,
  FOREIGN KEY (genre_id) REFERENCES genres (genre_id)
  ON DELETE CASCADE ON UPDATE NO ACTION
);

-- Down
DROP TABLE albums;
DROP TABLE artists;
DROP TABLE genres;
DROP TABLE album_artists;
DROP TABLE album_genres;
