
const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
let allDetails = [];
let offset = 0;
const LIMIT = 60;
const container = document.getElementById('pokemon-overview');
const loadMoreBtn = document.getElementById('load-more-btn');

let AUDIO_CLICK = new Audio ('assets/audio/click.mp3');
let AUDIO_DELAY = new Audio ('assets/audio/text-delay.mp3');
AUDIO_DELAY.volume = 0.02;


function toggleOverlay() {
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
    const loader = document.getElementById('loading-overlay');
    loader.classList.remove('d_none');

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
    }
}

container.addEventListener('scroll', () => {
  const scrollTop = container.scrollTop;
  const visibleHeight = container.clientHeight;
  const contentHeight = container.scrollHeight;

  console.log(scrollTop, visibleHeight, contentHeight) 

  if (scrollTop + visibleHeight >= contentHeight - 10) {
    loadMoreBtn.style.display = 'block';
  } else {
    loadMoreBtn.style.display = 'none';
  }
});

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function renderPokeMenu(pokemon, index) {
    let pokeRef = document.getElementById('poke-div'); 
     
    pokeRef.innerHTML += pokeTemplate(pokemon, index);
    renderTypeIcon(pokemon, index);
    getTypeColor(pokemon, index);
}

function getTypeColor(pokemon, index) {
    let pokeOverlayRef = document.getElementById(`poke-div-img-${index}`);

    pokeOverlayRef.classList.forEach(cls => {
        if (cls.startsWith('type-')) {
            pokeOverlayRef.classList.remove(cls);
        }
    });

    let mainType = pokemon.types[0].type.name;
    pokeOverlayRef.classList.add(`type-${mainType}`);
}

function renderTypeIcon(pokemon, index) {
    let typeRef = document.getElementById(`poke-div-type-${index}`);
    typeRef.innerHTML = '';

    pokemon.types.forEach(t => {
      const typeName = t.type.name;
      const iconPath = typeIcons[typeName];

      if (iconPath) {
        typeRef.innerHTML += `<img id="poke-type-icon" src="${iconPath}" alt="type-icon">`;
      }
    });
}

function filterByType(selectedType) {
    const pokeRef = document.getElementById('poke-div');
    const selectedTypeText = document.getElementById('selected-type-text');
    pokeRef.innerHTML = '';

    const filtered = allDetails.filter(pokemon => 
        pokemon.types.some(t => t.type.name === selectedType)
    );

    if (filtered.length === 0) {
        pokeRef.innerHTML = `<p>Keine Pokemon vom Typ "${selectedType}" gefunden.</p>`;
    }else {
        filtered.forEach((pokemon, index) => renderPokeMenu(pokemon, index));
    }

    selectedTypeText.innerHTML = `
        Filter Typ: <strong>${capitalize(selectedType)}</strong>
        <button onclick="clearTypeFilter()">Entfernen</button>
    `;
}

function clearTypeFilter() {
    const pokeRef = document.getElementById('poke-div');
    const selectedTypeText = document.getElementById('selected-type-text');

    pokeRef.innerHTML = '';
    selectedTypeText.innerHTML = '';

    allDetails.forEach((pokemon, index) => renderPokeMenu(pokemon, index));
}