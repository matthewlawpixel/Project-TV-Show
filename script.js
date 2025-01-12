
const FALLBACK_IMAGE = "placeholder.jpg";
const NO_SUMMARY_TEXT = "No summary available.";
let showCache = {}; // Cache to store shows and episodes data
let currentEpisodes = []; // Store the current episodes for search functionality

function setup() {
  populateShowSelector();
  addSearchFeature(); // Set up search functionality
}

function populateShowSelector() {
  const showSelector = document.getElementById("show-selector");
  if (!showSelector) return;

  // Fetch the list of shows
  fetchShows().then((shows) => {
    const sortedShows = shows.sort((a, b) =>
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );

    sortedShows.forEach((show) => {
      const option = document.createElement("option");
      option.value = show.id;
      option.textContent = show.name;
      showSelector.appendChild(option);
    });
  });

  // Add event listener to handle show selection
  showSelector.addEventListener("change", (event) => {
    const showId = event.target.value;
    if (showId) {
      fetchEpisodesForShow(showId);
    } else {
      clearEpisodes(); // Clear the episodes if no show is selected
    }
  });
}

function fetchShows() {
  // If shows have already been fetched, return from cache
  if (showCache.shows) {
    return Promise.resolve(showCache.shows);
  }

  return fetch("https://api.tvmaze.com/shows")
    .then((response) => response.json())
    .then((data) => {
      showCache.shows = data; // Cache the shows data
      return data;
    });
}

function fetchEpisodesForShow(showId) {
  // If episodes for this show are already fetched, use the cache
  if (showCache[showId]) {
    renderEpisodes(showCache[showId]);
    populateEpisodeSelector(showCache[showId]);
    return;
  }

  // Fetch episodes for the selected show
  fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then((response) => response.json())
    .then((episodes) => {
      showCache[showId] = episodes; // Cache episodes for this show
      currentEpisodes = episodes; // Store the episodes for search
      renderEpisodes(episodes);
      populateEpisodeSelector(episodes);
    });

let allEpisodes = [];

async function fetchEpisodes() {
  const loadingMessage = document.createElement("p");
  loadingMessage.id = "loadingMessage";
  loadingMessage.textContent = "Loading episodes...";
  document.body.prepend(loadingMessage);

  try {
    const response = await fetch("https://api.tvmaze.com/shows/82/episodes");
    if (!response.ok) {
      throw new Error(`Failed to fetch episodes: ${response.status}`);
    }
    allEpisodes = await response.json(); 
    initialisePage();
  } catch (error) {
    showError(`Error loading episodes: ${error.message}`);
  } finally {
    loadingMessage.remove();
  }
}

function showError(message) {
  const errorMessage = document.createElement("p");
  errorMessage.id = "errorMessage";
  errorMessage.textContent = message;
  errorMessage.style.color = "red";
  document.body.prepend(errorMessage);
}

// Initialize the page
function initialisePage() {
  if (allEpisodes.length === 0) {
    return; // Do nothing if no episodes are available
  }
  makePageForEpisodes(allEpisodes);
  addSearchFunctionality(allEpisodes);
  addEpisodeSelector(allEpisodes);

}

function renderEpisodes(episodes) {
  const rootElem = document.getElementById("root");
  if (!rootElem) return;

  rootElem.innerHTML = ""; // Clear existing content
  const container = createContainer();
  rootElem.appendChild(container);

  episodes.forEach((episode) => {
    const episodeCard = createEpisodeCard(episode);
    container.appendChild(episodeCard);
  });

  episodeList.forEach((episode) => {
    const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number
    ).padStart(2, "0")}`;


  const resultsCount = document.getElementById("results-count");
  if (resultsCount) {
    resultsCount.textContent = `Matching Episodes: ${episodes.length}`;
  }
}


function clearEpisodes() {
  const rootElem = document.getElementById("root");
  if (rootElem) {
    rootElem.innerHTML = "";
  }

    episodeCard.innerHTML = `
      <img src="${
        episode.image?.medium ||
        "https://via.placeholder.com/300x169?text=No+Image"
      }" alt="${episode.name}">
      <div class="episode-content">
        <h2>${episode.name} – ${episodeCode}</h2>
        <p>${
          episode.summary
            ? episode.summary.replace(/<[^>]+>/g, "")
            : "No summary available."
        }</p>
        <a href="${episode.url}" target="_blank">View on TVMaze</a>
      </div>
    `;


  const resultsCount = document.getElementById("results-count");
  if (resultsCount) {
    resultsCount.textContent = "Matching Episodes: 0";
  }
}

function createContainer() {
  const container = document.createElement("div");
  container.className = "episodes-container";
  return container;
}

function createEpisodeCard(episode) {
  const card = document.createElement("div");
  card.className = "episode-card";
  card.id = `episode-${episode?.id || "unknown"}`;

  const img = createEpisodeImage(episode);
  const title = createEpisodeTitle(episode);
  const code = createEpisodeCode(episode);
  const summary = createEpisodeSummary(episode);
  const link = createEpisodeLink(episode);

  card.append(img, title, code, summary, link);
  return card;
}

function createEpisodeImage(episode) {
  const img = document.createElement("img");
  img.src = episode?.image?.medium || FALLBACK_IMAGE;
  img.alt = `Image of ${
    episode?.name || "Unknown Episode"
  } - ${formatEpisodeCode(episode)}`;
  return img;
}

function createEpisodeTitle(episode) {
  const title = document.createElement("h2");
  title.className = "episode-title";
  title.textContent = episode?.name || "Untitled Episode";
  return title;
}

function createEpisodeCode(episode) {
  const code = document.createElement("p");
  code.className = "episode-code";
  code.textContent = formatEpisodeCode(episode);
  return code;
}

function createEpisodeSummary(episode) {
  const summary = document.createElement("p");
  summary.className = "episode-summary";
  summary.innerHTML = episode?.summary || NO_SUMMARY_TEXT;
  return summary;
}

function createEpisodeLink(episode) {
  const link = document.createElement("a");
  link.className = "episode-link";
  link.href = episode?.url || "#";
  link.target = "_blank";
  link.textContent = "More Info";
  return link;
}

function formatEpisodeCode(episode) {
  if (!episode) return "S00E00";
  const season = String(episode.season || 0).padStart(2, "0");
  const number = String(episode.number || 0).padStart(2, "0");
  return `S${season}E${number}`;
}

function populateEpisodeSelector(episodes) {
  const episodeSelector = document.getElementById("episode-selector");
  if (!episodeSelector) return;

  episodeSelector.innerHTML = '<option value="">Show All Episodes</option>';

  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${formatEpisodeCode(episode)} - ${
      episode?.name || "Unknown"
    }`;
    episodeSelector.appendChild(option);
  });

  addEpisodeSelectorListener(episodes);
}

