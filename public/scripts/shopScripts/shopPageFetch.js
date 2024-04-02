const searchInput = document.getElementById("example-search-input");
const userId = searchInput.dataset.userid;
searchInput.addEventListener("input", () => {
  searchProducts(searchInput);
});

async function searchProducts(input) {
  try {
    const response = await fetch("/searchFromShopPage", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },

      body: JSON.stringify({
        string: input.value,
      }),
    });

    const data = await response.json();
    const result = data.result;
    console.log(data);
    if (!response.ok) {
      console.log("failed");
    }
    const listingDiv = document.querySelector(".productList");
    listingDiv.innerHTML = "";
    if (result.length > 0) {
      result.forEach((item) => {
        const productHtml = `
        <div class="col-sm-6 col-md-4 col-lg-3 p-b-35 isotope-item women">
        <!-- Block2 -->
        <div class="block2">
            <div style="max-height: 400px;" class="block2-pic hov-img0">
                <a href="/productDetail/${item._id}">
                    <img src="/productImg/${item.image[0]}" alt="IMG-PRODUCT">
                </a>
            </div>
            <div class="block2-txt flex-w flex-t p-t-14">
                <div class="block2-txt-child1 flex-col-l ">
                    <a class="stext-104 cl4 hov-cl1 trans-04 js-name-b2 p-b-6">
                        ${item.productName}
                    </a>
                    
                    ${ item.offer  ? 
                        `<div>
                            <s class="stext-105 cl3 ">
                                ₹${item.offer.actualAmount}
                            </s>
                            <span style="font-size: medium;color: #b04fff;" class=" ms-2">${item.offer.offerValue}% OFF</span>
                            <div>
                                <span style="font-size: medium;" class="stext-105 cl3 text-success">
                                    ₹${item.productPrice}
                                </span>
                            </div>
                        </div>`
                        :
                        `<span class="stext-105 cl3">
                            ₹${item.productPrice}
                        </span>`
                     }
                </div>
                <div class="block2-txt-child2 flex-r p-t-3">
                    <a href="#" class="btn-addwish-b2 dis-block pos-relative js-addwish-b2">
                        <img class="icon-heart1 dis-block trans-04" src="/images/icons/icon-heart-01.png" alt="ICON">
                        <img class="icon-heart2 dis-block trans-04 ab-t-l" src="/images/icons/icon-heart-02.png" alt="ICON">
                    </a>
                </div>
            </div>
        </div>
    </div>
    `;
        listingDiv.innerHTML += productHtml;
      });
    } else {
      listingDiv.innerHTML = `<div class="d-flex justify-content-center mt-5">
        <h2 class="error-head"></h2>
      </div><div class="d-flex justify-content-center mb-4">
        <h2 class="error-head">Nothing Found</h2>
      </div>`;
    }
  } catch (error) {
    console.log(error);
  }
}

let exampleArray = [];
let sortValue;
let colors = [];
const inputBoxes = document.querySelectorAll(
  ".filter-box , .sort-box , .color-box"
);
inputBoxes.forEach((item) => {
  item.addEventListener("click", () => {
    if (item.classList.contains("filter-box")) {
      if (item.checked) {
        exampleArray.push(item.value);
        // console.log(exampleArray);
      } else {
        exampleArray = exampleArray.filter((value) => value !== item.value);
        // console.log(exampleArray);
      }
    } else if (item.classList.contains("sort-box")) {
      sortValue = item.value;
      // console.log(sortValue);
    } else if (item.classList.contains("color-box")) {
      if (item.checked) {
        colors.push(item.value);
        console.log(colors);
      } else {
        colors = colors.filter((value) => value !== item.value);
        console.log(colors);
      }
    }

    filterFunction(exampleArray, sortValue, colors);
  });
});

