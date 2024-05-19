var hoverImages = document.querySelectorAll('.hover-image');

hoverImages.forEach(function(img) {
    var originalSrc = img.src;
    var hoverSrc = img.getAttribute('data-hover');

    img.addEventListener('mouseover', function() {
        img.src = hoverSrc;
    });

    img.addEventListener('mouseout', function() {
        img.src = originalSrc;
    });
});