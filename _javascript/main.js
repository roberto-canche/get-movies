document.addEventListener('DOMContentLoaded', () => {
  console.log('Hello Bulma!');
});

//Funcion asyncrona para cargar elementos de la pagina mientras carga
(async function load() {

  //Url a la API de donde se consumiran los datos
  const API_URL = 'https://yts.am/api/v2/';

  //Ésta funcion sirve para traer los datos de la API
  async function getData(url) {
    const response = await fetch(url);
    const data = await response.json();
    if (data.data.movie_count > 0) {
      // aquí se acaba
      return data;
    }
    // si no hay pelis aquí continua
    throw new Error('No se encontró ningun resultado');
  }

  function templateCardMovie(movie, category) {
    return (
      `
      <div class="column is-one-third" data-id="${movie.id}" data-category=${category}>
        <div class="card large">
          <div class="card-image">
            <figure class="image" style="background-image:url(${movie.large_cover_image});">
            </figure>
          </div>
          <div class="card-content">
            <div class="media">
              <div class="media-left">
                  <figure class="image is-96x96">
                      <img src="${movie.small_cover_image}" alt="${movie.title}" height="95">
                  </figure>
              </div>
              <div class="media-content">
                <p class="title is-4 no-padding">${movie.title}</p>
                <p><span class="title is-6"><a href="#">${movie.genres[0]}</a></span></p>
                <p class="subtitle is-6">Raiting: ${movie.rating}</p>
              </div>
            </div>
            <div class="content">
              ${movie.summary.substring(0, 150)}
            </div>
            <div class="columns is-centered">
              <div class="column">
              <a class="button is-success is-rounded">Ver más</a>
              </div>
            </div>
          </div>
        </div>
      </div>`
    )
  }

  //Funcion para creacion de elemmento html
  function createTemplate(HTMLString) {
    const html = document.implementation.createHTMLDocument();
    html.body.innerHTML = HTMLString;
    return html.body.children[0];
  }

  //Añadir elemento click a cada Item de pelicula
  //Éste evento ejecutará la funcion para mostrar elemento de manera emergente(Desde una ventana modal)
  function addEventClick($element) {
    $element.addEventListener('click', () => {
      showModal($element)
    })
  }

  //Funcion para renderear template de cada Item de pelìcula
  function renderCardMovie(lista, $container, c) {
    $container.children[0].remove();
    lista.forEach((movie) => {
      const HTMLString = templateCardMovie(movie, c);
      const movieElement = createTemplate(HTMLString);
      $container.append(movieElement);
      const image = movieElement.querySelector('img');
      image.addEventListener('load', (event) => {
        event.srcElement.classList.add('fadeIn');
      })
      addEventClick(movieElement);
    })
  }

  async function existeCache(c) {
    const listNombre = `${c}Lista`
    const listaCache = window.localStorage.getItem(listNombre)

    if(listaCache) {
      return JSON.parse(listaCache)
    }

    const {
      data: { 
        movies: data
      }
    } = await getData(`${API_URL}list_movies.json?genre=${c}`)
    window.localStorage.setItem(listNombre, JSON.stringify(data))

    return data;
  }

  const listaAccion = await await existeCache('action')
  const $contenidoAccion = document.querySelector('#accion')
  renderCardMovie(listaAccion, $contenidoAccion, 'action')

  const listaAnimacion = await await existeCache('animation')
  const $contenidoAnimacion = document.querySelector('#animation')
  renderCardMovie(listaAnimacion, $contenidoAnimacion, 'animation')

  const $modal = document.getElementById('modal');
  const $overlay = document.getElementById('overlay');
  const $hideModal = document.getElementById('hide-modal');

  const $modalTitle = $modal.querySelector('h1');
  const $modalImage = $modal.querySelector('img');
  const $modalDescription = $modal.querySelector('p');

  function findById(list, id) {
    return list.find(movie => movie.id === parseInt(id, 10))
  }

  function findMovie(id, category) {
    switch (category) {
      case 'action' : {
        return findById(listaAccion, id)
      }
      default: {
        return findById(listaAnimacion, id)
      }
    }
  }

  function showModal($element) {
    $overlay.classList.add('active');
    $modal.style.animation = 'modalIn .8s forwards';
    const id = $element.dataset.id;
    const category = $element.dataset.category;
    const data = findMovie(id, category);

    $modalTitle.textContent = data.title;
    $modalImage.setAttribute('src', data.medium_cover_image);
    $modalDescription.textContent = data.description_full
  }

  $hideModal.addEventListener('click', hideModal);
  function hideModal() {
    $overlay.classList.remove('active');
    $modal.style.animation = 'modalOut .8s forwards';

  }

  /* Para formulario de busqueda */
  const $form = document.getElementById('form');

  $form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData($form);
    
    try {
      const {
        data: {
          movies: pelis
        }
      } = await getData(`${API_URL}list_movies.json?limit=1&query_term=${data.get('name')}`)

      addEventClick(pelis[0]['id'])
    } catch(error) {
      alert("No se encontraron resultados :(");
    }
  })
}) ()
