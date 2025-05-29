document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos HTML principais
    const searchInput = document.getElementById('searchInput');
    const carList = document.getElementById('carList');

    // --- Funções Auxiliares ---

    /**
     * Salva o estado atual de TODOS os carros e seus comentários no localStorage.
     * Esta função é o coração da persistência de dados.
     */
    function saveCars() {
        const cars = [];
        document.querySelectorAll('.car-item').forEach(item => {
            const comments = [];
            item.querySelectorAll('.comments-list li').forEach(commentLi => {
                comments.push(commentLi.textContent);
            });

            // Extrai a URL da imagem de forma mais robusta, pegando o 'src' do elemento <img>
            const imageUrl = item.querySelector('.car-image').src;
            // Pega o caminho relativo da imagem se ela for local para evitar problemas de caminho absoluto
            const relativeImageUrl = imageUrl.includes(window.location.origin) ?
                                     imageUrl.replace(window.location.origin + '/', '') : imageUrl;

            cars.push({
                name: item.querySelector('.car-name').textContent.trim(),
                price: item.querySelector('.car-price').textContent.trim(),
                image: relativeImageUrl, // Salva o caminho da imagem
                isSold: item.classList.contains('sold'),
                comments: comments
            });
        });
        localStorage.setItem('carInventory', JSON.stringify(cars));
        console.log('Inventário salvo:', cars); // Para depuração
    }

    /**
     * Anexa os event listeners (Vender/Remover/Comentário) a um item de carro específico.
     * @param {HTMLElement} carItem - O elemento <li> que representa o carro.
     */
    function attachCarEvents(carItem) {
        const statusBtn = carItem.querySelector('.status-btn');
        const removeBtn = carItem.querySelector('.remove-btn');
        const commentInput = carItem.querySelector('.comment-input');
        const addCommentBtn = carItem.querySelector('.add-comment-btn');
        const commentsList = carItem.querySelector('.comments-list');

        // Evento para o botão de status (Vendido/Disponível)
        statusBtn.addEventListener('click', () => {
            carItem.classList.toggle('sold');
            statusBtn.textContent = carItem.classList.contains('sold') ? 'Marcar como Disponível' : 'Marcar como Vendido';
            saveCars(); // Salva após a mudança de status
        });

        // Evento para o botão de remover
        removeBtn.addEventListener('click', () => {
            // Confirmação antes de remover
            if (confirm('Tem certeza que deseja remover este carro do inventário?')) {
                carList.removeChild(carItem);
                saveCars(); // Salva após a remoção
            }
        });

        // Evento para adicionar comentário
        addCommentBtn.addEventListener('click', () => {
            const commentText = commentInput.value.trim();
            if (commentText) {
                const newCommentLi = document.createElement('li');
                newCommentLi.textContent = commentText;
                commentsList.appendChild(newCommentLi);
                commentInput.value = ''; // Limpa o input
                commentsList.scrollTop = commentsList.scrollHeight; // Rola para o final da lista de comentários
                saveCars(); // Salva os comentários
            }
        });

        // Permitir adicionar comentário com a tecla Enter no input de comentário
        commentInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Impede o comportamento padrão da tecla Enter (ex: nova linha)
                addCommentBtn.click(); // Simula o clique no botão de adicionar
            }
        });
    }

    /**
     * Cria e retorna um elemento <li> de carro com base nos dados fornecidos.
     * Esta função é usada para popular a lista de carros dinamicamente.
     * @param {Object} carData - Objeto com os dados do carro (name, price, image, isSold, comments).
     * @returns {HTMLElement} - O elemento <li> criado.
     */
    function createCarElement(carData) {
        const listItem = document.createElement('li');
        listItem.classList.add('car-item');
        if (carData.isSold) {
            listItem.classList.add('sold');
        }
        listItem.setAttribute('data-car-name', carData.name); // Para a funcionalidade de pesquisa

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

        // Adiciona os comentários existentes ao <ul> dentro do novo item
        const commentsList = listItem.querySelector('.comments-list');
        if (carData.comments && Array.isArray(carData.comments)) {
            carData.comments.forEach(comment => {
                const commentLi = document.createElement('li');
                commentLi.textContent = comment;
                commentsList.appendChild(commentLi);
            });
            commentsList.scrollTop = commentsList.scrollHeight; // Rola para o final após carregar
        }

        carList.appendChild(listItem);
        attachCarEvents(listItem); // Anexa os eventos aos botões e inputs deste novo item
        return listItem; // Retorna o item para possível uso futuro
    }

    // --- Lógica de Inicialização Principal ---

    const storedCars = JSON.parse(localStorage.getItem('carInventory'));

    if (storedCars && storedCars.length > 0) {
        // Se há carros salvos no localStorage, limpa o HTML e os recria
        carList.innerHTML = ''; // Limpa a lista existente no HTML
        storedCars.forEach(car => createCarElement(car));
        console.log('Carros carregados do localStorage.');
    } else {
        // Se não há carros salvos (primeira visita),
        // coleta os carros do HTML, anexa os eventos e os salva no localStorage.
        console.log('Nenhum carro no localStorage. Carregando do HTML...');
        document.querySelectorAll('.car-item').forEach(attachCarEvents);
        saveCars(); // Salva o estado inicial dos carros do HTML para futuras visitas
    }

    // --- Funcionalidade de Pesquisa ---

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim(); // Garante trim() para espaços em branco
        document.querySelectorAll('.car-item').forEach(carItem => {
            const carName = carItem.querySelector('.car-name').textContent.toLowerCase();
            // Mostra o item se o nome do carro incluir o termo de pesquisa, esconde caso contrário
            if (carName.includes(searchTerm)) {
                carItem.style.display = ''; // Volta ao display padrão (flex, grid, block, etc.)
            } else {
                carItem.style.display = 'none'; // Esconde o item
            }
        });
    });

    // --- Funcionalidade de Adicionar Carro (Desativada por padrão no HTML) ---
    // Se você quiser reativar, descomente o HTML da seção .add-car-section
    // e o código abaixo.

    // const addCarSection = document.querySelector('.add-car-section');
    // const carNameInput = document.getElementById('carNameInput');
    // const carPriceInput = document.getElementById('carPriceInput');
    // const carImageInput = document.getElementById('carImageInput');
    // const addCarBtn = document.getElementById('addCarBtn');

    // // Exemplo de como você ativaria a seção de adicionar e a funcionalidade:
    // // addCarSection.style.display = 'block'; // Ou 'flex', dependendo do seu CSS

    // addCarBtn.addEventListener('click', () => {
    //     const name = carNameInput.value.trim();
    //     const price = carPriceInput.value.trim();
    //     const image = carImageInput.value.trim() || 'https://via.placeholder.com/180x180?text=Sem+Imagem'; // Imagem padrão se vazia

    //     if (name && price) {
    //         const newCarData = {
    //             name: name,
    //             price: price,
    //             image: image,
    //             isSold: false,
    //             comments: []
    //         };
    //         createCarElement(newCarData); // Cria o elemento e anexa os eventos
    //         saveCars(); // Salva o novo estado
    //         carNameInput.value = '';
    //         carPriceInput.value = '';
    //         carImageInput.value = '';
    //     } else {
    //         alert('Por favor, preencha o nome e o preço do carro.');
    //     }
    // });
});