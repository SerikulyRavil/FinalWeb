const articlesContainer = document.getElementById("articlesContainer");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const modalOverlay = document.getElementById("modalOverlay");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalTitle = document.getElementById("modalTitle");
const modalCategoryDate = document.getElementById("modalCategoryDate");
const modalContent = document.getElementById("modalContent");
const modalViews = document.getElementById("modalViews");
const modalReadingTime = document.getElementById("modalReadingTime");
const mostPopularArticle = document.getElementById("mostPopularArticle");

let articles = [];
let filteredArticles = [];

async function loadArticles() {
  try {
    const response = await fetch('articles.json');
    articles = (await response.json()).articles;
    filteredArticles = [...articles];
    renderArticles(filteredArticles);
    renderMostPopular();
  } catch (error) {
    articlesContainer.innerHTML = '<p class="text-danger">Failed to load articles.</p>';
  }
}

const calculateReadingTime = wordCount => {
  const minutes = Math.round(wordCount / 200) || 1;
  return `${minutes} min`;
};

const getMostPopularArticle = () => articles.reduce((max, article) => article.views > max.views ? article : max, articles[0]);

function renderArticles(arr) {
  articlesContainer.innerHTML = arr.length ? arr.map(article => `
    <article class="col">
      <div class="card h-100" tabindex="0" role="button" aria-label="Open article: ${article.title}" data-id="${article.id}">
        <img src="${article.image}" alt="${article.title} image" class="card-img-top">
        <div class="card-body d-flex flex-column">
          <h2 class="card-title">${article.title}</h2>
          <h6 class="card-subtitle mb-2 text-muted">${article.category} | ${article.date}</h6>
          <p class="card-text">${article.content.slice(0, 120).trim()}...</p>
          <div class="card-footer mt-auto d-flex justify-content-between small text-muted">
            <span>👁️ ${article.views}</span>
            <span>⏱️ ${calculateReadingTime(article.wordCount)}</span>
          </div>
        </div>
      </div>
    </article>
  `).join('') : '<p class="text-muted">No articles found.</p>';

  articlesContainer.querySelectorAll(".card").forEach(card => {
    const openModal = () => {
      const article = articles.find(a => a.id === +card.dataset.id);
      if (article) showModal(article);
    };
    card.addEventListener("click", openModal);
    card.addEventListener("keydown", e => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), openModal()));
  });
}

function renderMostPopular() {
  const mostPopular = getMostPopularArticle();
  mostPopularArticle.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card most-popular-card h-100" tabindex="0" role="button" aria-label="Open article: ${mostPopular.title}" data-id="${mostPopular.id}">
          <img src="${mostPopular.image}" alt="${mostPopular.title} image" class="card-img-top">
          <div class="card-body d-flex flex-column">
            <h2 class="card-title">${mostPopular.title}</h2>
            <h6 class="card-subtitle mb-2 text-muted">${mostPopular.category} | ${mostPopular.date}</h6>
            <p class="card-text">${mostPopular.content.slice(0, 120).trim()}...</p>
            <div class="card-footer mt-auto d-flex justify-content-between small text-muted">
              <span>👁️ ${mostPopular.views}</span>
              <span>⏱️ ${calculateReadingTime(mostPopular.wordCount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  mostPopularArticle.querySelector(".card").addEventListener("click", () => showModal(mostPopular));
}

function showModal(article) {
  article.views++;
  modalTitle.textContent = article.title;
  modalCategoryDate.textContent = `${article.category} | ${article.date}`;
  modalContent.textContent = article.content;
  modalViews.textContent = `👁️ ${article.views} views`;
  modalReadingTime.textContent = `⏱️ ${calculateReadingTime(article.wordCount)}`;
  modalOverlay.classList.remove("d-none");
  setTimeout(() => modalOverlay.classList.add("show"), 10);
  renderArticles(filteredArticles);
  renderMostPopular();
}

modalCloseBtn.addEventListener("click", () => {
  modalOverlay.classList.remove("show");
  setTimeout(() => modalOverlay.classList.add("d-none"), 300);
});

modalOverlay.addEventListener("click", e => e.target === modalOverlay && modalCloseBtn.click());

function filterAndSortArticles() {
  filteredArticles = articles.filter(article =>
    (article.title + article.category + article.content).toLowerCase().includes(searchInput.value.trim().toLowerCase())
  );

  if (sortSelect.value === "date-desc") {
    filteredArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortSelect.value === "views-desc") {
    filteredArticles.sort((a, b) => b.views - a.views);
  }

  renderArticles(filteredArticles);
}

searchInput.addEventListener("input", filterAndSortArticles);
sortSelect.addEventListener("change", filterAndSortArticles);

themeToggleBtn.addEventListener("click", () => {
  const isLight = document.body.classList.contains("light-mode");
  document.body.classList.toggle("light-mode", !isLight);
  document.body.classList.toggle("dark-mode", isLight);
  themeToggleBtn.textContent = isLight ? "☀️" : "🌙";
  localStorage.setItem("theme", isLight ? "dark" : "light");
});

window.addEventListener("DOMContentLoaded", () => {
  loadArticles();
  const savedTheme = localStorage.getItem("theme") || "light";
  if (savedTheme === "dark") {
    document.body.classList.replace("light-mode", "dark-mode");
    themeToggleBtn.textContent = "☀️";
  }
});