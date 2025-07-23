let allDetails = [];

function toggleOverlay() {
    let overlayRef = document.getElementById('pokedex-overlay');
    let pokedexImg = document.getElementById('pokedex-closed-img');

    const pokedexAnim = 'assets/gifs/pokedex-animation.gif';

    pokedexImg.src = pokedexAnim;

    setTimeout(() => {
        overlayRef.style.display = 'none';
    }, 2000);
}

function togglePokemonOverlay(index) {
    let pokeOverlayRef = document.getElementById('pokemon-details-div');
    pokeOverlayRef.classList.toggle('d_none');
    let pokemon;

    if (index !== undefined) {
        pokemon = allDetails[index];
        applyTypeColor(pokemon);
    }

    if (pokemon) {
        renderPokeDetails(pokemon, index);
    }

    console.log(pokemon);
    
}

function applyTypeColor(pokemon) {
    let pokeOverlayRef = document.getElementById('pokemon-details-div');
    let mainType = pokemon.types[0].type.name;

    pokeOverlayRef.classList.add(`type-${mainType}`);
}

function renderPokeDetails(pokemon, index) {
    let pokeOverlayRef = document.getElementById('pokemon-details-div');

    pokeOverlayRef.innerHTML = "";
    pokeOverlayRef.innerHTML += pokeDetailsTemplate(pokemon, index);
}

function renderTypes() {
    let typesRef = document.getElementById('types-div');

    for (let type in typeIcons) {
        let typeSrc = typeIcons[type];
        typesRef.innerHTML += `<div id="types-category-div"><img class="types-categories" src="${typeSrc}" alt="type-icon"> <span class="type-text">${type}</span> </div>`;
    }
    
}

async function loadPokemon() {
   
    let response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10');
    let data = await response.json();

    for (let pokemon of data.results) {
        let detailsResponse = await fetch(pokemon.url);
        let details = await detailsResponse.json();
        allDetails.push(details);
    }

    allDetails.forEach((pokemon, index) => renderPokeMenu(pokemon, index)); 
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