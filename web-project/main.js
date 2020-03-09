const container = document.getElementById('results');
const searchText = document.getElementById('searchText');
const btn = document.getElementById('searchButton');
const dType = document.getElementById('displayType');

// "Los" Button get clicked.
btn.addEventListener('click', apiSearch);

// input field submited with enter.
let input = document.getElementById("searchText");
input.addEventListener("keyup", function(event) {
    // Enter is key number 13.
    if (event.keyCode === 13) {
    event.preventDefault();
    apiSearch();
    }
});

// Declare function.
async function apiSearch() {
    const searchQuery = searchText.value;
    // Save JSON-Result. 
    const response = await fetch(`http://api.tvmaze.com/search/shows?q=${searchQuery}`);
    console.log(response);
    const json = await response.json();

    console.log(json);

    // get the selection from the dropdown menu.
    getDisplayType(json, dType.options[dType.selectedIndex].value);
}

function getDisplayType(jsonElement, dt) {
    if (dt == "image") {
        insertImageIntoHTML(jsonElement); 
    }
    else if (dt == "table") {
        insertTableInformation(jsonElement);
    }
}

// Insert images into HTML.
function insertImageIntoHTML(jsonArray) {
    let htmlString = '';
    // inserts the images into HTML.
    for (const jsonItem of jsonArray) {
        htmlString += `<img src="${jsonItem.show.image.medium}"</img>`;
    }
    container.innerHTML = htmlString;
}

// Inserts api information into a table.
function insertTableInformation(jsonArray) {
    let htmlString = '<table><tr><th>Name</th><th>Genre</th><th>Premiere</th><th>Sprache</th><th>Produktionsland</th></tr>';
    for (const jsonItem of jsonArray) {
        htmlString += `<tr><td>${jsonItem.show.name}</td>`;
        htmlString += `<td>${jsonItem.show.genres}</td>`;
        htmlString += `<td>${jsonItem.show.premiered}</td>`;
        htmlString += `<td>${jsonItem.show.language}</td>`;
        htmlString += `<td>${jsonItem.show.network.country.name}</td>`;
    }
    htmlString += '</table>';
    container.innerHTML = htmlString;
}