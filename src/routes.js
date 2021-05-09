import React from 'react';

const Params = React.lazy(() => import('./views/params/Params'));
const Chart = React.lazy(() => import('./views/Chart/Chart'));

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/params', name: 'Params', component: Params },
  { path: '/chart', exact: true, name: 'Chart', component: Chart },
];

export default routes;
