
const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
let allDetails = [];
let filteredDetails = [];
let offset = 0;
const LIMIT = 60;
const overviewRef = document.getElementById('pokemon-overview');
const loadMoreBtn = document.getElementById('pokeball-load-more');
const pokeRef = document.getElementById('poke-div');
let spriteAnimationInterval;
let currentTypeFilter = null;
const selectedTypeText = document.getElementById('selected-type-text');
let typeOffset = 0;
const TYPE_LIMIT = 60;
let currentTypeResults = [];
let renderedPokemon = [];
let totalPokemonCount = 0;
const loader = document.getElementById('loading-overlay');

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
    loader.classList.remove('d_none');
    try {
        let response = await fetch(`${BASE_URL}?limit=${LIMIT}&offset=${offset}`);
        let data = await response.json();
        totalPokemonCount = data.count;
        await pushDetails(data);
        startIndex(data);
        offset += LIMIT;
    } catch (error) {
        pokeRef.innerHTML = "<p>Fehler beim Laden der Pokemon</p>";
    } finally {
        loader.classList.add('d_none');
        hideLoadMoreBtn();
    }
}

async function pushDetails(data) {
    for (let pokemon of data.results) {
        if (!allDetails.find(p => p.name === pokemon.name)) {
            try {
                let detailsResponse = await fetch(pokemon.url);
                if (!detailsResponse.ok) {
                    console.warn(`Details nicht gefunden für ${pokemon.name}`);
                    continue;
                }
                let details = await detailsResponse.json();
                allDetails.push(details);
            } catch (e) {
                console.warn(`Fehler beim Laden von Details für ${pokemon.name}:`, e);
            }}
    }
}

function hideLoadMoreBtn() {
    overviewRef.style.overflowY = 'auto';
    if (currentTypeFilter) {
        loadMoreBtn.style.display = (typeOffset < currentTypeResults.length) ? 'block' : 'none';
    } else {
        loadMoreBtn.style.display = (offset < totalPokemonCount) ? 'block' : 'none';
    }
}

function startIndex(data) {
    const startIndex = allDetails.length - data.results.length;
        allDetails.slice(startIndex).forEach((pokemon, index) => {
            renderPokeMenu(pokemon, startIndex + index);
        });
}

overviewRef.addEventListener('scroll', () => {
    const SCROLL_TOLERANCE = 100;
    const scrollTop = overviewRef.scrollTop;
    const visibleHeight = overviewRef.clientHeight;
    const contentHeight = overviewRef.scrollHeight;
    const distanceToBottom = contentHeight - (scrollTop + visibleHeight);
    const morePokemonAvailable = currentTypeFilter
        ? (typeOffset < currentTypeResults.length)
        : (offset < totalPokemonCount);
    if (distanceToBottom <= SCROLL_TOLERANCE && morePokemonAvailable) {
        loadMoreBtn.style.display = 'block';
    } else {
        loadMoreBtn.style.display = 'none';
    }
});

function clearFilter() {
    renderedPokemon = [];
    typeOffset = 0;
    pokeRef.innerHTML = '';
    selectedTypeText.innerHTML = '';
}

async function filterByType(selectedType) {
    clearFilter();
    currentTypeFilter = selectedType;
    loader.classList.remove('d_none');
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/type/${selectedType}`);
        const data = await res.json();
        await getFilteredPokemon(data, selectedType, selectedTypeText);   
    } catch (error) {
        pokeRef.innerHTML = `<p>Fehler beim Laden der Pokemon vom Typ "${selectedType}"</p>`;
    } finally {
        loader.classList.add('d_none');
    }
}

async function getFilteredPokemon(data, selectedType, selectedTypeText) {
    currentTypeResults = data.pokemon.map(p => p.pokemon);
    const batch = currentTypeResults.slice(typeOffset, typeOffset + TYPE_LIMIT);
    const typeIconSrc = typeIcons[selectedType];
    await getDetailsFiltered(batch);
    typeOffset += TYPE_LIMIT;
    selectedTypeText.innerHTML += filterTypeTemplate(selectedType, typeIconSrc)
}

async function fetchPokemonByName(name) {
    const cleanName = name.split(':')[0];
    if (cleanName.includes(':')) return null;
    try {
      const res = await fetch(`${BASE_URL}/${cleanName}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
}

async function getDetailsFiltered(batch) {
    const details = [];
    for (const entry of batch) {
      const pokeData = await fetchPokemonByName(entry.name);
      if (pokeData) {
        details.push(pokeData);
        filteredDetails.push(pokeData);
      }
    }
    details.forEach((p, i) => renderPokeMenu(p, typeOffset + i));
}

function loadMore() {
    if (currentTypeFilter !== null) {
        loadPokemonFiltered(currentTypeFilter);
    } else {
        loadPokemon();
    }
}

async function loadPokemonFiltered() {
    loader.classList.remove('d_none');
    try {
        const batch = currentTypeResults.slice(typeOffset, typeOffset + TYPE_LIMIT);
        if (batch.length === 0) {
            loadMoreBtn.style.display = 'none';
            return;
     }
        await getDetailsFiltered(batch);
        typeOffset += TYPE_LIMIT;
    } catch (error) {
        console.error("Fehler beim Nachladen gefilterter Pokemon:", error);
    } finally {
        loader.classList.add('d_none');
        hideLoadMoreBtn();
    }
}

function clearTypeFilter() {
    renderedPokemon = [];
    currentTypeFilter = null;
    filteredDetails = [];    
    pokeRef.innerHTML = '';
    selectedTypeText.innerHTML = '';
    loader.classList.remove('d_none');
    generateNewSet()
}

function generateNewSet() {
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