function addEpisodeSelectorListener(episodes) {
  const episodeSelector = document.getElementById("episode-selector");
  if (!episodeSelector) return;

  episodeSelector.addEventListener("change", () => {
    const selectedId = episodeSelector.value;

    if (selectedId === "") {
      renderEpisodes(episodes); // Show all episodes if no specific episode is selected
    } else {
      const selectedEpisode = episodes.find(
        (episode) => episode.id === parseInt(selectedId, 10)
      );
      renderEpisodes(selectedEpisode ? [selectedEpisode] : []); // Render the selected episode or nothing
    }
  });
}

function addSearchFeature() {
  const searchInput = document.getElementById("search-bar");
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();

    const filteredEpisodes = currentEpisodes.filter((episode) => {
      const nameMatch = episode?.name?.toLowerCase().includes(searchTerm);
      const summaryMatch = episode?.summary?.toLowerCase().includes(searchTerm);
      return nameMatch || summaryMatch;
    });

    renderEpisodes(filteredEpisodes);

    // If the search term is empty, show all episodes
    if (searchTerm === "") {
      renderEpisodes(currentEpisodes);
    }
  });
}

function addSearchFunctionality(allEpisodes) {
  const searchInput = document.getElementById("searchInput");
  const episodeCountElem = document.getElementById("episodeCount");

  episodeCountElem.textContent = `${allEpisodes.length} episode(s) found`;

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();

    const filteredEpisodes = allEpisodes.filter((episode) => {
      const nameMatch = episode.name.toLowerCase().includes(searchTerm);
      const summaryMatch = episode.summary
        ? episode.summary.toLowerCase().includes(searchTerm)
        : false;
      return nameMatch || summaryMatch;
    });

    makePageForEpisodes(filteredEpisodes);
    episodeCountElem.textContent = `${filteredEpisodes.length} episode(s) found`;
  });
}

function addEpisodeSelector(allEpisodes) {
  const episodeSelector = document.getElementById("episodeSelector");
  const showAllButton = document.getElementById("showAllButton");

  allEpisodes.forEach((episode) => {
    const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number
    ).padStart(2, "0")}`;
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${episodeCode} - ${episode.name}`;
    episodeSelector.appendChild(option);
  });

  episodeSelector.addEventListener("change", (event) => {
    const selectedEpisodeId = event.target.value;
    if (selectedEpisodeId) {
      const selectedEpisode = allEpisodes.find(
        (episode) => episode.id == selectedEpisodeId
      );
      makePageForEpisodes([selectedEpisode]);
      showAllButton.style.display = "inline-block";
    }
  });

  showAllButton.addEventListener("click", () => {
    episodeSelector.value = ""; 
    makePageForEpisodes(allEpisodes);
    showAllButton.style.display = "none"; 
  });
}

window.onload = fetchEpisodes;
