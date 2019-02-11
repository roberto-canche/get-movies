'use strict';

(async function load() {
  var $form = document.getElementById('form');
  var $home = document.getElementById('home');
  var $featuringContainer = document.getElementById('featuring');

  function setAttributes($element, attributes) {
    for (var attribute in attributes) {
      $element.setAttribute(attribute, attributes[attribute]);
    }
  }

  var BASE_API = 'https://yts.am/api/v2/';

  function featuringTemplate(peli) {
    return '\n      <div class="featuring">\n        <div class="featuring-image">\n          <img src="' + peli.medium_cover_image + '" width="70" height="100" alt="">\n        </div>\n        <div class="featuring-content">\n          <p class="featuring-title">Pelicula encontrada</p>\n          <p class="featuring-album">' + peli.title + '</p>\n        </div>\n      </div>\n      ';
  }

  $form.addEventListener('submit', async function (event) {
    event.preventDefault();
    $home.classList.add('search-active');
    var $loader = document.createElement('img');
    setAttributes($loader, {
      src: 'loader.gif',
      height: 50,
      width: 50
    });
    $featuringContainer.append($loader);

    var data = new FormData($form);
    try {
      var _ref = await getData(BASE_API + 'list_movies.json?limit=1&query_term=' + data.get('name')),
          pelis = _ref.data.movies;

      var HTMLString = featuringTemplate(pelis[0]);
      $featuringContainer.innerHTML = HTMLString;
    } catch (error) {
      alert(error.message);
      $loader.remove();
      $home.classList.remove('search-active');
    }
  });

  function videoItemTemplate(movie, category) {
    return '<div class="primaryPlaylistItem column is-2" data-id="' + movie.id + '" data-category=' + category + '>\n        <div class="primaryPlaylistItem-image">\n          <img src="' + movie.medium_cover_image + '">\n        </div>\n        <h4 class="primaryPlaylistItem-title">\n          ' + movie.title + '\n        </h4>\n      </div>';
  }

  function createTemplate(HTMLString) {
    var html = document.implementation.createHTMLDocument();
    html.body.innerHTML = HTMLString;
    return html.body.children[0];
  }

  function addEventClick($element) {
    $element.addEventListener('click', function () {
      // alert('click')
      showModal($element);
    });
  }

  function renderMovieList(list, $container, category) {
    // actionList.data.movies
    $container.children[0].remove();
    list.forEach(function (movie) {
      var HTMLString = videoItemTemplate(movie, category);
      var movieElement = createTemplate(HTMLString);
      $container.append(movieElement);
      var image = movieElement.querySelector('img');
      image.addEventListener('load', function (event) {
        event.srcElement.classList.add('fadeIn');
      });
      addEventClick(movieElement);
    });
  }

  async function cacheExist(category) {
    var listName = category + 'List';
    var cacheList = window.localStorage.getItem(listName);

    if (cacheList) {
      return JSON.parse(cacheList);
    }

    var _ref2 = await getData(BASE_API + 'list_movies.json?genre=' + category),
        data = _ref2.data.movies;

    window.localStorage.setItem(listName, JSON.stringify(data));

    return data;
  }

  var actionList = await cacheExist('action');
  var $actionContainer = document.querySelector('#action');
  renderMovieList(actionList, $actionContainer, 'action');

  var dramaList = await await cacheExist('drama');
  var $dramaContainer = document.getElementById('drama');
  renderMovieList(dramaList, $dramaContainer, 'drama');

  var animationList = await await cacheExist('animation');
  var $animationContainer = document.getElementById('animation');
  renderMovieList(animationList, $animationContainer, 'animation');

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
          return findById(actionList, id);
        }
      case 'drama':
        {
          return findById(dramaList, id);
        }
      default:
        {
          return findById(animationList, id);
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
})();