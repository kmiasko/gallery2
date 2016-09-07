// basic extend function
function extend(a, b) {
  for (var key in b)
    if (b.hasOwnProperty(key))
      a[key] = b[key];
  return a;
}

var DRAGnDROP = (function() {

  var config = {
    parentContainer: '.parent',
    elementClass: 'drag-area',
    handleFunction: log,
  };

  var element,
    files;

  function init(conf) {
    if (conf) extend(config, conf);
    element = document.createElement('div');
    element.classList.add(config.elementClass);
    element.addEventListener("dragenter", dragenter, false);
    element.addEventListener("dragover", dragover, false);
    element.addEventListener("drop", drop, false);
    render();
  }

  // nothing to do on dragenter
  function dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  // nothing to do on dragover
  function dragover(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  // display thumbnails on drop event
  // and creaate anchors for original files
  function drop(e) {
    e.stopPropagation();
    e.preventDefault();
    var dt = e.dataTransfer;
    files = dt.files;
    config.handleFunction(files);
    // handleFiles(files); 
  }

  function log(fileList) {
    console.log(fileList);
  }

  function render() {
    var parent = document.querySelector(config.parentContainer);
    parent.appendChild(element);
  }

  return {
    init: init
  };

})();


// gallery module
var GALLERY = (function() {

  // default configuration
  var configuration = {
    parentContainer: '#parent',
    fileInput: '#files',
    fileUploadButton: '#send',
    dragArea: '#drag-area',
    acceptedFormats: ['jpg', 'png'],
    imageSize: {
      width: 150,
      height: 150
    },
    galleryArea: '#gallery'
  };

  // gallery init function
  // overvrite defaults in config  
  function init(config) {
    if (config) extend(configuration, config);
    start();
  }

  function start() {

    var parent = document.querySelector(configuration.parentContainer);
    var button = parent.querySelector(configuration.fileUploadButton);

    // create file input field
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.name = 'files';
    fileInput.accept = configuration.acceptedFormats.map(function(format) {
      return '.' + format;
    }).join(',');
    fileInput.multiple = true;
    parent.appendChild(fileInput);

    // create upload button
    var button = document.createElement('button');
    button.id = configuration.fileUploadButton.replace('#', '');
    button.name = 'send';
    button.textContent = 'Upload';
    parent.appendChild(button);

    // create drag area container
    DRAGnDROP.init({ parentContainer: configuration.parentContainer, handleFunction: handleFiles });

    // create gallery container
    var gallery = document.createElement('div');
    gallery.id = configuration.galleryArea.replace('#', '');
    parent.appendChild(gallery);

    // main anchor and thumbnails creating function
    function handleFiles(files) {

      // get gallery container 
      var gallery = document.querySelector(configuration.galleryArea);

      // accepted file extensions
      var acceptedFiles = RegExp('.(' + configuration.acceptedFormats.join('|') + ')$', 'i');

      for (var i = 0; i < files.length; i++) {

        if (!acceptedFiles.test(files[i].name)) {
          continue;
        }

        // create elements for single anchor / thumb / large image
        var anchor = document.createElement('a');
        var largeImg = document.createElement('img');
        var smallImg = document.createElement('img');

        largeImg.file = files[i];

        // open new window with large image after anchor clicked
        anchor.addEventListener('click', function(e) {
          e.preventDefault();
          var image = e.target.parentNode;
          window.open(image.href, 'Image');
        });

        // append thumb to 
        anchor.appendChild(smallImg);
        gallery.appendChild(anchor);

        var reader = new FileReader();
        reader.onload = (function(aImg, anchor) {
          // return closure that accepts event
          return function(e) {
            anchor.href = e.target.result;
            aImg.src = e.target.result;
          };
        })(largeImg, anchor);
        reader.readAsDataURL(files[i]);

        // after large image is loaded create thumb
        // pass small img container to onload function
        largeImg.onload = (function(smallImg) {
          // return closure that accepts event
          return (function(e) {

            // resize image with canvas
            var oc = document.createElement('canvas');
            var octx = oc.getContext('2d');
            oc.width = configuration.imageSize.width;
            oc.height = configuration.imageSize.height;
            octx.drawImage(e.target, 0, 0, oc.width, oc.height);

            // return small image data uri from canvas
            var jpegUrl = oc.toDataURL("image/jpeg");

            // assign data uri to thumbnail img element
            smallImg.src = jpegUrl;
          });
        })(smallImg);
      }
    }

    // upload files event for button
    button.addEventListener('click', function(e) {
      e.preventDefault();
      gallery.innerHTML = '';
      handleFiles(fileInput.files);
    });

    document.removeEventListener('DOMContentLoaded', start);
  }

  return {
    init: init,
  };

})();

GALLERY.init();

