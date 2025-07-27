
const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
let allDetails = [];
let filteredDetails = [];
let offset = 0;
const LIMIT = 60;
const container = document.getElementById('pokemon-overview');
const loadMoreBtn = document.getElementById('pokeball-load-more');
let spriteAnimationInterval;
let currentTypeFilter = null;
let typeOffset = 0;
const TYPE_LIMIT = 60;
let currentTypeResults = [];
let renderedPokemon = [];
let totalPokemonCount = 0;

let AUDIO_CLICK = new Audio ('./assets/audio/click.mp3');
AUDIO_CLICK.volume = 0.3;
let AUDIO_DELAY = new Audio ('./assets/audio/text-delay.mp3');
AUDIO_DELAY.volume = 0.08;
let AUDIO_POKEDEX = new Audio ('./assets/audio/open-pokedex.mp3')
AUDIO_POKEDEX.volume = 0.2

function toggleStartOverlay() {
    let overlayRef = document.getElementById('pokedex-overlay');
    let pokedexImg = document.getElementById('pokedex-closed-img');
    const pokedexAnim = 'assets/gifs/pokedex-animation.gif';

    pokedexImg.src = pokedexAnim;

    AUDIO_POKEDEX.play();
    setTimeout(() => {
        overlayRef.style.display = 'none';
    }, 2000);
}

function renderTypes() {
    let typesRef = document.getElementById('types-div');

    for (let type in typeIcons) {
        let typeSrc = typeIcons[type];
        typesRef.innerHTML += `<div id="types-category-div"><img class="types-categories" src="${typeSrc}" alt="type-icon" onclick="filterByType('${type}'), playAudio()"> <span class="type-text">${type}</span> </div>`;
    }
}

