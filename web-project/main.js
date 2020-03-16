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
bookmarksBtn.addEventListener('click', showSavedSeries);

// ---Catch a change in filter setting
selectedFilter.addEventListener("change", insertIntoHTML);



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

// Insert api request results into HTML
function insertIntoHTML() {
    // clear results div
    resultsContainer.innerHTML = '';

    //filter entries
    const filteredResult = apiResult.filter(checkSeriesStatus);

    console.log(filteredResult);


    if (!filteredResult.length > 0) {
        resultsContainer.innerHTML = "<p>Kein Ergebnis gefunden</p>"
        return;
    }

    // insert div elements per series
    for (const series of filteredResult) {
        if (series.show.image) {
            createDivElementForSeries(series.show);
        } 
    }
    
}

// create div element for each movie and append to parent div
function createDivElementForSeries(source) {
    let btnText = seriesIsAlreadySaved(source.id);

    let seriesDiv = document.createElement('div');
    seriesDiv.id = 'series'
    seriesDiv.innerHTML = 
    `
    <img src="${source.image.medium}"></img>
    <p id="name">
        ${source.name}
    </p>
    <p>
        <button class="info">Info</button>
        <button class="favs" name="${source.id}+/${source.name}+/${source.externals.imdb}+/${source.premiered}">${btnText}</button>
        <a href="https://www.netflix.com/search?q=${source.name}" target="_blank">
            <img id="netflixIcon" src="/icons/1200px-Netflix_icon.svg.png"></img>
        </a>
        <a href="https://www.amazon.de/s?k=${source.name}&i=instant-video&__mk_de_DE=%C3%85M%C3%85%C5%BD%C3%95%C3%91&ref=nb_sb_noss_2" target="_blank">
            <img id="amazonIcon" src="/icons/amazon-prime.png"></img>
        </a>
    </p>
    <div class="hidden" id="infoText">
        ${source.summary}
    </div>
    `

    // set event listener to info- and bookmark button
    const infoButton = seriesDiv.getElementsByClassName("info")[0]
    infoButton.addEventListener('click', function() {showInfo(infoButton)});
    
    const bookmarkButton = seriesDiv.getElementsByClassName("favs")[0]
    bookmarkButton.addEventListener('click', function() {saveOrDelete(bookmarkButton)});
    
    resultsContainer.appendChild(seriesDiv);

}



// Button methods
// ---Info Button
function showInfo(btnElement) {
    btnElement.parentNode.nextSibling.nextSibling.classList.toggle("hidden");
}

// ---Bookmark Button
function saveOrDelete(btn) {
    // series already on bookmark list?
    btnInfo = btn.name.split("+/");
    if (btn.innerHTML === "Merken") {
        saveSeries(btn.name);
        btn.innerHTML = "Vergessen";
    } else {
        btn.innerHTML = "Merken";
        deleteSeries(btnInfo[0]);
    }
}



// Bookmark Button methods
// ---Saves series to local storage
function saveSeries(informationString) {
    let series = JSON.parse(localStorage.getItem('savedSeries'));
    if (series === null) {
        series = [];
    }
    series.push(informationString);
    localStorage.setItem('savedSeries', JSON.stringify(series));

    // TODO: Hier entweder mit einem Class toggle zwischen Merken und vergessen
    // switchen oder irgendwie nur das innerHTML verändern... 
    // Auf jeden Fall etwas womit man später auch Elemente von der Merkliste
    // löschen kann.
}

// ---Delete series from local storage
function deleteSeries(id) {
    let series = JSON.parse(localStorage.getItem('savedSeries'));
    newArray = [];
    for (let i=0; i<series.length; i++) {
        x = series[i].split('+/');
        if (x[0] === id) {
            series.splice(i, 1);
            break;
        }
    }
    seriesID = series[0].split('+/');
    localStorage.setItem('savedSeries', JSON.stringify(series));
}



// show Bookmark list methods
// ---Create new div element for the bookmarks list 
function createDivElementForBookmarks(seriesName, imdbID, premiere) {
    let bookmarkTr = 
    `
    <tr>
        <td>${seriesName}</td>
        <td><a href="https://www.imdb.com/title/${imdbID}/" target="_blank">${imdbID}</a></td>
        <td>${premiere}</td>
        <td>
            <a href="https://www.netflix.com/search?q=${seriesName}" target="_blank">
                <img id="netflixIcon" src="/icons/1200px-Netflix_icon.svg.png"></img>
            </a>
        </td>
        <td>
            <a href="https://www.amazon.de/s?k=${seriesName}&i=instant-video&__mk_de_DE=%C3%85M%C3%85%C5%BD%C3%95%C3%91&ref=nb_sb_noss_2" target="_blank">
                <img id="amazonIcon" src="/icons/amazon-prime.png"></img>
            </a>
        </td>
    </tr>`;
    return bookmarkTr;
}

// ---Show saved Series
function showSavedSeries() {
    let htmlString = 
    `<table id="bookmarks">
        <thead>
            <th>NAME</th><th>IMDB</th><th>PREMIERE<th>NETFLIX</th><th>AMAZON</th>
        </thead>
        <tbody>
        `;
    let bookmarksArray = JSON.parse(localStorage.getItem('savedSeries'));
    for (series of bookmarksArray) {
        series = series.split("+/");
        console.log("0: " + series[0] + ", 1: " + series[1] + ", 2: " + series[2] + ", 3: " + series[3]);
        htmlString += createDivElementForBookmarks(series[1], series[2], series[3]);
    }
    resultsContainer.innerHTML = htmlString + '</tbody></table>';
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

// IDEE: Man könnte den Merkliste Knopf auch mit einer art toggle Funktion
// versehen. Erst steht da Merkliste dann Suche.