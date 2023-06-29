const imageInput = document.getElementById('imageInput');
const preview = document.getElementById('preview');
const convertButton = document.getElementById('convertButton');
const imageCount = document.getElementById('imageCount');
let images = [];

imageInput.addEventListener('change', function(event) {
  const files = event.target.files;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();

    reader.onload = function() {
      const img = document.createElement('img');
      img.src = reader.result;
      img.classList.add('preview-image');

      const imageItem = document.createElement('div');
      imageItem.classList.add('image-item');
      imageItem.appendChild(img);

      preview.appendChild(imageItem);
      images.push(file);

      const removeButton = document.createElement('button');
      removeButton.innerText = '-';
      removeButton.classList.add('remove-button');
      removeButton.addEventListener('click', function() {
        imageItem.remove();
        images.splice(images.indexOf(file), 1);
        updateImageCount();
      });

      imageItem.appendChild(removeButton);

      updateImageCount();
    };

    reader.readAsDataURL(file);
  }
});

convertButton.addEventListener('click', function() {
  if (images.length === 0) {
    alert('Please add at least one image.');
    return;
  }

  const formData = new FormData();
  for (let i = 0; i < images.length; i++) {
    formData.append('images', images[i]);
  }

  fetch('http://192.168.15.216:3000/convert-to-pdf', {
    method: 'POST',
    body: formData
  })
  .then(response => response.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.pdf';
    a.click();
    window.URL.revokeObjectURL(url);

    // Reset the image count after conversion
    images = [];
    preview.innerHTML = '';
    updateImageCount();
  })
  .catch(error => {
    console.error('Error occurred while converting to PDF:', error);
  });
});

function updateImageCount() {
  imageCount.textContent = `Total Images: ${images.length}`;
}
function openNav() {
    document.getElementById("mySidenav").style.width = "200px";
  }
  
  function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
  }
  let isSideNavOpen = false;

  function toggleNav() {
    const sideNav = document.getElementById("mySidenav");
    const mainContent = document.getElementById("mainContent");
  
    if (sideNav.style.width === "200px") {
      sideNav.style.width = "0";
      mainContent.style.marginLeft = "0";
    } else {
      sideNav.style.width = "200px";
      mainContent.style.marginLeft = "200px";}
  }
  
