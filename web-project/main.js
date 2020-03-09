const container = document.getElementById('results');
const searchText = document.getElementById('searchText');
const btn = document.getElementById('searchButton');
const selectedFilter = document.getElementById('filter');


// ----- Submit input with enter or by clicking Los -----
btn.addEventListener('click', apiSearch);

let input = document.getElementById("searchText");
input.addEventListener("keyup", function(event) {
    // Enter is key number 13.
    if (event.keyCode === 13) {
    event.preventDefault();
    apiSearch();
    }
});


// ----- Standard Layout for each series -----
function createDivElement(source) {
    let seriesDiv = 
    `<div id="series">
        <img src="${source.image.medium}"></img>
        <p id="name">${source.name}</p>
        <p>
            <button class="info">Info</button>
            <button class="favs" onclick="saveSeries(${source.id})">Speichern</button>
        </p>
        <div class="hidden" id="infoText">
            ${source.summary}
        </div>
    </div>`;
    return seriesDiv;
}


// ----- Performing an API-Request -----
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

    // TODO: Wenn das Array etwas enthält aber durch den Filter nichts angezeigt wird
    // wird noch nicht KEIN ERGEBNIS angezeigt.
    if (json.length > 0) {
        insertIntoHTML(json);
    } else {
        container.innerHTML = "<p>Kein Ergebnis gefunden</p>"
    }
}


// ----- Converting information into HTML -----
function insertIntoHTML(jsonArray) {
    let htmlString = '';
    let selection = getFilterMethod();
    // inserts the images into HTML.
    if (selection === "Alle") {
        for (const jsonItem of jsonArray) {
            if (jsonItem.show.image) {
                htmlString += createDivElement(jsonItem.show);
            } 
        }
    } else {
        for (const jsonItem of jsonArray) {
            if (jsonItem.show.image) {
                if(!filter(jsonItem, selection)) { 
                    console.log(jsonItem.show.name + " is " + jsonItem.show.status + " --- " + !filter(jsonItem));
                    continue;
                }
                htmlString += createDivElement(jsonItem.show);
            } 
        }
    }
    container.innerHTML = htmlString;

    const infoButtons = document.getElementsByClassName("info");
    for (const element of infoButtons) {
        element.addEventListener('click', function() {showInfo(element)});
    }
}


// ----- Buttons -----
function showInfo(btnElement) {
    let parent = btnElement.parentNode.nextSibling.nextSibling.classList.toggle("hidden");
    console.log(parent);
}

function saveSeries(id) {
    let ids = JSON.parse(localStorage.getItem('savedIDs'));
    if (ids === null) {
        ids = [];
    }
    ids.push(id);
    localStorage.setItem('savedIDs', JSON.stringify(ids));
}


// ----- Filtering the Output -----
function getFilterMethod() {
    return document.getElementById("filter").value;
}

function filter(jsonElement, filterMethod) {
    if (jsonElement.show.status === filterMethod) {
        return 1;
    } else {
        return 0;
    }
}
