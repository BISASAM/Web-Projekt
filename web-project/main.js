const resultsContainer = document.getElementById('results');
const textInput = document.getElementById('searchText');
const losBtn = document.getElementById('searchButton');
const selectedFilter = document.getElementById('filter');
const bookmarksBtn = document.getElementById('showBookmarks');

// globaly available api results (allows filtering without performing a re-request)
let apiResult;


// Set up Event Listener
// ---Catch a click on 'Los' Button
losBtn.addEventListener('click', onLosBtn);
// ---Catch key event in text input field
textInput.addEventListener("keyup", function(event) {
    // Enter is key number 13.
    if (event.keyCode === 13) {
    event.preventDefault();
    onLosBtn();
    }
});
// ---Catch a click on 'Merkliste' Button
bookmarksBtn.addEventListener('click', showBookmarks);
// ---Catch a change in filter settings
selectedFilter.addEventListener("change", onChangeFilter);


async function apiSearch() {
    const searchQuery = textInput.value;
    // Save JSON-Result. 
    const response = await fetch(`http://api.tvmaze.com/search/shows?q=${searchQuery}`);
    // 200 means "ok".
    if (response.status !== 200) {
        console.log('Problem with api: ' + response.status);
    }

    const result = await response.json();

    return result;
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

function createDivElementForSeries(series, bookmarks) {
    // creates div element for one series and appends it to parent div
    // also, checks if series is bookmarked already
    let bkmBtnText = bookmarks.has(series.id) ? "Vergessen" : "Merken";
    let bkmBtnClass = bookmarks.has(series.id) ? "bookmarked" : "";

    let seriesDiv = document.createElement('div');
    seriesDiv.className = 'series';
    seriesDiv.innerHTML = 
    `
    <img src="${series.image.medium}"></img>
    <p class="seriesName">${series.name}</p>
    <div>
        <button class="infoBtn">Info</button>
        <button class="bkmBtn ${bkmBtnClass}">${bkmBtnText}</button>
    </div>
    <div class="center">
        <a href="https://www.netflix.com/search?q=${series.name}" target="_blank">
            <img class="netflixIcon" src="/icons/netflix_icon.png"></img>
        </a>
        <a href="https://www.imdb.com/title/${series.externals.imdb}" target="_blank">
            <img class="amazonIcon" src="/icons/imdb_icon.png"></img>
        </a>
        <a href="https://www.amazon.de/s?k=${series.name}&i=instant-video&__mk_de_DE=%C3%85M%C3%85%C5%BD%C3%95%C3%91&ref=nb_sb_noss_2" target="_blank">
            <img class="amazonIcon" src="/icons/amazonprime_icon.png"></img>
        </a>  
    </div>
    <div class="infobox hidden" id="${series.id}">
        ${series.summary}
    </div>
    `;

    // set event listener to created info- and bookmark button
    const infoButton = seriesDiv.getElementsByClassName("infoBtn")[0];
    infoButton.addEventListener('click', function(event) {OnInfoBtn(event, series.id)});
    
    const bookmarkButton = seriesDiv.getElementsByClassName("bkmBtn")[0]
    bookmarkButton.addEventListener('click', function(event) {onBookmarkBtn(event, series.id)});
    
    resultsContainer.appendChild(seriesDiv);

}



// Button methods

// ---Los Button
async function onLosBtn() {

    // remove bookmark heading if currently displayed
    const elem = document.getElementById("bkmHeading");
    if (elem != null) {
        elem.parentNode.removeChild(elem);
    }

    apiResult = await apiSearch();  // global var
    insertIntoHTML();
}

// ---Merkliste zeigen Button
async function showBookmarks() {

    //reset filter to show all bookmarks
    selectedFilter.selectedIndex = 0;

    // create little heading for bookmark page
    if (document.getElementById("bkmHeading") == null) {
        let bookmarkHeading = document.createElement('p');
        bookmarkHeading.id = "bkmHeading";
        bookmarkHeading.innerHTML = "Merkliste";
        resultsContainer.parentNode.insertBefore(bookmarkHeading, resultsContainer);
    }

    let bookmarks = getBookmarks();  
    apiResult = [];  // global var
    for (const seriesId of bookmarks) {
        const result = await apiSearchWithID(seriesId);
        apiResult.push({"show": result});  // keep original array structure
    }

    insertIntoHTML();
}

// ---Info Button
function OnInfoBtn(event, seriesId) {
    document.getElementById(seriesId).classList.toggle("hidden");
    event.target.classList.toggle("infochecked");
}

// ---Bookmark Button
function onBookmarkBtn(event, seriesId) {

    if (getBookmarks().has(seriesId)) {
        deleteSeries(seriesId);
        event.target.innerHTML = "Merken";
        event.target.classList.remove("bookmarked");
    } 
    else {
        saveSeries(seriesId);
        event.target.innerHTML = "Vergessen";
        event.target.classList.add("bookmarked");
    }
}

// ---Change Filter in selection dropdown
function onChangeFilter() {
    if (apiResult == undefined) { // there hasn't been made an api request yet
        return;
    }

    insertIntoHTML();
}



// Bookmark methods
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
}

// ---Delete series from local storage
function deleteSeries(id) {

    let bookmarks = getBookmarks();
    bookmarks.delete(id);

    // convert to array and write to local storage
    localStorage.setItem('savedSeries', JSON.stringify([...bookmarks]));

    console.log (bookmarks);
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
