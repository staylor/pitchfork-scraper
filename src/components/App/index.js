import React from 'react';
import { Route } from 'react-router-dom';
import Home from 'routes/Home';
import Rating from 'routes/Rating';

/* eslint-disable react/prop-types */

function App() {
  return (
    <section>
      <header>
        <h1>Pitchfork Reviews</h1>
      </header>
      <Route path="/rating/:score" component={Rating} />
      <Route path="/" exact component={Home} />
    </section>
  );
}

export default App;
