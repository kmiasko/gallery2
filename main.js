var DRAGnDROP = (function() {

  var config = {
    parentContainer: '.parent',
    elementClass: 'drag-area',
    handleFunction: log,
  };

  var element;
  var files;

  function init(conf) {
    // update config if object passed
    if (conf) {
      Object.assign(config, conf);
    }

    // bind events to drag container
    var parent = document.querySelector(config.parentContainer);
    element = parent.querySelector('.' + config.elementClass);
    element.addEventListener("dragenter", dragenter, false);
    element.addEventListener("dragover", dragover, false);
    element.addEventListener("drop", drop, false);
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
    // use passed function on dragged files
    config.handleFunction(files);
  }

  function log(fileList) {
    console.log(fileList);
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

  var parent;
  var button;
  var fileInput;
  var gallery;

  // gallery init function
  // overvrite defaults in config
  function init(config) {
    if (config) {
      Object.assign(configuration, config);
    }

    // initialize dom elements handles
    parent = document.querySelector(configuration.parentContainer);
    button = parent.querySelector(configuration.fileUploadButton);
    fileInput = parent.querySelector(configuration.fileInput);
    gallery = parent.querySelector(configuration.galleryArea);

    start();
  }

  // checks if the passed file is in accepted files array
  function isAcceptedFile(file) {
    // accepted file extensions
    var acceptedRegExp = RegExp('.(' + configuration.acceptedFormats.join('|') + ')$', 'i');
    return !acceptedRegExp.test(file);
  }

  // resizes image base on config width and height
  function returnResizedImage(largeImage) {

    // resize image with canvas
    var oc = document.createElement('canvas');
    var octx = oc.getContext('2d');
    oc.width = configuration.imageSize.width;
    oc.height = configuration.imageSize.height;
    octx.drawImage(largeImage, 0, 0, oc.width, oc.height);

    // return small image data uri from canvas
    var jpegUrl = oc.toDataURL("image/jpeg");
    return jpegUrl;
  }

  function addAnchor(thumbnail) {
    var anchor = document.createElement('a');
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      var image = e.target.parentNode;
      // open new window with large image after anchor clicked
      window.open(image.href, 'Image');
    });

    anchor.appendChild(thumbnail);

    return anchor;
  }

  function addSmallImg() {
    var smallImg = document.createElement('img');
    return smallImg;
  }

  function addLargeImg(file) {
    var largeImg = document.createElement('img');
    largeImg.file = file;

    return largeImg;
  }

  // handles image upload
  function addRender(anchor, largeImg, file) {
    var reader = new FileReader();
    reader.onload = (function(aImg, anchor) {
      // return closure that accepts event
      return function(e) {
        // add uri to anchor href, and set large image data uri
        anchor.href = e.target.result;
        aImg.src = e.target.result;
      };
    })(largeImg, anchor);
    reader.readAsDataURL(file);
  }

  function createThumbnail(largeImage, smallImage) {
    largeImage.onload = (function(smallImage) {
      // return closure that accepts event and resizes large image
      // to thumb with canvas (in returnResizedImage)
      return (function(e) {
        // assign data uri to thumbnail img element
        smallImage.src = returnResizedImage(e.target);
      });
    })(smallImage);
  }

  // handle uploaded files
  function handleFiles(files) {
    for (var i = 0; i < files.length; i++) {
      if (!isAcceptedFile(files[i])) {
        continue;
      }
      // create elements for single anchor / thumb / large image
      var largeImg = addLargeImg(files[i]);
      var smallImg = addSmallImg();
      var anchor = addAnchor(smallImg);
      // append elements to gallery container
      gallery.appendChild(anchor);
      addRender(anchor, largeImg, files[i]);
      // after large image is loaded create thumb
      // pass small img container to onload function
      createThumbnail(largeImg, smallImg);
    }
  }

  function start() {
    DRAGnDROP.init({ parentContainer: configuration.parentContainer, handleFunction: handleFiles });
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

