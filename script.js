const FALLBACK_IMAGE = "placeholder.jpg";
const NO_SUMMARY_TEXT = "No summary available.";
const showCache = {};
let currentEpisodes = [];

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

function initializeApp() {
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
      showId ? loadEpisodes(showId) : clearEpisodes();
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

function fetchShows() {
  if (showCache.shows) return Promise.resolve(showCache.shows);

  return fetch("https://api.tvmaze.com/shows")
    .then((response) => response.json())
    .then((shows) => {
      showCache.shows = shows.sort((a, b) => a.name.localeCompare(b.name));
      return showCache.shows;
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

function clearEpisodes() {
  renderEpisodes([]);
}

function createEpisodeCard(episode) {
  const card = createElement("div", { className: "episode-card", id: `episode-${episode?.id || "unknown"}` });

  card.append(
    createEpisodeImage(episode),
    createElement("h2", { className: "episode-title", textContent: episode?.name || "Untitled Episode" }),
    createElement("p", { className: "episode-code", textContent: formatEpisodeCode(episode) }),
    createElement("p", { className: "episode-summary", innerHTML: episode?.summary || NO_SUMMARY_TEXT }),
    createElement("a", {
      className: "episode-link",
      href: episode?.url || "#",
      target: "_blank",
      textContent: "More Info",
    })
  );

  return card;
}

function setupEpisodeSelector(episodes) {
  const episodeSelector = document.getElementById("episode-selector");
  if (!episodeSelector) return;

  populateDropdown(
    episodeSelector,
    [{ id: "", name: "Show All Episodes" }, ...episodes.map((e) => ({ id: e.id, name: `${formatEpisodeCode(e)} - ${e.name || "Unknown"}` }))],
    "name",
    "id"
  );

  episodeSelector.addEventListener("change", ({ target }) => {
    const selectedId = target.value;
    const selectedEpisode = currentEpisodes.find((ep) => ep.id === parseInt(selectedId, 10));
    renderEpisodes(selectedId ? [selectedEpisode] : currentEpisodes);
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

function createEpisodeImage(episode) {
  return createElement("img", {
    src: episode?.image?.medium || FALLBACK_IMAGE,
    alt: `Image of ${episode?.name || "Unknown Episode"} - ${formatEpisodeCode(episode)}`,
  });
}

function formatEpisodeCode(episode) {
  const season = String(episode?.season || 0).padStart(2, "0");
  const number = String(episode?.number || 0).padStart(2, "0");
  return `S${season}E${number}`;
}

function createElement(tag, props = {}) {
  const element = document.createElement(tag);
  Object.assign(element, props);
  return element;
}