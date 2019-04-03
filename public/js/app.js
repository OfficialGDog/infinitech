const colors = ['green', 'purple', 'orange', 'red'];
var showAdminMessage = false;

var app = new Framework7({
on: {
  init: function () {
  console.log('App initialized');
},
pageInit: function (page) {
if(page.name=='expenses'){
  if(selected_index != null && filteredCategories != null && categories != null){
    let filteredExpenses = categories.filter(item => item.Category === filteredCategories[selected_index].name);
    for(var i = 0; i < filteredExpenses.length; i++){
      let randomcolor = colors[Math.floor(Math.random() * colors.length)];
      document.getElementById("expenses").innerHTML += "<div class='card theme-" + randomcolor + "' style='margin-top: 50px'><div class='card__part card__part-2 card__hover'><div class='card__part__side m--back'><div class='card__part__inner card__face' style='box-shadow: 5px 10px 8px #888888; height: 100px;'><div class='card__face__colored-side'></div><div style='float: right;position: relative;top: 0px;padding-right: 10px;' class='card__greytext'><span>" + filteredExpenses[i].Amount + "</span><i class='f7-icons' style='position: absolute;top: 25px;font-size: 20px;padding-left: 5px'>chevron_right</i></div><h3 class='card__face__price ng-binding text-limited'>" + filteredExpenses[i].Client_Project + "</h3><h4 class='card__greytext' style='font-weight: normal;margin: auto;margin-top: 15px;margin-bottom: 15px;'>" + filteredExpenses[i].Client_Name + ", " + filteredExpenses[i].Category + "</h4><p class='card__greytext' style='width: 80%;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;'>" + filteredExpenses[i].Expense_Desc + "</p><div class='card__greytext' style='font-size: 15px'><i class='f7-icons' style='font-size: 18px; padding-right: 10px'>time</i>Awaiting confirmation...</div></div></div></div></div>";
    }
    selected_index = null;
  }
}
else if(page.name=='categories' && showAdminMessage){
  document.getElementById("categories").innerHTML = "<h1>Admin has logged in.</h1>";
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

var categories = null;
var filteredCategories = null;
var selected_index = null;

function fetchCategories(id){
  fetch("https://stormy-coast-58891.herokuapp.com/expenses/" + id)
  .then(response => response.json())
  .then(response => {categories = response.slice(0); let array = response.map((item) => item.Category); let listofcategories = array.reduce(function(prev, cur) {prev[cur] = (prev[cur] || 0) + 1; return prev;}, {}); var newarray = Object.keys(listofcategories).map(item => ({name: item, count: listofcategories[item]})); filteredCategories = newarray.slice(0); displayCategories(response, newarray)})
  .catch(err => console.error(err))
}


function displayCategories(allexpenses,categories){
  while(document.getElementById("categories").innerHTML != null){
    if(categories.length > 0){
      for(var i = 0; i < categories.length; i++){
        let randomcolor = colors[Math.floor(Math.random() * colors.length)];
        let multiples = "s";
        if(categories[i].count > 1) {multiples = "s"} else {multiples = ""}
        document.getElementById("categories").innerHTML += "<a href='/expenses/' data-force='true' data-ignore-cache='true' onclick=" + "'updateIndex(" + i + ")'" + "><div class='card theme-" + randomcolor + "' style='margin-top: 25px'><div class='card__part card__part-2 card__hover'><div class='card__part__side m--back'><div class='card__part__inner card__face' style='box-shadow: 5px 10px 8px #888888'><div class='card__face__colored-side'></div><div style='float: right;position: relative;top: 0px;padding-right: 10px;' class='card__greytext'><span>£3839.23</span><i class='f7-icons' style='position: absolute;top: 25px;font-size: 20px;padding-left: 5px'>chevron_right</i></div><h3 class='card__face__price ng-binding text-limited'>" + categories[i].name + "</h3><p class='card__greytext' style='width: 150px'>" + categories[i].count + " Expense" + multiples + "</p><div class='card__greytext' style='font-size: 15px'><i class='f7-icons' style='font-size: 18px; padding-right: 10px'>time</i>Awaiting confirmation...</div></div></div></div></div><a>";
      }
    }
    else{
      document.getElementById("categories").innerHTML = "<h3 style='font-weight: normal; padding: 20px'>Uh oh! Looks like we couldn't find any expenses associated with your account 😭 Try creating a new expense by clicking the button in the bottom-right hand corner.</h3>";
    }
    break;
  }
}

function updateIndex(index){
  selected_index = index;
}

function test(){
  showAdminMessage = true;
}