const resultsContainer = document.getElementById('results');
const textInput = document.getElementById('searchText');
const losBtn = document.getElementById('searchButton');
const selectedFilter = document.getElementById('filter');
const bookmarksBtn = document.getElementById('showBookmarks');

// globaly available api results (allows filtering without performing a re-request)
let apiResult;


// Set up Event Listener
// ---Catch a click on 'Los' Button
losBtn.addEventListener('click', apiSearch);

// ---Catch key event in text input field
textInput.addEventListener("keyup", function(event) {
    // Enter is key number 13.
    if (event.keyCode === 13) {
    event.preventDefault();
    apiSearch();
    }
});

// ---Catch a click on 'Merkliste' Button
bookmarksBtn.addEventListener('click', showBookmarks);

// ---Catch a change in filter settings
selectedFilter.addEventListener("change", onChangeFilter);



// Performe API-Request
async function apiSearch() {
    const searchQuery = textInput.value;
    // Save JSON-Result. 
    const response = await fetch(`http://api.tvmaze.com/search/shows?q=${searchQuery}`);
    // 200 means "ok".
    if (response.status !== 200) {
        console.log('Problem with api: ' + response.status);
    }

    apiResult = await response.json();  // global var

    console.log(apiResult);

    insertIntoHTML();
}

async function apiSearchWithID(sourceId) {
    // This function is used for the bookmarklist
    const response = await fetch(`http://api.tvmaze.com/shows/${sourceId}`);
    // 200 means "ok".
    if (response.status !== 200) {
        console.log('Problem with api: ' + response.status);
    }

    const result = await response.json();  // global var

    return result;
}

// Insert api request results into HTML
function insertIntoHTML() {
    // this funtion takes whatever is in the global apiResult variable, filters it, and displays it


    // clear results div
    resultsContainer.innerHTML = '';

    //filter entries
    const filteredResult = apiResult.filter(checkSeriesStatus);

    if (!filteredResult.length > 0) {
        resultsContainer.innerHTML = "<p>Kein Ergebnis gefunden</p>"
        return;
    }

    // insert div elements per series
    let bookmarks = getBookmarks();
    for (const series of filteredResult) {
        if (series.show.image) {
            createDivElementForSeries(series.show, bookmarks);
        } 
    }
    
}

// create div element for each movie and append to parent div
function createDivElementForSeries(source, bookmarks) {
    let bkmBtnText = bookmarks.has(source.id) ? "Vergessen" : "Merken";

    let seriesDiv = document.createElement('div');
    seriesDiv.className = 'series';
    seriesDiv.innerHTML = 
    `
    <img src="${source.image.medium}"></img>
    <p class"seriesName">${source.name}</p>
    <p>
        <button class="info">Info</button>
        <button class="favs">${bkmBtnText}</button>
        <a href="https://www.netflix.com/search?q=${source.name}" target="_blank">
            <img id="netflixIcon" src="/icons/1200px-Netflix_icon.svg.png"></img>
        </a>
        <a href="https://www.amazon.de/s?k=${source.name}&i=instant-video&__mk_de_DE=%C3%85M%C3%85%C5%BD%C3%95%C3%91&ref=nb_sb_noss_2" target="_blank">
            <img id="amazonIcon" src="/icons/amazon-prime.png"></img>
        </a>
    </p>
    <div class="hidden infobox" id="${source.id}">
        ${source.summary}
    </div>
    `;

    // set event listener to info- and bookmark button
    const infoButton = seriesDiv.getElementsByClassName("info")[0];
    infoButton.addEventListener('click', function() {showInfo(source.id)});
    
    const bookmarkButton = seriesDiv.getElementsByClassName("favs")[0]
    bookmarkButton.addEventListener('click', function(event) {onBookmarkBtn(event, source.id)});
    
    resultsContainer.appendChild(seriesDiv);

}



// Button methods
// ---Info Button
function showInfo(seriesId) {
    document.getElementById(seriesId).classList.toggle("hidden");
}

// ---Bookmark Button
function onBookmarkBtn(event, seriesId) {

    if (getBookmarks().has(seriesId)) {
        deleteSeries(seriesId);
        event.target.innerHTML = "Merken";
    } 
    else {
        saveSeries(seriesId);
        event.target.innerHTML = "Vergessen";
    }
}

// ---Change Filter in selection dropdown
function onChangeFilter() {
    if (apiResult == undefined) { // there hasn't been made an api request yet
        return;
    }

    insertIntoHTML(apiResult);
}



// Bookmark methods
// ---Get bookmarked series
function getBookmarks() {
    let bookmarks = JSON.parse(localStorage.getItem('savedSeries'));
    
    if (bookmarks === null) {
        bookmarks = new Set();
    } else {
        bookmarks = new Set(bookmarks); // convert Array to Set to have unique entries
    }

    return bookmarks;
}

// ---Saves series to local storage
function saveSeries(id) {
    
    let bookmarks = getBookmarks();
    bookmarks.add(id);

    // convert to array and write to local storage
    localStorage.setItem('savedSeries', JSON.stringify([...bookmarks]));

    console.log (bookmarks);

    // TODO: Hier entweder mit einem Class toggle zwischen Merken und vergessen
    // switchen oder irgendwie nur das innerHTML verändern... 
    // Auf jeden Fall etwas womit man später auch Elemente von der Merkliste
    // löschen kann.
}

// ---Delete series from local storage
function deleteSeries(id) {

    let bookmarks = getBookmarks();
    bookmarks.delete(id);

    // convert to array and write to local storage
    localStorage.setItem('savedSeries', JSON.stringify([...bookmarks]));

    console.log (bookmarks);
}


// ---Show saved Series
async function showBookmarks() {

    //reset filter to show all bookmarks
    selectedFilter.selectedIndex = 0;

    let bookmarks = getBookmarks();
    
    apiResult = [];  // global var
    for (const seriesId of bookmarks) {
        const result = await apiSearchWithID(seriesId);
        apiResult.push({"show": result});  // keep original array structure
    }

    console.log(apiResult);

    insertIntoHTML();
}


// Helper methods
function checkSeriesStatus(seriesJson) {
    if (selectedFilter.value === 'Alle') {
        return true;
    }
    else {
        return seriesJson.show.status === selectedFilter.value;
    }
}
