let adminPassword = prompt("PODAJ HASŁO:");

if (!adminPassword) {
    alert("Brak dostępu!");
    window.location.href = "index.html";
}

const form = document.getElementById('adminForm');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');

async function secureFetch(url, options = {}) {
    options.headers = {
        ...options.headers,
        'Content-Type': 'application/json',
        'x-admin-password': adminPassword //klucz
    };

    const response = await fetch(url, options);

    if (response.status === 401) {
        alert("ZŁE HASŁO! Odśwież stronę i spróbuj ponownie.");
        return null;
    }

    return response;
}

async function loadAdminList() {
    const res = await fetch('/api/albums');
    const albums = await res.json();
    const list = document.getElementById('adminList');
    list.innerHTML = '';

    albums.forEach(album => {
        list.innerHTML += `
            <div class="album-card">
                <h3>${album.title}</h3>
                <p>ID: ${album.id}</p>
                <button onclick="editAlbum(${album.id}, '${album.title}', ${album.price}, '${album.description}', '${album.img}')" style="background: orange;">EDYTUJ</button>
                <button onclick="deleteAlbum(${album.id})" style="background: red;">USUŃ</button>
            </div>
        `;
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const data = {
        title: document.getElementById('title').value,
        price: document.getElementById('price').value,
        description: document.getElementById('description').value,
        img: document.getElementById('img').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/albums/${id}` : '/api/albums';

    const res = await secureFetch(url, {
        method: method,
        body: JSON.stringify(data)
    });

    if (res && res.ok) {
        resetForm();
        loadAdminList();
        alert("Wykonano!");
    }
});

window.deleteAlbum = async (id) => {
    if(confirm("Czy na pewno chcesz usunąć ten album?")) {
        const res = await secureFetch(`/api/albums/${id}`, { method: 'DELETE' });
        if (res && res.ok) loadAdminList();
    }
};

window.editAlbum = (id, title, price, desc, img) => {
    document.getElementById('editId').value = id;
    document.getElementById('title').value = title;
    document.getElementById('price').value = price;
    document.getElementById('description').value = desc;
    document.getElementById('img').value = img;
    
    saveBtn.innerText = "ZAPISZ ZMIANY";
    cancelBtn.style.display = "inline-block";
    window.scrollTo(0,0);
};

cancelBtn.addEventListener('click', resetForm);

function resetForm() {
    form.reset();
    document.getElementById('editId').value = '';
    saveBtn.innerText = "DODAJ ALBUM";
    cancelBtn.style.display = "none";
}

loadAdminList();