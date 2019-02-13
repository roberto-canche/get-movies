'use strict';

document.addEventListener('DOMContentLoaded', function () {
  console.log('Hello Bulma!');
});

//Funcion asyncrona para cargar elementos de la pagina mientras carga
(async function load() {

  //Url a la API de donde se consumiran los datos
  var API_URL = 'https://yts.am/api/v2/';

  //Ésta funcion sirve para traer los datos de la API
  async function getData(url) {
    var response = await fetch(url);
    var data = await response.json();
    if (data.data.movie_count > 0) {
      // aquí se acaba
      return data;
    }
    // si no hay pelis aquí continua
    throw new Error('No se encontró ningun resultado');
  }

  function templateCardMovie(movie, category) {
    return '\n      <div class="column is-one-third" data-id="' + movie.id + '" data-category=' + category + '>\n        <div class="card large">\n          <div class="card-image">\n            <figure class="image" style="background-image:url(' + movie.large_cover_image + ');">\n            </figure>\n          </div>\n          <div class="card-content">\n            <div class="media">\n              <div class="media-left">\n                  <figure class="image is-96x96">\n                      <img src="' + movie.small_cover_image + '" alt="' + movie.title + '" height="95">\n                  </figure>\n              </div>\n              <div class="media-content">\n                <p class="title is-4 no-padding">' + movie.title + '</p>\n                <p><span class="title is-6"><a href="#">' + movie.genres[0] + '</a></span></p>\n                <p class="subtitle is-6">Raiting: ' + movie.rating + '</p>\n              </div>\n            </div>\n            <div class="content">\n              ' + movie.summary.substring(0, 150) + '\n            </div>\n            <div class="columns is-centered">\n              <div class="column">\n              <a class="button is-success is-rounded">Ver m\xE1s</a>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>';
  }

  //Funcion para creacion de elemmento html
  function createTemplate(HTMLString) {
    var html = document.implementation.createHTMLDocument();
    html.body.innerHTML = HTMLString;
    return html.body.children[0];
  }

  //Añadir elemento click a cada Item de pelicula
  //Éste evento ejecutará la funcion para mostrar elemento de manera emergente(Desde una ventana modal)
  function addEventClick($element) {
    $element.addEventListener('click', function () {
      showModal($element);
    });
  }

  //Funcion para renderear template de cada Item de pelìcula
  function renderCardMovie(lista, $container, c) {
    $container.children[0].remove();
    lista.forEach(function (movie) {
      var HTMLString = templateCardMovie(movie, c);
      var movieElement = createTemplate(HTMLString);
      $container.append(movieElement);
      var image = movieElement.querySelector('img');
      image.addEventListener('load', function (event) {
        event.srcElement.classList.add('fadeIn');
      });
      addEventClick(movieElement);
    });
  }

  async function existeCache(c) {
    var listNombre = c + 'Lista';
    var listaCache = window.localStorage.getItem(listNombre);

    if (listaCache) {
      return JSON.parse(listaCache);
    }

    var _ref = await getData(API_URL + 'list_movies.json?genre=' + c),
        data = _ref.data.movies;

    window.localStorage.setItem(listNombre, JSON.stringify(data));

    return data;
  }

  var listaAccion = await await existeCache('action');
  var $contenidoAccion = document.querySelector('#accion');
  renderCardMovie(listaAccion, $contenidoAccion, 'action');

  var listaAnimacion = await await existeCache('animation');
  var $contenidoAnimacion = document.querySelector('#animation');
  renderCardMovie(listaAnimacion, $contenidoAnimacion, 'animation');

  var $modal = document.getElementById('modal');
  var $overlay = document.getElementById('overlay');
  var $hideModal = document.getElementById('hide-modal');

  var $modalTitle = $modal.querySelector('h1');
  var $modalImage = $modal.querySelector('img');
  var $modalDescription = $modal.querySelector('p');

  function findById(list, id) {
    return list.find(function (movie) {
      return movie.id === parseInt(id, 10);
    });
  }

  function findMovie(id, category) {
    switch (category) {
      case 'action':
        {
          return findById(listaAccion, id);
        }
      default:
        {
          return findById(listaAnimacion, id);
        }
    }
  }

  function showModal($element) {
    $overlay.classList.add('active');
    $modal.style.animation = 'modalIn .8s forwards';
    var id = $element.dataset.id;
    var category = $element.dataset.category;
    var data = findMovie(id, category);

    $modalTitle.textContent = data.title;
    $modalImage.setAttribute('src', data.medium_cover_image);
    $modalDescription.textContent = data.description_full;
  }

  $hideModal.addEventListener('click', hideModal);
  function hideModal() {
    $overlay.classList.remove('active');
    $modal.style.animation = 'modalOut .8s forwards';
  }

  /* Para formulario de busqueda */
  var $form = document.getElementById('form');

  $form.addEventListener('submit', async function (event) {
    event.preventDefault();
    var data = new FormData($form);

    try {
      var _ref2 = await getData(API_URL + 'list_movies.json?limit=1&query_term=' + data.get('name')),
          pelis = _ref2.data.movies;

      addEventClick(pelis[0]['id']);
    } catch (error) {
      alert("No se encontraron resultados :(");
    }
  });
})();