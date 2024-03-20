
function validatePayment(data ,rzpId) {
  const amount = data.amount/100 ; 
  var options = {
    "key": rzpId,
    "amount": amount, 
    "currency": "INR",
    "name": "StopShoppers",
    "description": "Test Transaction",
    "order_id": data.id,
    "handler": function (response){
      Swal.fire('Payment successful! Payment ID: ' + response.razorpay_payment_id);
    },
    "prefill": {
      "name": "user.firstname",
      "email": "customer@example.com",
      
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
    const totalAmount = razorpayBtn.dataset.grandtotal;
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