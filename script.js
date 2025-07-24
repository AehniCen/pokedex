
const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
let allDetails = [];

let AUDIO_CLICK = new Audio ('assets/audio/click.mp3');
let AUDIO_DELAY = new Audio ('assets/audio/text-delay.mp3');
AUDIO_DELAY.volume = 0.05;


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
        typesRef.innerHTML += `<div id="types-category-div"><img class="types-categories" src="${typeSrc}" alt="type-icon" onclick="playAudio()"> <span class="type-text">${type}</span> </div>`;
    }
    
}

async function loadPokemon() {
    const loader = document.getElementById('loading-overlay');
    loader.classList.remove('d_none');

    try{
    let response = await fetch(BASE_URL + "?limit=60");
    let data = await response.json();

    for (let pokemon of data.results) {
        let detailsResponse = await fetch(pokemon.url);
        let details = await detailsResponse.json();
        allDetails.push(details);
    }

    allDetails.forEach((pokemon, index) => renderPokeMenu(pokemon, index));
    }catch(error) {
        console.error("Fehler beim Laden der Pokemon:", error);
        document.getElementById('poke-div').innerHTML = "<p>Fehler beim Laden der Pokemon</p>"
    } finally {
        loader.classList.add('d_none');
    }

}

function renderPokeMenu(pokemon, index) {
    let pokeRef = document.getElementById('poke-div');  
    pokeRef.innerHTML += pokeTemplate(pokemon, index);
    renderTypeIcon(pokemon, index);
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