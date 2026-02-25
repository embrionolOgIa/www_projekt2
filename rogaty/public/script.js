let currentAlbumId = null;

// pobieranie i wysw albumow bez hasla
async function fetchAlbums() {
    try {
        const response = await fetch('/api/albums');
        const albums = await response.json();
        const root = document.getElementById('shop-root');
        
        if (!root) return;
        root.innerHTML = '';
        
        albums.forEach(album => {
            root.innerHTML += `
                <div class="album-card">
                    <img src="${album.img || 'default.jpg'}" alt="${album.title}">
                    <h3>${album.title}</h3>
                    <p>${album.price} PLN</p>
                    <button class="btn-buy" onclick="openModal(${album.id}, '${album.title}', '${album.description}')">SZCZEGÓŁY / RECENZJE</button>
                </div>
            `;
        });
    } catch (error) {
        console.error('Błąd pobierania:', error);
    }
}

// modal
const modal = document.getElementById("albumModal");
const span = document.getElementsByClassName("close")[0];

function openModal(id, title, desc) {
    currentAlbumId = id;
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalDesc').innerText = desc || "Brak opisu.";
    fetchReviews(id);
    if(modal) modal.style.display = "block";
}

if(span) span.onclick = () => modal.style.display = "none";
window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; }

// recenzje
async function fetchReviews(albumId) {
    const res = await fetch(`/api/albums/${albumId}/reviews`);
    const reviews = await res.json();
    const list = document.getElementById('reviewsList');
    list.innerHTML = reviews.length ? '' : '<p>Brak recenzji. Bądź pierwszy.</p>';
    
    reviews.forEach(r => {
        list.innerHTML += `<div class="review-item"><strong>${r.author}</strong> [${r.rating}/5]: ${r.content}</div>`;
    });
}

const reviewForm = document.getElementById('reviewForm');
if(reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            album_id: currentAlbumId,
            author: document.getElementById('reviewAuthor').value,
            content: document.getElementById('reviewContent').value,
            rating: document.getElementById('reviewRating').value
        };

        await fetch('/api/reviews', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        
        document.getElementById('reviewContent').value = '';
        fetchReviews(currentAlbumId);
    });
}

//kontakt
const contactForm = document.getElementById('contactForm');
if(contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = document.getElementById('status');
        const data = {
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        const res = await fetch('/api/contact', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        const result = await res.json();
        status.innerText = result.success || result.error;
    });
}

fetchAlbums();