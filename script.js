
const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
let allDetails = [];
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
let AUDIO_CLICK = new Audio ('assets/audio/click.mp3');
AUDIO_CLICK.volume = 0.3;
let AUDIO_DELAY = new Audio ('assets/audio/text-delay.mp3');
AUDIO_DELAY.volume = 0.02;


function toggleStartOverlay() {
    let overlayRef = document.getElementById('pokedex-overlay');
    let pokedexImg = document.getElementById('pokedex-closed-img');

    const pokedexAnim = 'assets/gifs/pokedex-animation.gif';

    pokedexImg.src = pokedexAnim;

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

    loader.classList.remove('d_none');
    overviewRef.style.overflowY = 'hidden';

    try{
    let response = await fetch(`${BASE_URL}?limit=${LIMIT}&offset=${offset}`);
    let data = await response.json();

    for (let pokemon of data.results) {
        let detailsResponse = await fetch(pokemon.url);
        let details = await detailsResponse.json();
        allDetails.push(details);
    }

    const startIndex = allDetails.length - data.results.length;
        allDetails.slice(startIndex).forEach((pokemon, index) => {
            renderPokeMenu(pokemon, startIndex + index);
        });

        offset += LIMIT;

    }catch(error) {
        console.error("Fehler beim Laden der Pokemon:", error);
        document.getElementById('poke-div').innerHTML = "<p>Fehler beim Laden der Pokemon</p>"
    } finally {
        loader.classList.add('d_none');
         overviewRef.style.overflowY = 'auto';
    }
}

container.addEventListener('scroll', () => {
  const scrollTop = container.scrollTop;
  const visibleHeight = container.clientHeight;
  const contentHeight = container.scrollHeight;

  console.log(scrollTop, visibleHeight, contentHeight) 

  if (scrollTop + visibleHeight >= contentHeight - 20) {
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
            const pokeRes = await fetch(entry.url);
            const pokeData = await pokeRes.json();
            typeFilteredDetails.push(pokeData);
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

function clearTypeFilter() {
    renderedPokemon = [];
    currentTypeFilter = null;
    const pokeRef = document.getElementById('poke-div');
    const selectedTypeText = document.getElementById('selected-type-text');
    const loader = document.getElementById('loading-overlay');
    pokeRef.innerHTML = '';
    selectedTypeText.innerHTML = '';
    loader.classList.remove('d_none');

    setTimeout(() => {
        pokeRef.innerHTML = '';
        allDetails.forEach((pokemon, index) => renderPokeMenu(pokemon, index));
        loader.classList.add('d_none');
    }, 50);
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
        const typeFilteredDetails = [];

        for (let entry of batch) {
            const pokeRes = await fetch(entry.url);
            const pokeData = await pokeRes.json();
            typeFilteredDetails.push(pokeData);
            allDetails.push(pokeData);
        }

        const startIndex = allDetails.length - typeFilteredDetails.length;

        typeFilteredDetails.forEach((pokemon, i) => {
            renderPokeMenu(pokemon, startIndex + i);
        });
        typeOffset += TYPE_LIMIT;

    } catch (error) {
        console.error("Fehler beim Nachladen gefilterter Pokémon:", error);
    } finally {
        loader.classList.add('d_none');
    }
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}


function playAudio() {
    AUDIO_CLICK.play()
}