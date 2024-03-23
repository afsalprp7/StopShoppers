




let walletAmount ;
const cartTotal = razorpayBtn.dataset.grandtotal;
console.log(cartTotal);
const singlePrice = razorpayBtn.dataset.singleproduct;

//from cart
const totalPriceCart = document.querySelector('.total-price-cart');
//for single product
const totalPriceSingle = document.querySelector('.total-price-single')
const walletTag = document.querySelector('.wallet-tag');
const balanceInWallet = document.querySelector('.balance-wallet');
console.log(balanceInWallet.innerText);


const walletInput = document.getElementById('wallet-check')
 walletInput.addEventListener('click',async()=>{
if(walletInput.checked){
  const { value: amount } = await Swal.fire({
  title: "Please Enter the Amount",
  input: "number",
  inputLabel: "Amount must be",
  inputPlaceholder: "Enter your amount"
});
if(amount <= Number(balanceInWallet.innerText) ){
  if(totalPriceCart){
    const cartTotalValid = (cartTotal * 0.8).toFixed(2) ;
    if(amount >= Number(cartTotalValid)){
  
      walletInput.checked = false ;
      return Swal.fire({
        icon : "error",
        title : "Error",
        text  : `You can only use wallet for 80% (${cartTotalValid})`
      });
    
    }else{
      walletAmount = amount ;
      const totalPayableAmount = cartTotal - walletAmount
      totalPriceCart.innerHTML = '₹' + totalPayableAmount;
      walletTag.textContent = '₹ ' + walletAmount ;
    }
    //single product
  }else{
  const singlePriceValid = (singlePrice * 0.8).toFixed(2);
  if(amount >= Number(singlePriceValid)){
    walletInput.checked = false ;
    return Swal.fire({
      icon : "error",
      title : "Error",
      text  : `You can only use wallet for 80% (${singlePriceValid})`
    });
  }else {
    walletAmount = amount;
    const totalAmount = singlePrice - walletAmount ;
    totalPriceSingle.innerHTML = '₹' + totalAmount;
    walletTag.textContent = '₹ ' + walletAmount ;
  }
  
  }
}else{
  walletInput.checked = false ;
  return Swal.fire({
    icon : "error",
    title : "Error",
    text  : `Not enough Balance !`
  });

}


}else{
  if(totalPriceCart){
    totalPriceCart.textContent = '₹' + cartTotal;
    walletTag.textContent = '₹-/' ;
    walletAmount = false;
  }else{
    walletAmount = false;
    totalPriceSingle.innerHTML = '₹' + singlePrice;
    walletTag.textContent = '₹-/' ;
  }
  }
 
 })



function validatePayment(data ,rzpId,walletAmount) {
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
            rzpSignature : response.razorpay_signature,
            walletAmount : walletAmount ? walletAmount : false




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
    
    console.log(cartTotal);
    console.log(singlePrice);

    
    if (cartTotal !== "false") {
      if(walletAmount){
       totalAmount = cartTotal - walletAmount ;
      }else{
        totalAmount = cartTotal ;
      }
    } else {
      if(walletAmount){
        totalAmount = singlePrice - walletAmount ;
      }else{
        totalAmount = singlePrice;

      }
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
    validatePayment(data ,rzpId,walletAmount)
    }

  }catch(error){
    console.log(error);
  }



});



//do place order


