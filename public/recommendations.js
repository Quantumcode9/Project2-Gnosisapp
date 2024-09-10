
const userId = window.userId;


document.addEventListener('DOMContentLoaded', () => {
    const triggerButtons = document.querySelectorAll('.icon-button');
    triggerButtons.forEach(button => {
    const showElement = button.closest('.show');
    const showId = showElement.id.split('_')[1];
    const showName = showElement.querySelector('img').alt;
    button.addEventListener('click', (event) => {
        fetchRecommendations(showId, showName);
    });
  });


function addShowToFavorites(showId, showName, showPosterPath) {
fetch(`/shows/add/${userId}`, {
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
const message = document.createElement('p');
message.textContent = `${showName} added to favorites.`;
messageContainer.appendChild(message);

    setTimeout(() => {
    messageContainer.innerHTML = '';
    }, 3000);
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
const message = document.createElement('p');
message.textContent = `${showName} added to watched.`;
messageContainer.appendChild(message);

    setTimeout(() => {
    messageContainer.innerHTML = '';
    }, 3000);
    fetchRecommendations(showId);
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
        const message = document.createElement('p');
        message.textContent = `${showName} added to watchlist.`;
        messageContainer.appendChild(message);
    
        setTimeout(() => {
        messageContainer.innerHTML = '';
        }, 3000);
        })
        .catch(error => console.error('Error adding show to watchlist:', error));
}


function fetchRecommendations(showId, showName) {
    fetch(`/get-recommendations/${showId}`)
        .then(response => response.json())
        .then(recommendations => {
        
            displayRecommendations(showId, showName, recommendations);
        })
        .catch(error => console.error('Error fetching recommendations:', error));
}

function displayRecommendations(showId, showName, recommendations) {
    const recommendationsSection = document.getElementById('recommendations-section');
    recommendationsSection.innerHTML = ''; // Clear previous recommendations

    // Add the title
    const title = document.createElement('h1');
    title.textContent = `Because you like ${showName}`;
    recommendationsSection.appendChild(title);
    
    // Create and append the recommendations container
    const recommendationsContainer = document.createElement('div');
    recommendationsContainer.id = `recommendations_${showId}`;
    recommendationsContainer.className = 'recommendations-container';
    recommendationsSection.appendChild(recommendationsContainer);
    




// Display recommendations

recommendations.forEach(show => {
const recommendationElement = document.createElement('div');
recommendationElement.className = 'show';
recommendationElement.innerHTML = `
                <a href="/pages/show/${show.id}">
        <div class="show-card border-glow">
                    <img src="https://image.tmdb.org/t/p/w500${show.poster_path}" alt="${show.name}"  style="height: 250px;">
                </a>
            <div id="messageBox-${show.id}" class="message-box"></div>
                <div class= "show-icons">
                <form class="add-to-favorites-form">
                <input type="hidden" name="id" value="${show.id}">
                <input type="hidden" name="name" value="${show.name}">
                <input type="hidden" name="poster_path" value="${show.poster_path}">
                <button type="submit" class="icon-button">
                <img class="icon" src="/images/Favorites.png" alt="Add to Favorites">
                </button>
            </form>
        
            <form class="watched-form">
            <input type="hidden" name="id" value="${show.id}">
            <input type="hidden" name="name" value="${show.name}">
            <input type="hidden" name="poster_path" value="${show.poster_path}">
            <button type="submit" class="icon-button">
                <img class="icon" src="/images/Watched.png" alt="Mark as Watched">
            </button>
        </form>
        <form class="watchlist-form">
            <input type="hidden" name="id" value="${show.id}">
            <input type="hidden" name="name" value="${show.name}">
            <input type="hidden" name="poster_path" value="${show.poster_path}">
            <button type="submit" class="icon-button">
                <img class="icon" src="/images/Watching.png" alt="Add to Watchlist">
            </button>
        </form>
        </div>
    </div>
    <div id="recommendations-container"></div>
`;
recommendationsContainer.appendChild(recommendationElement);
});
}

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


