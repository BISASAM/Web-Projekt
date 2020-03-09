const container = document.getElementById('results');
const searchText = document.getElementById('searchText');
const btn = document.getElementById('searchButton');
const selectedFilter = document.getElementById('filter');


// "Los" Button gets clicked.
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

function createDivElement(source) {
    let seriesDiv = 
    `<div id="series">
        <img src="${source.image.medium}"></img>
        <p id="name">${source.name}</p>
        <p>
            <button class="info">Info</button>
            <button class="favs">Speichern</button>
        </p>
        <div class="hidden" id="infoText">
            ${source.summary}
        </div>
    </div>`;
    return seriesDiv;
}

// Declare function.
async function apiSearch() {
    const searchQuery = searchText.value;
    // Save JSON-Result. 
    const response = await fetch(`http://api.tvmaze.com/search/shows?q=${searchQuery}`);
    // 200 means "ok".
    if (response.status !== 200) {
        console.log('Problem with api: ' + response.status);
    }
    const json = await response.json();

    console.log(json);

    /* Das hier ist eine Vorlage zum Filtern - bisher einfach nur abgeschrieben.
    // selectedStatus muss noch als Variable definiert werden.
    if (seletedStatus.length > 0) {
        json = json.filter(item => item.show.status === selectedStatus)
    }
    */

    insertIntoHTML(json);
}

// Insert images into HTML.
function insertIntoHTML(jsonArray) {
    let htmlString = '';
    // inserts the images into HTML.
    for (const jsonItem of jsonArray) {
        if (jsonItem.show.image) {
            htmlString += createDivElement(jsonItem.show);
        } 
    }
    container.innerHTML = htmlString;

    const infoButtons = document.getElementsByClassName("info");
    for (const element of infoButtons) {
        element.addEventListener('click', function() {showInfo(element)});
    }
}

function showInfo(btnElement) {
    let parent = btnElement.parentNode.nextSibling.nextSibling.classList.toggle("hidden");
    console.log(parent);
}

/*






// Code von der Vorlesung
function addEventListenersToWatchLaterButton (node, id) {
    const elements = node.getElementByClassName('favs');
    for (const element of elements) {
        element.addEventListener('click', () => {
            let ids = JSON.parse(localStorage.getItem('favs'));
            // localStorage is empty.
            if (ids === null) {
                ids = [];
            }
            ids.push(id);
            localStorage.setItem('favs', JSON.stringify(ids)); // TODO
        });
    }    
}
*/