import React from 'react';
import { withRouter, Route } from 'react-router-dom';
import Home from 'routes/Home';
import Rating from 'routes/Rating';

/* eslint-disable react/prop-types */

function App() {
  return (
    <section>
      <Route path="/rating/:score" component={Rating} />
      <Route path="/" exact component={Home} />
    </section>
  );
}

export default withRouter(App);
