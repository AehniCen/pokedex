function pokeTemplate(pokemon, index){
    return `
    <div class="template-div" onclick="togglePokemonOverlay(${index}), playDelay()">
        <div class="poke-div-type" id="poke-div-type-${index}"></div>
        <div class="poke-div-img"><img id="poke-img-image"src="${pokemon.sprites.other["official-artwork"].front_default}" alt="pokemon-image"></div>
        <div class="poke-div-name"><p id="poke-name-p">${pokemon.species.name}</p></div>
    </div>
    `};

function pokeDetailsTemplate(pokemon, index) {
    
    return `
    <div id="poke-details-div-overlay">
        <button id="poke-details-button" onclick="togglePokemonOverlay(${index}), playAudio()">x</button>
        <div id="poke-details-img-stats-div">
            <div id="poke-details-img-div">
                <img id="poke-details-img" src="${pokemon.sprites.other["official-artwork"].front_default}" alt="">
            </div>
            <div id="poke-details-stats-div">
                <p id="poke-details-stats"><p>Stats:</p>${generateStatsBars(pokemon)}
            </div>
        </div>
        <div id="poke-details-name-div">
            <div><p>Name:</p></div><p id="poke-details-name">${pokemon.species.name}</p>
            <div><p>Typ:</p></div><div id="poke-details-type"><p>${pokemon.types
                    .map(t => {
                      const type = t.type.name;
                      const icon = typeIcons[type];
                      return `
                            <div class="poke-details-types-div">
                                <img id="poke-details-type-icons" src="${icon}" alt="${type}" class="type-icon">
                                <span class="poke-details-type-name">${type}</span>
                            </div>
                            `;
                    })
                    .join('')}</p>
            </div>
            <div><p>Abilities:</p></div><p id="poke-details-abilities">${pokemon.abilities.map(t => t.ability.name).join('<br>')}</p>
            <div><p>Moves:</p></div><p id="poke-details-moves">${pokemon.moves.slice(0, 3).map(t => t.move.name).join('<br>')}</p>
            <div><p>Forms:</p></div>
        </div>
        <div id="poke-details-sprite-div"><img id="poke-sprite" src="" alt="pokemon-sprite"><div id="poke-evolution-sprite"></div></div>
        
    </div>
    `
}