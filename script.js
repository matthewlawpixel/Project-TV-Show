const FALLBACK_IMAGE = "placeholder.jpg";
const NO_SUMMARY_TEXT = "No summary available.";

const showCache = {};

let currentEpisodes = [];

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

function initializeApp() {
  setupNavigation();  
  setupEpisodesView();
  loadShowsListing();
}

function loadShowsListing() {
  if (showCache.shows) {
    renderShows(showCache.shows);
  } else {
    fetchShows().then((shows) => {
      renderShows(shows);
    });
  }
}

function renderShows(shows) {
  const showsView = document.getElementById("shows-view");
  const showsContainer = document.getElementById("shows-container");
  const showsResultsCount = document.getElementById("shows-results-count");
  if (!showsView || !showsContainer || !showsResultsCount) return;

  showsView.style.display = "block";
  document.getElementById("episodes-view").style.display = "none";

  showsContainer.innerHTML = "";
  showsResultsCount.textContent = `Found ${shows.length} shows`;

  updateFrontShowSelector(shows);

  shows.forEach((show) => {
    const card = createShowCard(show);
    showsContainer.appendChild(card);
  });
}

function createShowCard(show) {
  const card = document.createElement("div");
  card.className = "show-card";

  const img = document.createElement("img");
  img.src = show?.image?.medium || FALLBACK_IMAGE;

  const title = document.createElement("h2");
  title.className = "show-card-title";
  title.textContent = show.name || "Untitled Show";

  const summary = document.createElement("p");
  summary.className = "show-card-summary";
  summary.innerHTML = show.summary || NO_SUMMARY_TEXT;

  const meta = document.createElement("div");
  meta.className = "show-card-meta";
  meta.innerHTML = `
    <p><strong>Rated:</strong> ${show.rating?.average || "N/A"}</p>
    <p><strong>Genres:</strong> ${show.genres?.join(", ") || "N/A"}</p>
    <p><strong>Status:</strong> ${show.status || "N/A"}</p>
    <p><strong>Runtime:</strong> ${show.runtime || "N/A"}</p>
  `;

  card.appendChild(img);
  card.appendChild(title);
  card.appendChild(summary);
  card.appendChild(meta);

  card.addEventListener("click", () => handleShowClick(show.id));

  return card;
}

function updateFrontShowSelector(shows) {
  const frontSelector = document.getElementById("front-show-selector");
  if (!frontSelector) return;

  frontSelector.innerHTML = "";
  
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select a Show";
  frontSelector.appendChild(defaultOption);

  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name; 
    frontSelector.appendChild(option);
  });
}

function setupNavigation() {
  const showSearchBar = document.getElementById("shows-search-bar");
  if (showSearchBar) {
    showSearchBar.addEventListener("input", () => {
      const term = showSearchBar.value.toLowerCase();
      const allShows = showCache.shows || [];

      const filtered = allShows.filter((show) => {
        const nameMatch = show.name.toLowerCase().includes(term);
        const genreMatch = show.genres.join(" ").toLowerCase().includes(term);
        const summaryMatch = (show.summary || "").toLowerCase().includes(term);
        return nameMatch || genreMatch || summaryMatch;
      });

      renderShows(filtered);
    });
  }

  const backToShowsBtn = document.getElementById("back-to-shows-btn");
  if (backToShowsBtn) {
    backToShowsBtn.addEventListener("click", () => {
      loadShowsListing();
    });
  }

  const frontSelector = document.getElementById("front-show-selector");
  if (frontSelector) {
    frontSelector.addEventListener("change", (event) => {
      const showId = event.target.value;
      if (showId) {
        handleShowClick(showId);
      }
    });
  }
}

function setupEpisodesView() {
  setupShowSelector();
  setupSearchBar();
}

function setupShowSelector() {
  const showSelector = document.getElementById("show-selector");
  if (!showSelector) return;

  fetchShows().then((shows) => {
    populateDropdown(showSelector, shows, "name", "id");
    showSelector.addEventListener("change", ({ target }) => {
      const showId = target.value;
      if (showId) {
        loadEpisodes(showId);
      } else {
        clearEpisodes();
      }
    });
  });
}

