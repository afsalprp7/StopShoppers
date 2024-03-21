

function validatePayment(data ,rzpId) {
  const productIdElement = document.querySelector('.form-product-id');
  const productSizeElement = document.querySelector('.form-product-size');
  const productPriceElement = document.querySelector('.form-product-price');
  
  // Check if the elements exist before accessing their values
  const productId = productIdElement ? productIdElement.value : '';
  const productSize = productSizeElement ? productSizeElement.value : '';
  const productPrice = productPriceElement ? productPriceElement.value : '';
  
  const userDetails = document.querySelector('.form-content-div').dataset.userid; 
  // console.log(productId,productPrice,productSize,userDetails);
 

  const amount = data.amount/100 ; 
  var options = {
    "key": rzpId,
    "amount": amount, 
    "currency": "INR",
    "name": "StopShoppers",
    "description": "Test Transaction",
    "image" : "authPic.jpg",
    "order_id": data.id,
    "handler": async function(response){
      try{
        
        Swal.fire('Payment successful! Payment ID: ' + response.razorpay_payment_id);
        console.log(userDetails);
        const responseFetch = await fetch(`/verifyOrderRzp/${userDetails}`,{
          method : "PATCH",
          headers :{
            'content-type' : 'application/json'
          },
          body : JSON.stringify({
            productId : productId ? productId : false,
            productSize : productSize? productSize : false,
            productPrice : productSize ? productPrice : false,
            rzpOrderId : response.razorpay_order_id,
            rzpPaymentId : response.razorpay_payment_id,
            rzpSignature : response.razorpay_signature




          })
        });

        if(!responseFetch.ok){
          Swal.fire('Something Went wrong');
        }else{
          const data = await responseFetch.json();
          const result = data.message ;
          console.log(result);
          window.location.href = `/confirmOrder/${result}`;
        }
      }catch(error){
        console.log(error);
      }



    },
    "prefill": {
      "name": 'something',
      "email": 'something@getMaxListeners.com',
      
    },
    "theme": {
      "color": "#b04fff"
    }
  };

  var rzp = new Razorpay(options);
  rzp.open();
}

razorpayBtn.addEventListener('click',async()=>{
  try{
    let  totalAmount  ;
    const cartTotal = razorpayBtn.dataset.grandtotal;
    const singlePrice = razorpayBtn.dataset.singleproduct;
    console.log(cartTotal);
    console.log(singlePrice);

    if (cartTotal !== "false") {
      totalAmount = cartTotal;
    } else {
      totalAmount = singlePrice;
    }
    
    console.log(totalAmount);

    const response = await fetch(`/createOrderRzp`,{
      method : "POST",
      headers :{
        'content-type' : 'application/json'
      },
      body : JSON.stringify({
        totalAmount  
      })
    });
    if(!response.ok){
      console.log('error occured');
    }else{
      const result = await response.json();
      const { data ,rzpId } = result ;
    // razorpayPayment(orderId,amount,key_id)
    // console.log(data);  
    validatePayment(data ,rzpId)
    }

  }catch(error){
    console.log(error);
  }



})