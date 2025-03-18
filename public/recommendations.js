const userId = window.userId;
let recommendationsTimeout = null;

document.addEventListener('DOMContentLoaded', () => {
const triggerButtons = document.querySelectorAll('.icon-button');
triggerButtons.forEach(button => {
    const showElement = button.closest('.show');
    if (!showElement) return;
    
    const showId = showElement.id.split('_')[1];
    const showImg = showElement.querySelector('img');
    if (!showImg) return;
    
    const showName = showImg.alt;
    button.addEventListener('click', (event) => {
    fetchRecommendations(showId, showName);
    });
});

// Close button for recommendations
document.body.addEventListener('click', (event) => {
    if (event.target.classList.contains('close-recommendations')) {
    closeRecommendations();
    }
});

// Event delegation for favorite button
document.body.addEventListener('submit', (event) => {
    const form = event.target.closest('.add-to-favorites-form');
    if (form) {
    event.preventDefault();
    const formData = new FormData(form);
    const showId = formData.get('id');
    const showName = formData.get('name');
    const showPosterPath = formData.get('poster_path');
    addShowToFavorites(showId, showName, showPosterPath);
    }
});

// Event delegation for watched button
document.body.addEventListener('submit', (event) => {
    const form = event.target.closest('.watched-form');
    if (form) {
    event.preventDefault();
    const formData = new FormData(form);
    const showId = formData.get('id');
    const showName = formData.get('name');
    const showPosterPath = formData.get('poster_path');
    addShowToWatched(showId, showName, showPosterPath);
    }
});

// Event delegation for watchlist button
document.body.addEventListener('submit', (event) => {
    const form = event.target.closest('.watchlist-form');
    if (form) {
    event.preventDefault();
    const formData = new FormData(form);
    const showId = formData.get('id');
    const showName = formData.get('name');
    const showPosterPath = formData.get('poster_path');
    addShowToWatchlist(showId, showName, showPosterPath);
    }
});
});

function addShowToFavorites(showId, showName, showPosterPath) {
fetch(`/shows/favorites/add/${userId}`, {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify({
    id: showId,
    name: showName,
    poster_path: showPosterPath
    })
})
.then(() => {
    const messageContainer = document.querySelector('#messageBox-' + showId);
    if (messageContainer) {
    const message = document.createElement('p');
    message.textContent = `${showName} added to favorites.`;
    messageContainer.appendChild(message);
    
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 3000);
    }
})
.catch(error => console.error('Error adding show to favorites:', error));
}

function addShowToWatched(showId, showName, showPosterPath) {
fetch(`/shows/watched/add/${userId}`, {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify({
    id: showId,
    name: showName,
    poster_path: showPosterPath
    })
})
.then(() => {
    const messageContainer = document.querySelector('#messageBox-' + showId);
    if (messageContainer) {
    const message = document.createElement('p');
    message.textContent = `${showName} added to watched.`;
    messageContainer.appendChild(message);
    
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 3000);
    }
    fetchRecommendations(showId, showName);
})
.catch(error => console.error('Error adding show to watched:', error));
}

function addShowToWatchlist(showId, showName, showPosterPath) {
fetch(`/shows/watchlist/add/${userId}`, {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify({
    id: showId,
    name: showName,
    poster_path: showPosterPath
    })
})
.then(() => {
    const messageContainer = document.querySelector('#messageBox-' + showId);
    if (messageContainer) {
    const message = document.createElement('p');
    message.textContent = `${showName} added to watchlist.`;
    messageContainer.appendChild(message);
    
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 3000);
    }
})
.catch(error => console.error('Error adding show to watchlist:', error));
}

function fetchRecommendations(showId, showName) {
    if (window.modalIsOpen) {
        console.log('Modal is open, skipping recommendations fetch');
        return;
    }

    fetch(`/get-recommendations/${showId}`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(recommendations => {
            if (window.modalIsOpen) return;
            displayRecommendations(showId, showName, recommendations);
            
            if (recommendationsTimeout) clearTimeout(recommendationsTimeout);
            recommendationsTimeout = setTimeout(closeRecommendations, 10000);
        })
        .catch(error => console.error('Error fetching recommendations:', error));
}


function displayRecommendations(showId, showName, recommendations) {
    const recommendationsSection = document.getElementById('recommendations-section');
    if (!recommendationsSection) return;

    recommendationsSection.innerHTML = '';
    recommendationsSection.classList.add('active');

    const content = document.createElement('div');
    content.className = 'recommendations-content';
    
    content.innerHTML = `
        <div class="recommendations-header">
            <h2 class="recommendations-title">Liked ${showName}</h2>
            <button class="close-recommendations" aria-label="Close recommendations">×</button>
        </div>
        <div class="recommendations-list">
            ${recommendations.length === 0 ? 
                '<p class="no-recommendations">No recommendations available.</p>' :
                recommendations.slice(0, 5).map(show => !show.poster_path ? '' : `
                    <div class="recommendation-item">
                        <div class="recommendation-card">
                            <img src="https://image.tmdb.org/t/p/w200${show.poster_path}" alt="${show.name}">
                            <div class="recommendation-actions">
                                <form class="add-to-favorites-form">
                                    <input type="hidden" name="id" value="${show.id}">
                                    <input type="hidden" name="name" value="${show.name || 'Unknown Show'}">
                                    <input type="hidden" name="poster_path" value="${show.poster_path}">
                                    <button type="submit" class="action-btn" title="Add to Favorites">
                                        <i class="bi bi-heart-fill"></i>
                                    </button>
                                </form>
                                <form class="watched-form">
                                    <input type="hidden" name="id" value="${show.id}">
                                    <input type="hidden" name="name" value="${show.name || 'Unknown Show'}">
                                    <input type="hidden" name="poster_path" value="${show.poster_path}">
                                    <button type="submit" class="action-btn" title="Mark as Watched">
                                        <i class="bi bi-eye-fill"></i>
                                    </button>
                                </form>
                                <form class="watchlist-form">
                                    <input type="hidden" name="id" value="${show.id}">
                                    <input type="hidden" name="name" value="${show.name || 'Unknown Show'}">
                                    <input type="hidden" name="poster_path" value="${show.poster_path}">
                                    <button type="submit" class="action-btn" title="Add to Watchlist">
                                        <i class="bi bi-bookmark-fill"></i>
                                    </button>
                                </form>
                            </div>
                            <h3>${show.name}</h3>
                        </div>
                    </div>
                `).join('')}
        </div>
    `;

    recommendationsSection.appendChild(content);
}

function closeRecommendations() {
    const recommendationsSection = document.getElementById('recommendations-section');
    if (!recommendationsSection) return;

    recommendationsSection.classList.remove('active');
    setTimeout(() => {
        recommendationsSection.innerHTML = '';
    }, 300); // Match with CSS transition

    if (recommendationsTimeout) {
        clearTimeout(recommendationsTimeout);
        recommendationsTimeout = null;
    }
}
// Make functions available globally
window.closeRecommendations = closeRecommendations;