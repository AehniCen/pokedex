function pokeTemplate(pokemon, index){
    return `
    <div class="template-div" onclick="openPokemonOverlay(${index}), playDelay()">
        <div class="poke-div-type" id="poke-div-type-${index}"></div>
        <div id="poke-div-img-${index}" class="poke-div-img"><img id="poke-img-image"src="${pokemon.sprites.other["official-artwork"].front_default}" alt="pokemon-image"></div>
        <div class="poke-div-name"><p id="poke-name-p">${capitalize(pokemon.species.name)}</p></div>
    </div>
    `};

function pokeDetailsTemplate(pokemon, index) {
    
    return `
    <div id="poke-details-div-overlay">
        <button id="poke-details-button" onclick="closePokemonOverlay(${index}), playAudio()">x</button>
        <div id="poke-details-img-stats-div">
            <div id="poke-details-img-div">
                <img id="poke-details-img" src="${pokemon.sprites.other["official-artwork"].front_default}" alt="">
            </div>
            <div id="poke-details-stats-div">
                <p id="poke-details-stats"><p>Stats:</p>${generateStatsBars(pokemon)}
            </div>
        </div>
        <div id="poke-details-name-div">
            <div><p>Name:</p></div><p id="poke-details-name" class="poke-details-position pd_padding">${capitalize(pokemon.species.name)}</p>
            <div><p>Typ:</p></div><div id="poke-details-type" class="poke-details-position pd_padding"><p>${pokemon.types
                    .map(t => {
                      const type = t.type.name;
                      const icon = typeIcons[type];
                      return `
                            <div class="poke-details-types-div">
                                <img id="poke-details-type-icons" src="${icon}" alt="${type}" class="type-icon">
                                <span class="poke-details-type-name">${capitalize(type)}</span>
                            </div>
                            `;
                    })
                    .join('')}</p>
            </div>
            <div><p>Abilities:</p></div>
            <ul id="poke-details-abilities" class="pd_padding">
              ${pokemon.abilities
                .map(t => `<li>${capitalize(t.ability.name.replace(/-/g, ' '))}</li>`)
                .join('')}
            </ul>
            <div><p>Moves:</p></div>
            <ul id="poke-details-moves"class="pd_padding">
              ${pokemon.moves.slice(0, 3)
                .map(t => `<li>${capitalize(t.move.name.replace(/-/g, ' '))}</li>`)
                .join('')}
            </ul>
        </div>
        <div id="poke-details-sprite-div"><p>Forms:</p><img id="poke-sprite" src="" alt="pokemon-sprite"></div>        
    </div>
    `
}