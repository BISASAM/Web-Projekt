const container = document.getElementById('results');
const searchText = document.getElementById('searchText');
const btn = document.getElementById('searchButton');
const selectedFilter = document.getElementById('filter');
const bookmarksBtn = document.getElementById('showBookmarks');


// ----- Catch a click on 'Merkliste' Button -----
bookmarksBtn.addEventListener('click', showSavedSeries);


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
function createDivElementForImage(source) {
    let btnText = seriesIsAlreadySaved(source.id);
    console.log(source);
    let seriesDiv = 
    `
    <div id="series">
        <img src="${source.image.medium}"></img>
        <p id="name">${source.name}</p>
        <p>
            <button class="info">Info</button>
            <button class="favs" id="bookmarkButton" name="${source.id}+/${source.name}">${btnText}</button>
        </p>
        <div class="hidden" id="infoText">
            ${source.summary}
        </div>
    </div>`;
    return seriesDiv;
}


// ----- Create new div element for the bookmarks list -----
function createDivElementForBookmarks(seriesID, seriesName) {
    let bookmarkTr = 
    `
    <tr>
        <td>${seriesName}</td><td>${seriesID}</td>
    </tr>`;
    return bookmarkTr;
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
                htmlString += createDivElementForImage(jsonItem.show);
            } 
        }
    } else {
        for (const jsonItem of jsonArray) {
            if (jsonItem.show.image) {
                if(!filter(jsonItem, selection)) { 
                    console.log(jsonItem.show.name + " is " + jsonItem.show.status + " --- " + !filter(jsonItem));
                    continue;
                }
                htmlString += createDivElementForImage(jsonItem.show);
            } 
        }
    }
    container.innerHTML = htmlString;

    const infoButtons = document.getElementsByClassName("info");
    for (const button of infoButtons) {
        button.addEventListener('click', function() {showInfo(button)});
    }

    const saveButtons = document.getElementsByClassName("favs");
    for (const button of saveButtons) {
        button.addEventListener('click', function() {saveOrDelete(button)});
    }
}


// ----- Info Button -----
function showInfo(btnElement) {
    let parent = btnElement.parentNode.nextSibling.nextSibling.classList.toggle("hidden");
    console.log(parent);
}


// ----- Is the series already on the bookmark list? -----
function saveOrDelete(btn) {
    console.log(btn);
    btnInfo = btn.name.split('+/');

    if (btn.innerHTML === "Merken") {
        saveSeries(btnInfo[0], btnInfo[1]);
        btn.innerHTML = "Vergessen";
    } else {
        btn.innerHTML = "Merken";
        deleteSeries(btnInfo[0]);
    }
}


// ----- Saves series to local storage -----
function saveSeries(id, name) {
    console.log(id);
    console.log(1);
    let series = JSON.parse(localStorage.getItem('savedSeries'));
    let idAndName = id + '+/' + name;
    if (series === null) {
        series = [];
    }
    series.push(idAndName);
    localStorage.setItem('savedSeries', JSON.stringify(series));

    // TODO: Hier entweder mit einem Class toggle zwischen Merken und vergessen
    // switchen oder irgendwie nur das innerHTML verändern... 
    // Auf jeden Fall etwas womit man später auch Elemente von der Merkliste
    // löschen kann.
}


// ----- Delete series from local storage -----
function deleteSeries(id) {
    let series = JSON.parse(localStorage.getItem('savedSeries'));
    console.log(series);
    newArray = [];
    for (let i=0; i<series.length; i++) {
        x = series[i].split('+/');
        if (x[0] === id) {
            series.splice(i, 1);
            break;
        }
        console.log(series[i]);
    }
    seriesID = series[0].split('+/');
    console.log(seriesID);
    localStorage.setItem('savedSeries', JSON.stringify(series));
}


// ----- Show the correct buttons when reloading the page -----
function seriesIsAlreadySaved(id) {
    let bookmarksArray = JSON.parse(localStorage.getItem('savedSeries'));
    if (!bookmarksArray) {
        return "Merken";
    }
    for (series of bookmarksArray) {
        series = series.split("+/");
        if (parseInt(series[0]) === id) {
            return "Vergessen";
        }
    }
    return "Merken";
}


// ----- Show saved Series -----
function showSavedSeries() {
    let htmlString = '<table id="bookmarks"><thead><th>NAME</th><th>ID</th></thead><tbody>';
    let bookmarksArray = JSON.parse(localStorage.getItem('savedSeries'));
    for (series of bookmarksArray) {
        series = series.split("+/");
        console.log("0: " + series[0] + ", 1: " + series[1]);
        htmlString += createDivElementForBookmarks(series[0], series[1]);
    }
    container.innerHTML = htmlString + '</tbody></table>';
}


// ----- Which filter is selected? -----
function getFilterMethod() {
    return document.getElementById("filter").value;
}


// ----- Does the jsonElement match the selected filter method? -----
function filter(jsonElement, filterMethod) {
    if (jsonElement.show.status === filterMethod) {
        return 1;
    } else {
        return 0;
    }
}