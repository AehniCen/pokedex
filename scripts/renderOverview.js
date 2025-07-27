function renderPokeMenu(pokemon, index) {
    let pokeRef = document.getElementById('poke-div'); 
    
    renderedPokemon.push(pokemon);

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