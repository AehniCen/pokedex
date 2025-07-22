function toggleOverlay() {
    let overlayRef = document.getElementById('pokedex-overlay');
    let pokedexImg = document.getElementById('pokedex-closed-img');

    const pokedexAnim = 'assets/gifs/pokedex-animation.gif';

    pokedexImg.src = pokedexAnim;

    setTimeout(() => {
        overlayRef.style.display = 'none';
    }, 2000);
}

async function loadPokemon() {
    let response = await fetch('https://pokeapi.co/api/v2/pokemon/ivysaur');
    let pokemon = await response.json();
    let pokemonRef = document.getElementById('poke-div');
    pokemonRef.innerHTML += pokeTemplate(pokemon);


    console.log(pokemon);
    
}