function setupSearchBar() {
  const searchBar = document.getElementById("search-bar");
  if (!searchBar) return;

  searchBar.addEventListener("input", () => {
    const searchTerm = searchBar.value.toLowerCase();
    const filteredEpisodes = currentEpisodes.filter(({ name, summary }) => {
      return (
        name?.toLowerCase().includes(searchTerm) ||
        summary?.toLowerCase().includes(searchTerm)
      );
    });
    renderEpisodes(filteredEpisodes);
  });
}

function loadEpisodes(showId) {
  if (showCache[showId]) {
    updateEpisodes(showCache[showId]);
    return;
  }

  fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then((response) => response.json())
    .then((episodes) => {
      showCache[showId] = episodes;
      updateEpisodes(episodes);
    });
}

function updateEpisodes(episodes) {
  currentEpisodes = episodes;
  renderEpisodes(episodes);
  setupEpisodeSelector(episodes);
  showEpisodesView();
}

function renderEpisodes(episodes) {
  const root = document.getElementById("root");
  const resultsCount = document.getElementById("results-count");
  if (!root || !resultsCount) return;

  root.innerHTML = "";
  resultsCount.textContent = `Matching Episodes: ${episodes.length}`;

  const container = createElement("div", { className: "episodes-container" });
  episodes.forEach((episode) => {
    container.appendChild(createEpisodeCard(episode));
  });
  root.appendChild(container);
}

function createEpisodeCard(episode) {
  const card = createElement("div", {
    className: "episode-card",
    id: `episode-${episode?.id || "unknown"}`
  });

  card.append(
    createEpisodeImage(episode),
    createElement("h2", {
      className: "episode-title",
      textContent: episode?.name || "Untitled Episode",
    }),
    createElement("p", {
      className: "episode-code",
      textContent: formatEpisodeCode(episode),
    }),
    createElement("p", {
      className: "episode-summary",
      innerHTML: episode?.summary || NO_SUMMARY_TEXT,
    }),
    createElement("a", {
      className: "episode-link",
      href: episode?.url || "#",
      target: "_blank",
      textContent: "View on TVMaze",
    })
  );

  return card;
}

function createEpisodeImage(episode) {
  return createElement("img", {
    src: episode?.image?.medium || FALLBACK_IMAGE,
    alt: `Image of ${episode?.name || "Unknown Episode"} - ${formatEpisodeCode(episode)}`,
  });
}

function setupEpisodeSelector(episodes) {
  const episodeSelector = document.getElementById("episode-selector");
  if (!episodeSelector) return;

  const showAllOption = { id: "", name: "Show All Episodes" };
  const episodeOptions = episodes.map((e) => ({
    id: e.id,
    name: `${formatEpisodeCode(e)} - ${e.name || "Unknown"}`
  }));

  populateDropdown(episodeSelector, [showAllOption, ...episodeOptions], "name", "id");

  episodeSelector.addEventListener("change", ({ target }) => {
    const selectedId = target.value;
    if (!selectedId) {
      renderEpisodes(currentEpisodes);
    } else {
      const selectedEpisode = currentEpisodes.find(
        (ep) => ep.id === parseInt(selectedId, 10)
      );
      renderEpisodes(selectedEpisode ? [selectedEpisode] : []);
    }
  });
}

function populateDropdown(selector, items, textKey, valueKey) {
  selector.innerHTML = "";
  items.forEach((item) => {
    const option = createElement("option", {
      textContent: item[textKey],
      value: item[valueKey],
    });
    selector.appendChild(option);
  });
}

function createElement(tag, props = {}) {
  const element = document.createElement(tag);
  Object.assign(element, props);
  return element;
}

function formatEpisodeCode(episode) {
  const season = String(episode?.season || 0).padStart(2, "0");
  const number = String(episode?.number || 0).padStart(2, "0");
  return `S${season}E${number}`;
}

function showEpisodesView() {
  document.getElementById("shows-view").style.display = "none";
  document.getElementById("episodes-view").style.display = "block";
}

function clearEpisodes() {
  renderEpisodes([]);
}

function handleShowClick(showId) {
  const showSelector = document.getElementById("show-selector");
  if (showSelector) {
    showSelector.value = showId;
  }
  loadEpisodes(showId);
}

function fetchShows() {
  if (showCache.shows) {
    return Promise.resolve(showCache.shows);
  }
  return fetch("https://api.tvmaze.com/shows")
    .then((response) => response.json())
    .then((shows) => {
      shows.sort((a, b) => a.name.localeCompare(b.name));
      showCache.shows = shows;
      return shows;
    });
}