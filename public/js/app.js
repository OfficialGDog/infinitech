const colors = ['green', 'purple', 'orange', 'red'];
var userexpenses = [];
var logindata = null;
var expenses = null;
var filteredCategories = null;
var filteredProject = null;
var projectdata = null;
var categorydata = null;
var filterPicker = null;
var selected_index = null;
var bContinue = false;

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
    filterPicker = app.picker.create({
    inputEl: '#filter',
    cols: [
      {
        textAlign: 'center',
        values: ['Categories', 'Project Name'],
        displayValues: ['Categories', 'Project Name']
      }
    ],
    on: {
    change: function (picker, values, displayValues) {
      bContinue = true;
      if(document.getElementById("filter").value != displayValues){
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
}
else if(page.name == 'addexpenses'){
    if(projectdata == null || categorydata == null){
      fetchFormData();
    }
    else{
      displayFormData();
    }
}
else if(page.name == 'admin'){
  console.log("admin page loaded!");
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

var dynamicPopup = app.popup.create({
  content: '<div class="popup"><div class="block" style="height:100%"><form id="myForm" class="gform pure-form pure-form-stacked" method="POST" data-email="" action="https://script.google.com/macros/s/AKfycbxSpRr_JqfzJC49xvYpb-0N8vGMa0UuvwyDtS5d/exec" onsubmit="displayFormSuccess();' + 'removeExpenseReport()"><div id="alertmessage"></div><div class="list inset"><ul><div class="form-elements"><li class="item-content item-input" style="margin-bottom: 15px;"><div class="item-inner"><div class="item-input-wrap"><input type="text" id="name" name="name" placeholder="Username" required><span class="input-clear-button"></span></div></div></li><li class="item-content item-input" style="margin-bottom: 15px"><div class="item-inner"><div class="item-input-wrap"><textarea id="message" name="message" rows="10" placeholder="Your message..." required spellcheck="true"></textarea><span class="input-clear-button"></span></div></div></li><li class="item-content item-input"><div class="item-inner"><div class="item-input-wrap"><input type="email" id="email" name="email" placeholder="E-mail" oninput="updateFormEmail()" required><span class="input-clear-button"></span></div></div></li></div></ul></div><div class="block block-strong row no-hairlines" style="position: absolute; bottom: 0px; width: 100%; left: 0px"><div class="col"><button class="button popup-close button-fill-md color-red" href="#" type="button">Cancel</button></div><div class="col"><button class="button button-fill-md color-green" href="#" type="submit">Confirm</button></div></div></form><h4 style="text-align: center; font-weight: normal; font-style: italic">An automatic email 📧 will be sent to the user.</h4></div></div>',
  on: {
    opened: function (popup) {
      loaded();
    },
  }
});

var mainView = app.views.create('.view-main');

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
      logindata = response.map(item => ({name: item.User_Username, id: item.User_ID}));
  }
  else if(response[0].hasOwnProperty("Admin_Username")){
      logindata = response.map(item => ({name: item.Admin_Username, id: item.Admin_ID}));
  }
  else{
    console.error("Failed to save login information!");
  }
}

function fetchExpenses(id){
  fetch("https://stormy-coast-58891.herokuapp.com/expenses/" + id)
  .then(response => response.json())
  .then(response => {expenses = response.slice(0); updateUserExpenses(); console.log(expenses)})
  .catch(err => console.error(err))
}

function updateUserExpenses(){
  let array = expenses.map((item) => item.Category); 
  let listofcategories = array.reduce(function(prev, cur) {prev[cur] = (prev[cur] || 0) + 1; return prev;}, {}); 
  let categoryarray = Object.keys(listofcategories).map(item => ({name: item, count: listofcategories[item]})); 
  filteredCategories = categoryarray.slice(0); displayCategories(categoryarray); 
  let array2 =  expenses.map((item) => item.Client_Project); 
  let listofprojects = array2.reduce(function(prev, cur) {prev[cur] = (prev[cur] || 0) + 1; return prev;}, {}); 
  let projectarray = Object.keys(listofprojects).map(item => ({name: item, count: listofprojects[item]})); filteredProject = projectarray.slice(0);
}

function fetchAdminExpenses(id){
  let datapack1 = fetch("https://stormy-coast-58891.herokuapp.com/adminexpenses/" + id)
  .then(response => response.json())
  .then(response => {if(response.length > 0) {expenses = response.slice(0);} else {expenses = false}})
  .catch(err => console.error(err), expenses = false)

  let datapack2 = fetch("https://stormy-coast-58891.herokuapp.com/users/")
  .then(response => response.json())
  .then(response => {if(response.length > 0){projectdata = response.slice(0)} else{projectdata = false}})
  .catch(err => console.error(err), projectdata = false)

  Promise.all([datapack1,datapack2]).then(function(){if(projectdata && expenses){displayAdminExpenses();}else{console.log("Failed to fetch data :(")}})
}


function displayAdminExpenses(){
  let counter = 0;
  let position = 0;
  for(var i = 0; i < expenses.length; i++){
    let Old_UserID = null;
    if(i > 0){Old_UserID = expenses[(i - 1)].User_ID;} else {const index = projectdata.map(e => e.user_id).indexOf(expenses[0].User_ID); document.getElementById("expenselist").innerHTML = "<div class='block block-strong no-hairlines tablet-inset' style='background: transparent'><div class='card data-table data-table-collapsible data-table-init' style='height: auto'><div class='card-header'><div class='data-table-header'><div class='data-table-title'>" + projectdata[index].user_username + "</div><div class='data-table-actions'><a class='link icon-only'><i class='icon f7-icons if-not-md'>sort</i></a><a class='link icon-only'><i class='icon f7-icons if-not-md'>more_vertical_round</i></a></div></div><div class='data-table-header-selected'><div class='data-table-title-selected'><span class='data-table-selected-count'>0</span> items selected</div><div class='data-table-actions'><a class='link icon-only'><i class='icon f7-icons if-not-md'>trash</i></a><a class='link icon-only'><i class='icon f7-icons if-not-md'>more_vertical_round</i></a></div></div></div><div class='card-content'><div class='list'><ul id=" + "user0" + "></ul></div></div></div></div>"; injectAdminCategories(expenses[0].User_ID, 0, projectdata[index].user_username);}
    let Current_UserID = expenses[i].User_ID;

    if(Old_UserID != Current_UserID && Old_UserID != null){
    const index = projectdata.map(e => e.user_id).indexOf(expenses[i].User_ID);
    counter++;
    position += 60;
    document.getElementById("expenselist").innerHTML += "<div class='block block-strong no-hairlines tablet-inset' style='background: transparent; top: -" + position + "px'><div class='card data-table data-table-collapsible data-table-init' style='height: auto'><div class='card-header'><div class='data-table-header'><div class='data-table-title'>" + projectdata[index].user_username + "</div><div class='data-table-actions'><a class='link icon-only'><i class='icon f7-icons if-not-md'>sort</i></a><a class='link icon-only'><i class='icon f7-icons if-not-md'>more_vertical_round</i></a></div></div><div class='data-table-header-selected'><div class='data-table-title-selected'><span class='data-table-selected-count'>0</span> items selected</div><div class='data-table-actions'><a class='link icon-only'><i class='icon f7-icons if-not-md'>trash</i></a><a class='link icon-only'><i class='icon f7-icons if-not-md'>more_vertical_round</i></a></div></div></div><div class='card-content'><div class='list'><ul id=" + "user" + counter + "></ul></div></div></div></div>"; injectAdminCategories(expenses[i].User_ID, counter, projectdata[index].user_username);
    }
  }
}

function injectAdminCategories(id, counter, username){
  let array = [];
  userexpenses = [];
  for(var i = 0; i < expenses.length; i++){
    if(id == expenses[i].User_ID)
    {
      userexpenses.push(expenses[i]);
      array.push(expenses[i].Client_Project);
    }
}
let arrayreduced = array.reduce(function(prev, cur) {prev[cur] = (prev[cur] || 0) + 1; return prev;}, {});
let filteredarray = Object.keys(arrayreduced).map(item => ({name: item, count: arrayreduced[item]}));

for(var i = 0; i < filteredarray.length; i++){
  document.getElementById("user" + counter).innerHTML += "<li class='accordion-item'><a href='#' class='item-content item-link'><div class='item-inner'><div class='item-title'>" + filteredarray[i].name + " (" + filteredarray[i].count + ")" + "</div></div></a><div class='accordion-item-content' aria-hidden='true'><div class='block'>" + injectAdminExpenses(filteredarray[i].name, username) + "</div></div></li>";
}
}

function injectAdminExpenses(name, username) {
  let rows = "";
  for(var i = 0; i < userexpenses.length; i++){
    if(userexpenses[i].Client_Project == name)
    {
      rows += "<tr><td class='checkbox-cell'><label class='checkbox'><input type='checkbox'><i class='icon-checkbox'></i></label></td><td class='label-cell' data-collapsible-title='Project Name:'>" + userexpenses[i].Client_Project + "</td><td class='numeric-cell' data-collapsible-title='Report ID:'>" + userexpenses[i].report_ID + "</td><td class='numeric-cell' data-collapsible-title='Description:'>" + userexpenses[i].Expense_Desc + "</td><td class='numeric-cell' data-collapsible-title='Category:'>" + userexpenses[i].Category + "</td><td class='numeric-cell' data-collapsible-title='Amount:'>" + userexpenses[i].Amount + "</td><td class='actions-cell'><a class='link icon-only' onclick=" + "approveExpense(" + userexpenses[i].report_ID + "," + "'" + username + "'" + "," + "'" + escape(userexpenses[i].Expense_Desc) + "'" + "," + "'" + escape(userexpenses[i].Category) + "'" + "," + "'" + userexpenses[i].Amount + "'" + ")" + "><i class='icon f7-icons if-not-md' style='color: green'>check</i></a><a class='link icon-only' onclick=" + "rejectExpense(" + userexpenses[i].report_ID + "," + "'" + username + "'" + "," + "'" + escape(userexpenses[i].Expense_Desc) + "'" + "," + "'" + escape(userexpenses[i].Category) + "'" + "," + "'" + userexpenses[i].Amount + "'"+ ")" + "><i class='icon f7-icons if-not-md' style='color: red'>close</i></a></td></tr>";
    }
  }
    return "<table><thead><tr><th class='checkbox-cell'><label class='checkbox'><input type='checkbox' disabled><i class='icon-checkbox'></i></label></th><th class='label-cell'>Project Name:</th><th class='numeric-cell'>Report ID:</th><th class='numeric-cell'>Description:</th><th class='numeric-cell'>Category:</th><th class='numeric-cell'>Amount:</th><th class='numeric-cell'>Approve / Reject:</th></tr></thead><tbody>" + rows + "</tbody></table>";
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

function fetchFormData(){
  let datapack1 = fetch("https://stormy-coast-58891.herokuapp.com/projects/")
  .then(response => response.json())
  .then(response => {if(response.length > 0){projectdata = response.slice(0)} else{projectdata = false}})
  .catch(err => console.error(err), projectdata = false)

  let datapack2 = fetch("https://stormy-coast-58891.herokuapp.com/categories/")
  .then(response => response.json())
  .then(response => {if(response.length > 0) {categorydata = response.slice(0)} else{categorydata = false}})
  .catch(err => console.error(err), categorydata = false)

  Promise.all([datapack1,datapack2]).then(function(){if(categorydata && projectdata){displayFormData()} else {console.error("Failed to fetch data :(")}})
}

function displayFormData(){
  let clientNameElement = document.getElementById("clientname");
  let projectNameElement = document.getElementById("projectname");
  let categoryElement = document.getElementById("category");
  clientNameElement.style = "";
  projectNameElement.style = "";
  categoryElement.style = "";

  document.getElementById("username").innerHTML = "<input type='text' readonly value='" + logindata[0].name + "'></input>";
  document.getElementById("userid").innerHTML = "<input type='text' name='userId' readonly value='" + logindata[0].id + "'></input>";

    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2){ month = '0' + month};
    if (day.length < 2) {day = '0' + day};

    document.getElementById("date").value = [year, month, day].join('-');

  if(projectdata.length > 0 && categorydata.length > 0){
    for(var i = 0; i < projectdata.length; i++){
      let option = document.createElement("option"); 
      option.text = projectdata[i].Client_Name; 
      clientNameElement.add(option, clientNameElement[i]); 
      let option2 = document.createElement("option"); 
      option2.text = projectdata[i].Project_Name; 
      projectNameElement.add(option2, projectNameElement[i])
    }
    for(var i = 0; i < categorydata.length; i++) {
      let option = document.createElement("option"); 
      option.text = categorydata[i].Categories; 
      categoryElement.add(option, categoryElement[i]);
    }
      clientNameElement.remove(projectdata.length);
      projectNameElement.remove(projectdata.length);
      categoryElement.remove(categorydata.length);
  }
}

function addExpenseReport(){
  let hasFetched = false;
  var formData = app.form.convertToData('#my-form');
  if(formData.desc != "" && formData.amount != ""){
  let newprojectid = fetch("https://stormy-coast-58891.herokuapp.com/maxprojectid/")
  .then(response => response.json())
  .then(response => {if(response.length > 0){ hasFetched = true; formData.reportId = ((response[0].Report_ID) + 1)}})
  .catch(err => console.error(err))
  formData.userId = parseInt(formData.userId);
  formData.amount = "£" + formData.amount;
  Promise.all([newprojectid]).then(function(){if(hasFetched){
  app.request.postJSON('https://stormy-coast-58891.herokuapp.com/addexpense', formData); 
  if(bContinue) {filterPicker.setValue([filterPicker.cols[0].values[0]]);}
  // Update the front end
  let newobject = {User_ID: formData.userId, Report_ID: formData.reportId, Date_of_Submission: formData.subdate, Reciept: formData.reciept, Expense_Desc: formData.desc, Category: formData.category, Client_Name: formData.clientname, Client_Project: formData.clientproject, Billable: formData.bill, Payment_Method: formData.paymeth, Amount: formData.amount};
  expenses.push(newobject);
  updateUserExpenses();

  app.dialog.alert("A new expense report has been created successfully!", "Success! 😄👏"); app.views.main.router.back();}})

}
  else{
    app.dialog.alert("Please ensure all input boxes are filled out!", "Form incomplete ❌");
  }
}

function removeExpenseReport(){
  // Define expense id object for database deletion. 
  let id = {id: expenses[selected_index].report_ID}
  // If admin approves expense run this code.
  if(bContinue){
    // Copy the report into the archive table.
    let archived = {userId: expenses[selected_index].User_ID, reportId: expenses[selected_index].report_ID, subdate: expenses[selected_index].Date_of_Submission, reciept: expenses[selected_index].Reciept, desc: expenses[selected_index].Expense_Desc, category: expenses[selected_index].Category, clientname: expenses[selected_index].Client_Name, clientproject: expenses[selected_index].Client_Project, bill: expenses[selected_index].Billable, paymeth: expenses[selected_index].Payment_Method, amount: expenses[selected_index].Amount}
    app.request.postJSON('https://stormy-coast-58891.herokuapp.com/archiveexpense', archived);
  }
  // Remove the report from the report table in the database.
  app.request.postJSON('https://stormy-coast-58891.herokuapp.com/deleteexpense', id);
  // Remove expense from the front end.
  expenses.splice(selected_index, 1);
  // Reload the page to update the changes.
  displayAdminExpenses();
}

function approveExpense(id, username, desc, category, amount){
  dynamicPopup.open();
  document.getElementById("alertmessage").innerHTML = '<h1 style="text-align: center">Approve Report #' + id + '</h1><h3 style="text-align: center">Are you sure you want to approve this expense report?</h3>';
  document.getElementById("name").value = username;
  document.getElementById("message").value = "Your expense: " + unescape(desc) + ", Category: " + unescape(category) + ", Amount: " + amount + " has been approved! 😄👏";
  updateIndex(expenses.findIndex(item => item.report_ID === id));
  bContinue = true;
}

function rejectExpense(id, username, desc, category, amount){
  dynamicPopup.open();
  document.getElementById("alertmessage").innerHTML = '<h1 style="text-align: center">Reject Report #' + id + '</h1><h3 style="text-align: center">Are you sure you want to reject this expense report?</h3>';
  document.getElementById("name").value = username;
  document.getElementById("message").value = "Sorry your expense: " + unescape(desc) + ", Category: " + unescape(category) + ", Amount: " + amount + " has been rejected! 😭";
  updateIndex(expenses.findIndex(item => item.report_ID === id));
  bContinue = false;
}

function updateFormEmail(){
  document.getElementById("myForm").setAttribute("data-email", document.getElementById("email").value);
}

function displayFormSuccess(){
  dynamicPopup.close();
  app.dialog.alert("Your email has been sent successfully! 😄", "Email was sent to user");
}