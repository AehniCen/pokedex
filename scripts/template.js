function pokeTemplate(pokemon, index){
    return `
    <div class="template-div" onclick="togglePokemonOverlay(${index})">
        <div class="poke-div-type" id="poke-div-type-${index}"></div>
        <div class="poke-div-img"><img id="poke-img-image"src="${pokemon.sprites.other["official-artwork"].front_default}" alt="pokemon-image"></div>
        <div class="poke-div-name"><p id="poke-name-p">${pokemon.species.name}</p></div>
    </div>
    `};

function pokeDetailsTemplate(pokemon, index) {
    return `
    <div id="poke-details-div">
        <button id="poke-details-button">x</button>
        <div id="poke-details-img-div">
            <img src="${pokemon.sprites.other["official-artwork"].front_default}" alt="">
        </div>
        <div id="poke-details-name-div">
            <p id="poke-details-name">${pokemon.species.name}</p>
            <div id="poke-details-type">${pokemon.types
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
                    .join('')}
            </div>
        </div>
        <div id="poke-details-stats-div">
            <p id="poke-details-abilities">${pokemon.abilities.map(t => t.ability.name).join(' / ')}</p>
            <p id="poke-details-moves">${pokemon.moves.slice(0, 3).map(t => t.move.name).join(' / ')}</p>
            <p id="poke-details-stats">${pokemon.stats.map(t => t.stat.name).join(' / ')}</p>
        </div>
    </div>
    `
}