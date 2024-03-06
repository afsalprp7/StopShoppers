const input = document.querySelector('.searchInput');
  const headingTag = document.querySelector('.error-head');
  input.addEventListener('input',(event)=>{

    // if(event.key === 'Enter'){
      console.log('hi');
      getFetch(input);
    // }

  })
  async function getFetch(input){
   const response = await fetch(`http://localhost:7000/searchProduct`,{

    method:'POST',
    headers : {
      'content-type' : 'application/json',

        },
          body : JSON.stringify({
          string : input.value
        })
    });
    const data = await response.json();
    const result = data.result;
   
    console.log(result);
    const listingDiv = document.querySelector('.productList');
    listingDiv.innerHTML = '';
    if (Array.isArray(result)) {
        result.forEach(item => {
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
                                <span class="stext-105 cl3">
                                    ₹${item.productPrice}
                                </span>
                            </div>
                            <div class="block2-txt-child2 flex-r p-t-3">
                                <a href="#" class="btn-addwish-b2 dis-block pos-relative js-addwish-b2">
                                    <img class="icon-heart1 dis-block trans-04" src="/images/icons/icon-heart-01.png" alt="ICON">
                                    <img class="icon-heart2 dis-block trans-04 ab-t-l" src="/images/icons/icon-heart-02.png" alt="ICON">
                                </a>
                            </div>
                        </div>
                    </div>
                </div>`;
            listingDiv.innerHTML += productHtml;
        });
    } else {
      console.log(result);
      listingDiv.innerHTML = `<div class="d-flex justify-content-center">
        <h2 class="error-head"></h2>
      </div><div class="d-flex justify-content-center mb-4">
        <h2 class="error-head">${result}</h2>
      </div>`
        
    }
  }