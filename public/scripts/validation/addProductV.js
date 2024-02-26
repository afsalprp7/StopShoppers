const form = document.getElementById("form");
const productName = document.getElementById("productName");
const price = document.getElementById("Price");
const description = document.getElementById("Description");
const color = document.getElementById("color");
const quantity = document.getElementById("Quantity");
const photo = document.getElementById("photoProduct");
const checkboxes = document.querySelectorAll('.sizes-tag');

const parent_size = document.getElementById("parent");

const stringRegex = /^[A-Za-z0-9\s.]+$/;
const priceRegex = /^\d+(\.\d{1,2})?$/;

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!validateForm()) {
    
    form.submit();
  }
});

setError = (element, message) => {
  const inputControl = element.parentElement;
  const errorDisplay = inputControl.querySelector(".warn");
  errorDisplay.innerText = message;
};

function validateForm() {
  let error = false;
  const productNameValue = productName.value;
  if (productNameValue === "") {
    setError(productName, "This field cannot be empty");
    error = true;
  } else if (!stringRegex.test(productNameValue)) {
    setError(
      productName,
      "Only letters, numbers, spaces, and dots are allowed"
    );
    error = true;
  } else {
    setError(productName, "");
  }

  if (price.value === "") {
    setError(price, "This field cannot be empty");
    error = true;
  } else if (!priceRegex.test(price.value)) {
    setError(price, "Only numbers and decimals are allowded");
    error = true;
  } else {
    setError(price, "");
  }

  if (description.value === "") {
    setError(description, "This field Cannot be empty");
    error = true;
  } else {
    setError(description, "");
  }
  let lettersOnlyRegex = /^[A-Za-z\s]*$/;
  if (color.value === "") {
    setError(color, "This field cannot be empty");
    error = true;
  } else if (!lettersOnlyRegex.test(color.value)) {
    setError(color, "Only letters are allowded");
    error = true;
  } else {
    setError(color, "");
  }

  if (quantity.value === "") {
    setError(quantity, "This field cannot be empty");
    error = true;
  } else if (!priceRegex.test(quantity.value)) {
    setError(quantity, "Only numbers are allowded");
    error = true;
  } else {
    setError(quantity, "");
  }




  const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.webp)$/i;
let imageIn = false;

// Check if at least one file is selected
for (const img of document.querySelectorAll('#photoProduct')) {
  if (img.files.length > 0) {
    imageIn = true;
    break;
  }
}

if (!imageIn) {
  setError(photo, "This field is empty");
  error = true;
} else {
  for (const img of document.querySelectorAll('#photoProduct')) {
    if (!allowedExtensions.test(img.files[0].name)) {
      setError(photo, 'Invalid file type. Allowed file types are: JPG, JPEG, PNG, and WEBP');
    } else {
      setError(photo, '');
    }
  }
}



  //sizes

  let sizeSelected = false;
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      sizeSelected = true;
    }
  });

  if (!sizeSelected) {
    setError(parent_size, "Select available sizes");
    error = true;
  } else {
    setError(parent_size, "");
  }

  return error;
}


