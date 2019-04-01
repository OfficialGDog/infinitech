var app = new Framework7({
on: {
  init: function () {
  console.log('App initialized');
},
pageInit: function (page) {
if(page.name=='expenses'){
console.log("expenses page");
}
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

function fetchCategories(id){
  fetch("https://stormy-coast-58891.herokuapp.com/expenses/" + id)
  .then(response => response.json())
  .then(response => {let array = response.map((item) => item.Category); let listofcategories = array.reduce(function(prev, cur) {prev[cur] = (prev[cur] || 0) + 1; return prev;}, {}); var newarray = Object.keys(listofcategories).map(item => ({name: item, count: listofcategories[item]})); displayCategories(newarray)})
  .catch(err => console.error(err))
}


function displayCategories(categories){
  const colors = ['green', 'purple', 'orange', 'red'];
  if(categories.length > 0){
    for(var i = 0; i < categories.length; i++){
      let randomcolor = colors[Math.floor(Math.random() * colors.length)];
      document.getElementById("categories").innerHTML += "<div class='card theme-" + randomcolor + "' style='margin-top: 25px'><div class='card__part card__part-2 card__hover'><div class='card__part__side m--back'><div class='card__part__inner card__face' style='box-shadow: 5px 10px 8px #888888'><div class='card__face__colored-side'></div><div style='float: right;position: relative;top: 0px;padding-right: 10px;' class='card__greytext'><span>£3839.23</span><i class='f7-icons' style='position: absolute;top: 25px;font-size: 20px;padding-left: 5px'>chevron_right</i></div><h3 class='card__face__price ng-binding text-limited'>" + categories[i].name + "</h3><p class='card__greytext' style='width: 150px'>" + categories[i].count + " Expenses</p><div class='card__greytext' style='font-size: 15px'><i class='f7-icons' style='font-size: 18px; padding-right: 10px'>time</i>Awaiting confirmation...</div></div></div></div></div>";
    }
  }
}