async function filterFunction(exampleArray, sortValue, colors) {
  try {
    const response = await fetch("/filterCategory", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },

      body: JSON.stringify({
        categoryValue: exampleArray,
        priceSortvalue: sortValue,
        colorValues: colors,
      }),
    });

    const data = await response.json();
    const result = data.result;
    console.log(data);
    const listingDiv = document.querySelector(".productList");
    listingDiv.innerHTML = "";
    if (result.length > 0) {
      result.forEach((item) => {
        const productHtml = `
        <div class="col-sm-6 col-md-4 col-lg-3 p-b-35 isotope-item women">
        <!-- Block2 -->
        <div class="block2">
            <div style="max-height: 400px;" class="block2-pic hov-img0">
                <a href="/productDetail/${item._id}">
                    <img src="/productImg/${item.image[0]}" alt="IMG-PRODUCT">
                </a>
            </div>
            <div class="block2-txt flex-w flex-t p-t-14">
                <div class="block2-txt-child1 flex-col-l ">
                    <a class="stext-104 cl4 hov-cl1 trans-04 js-name-b2 p-b-6">
                        ${item.productName}
                    </a>
                    
                    ${item.offer && item.offer.actualAmount ? 
                    `
                        <div>
                            <s class="stext-105 cl3 ">
                                ₹${item.offer.actualAmount}
                            </s>
                            <span style="font-size: medium;color: #b04fff;" class=" ms-2">${item.offer.offerValue}% OFF</span>
                            <div>
                                <span style="font-size: medium;" class="stext-105 cl3 text-success">
                                    ₹${item.productPrice}
                                </span>
                            </div>
                        </div>
                    `
                    :
                    `
                        <span class="stext-105 cl3">
                            ₹${item.productPrice}
                        </span>
                    `
                    }
                </div>
                <div style="cursor: pointer;" class="block2-txt-child2 flex-r p-t-3 heart-wishlist" data-userid="${userId}" data-productid="${item._id}">
                <!-- <a href="#" class="btn-addwish-b2 dis-block pos-relative  "> -->
                  <img class="icon-heart1 dis-block trans-04 wishlist-icon" src="/images/icons/icon-heart-01.png" alt="ICON">
                  <!-- <img class="icon-heart2 dis-block trans-04 ab-t-l" src="/images/icons/icon-heart-02.png" alt="ICON"> -->
                <!-- </a> -->
              </div>
            </div>
        </div>
    </div>
    `;
        listingDiv.innerHTML += productHtml;
      });
    }

    if (!response.ok) {
      console.log("failed");
    }
  } catch (error) {
    console.log(error);
  }
}

const priceSortOptions = document.getElementById("price-sort-options");
priceSortOptions.addEventListener("click", function (event) {
  if (event.target.matches(".form-check-input")) {
    const checkboxes = priceSortOptions.querySelectorAll(".form-check-input");
    checkboxes.forEach((checkbox) => {
      if (checkbox !== event.target) {
        checkbox.checked = false;
      }
    });
  }
});



const wishlistBtn = document.querySelectorAll('.heart-wishlist');

wishlistBtn.forEach((item)=>{
const productId = item.dataset.productid ;
const userId = item.dataset.userid ;

item.addEventListener('click',async()=>{
//   console.log(userId);
// console.log(productId);
  const response = await fetch(`/addToWishlist/${productId}`,{
    method : "POST",
    headers:{
      'content-type' : 'application/json'
    },
    body : JSON.stringify({
      userId
    })
  })
  const result = await response.json();
  console.log(result);
  if(!response.ok){
    // const icon = item.querySelector('.wishlist-icon');
    // icon.setAttribute('src','/images/icons/icon-heart-02.png');
    console.log('failed to do task');
  }
  if(result === 'success'){
  await Swal.fire({
  position: "center",
  icon: "success",
  title: "Added to wishlist",
  showConfirmButton: false,
  timer: 1500
});
  }else if(result === 'error'){
    Swal.fire('Product Already Exists')
  }
})
})