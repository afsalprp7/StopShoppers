const quantityDiv = document.querySelectorAll(".quantity");
  
  quantityDiv.forEach((div) => {
    const input = div.querySelector(".quantity-input ");
    const plus = div.querySelector(".quantity-plus");
    const minus = div.querySelector(".quantity-minus");
    // const pricetag = div.querySelectorAll('.price');
      const productId = div.dataset.productid;
      const userId = div.dataset.userid;
      const size = div.dataset.size;
    
    
      plus.addEventListener("click", () => {
      if (input.value < 5) 
      input.value = parseInt(input.value) + 1;
      const newQuantity = input.value
      // console.log(newQuantity);
      // console.log(size);
      updateCartQuantity(productId, userId, newQuantity,size);
      
      window.location.reload();
      
    });
    minus.addEventListener("click", () => {
      if (input.value > 1) 
      input.value = parseInt(input.value) - 1;
      const newQuantity = input.value;
      
      // console.log(newQuantity);
      // console.log(size);

      updateCartQuantity(productId, userId, newQuantity,size);
      window.location.reload();

    });
    });

    async function updateCartQuantity(productId, userId, newQuantity,size) {
      try {
        const response = await fetch(`/updateCartQuantity/${productId}/${userId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(
            { 
              quantity: newQuantity ,
              size  : size
            })
        });

        if (!response.ok) {
          console.log('failed to update cart');
        }
  
      } catch (error) {
        console.error(error);
      }
    }


    //remove item from cart
    