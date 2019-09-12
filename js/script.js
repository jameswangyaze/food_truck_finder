// This funcion is to get the pre pagination truck list back from
// the server based on the current time and day and user's inputs
function getTruckData() {
  // Gather current date time
  var date = getCurrentDate();
  // Gather user inputs
  var name = document.getElementById('truck-name').value.toLowerCase();
  var foodType = document.getElementById('food-type').value.toLowerCase();
  // Fetch data from server
  fetch(`https://data.sfgov.org/resource/jjew-r69b.json?` +
    `$query=SELECT * WHERE dayorder=${date.weekDay} AND start24 <= '${date.startHour}:00' ` +
    `AND end24 >='${date.endHour}:00' AND LOWER(applicant) LIKE '%25${name}%25'` + 
    `AND LOWER(optionaltext) LIKE '%25${foodType}%25' ORDER BY applicant`)
  .then(handleErrors)
  .then((result) => result.json())
  .then((data) => {
    // Display the first page first
    displayTruckDataPagination(1);
    // Figure out the pagination based on total item count
    displayPaginationCounter(data.length);
  });
}

// Error handling in case the server stop responding.
function handleErrors(response) {
  if (!response.ok) {
    alert("The system is down. Please try again later.");
    console.log(response);
  } else {
    return response;
  }
}

// This method is called with a pagination page is selected along with the page number
function displayTruckDataPagination(pageNumber) {
  // Make sure these 3 values havn't changed
  var date = getCurrentDate();
  var name = document.getElementById('truck-name').value.toLowerCase();
  var foodType = document.getElementById('food-type').value.toLowerCase();
  // Calculate the offset for the backend query to calculate the pagination
  var offset = (pageNumber - 1) * 10;
  fetch(`https://data.sfgov.org/resource/jjew-r69b.json?` +
    `$query=SELECT * WHERE dayorder=${date.weekDay} AND start24 <= '${date.startHour}:00' ` +
    `AND end24 >='${date.endHour}:00' AND LOWER(applicant) LIKE '%25${name}%25' AND ` +
    `LOWER(optionaltext) LIKE '%25${foodType}%25' ORDER BY applicant LIMIT 10 OFFSET ${offset}`)
  .then(handleErrors)
  .then((result) => result.json())
  .then((data) => {
    const list = document.querySelector('#truck-list');
    // Refresh the truck list with new page data
    list.innerHTML = "";
    data.forEach((truck) => addTruckToList(truck));
  });
}

// The method handles dynamically generating the pagination counter based on total data count
function displayPaginationCounter(dataCount) {
  // Refresh the original list with new list
  var pagination = document.querySelector('#nav-pagination');
  pagination.innerHTML = "";
  
  // Get the total page number
  var page = Math.ceil(dataCount / 10);
  for (var i = 1; i <= page; i++) {
    // Insert each page item programmatically
    var pageItem = document.createElement('li');
    pageItem.setAttribute('class', 'page-item');
    pageItem.innerHTML = `
     <a class="page-link" onclick='displayTruckDataPagination(${i})'>${i}</a>
    `;
    pagination.appendChild(pageItem);
  }
}

// This method get a truck data and insert into the html table element
function addTruckToList(truck) {
  const list = pagination = document.querySelector('#truck-list');
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${truck.applicant}</td>
    <td>${truck.location}</td>
    <td>${truck.optionaltext}</td>   
    <td>${truck.starttime} - ${truck.endtime}</td>
  `;
  list.appendChild(row);
}

// Parse the current date into weekday, starthour and endhour object
function getCurrentDate() {
  var date = new Date();
  var weekDay = date.getDay();
  var hour = date.getHours();
  var startHour = hour === 0 ? 0 : hour - 1;
  if (startHour < 10) {
    startHour = '0' + startHour;
  }
  var endHour = hour + 1;
  if (endHour < 10) {
    endHour = '0' + endHour;
  }
  return {
    weekDay: weekDay,
    startHour: startHour,
    endHour: endHour
  };
}

// When the page finish loading, load the truck data based on the time first
// meanwhile listening to the user keystrokes on the input bars.
window.onload = function() {
  getTruckData();
  document.getElementById('truck-name').addEventListener('keyup', getTruckData);
  document.getElementById('food-type').addEventListener('keyup', getTruckData);
}
