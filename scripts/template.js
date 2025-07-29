function pokeTemplate(pokemon, index){
    return `
    <div class="template-div" onclick="openPokemonOverlayByName('${pokemon.name}'), playDelay()">
        <div class="poke-div-type" id="poke-div-type-${index}"></div>
        <div id="poke-div-img-${index}" class="poke-div-img"><img id="poke-img-image" src="${pokemon.sprites.other["official-artwork"].front_default || './assets/images/fallback-picture.png'}" alt="pokemon-image"></div>
        <div class="poke-div-name"><p id="poke-name-p">${capitalize(pokemon.species.name)}</p></div>
    </div>
    `};

function filterTypeTemplate(selectedType, typeIconSrc) {
    return `
        <p>Filter Typ:<strong id="selected-filter">${capitalize(selectedType)}</strong></p>
        <img id="filter-type-icon" src="${typeIconSrc}" alt="${selectedType} Icon">
        <button id="filter-clear-btn" onclick="clearTypeFilter()">x</button>
    `;
}

function pokeDetailsTemplate(pokemon, index) {
    
    return `
    <div id="poke-details-div-overlay">
        <button id="prev-btn" onclick="showPrev()"><img src="assets/images/pokeball-load-more.png" alt=""></button>
        <button id="next-btn" onclick="showNext()"><img src="assets/images/pokeball-load-more.png" alt=""></button>
        <button id="poke-details-button" onclick="handleCloseOverlay()">x</button>
        <div id="poke-details-img-stats-div">
            <div id="poke-details-img-div">
                <img id="poke-details-img" src="${pokemon.sprites.other["official-artwork"].front_default || './assets/images/fallback-picture.png'}" alt="">
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
            <div class="sprite-current-col">
              <p id="forms-label">Forms:</p>
            </div>
            <div id="poke-details-sprite-div" class="d_none"></div>
        </div>      
    </div>
    `
}

function generateStatsBars(pokemon) {
  return pokemon.stats.map(stat => {
    const name = stat.stat.name;
    const value = stat.base_stat;
    const percentage = Math.min((value / 200) * 100, 100); 
    return `
      <div class="stat-row">
        <span class="stat-label"><p>${name}</p></span>
        <div class="stat-bar-bg">
          <div class="stat-bar-fill" style="width: ${percentage}%"></div>
        </div>
        <span class="stat-value">${value}</span>
      </div>
    `;
  }).join('');
}