async function loadPokemon() {
    renderedPokemon = [];
    const loader = document.getElementById('loading-overlay');
    const overviewRef = document.getElementById('pokemon-overview');
    const loadMoreBtn = document.getElementById('pokeball-load-more');

    loader.classList.remove('d_none');
    overviewRef.style.overflowY = 'hidden';

    try {
        let response = await fetch(`${BASE_URL}?limit=${LIMIT}&offset=${offset}`);
        let data = await response.json();
        totalPokemonCount = data.count;
        for (let pokemon of data.results) {
            let exists = allDetails.find(p => p.name === pokemon.name);
            if (!exists) {
                let detailsResponse = await fetch(pokemon.url);
                let details = await detailsResponse.json();
                allDetails.push(details);
            }
        }
        const startIndex = allDetails.length - data.results.length;
        allDetails.slice(startIndex).forEach((pokemon, index) => {
            renderPokeMenu(pokemon, startIndex + index);
        });
        offset += LIMIT;
        if (offset >= totalPokemonCount) {
            loadMoreBtn.style.display = 'none';
        }
    } catch (error) {
        console.error("Fehler beim Laden der Pokemon:", error);
        document.getElementById('poke-div').innerHTML = "<p>Fehler beim Laden der Pokemon</p>"
    } finally {
        loader.classList.add('d_none');
        overviewRef.style.overflowY = 'auto';
        if (offset < totalPokemonCount) {
            loadMoreBtn.style.display = 'none'; 
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }
}

container.addEventListener('scroll', () => {
    const SCROLL_TOLERANCE = 100;
    const scrollTop = container.scrollTop;
    const visibleHeight = container.clientHeight;
    const contentHeight = container.scrollHeight;
    const distanceToBottom = contentHeight - (scrollTop + visibleHeight);
    const morePokemonAvailable = currentTypeFilter 

        ? (typeOffset < currentTypeResults.length)
        : (offset < 1118);

    if (distanceToBottom <= SCROLL_TOLERANCE && morePokemonAvailable) {
        loadMoreBtn.style.display = 'block';
    } else {
        loadMoreBtn.style.display = 'none';
    }
});

async function filterByType(selectedType) {
    renderedPokemon = [];
    currentTypeFilter = selectedType;
    typeOffset = 0;

    const pokeRef = document.getElementById('poke-div');
    const selectedTypeText = document.getElementById('selected-type-text');
    const loader = document.getElementById('loading-overlay');
    const typeIconSrc = typeIcons[selectedType];
    pokeRef.innerHTML = '';
    selectedTypeText.innerHTML = '';
    loader.classList.remove('d_none');

    try {
        const res = await fetch(`https://pokeapi.co/api/v2/type/${selectedType}`);
        const data = await res.json();
        currentTypeResults = data.pokemon.map(p => p.pokemon);
        const batch = currentTypeResults.slice(typeOffset, typeOffset + TYPE_LIMIT);
        const typeFilteredDetails = [];
        for (let entry of batch) {
            const cleanName = entry.name.split(':')[0];
            try {
                const pokeRes = await fetch(`${BASE_URL}/${cleanName}`);
                const pokeData = await pokeRes.json();
                typeFilteredDetails.push(pokeData);
            } catch (e) {
                console.warn(`Überspringe ungültigen Eintrag: ${entry.name}`, e);
            }
        }
        typeFilteredDetails.forEach((pokemon, index) => renderPokeMenu(pokemon, index));
        typeOffset += TYPE_LIMIT;
        selectedTypeText.innerHTML = `
            <p>Filter Typ:<strong id="selected-filter">${capitalize(selectedType)}</strong></p>
            <img id="filter-type-icon" src="${typeIconSrc}" alt="${selectedType} Icon">
            <button id="filter-clear-btn" onclick="clearTypeFilter()">x</button>
        `;
    } catch (error) {
        pokeRef.innerHTML = `<p>Fehler beim Laden der Pokémon vom Typ "${selectedType}"</p>`;
        console.error(error);
    } finally {
        loader.classList.add('d_none');
    }
}

function loadMore() {
    if (currentTypeFilter !== null) {
        loadPokemonFiltered(currentTypeFilter);
    } else {
        loadPokemon();
    }
}

async function loadPokemonFiltered(type) {
    const pokeRef = document.getElementById('poke-div');
    const loader = document.getElementById('loading-overlay');
    loader.classList.remove('d_none');

    try {
        const batch = currentTypeResults.slice(typeOffset, typeOffset + TYPE_LIMIT);
        if (batch.length === 0) {
            loadMoreBtn.style.display = 'none';  // Kein Nachladen mehr möglich
            return;
        }
        const typeFilteredDetails = [];
        for (let entry of batch) {
            const cleanName = entry.name.split(':')[0];
            try {
                const pokeRes = await fetch(`${BASE_URL}/${cleanName}`);
                const pokeData = await pokeRes.json();
                typeFilteredDetails.push(pokeData);
                filteredDetails.push(pokeData);
            } catch (e) {
                console.warn(`Überspringe ungültigen Eintrag: ${entry.name}`, e);
            }
        }
        filteredDetails.push(...typeFilteredDetails);
        typeFilteredDetails.forEach((pokemon, i) => {
            renderPokeMenu(pokemon, typeOffset + i);
        });

        typeOffset += TYPE_LIMIT;

        if (typeOffset >= currentTypeResults.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    } catch (error) {
        console.error("Fehler beim Nachladen gefilterter Pokémon:", error);
    } finally {
        loader.classList.add('d_none');
    }
}

function clearTypeFilter() {
    renderedPokemon = [];
    currentTypeFilter = null;
    filteredDetails = [];
    const pokeRef = document.getElementById('poke-div');
    const selectedTypeText = document.getElementById('selected-type-text');
    const loader = document.getElementById('loading-overlay');
    
    pokeRef.innerHTML = '';
    selectedTypeText.innerHTML = '';
    loader.classList.remove('d_none');

    setTimeout(() => {
        pokeRef.innerHTML = '';
        let uniqueNames = new Set();
        allDetails.forEach((pokemon, index) => {
            if (!uniqueNames.has(pokemon.name)) {
                uniqueNames.add(pokemon.name);
                renderPokeMenu(pokemon, index);
            }
        });
        loader.classList.add('d_none');
    }, 50);
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function playAudio() {
    AUDIO_CLICK.play()
}