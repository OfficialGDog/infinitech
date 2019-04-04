const colors = ['green', 'purple', 'orange', 'red'];
var logindata = null;
var showAdminMessage = false;
var expenses = null;
var filteredCategories = null;
var filteredProject = null;

var app = new Framework7({
  picker: {
    toolbarCloseText: ""
  },
on: {
  init: function () {
  console.log('App initialized');
},
pageInit: function (page) {
if(page.name=='expenses'){
  if(selected_index != null && filteredCategories != null && filteredProject != null && expenses != null){
    let filteredExpenses = null;
    let type = null;
    let value = document.getElementById("filter").value;
    switch(value)
    {
      case "Categories":
      filteredExpenses = expenses.filter(item => item.Category === filteredCategories[selected_index].name);
      type = "category";
      break;
      case "Project Name":
      filteredExpenses = expenses.filter(item => item.Client_Project === filteredProject[selected_index].name);
      type = "projectname";
      break;
      default:
      console.error("Unable to filter results, no definition for: " + value);
      break;
    }
    
    if(filteredExpenses != null){
      for(var i = 0; i < filteredExpenses.length; i++){
        let title = null;
        let subtitle = null;
        switch(type){
          case "category":
            title = filteredExpenses[i].Category;
            subtitle = filteredExpenses[i].Client_Project;
          break;
          case "projectname":
            title = filteredExpenses[i].Client_Project;
            subtitle = filteredExpenses[i].Category;
          break;
        }

        let randomcolor = colors[Math.floor(Math.random() * colors.length)];
        document.getElementById("expenses").innerHTML += "<div class='card theme-" + randomcolor + "' style='margin-top: 50px'><div class='card__part card__part-2 card__hover'><div class='card__part__side m--back'><div class='card__part__inner card__face' style='box-shadow: 5px 10px 8px #888888; height: 100px;'><div class='card__face__colored-side'></div><div style='float: right;position: relative;top: 0px;padding-right: 10px;' class='card__greytext'><span>" + filteredExpenses[i].Amount + "</span><i class='f7-icons' style='position: absolute;top: 25px;font-size: 20px;padding-left: 5px'>chevron_right</i></div><h3 class='card__face__price ng-binding text-limited'>" + title + "</h3><h4 class='card__greytext' style='font-weight: normal;margin: auto;margin-top: 15px;margin-bottom: 15px;'>" + filteredExpenses[i].Client_Name + ", " + subtitle + "</h4><p class='card__greytext' style='width: 80%;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;'>" + filteredExpenses[i].Expense_Desc + "</p><div class='card__greytext' style='font-size: 15px'><i class='f7-icons' style='font-size: 18px; padding-right: 10px'>time</i>Awaiting confirmation...</div></div></div></div></div>";
      }
    }
    selected_index = null;
  }
}
else if(page.name=='categories'){
  var filterPicker = app.picker.create({
    inputEl: '#filter',
    cols: [
      {
        textAlign: 'center',
        values: ['Categories', 'Project Name']
      }
    ],
    on: {
    change: function (picker, values, displayValues) {
      if(document.getElementById("filter").value != displayValues && !showAdminMessage){
        const column = picker.cols[0];
        switch(displayValues[0]){
          case column.values[0]:
          // First column selected run code here...
          displayCategories(filteredCategories);
          break;
          case column.values[1]:
          // Second column selected run code here...
          displayCategories(filteredProject);
          break;
        }
          filterPicker.close();
      }
    }
  },
});
if(showAdminMessage){
  document.getElementById("categories").innerHTML = "<h1>Admin has logged in.</h1>";
}
}
else if(page.name == 'addexpenses'){
    /*  Need to find a more
        efficient way of doing
        this... Otherwise fetch
        promise is called twice on
        page load 👿
    */    

    document.getElementById("username").innerHTML = "<input type='text' readonly value='" + logindata[0].name + "'></input>";
    fetch("https://stormy-coast-58891.herokuapp.com/projects/")
    .then(response => response.json())
    .then(response => {updateDropdown(response);})
    .catch(err => console.error(err))
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

var selected_index = null;

function loginOnKeyEnter(input1, input2, button){
  input1.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
     event.preventDefault();
     button.click();
    }
  });
  input2.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
     event.preventDefault();
     button.click();
    }
  });
}

function saveLogin(response){
  if(response[0].hasOwnProperty("User_Username")){
      logindata = response.map(item => ({name: item.User_Username}));
  }
  else if(response[0].hasOwnProperty("Admin_Username")){
      logindata = response.map(item => ({name: item.Admin_Username}));
  }
  else{
    console.error("Failed to save login information!");
  }
}

function fetchExpenses(id){
  fetch("https://stormy-coast-58891.herokuapp.com/expenses/" + id)
  .then(response => response.json())
  .then(response => {expenses = response.slice(0); let array = response.map((item) => item.Category); let listofcategories = array.reduce(function(prev, cur) {prev[cur] = (prev[cur] || 0) + 1; return prev;}, {}); var categoryarray = Object.keys(listofcategories).map(item => ({name: item, count: listofcategories[item]})); filteredCategories = categoryarray.slice(0); displayCategories(categoryarray); let array2 =  response.map((item) => item.Client_Project); let listofprojects = array2.reduce(function(prev, cur) {prev[cur] = (prev[cur] || 0) + 1; return prev;}, {}); var projectarray = Object.keys(listofprojects).map(item => ({name: item, count: listofprojects[item]})); filteredProject = projectarray.slice(0);})
  .catch(err => console.error(err))
}

function displayCategories(categories){
  while(document.getElementById("categories").innerHTML != null){
    document.getElementById("categories").innerHTML = "";
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

function updateDropdown(projectdata){
  let categoryElement = document.getElementById("category");
  let projectNameElement = document.getElementById("projectname");
  let clientNameElement = document.getElementById("clientname");

  for(var i = 0; i < projectdata.length; i++){
      let option1 = document.createElement("option");
      option1.text = projectdata[i].Client_Name;
      clientNameElement.add(option1, clientNameElement[i]);
      let option2 = document.createElement("option");
      option2.text = projectdata[i].Project_Name;
      projectNameElement.add(option2, projectNameElement[i]);
  }

  fetch("https://stormy-coast-58891.herokuapp.com/categories/")
  .then(response => response.json())
  .then(response => {for(var i = 0; i < response.length; i++) {let option = document.createElement("option"); option.text = response[i].Categories; categoryElement.add(option, categoryElement[i]);}})
  .catch(err => console.error(err))

}

function test(){
  showAdminMessage = true;
}
