function openPokemonOverlay(index) {
    const pokeOverlayRef = document.getElementById('pokemon-details-div');
    const backgroundRef = document.getElementById('background-overlay');
    const pokemon = renderedPokemon[index];
    if (!pokemon) return;

    pokeOverlayRef.classList.remove('d_none');
    backgroundRef.classList.remove('d_none');

    applyTypeColor(pokemon);
    renderPokeDetails(pokemon, index);
}

function handleCloseOverlay() {
    if (AUDIO_DELAY) {
        AUDIO_DELAY.pause();
        AUDIO_DELAY.currentTime = 0;
    }
    closePokemonOverlay();
    playAudio();
}

function closePokemonOverlay() {
    document.getElementById('pokemon-details-div').classList.add('d_none');
    document.getElementById('background-overlay').classList.add('d_none');
}

function playDelay() {
    AUDIO_DELAY.pause();
    AUDIO_DELAY.currentTime = 0;
    AUDIO_DELAY.play().catch(error => {
        if (error.name !== 'AbortError') {
            console.error('Audio konnte nicht abgespielt werden:', error);
        }
    });
}

function applyTypeColor(pokemon) {
    let pokeOverlayRef = document.getElementById('pokemon-details-div');

    pokeOverlayRef.classList.forEach(cls => {
        if (cls.startsWith('type-')) {
            pokeOverlayRef.classList.remove(cls);
        }
    });

    let mainType = pokemon.types[0].type.name;
    pokeOverlayRef.classList.add(`type-${mainType}`);
}

function renderPokeDetails(pokemon, index) {
    let pokeOverlayRef = document.getElementById('pokemon-details-div');
    pokeOverlayRef.innerHTML = "";
    pokeOverlayRef.innerHTML += pokeDetailsTemplate(pokemon, index);
    
    const allPTags = pokeOverlayRef.querySelectorAll('p');

        allPTags.forEach(p => {
          typeText(p, p.textContent);
        });

    animateAllSprites(pokemon);
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

async function animateAllSprites(pokemon) {
  const pokeOverlayRef = document.getElementById('pokemon-details-div');
  const spriteRow = pokeOverlayRef.querySelector('.sprite-current-col');
  const formsLabel = pokeOverlayRef.querySelector('#forms-label');
  const spriteImg = pokeOverlayRef.querySelector('#poke-sprite');
  const spriteContainer = pokeOverlayRef.querySelector('#poke-details-sprite-div');

  formsLabel.style.display = 'none';
  if (spriteImg) spriteImg.style.display = 'none';
  if (spriteImg) spriteImg.src = '';
  spriteRow.style.display = 'none';
  spriteContainer.innerHTML = '';
  spriteContainer.classList.add('d_none');

  if (spriteAnimationInterval) {
    clearInterval(spriteAnimationInterval);
  }
  try {
    const speciesRes = await fetch(pokemon.species.url);
    const speciesData = await speciesRes.json();
    const evoRes = await fetch(speciesData.evolution_chain.url);
    const evoData = await evoRes.json();
    const evolutionNames = [];
    let current = evoData.chain;
    while (current) {
      evolutionNames.push(current.species.name);
      current = current.evolves_to[0];
    }
    const spritePairs = [];
    for (let name of evolutionNames) {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      const data = await res.json();
      const front = data.sprites.front_default;
      const back = data.sprites.back_default; 
      if (front && back) {
        spritePairs.push({ front, back, name });
        const evoImg = document.createElement('img');
        evoImg.src = front;
        evoImg.alt = `${name}-sprite`;
        evoImg.classList.add('evo-sprite');
        evoImg.setAttribute('onclick', `openPokemonOverlayByName('${name}')`);
        spriteContainer.appendChild(evoImg);
      }
    }
        if (spritePairs.length === 0) return;
        if (spriteContainer.children.length > 0) {
          spriteContainer.classList.remove('d_none');
        }
      } catch (err) {
        console.error('Fehler beim Laden der Sprites:', err);
      }

    formsLabel.style.display = 'block';
    spriteRow.style.display = 'flex';
}

function typeText(element, text, delay = 160) {
  element.innerHTML = '';
  let i = 0;

  const interval = setInterval(() => {
    element.innerHTML += text.charAt(i);
    i++;
    if (i >= text.length) clearInterval(interval);
  }, delay);
}

function openPokemonOverlayByName(name) {
    let pokemon = renderedPokemon.find(p => p.name === name);
    if (!pokemon && typeof allDetails !== 'undefined') {
        pokemon = allDetails.find(p => p.name === name);
    }
    if (pokemon) {
        openPokemonOverlayFromObject(pokemon);
        playDelay();
    } else {
        console.warn(`Pokémon mit Name "${name}" nicht gefunden.`);
    }
}


function openPokemonOverlayFromObject(pokemon) {
    const pokeOverlayRef = document.getElementById('pokemon-details-div');
    const backgroundRef = document.getElementById('background-overlay');

    if (!pokemon) return;

    pokeOverlayRef.classList.remove('d_none');
    backgroundRef.classList.remove('d_none');

    applyTypeColor(pokemon);

    const index = renderedPokemon.findIndex(p => p.name === pokemon.name);
    renderPokeDetails(pokemon, index);
    playDelay();
}
