
const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
let allDetails = [];
let offset = 0;
const LIMIT = 60;
const container = document.getElementById('pokemon-overview');
const loadMoreBtn = document.getElementById('load-more-btn');
let spriteAnimationInterval;
let currentTypeFilter = null;

let AUDIO_CLICK = new Audio ('assets/audio/click.mp3');
AUDIO_CLICK.volume = 0.3;
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

async function filterByType(selectedType) {
    currentTypeFilter = selectedType; // ✅ Filter merken

    const pokeRef = document.getElementById('poke-div');
    const selectedTypeText = document.getElementById('selected-type-text');
    const loader = document.getElementById('loading-overlay');
    pokeRef.innerHTML = '';
    selectedTypeText.innerHTML = '';
    loader.classList.remove('d_none');

    try {
        const res = await fetch(`https://pokeapi.co/api/v2/type/${selectedType}`);
        const data = await res.json();

        const pokemonEntries = data.pokemon.slice(0, 60); // max. 60 laden
        const typeFilteredDetails = [];

        for (let entry of pokemonEntries) {
            const pokeRes = await fetch(entry.pokemon.url);
            const pokeData = await pokeRes.json();
            typeFilteredDetails.push(pokeData);
        }

        if (typeFilteredDetails.length === 0) {
            pokeRef.innerHTML = `<p>Keine Pokémon vom Typ "${selectedType}" gefunden.</p>`;
        } else {
            typeFilteredDetails.forEach((pokemon, index) => renderPokeMenu(pokemon, index));
        }

        selectedTypeText.innerHTML = `
            Filter Typ: <strong>${capitalize(selectedType)}</strong>
            <button onclick="clearTypeFilter()">Entfernen</button>
        `;

    } catch (error) {
        pokeRef.innerHTML = `<p>Fehler beim Laden der Pokémon vom Typ "${selectedType}"</p>`;
        console.error(error);
    } finally {
        loader.classList.add('d_none');
    }
}

function clearTypeFilter() {
    currentTypeFilter = null; // ✅ Filter zurücksetzen

    const pokeRef = document.getElementById('poke-div');
    const selectedTypeText = document.getElementById('selected-type-text');

    pokeRef.innerHTML = '';
    selectedTypeText.innerHTML = '';

    allDetails.forEach((pokemon, index) => renderPokeMenu(pokemon, index));
}

function loadMore() {
    if (currentTypeFilter !== null) {
        alert('Bitte entferne zuerst den aktiven Typfilter, bevor du weitere Pokémon lädst.');
        return;
    }

    loadPokemon();
}