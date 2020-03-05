const container = document.getElementById('results');
const searchText = document.getElementById('searchText');

function insertSearchResultIntoPage(jsonArray) {
    let htmlString = '';
    // TODO: Insert data into HTML
    for (const jsonItem of jsonArray) {
        htmlString += `<img src="${jsonItem.show.image.medium}"</img>`;
    }
    container.innerHTML = htmlString;
}

// Funktionen deklarieren.
async function apiSearch() {
    const searchQuery = searchText.value;
    // JSON-Ergebnis in Konstante ablegen
    const response = await fetch(`http://api.tvmaze.com/search/shows?q=${searchQuery}`);
    console.log(response);
    const json = await response.json();

    // Suchergebnis in HTML-Dokument einfügen.
    insertSearchResultIntoPage(json);
}



const btn = document.getElementById('searchButton');
btn.addEventListener('click', apiSearch)