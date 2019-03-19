var app = new Framework7({
on: {
  init: function () {
  console.log('App initialized');
  },
},
  // App root element
  root: '#app',
  // App Name
  name: 'My App',
  // App id
  id: 'com.myapp.test',
  // Enable swipe panel
  panel: {
    swipe: 'left',
  },
  // Add default routes
  routes: routes

});

var mainView = app.views.create('.view-main');