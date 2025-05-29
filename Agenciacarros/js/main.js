document.addEventListener('DOMContentLoaded', () => {
    
    const searchInput = document.getElementById('searchInput');
    const carList = document.getElementById('carList');

    function attachCarEvents(carItem) {
        const statusBtn = carItem.querySelector('.status-btn');
        const removeBtn = carItem.querySelector('.remove-btn');
        const commentInput = carItem.querySelector('.comment-input');
        const addCommentBtn = carItem.querySelector('.add-comment-btn');
        const commentsList = carItem.querySelector('.comments-list');

        statusBtn.addEventListener('click', () => {
            carItem.classList.toggle('sold');
            statusBtn.textContent = carItem.classList.contains('sold') ? 'Marcar como Disponível' : 'Marcar como Vendido';
        });

        removeBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja remover este carro do inventário?')) {
                carList.removeChild(carItem);
            }
        });

        addCommentBtn.addEventListener('click', () => {
            const commentText = commentInput.value.trim();
            if (commentText) {
                const newCommentLi = document.createElement('li');
                newCommentLi.textContent = commentText;
                commentsList.appendChild(newCommentLi);
                commentInput.value = '';
                commentsList.scrollTop = commentsList.scrollHeight;
            }
        });

        commentInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); 
                addCommentBtn.click();
            }
        });
    }

    function createCarElement(carData) {
        const listItem = document.createElement('li');
        listItem.classList.add('car-item');
        if (carData.isSold) {
            listItem.classList.add('sold');
        }
        listItem.setAttribute('data-car-name', carData.name);

        listItem.innerHTML = `
            <div class="car-image-wrapper">
                <img class="car-image" src="${carData.image}" alt="Imagem ${carData.name}">
            </div>
            <div class="car-content">
                <h3 class="car-name">${carData.name}</h3>
                <p class="car-price">${carData.price}</p>
                <div class="car-actions">
                    <button class="status-btn">${carData.isSold ? 'Marcar como Disponível' : 'Marcar como Vendido'}</button>
                    <button class="remove-btn">Remover</button>
                </div>
                <div class="comments-section">
                    <h4>Comentários:</h4>
                    <ul class="comments-list"></ul>
                    <div class="comment-input-wrapper">
                        <input type="text" class="comment-input" placeholder="Adicionar comentário...">
                        <button class="add-comment-btn">Adicionar</button>
                    </div>
                </div>
            </div>
        `;

        const commentsList = listItem.querySelector('.comments-list');
        if (carData.comments && Array.isArray(carData.comments)) {
            carData.comments.forEach(comment => {
                const commentLi = document.createElement('li');
                commentLi.textContent = comment;
                commentsList.appendChild(commentLi);
            });
            commentsList.scrollTop = commentsList.scrollHeight; 
        }

        carList.appendChild(listItem);
        attachCarEvents(listItem);
        return listItem;
    }

    document.querySelectorAll('.car-item').forEach(attachCarEvents);
    console.log('Dados não estão sendo persistidos. Carregando carros apenas do HTML.');


    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        document.querySelectorAll('.car-item').forEach(carItem => {
            const carName = carItem.querySelector('.car-name').textContent.toLowerCase();
            if (carName.includes(searchTerm)) {
                carItem.style.display = '';
            } else {
                carItem.style.display = 'none';
            }
        });
    });
});