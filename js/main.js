let Url = 'sample/seo.pdf';

let pdfDoc = null,
  pageNum = 1,
  pageIsRendering = false,
  pageNumIsPending = null;

let scale = 1;
const canvas = document.querySelector('#pdf-render');
const ctx = canvas.getContext('2d');

// Render the page
const renderPage = num => {
  pageIsRendering = true;

  // Get page
  pdfDoc.getPage(num).then(page => {
    // Set scale
    const viewport = page.getViewport({
      scale
    });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderCtx = {
      canvasContext: ctx,
      viewport
    };

    page.render(renderCtx).promise.then(() => {
      pageIsRendering = false;

      if (pageNumIsPending !== null) {
        renderPage(pageNumIsPending);
        pageNumIsPending = null;
      }
    });

    // Output current page
    document.querySelector('#page-num').value = num;
  });
};

// Check for pages rendering
const queueRenderPage = num => {
  if (pageIsRendering) {
    pageNumIsPending = num;
  } else {
    renderPage(num);
  }
};

// Show Prev Page
const showPrevPage = () => {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
};

// Show Next Page
const showNextPage = () => {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
};

// Get Document
const init = url => {
  if (!url) url = Url;
  pdfjsLib
    .getDocument(url)
    .promise.then(pdfDoc_ => {
      pdfDoc = pdfDoc_;
      document.querySelector('#page-count').textContent = pdfDoc.numPages;
      renderPage(pageNum);
    })
    .catch(err => {
      // Display error
      const div = document.createElement('div');
      div.className = 'error';
      div.appendChild(document.createTextNode(err.message));
      document.querySelector('body').insertBefore(div, canvas);
      // Remove top bar
      document.querySelector('.top-bar').style.display = 'none';
    });
};

init();

// get file path
function getObjectURL(file) {
  var url = null;
  if (window.createObjcectURL != undefined) {
    url = window.createOjcectURL(file);
  } else if (window.URL != undefined) {
    url = window.URL.createObjectURL(file);
  } else if (window.webkitURL != undefined) {
    url = window.webkitURL.createObjectURL(file);
  }
  return url;
}

// Events Listener
document.querySelector('#prev-page').addEventListener('click', showPrevPage);
document.querySelector('#next-page').addEventListener('click', showNextPage);
document.querySelector('#check-read').addEventListener('click', function () {
  init(Url);
});
document.querySelector('#file-read').addEventListener('change', function (evt) {
  Url = getObjectURL(evt.target.files[0]);
});
document.querySelector('html').addEventListener('keyup', function (evt) {
  if (evt.keyCode === 37) {
    showPrevPage()
  } else if (evt.keyCode === 39) {
    showNextPage()
  }
});
document.querySelector('#scale').addEventListener('change', function (evt) {
  scale = parseFloat(evt.target.value);
  renderPage(pageNum);
});
document.querySelector('#page-num').addEventListener('keyup', function (evt) {
  if (evt.keyCode === 13) {
    queueRenderPage(parseInt(event.target.value))
  }
});
