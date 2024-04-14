let couponDiscount;
let walletAmount;
let finalAmount;
const cartTotal = razorpayBtn.dataset.grandtotal;
console.log(cartTotal);
const singlePrice = razorpayBtn.dataset.singleproduct;

//userId
const userDetails =
    document.querySelector(".form-content-div").dataset.userid;
//from cart
const totalPriceCart = document.querySelector(".total-price-cart");
//for single product
const totalPriceSingle = document.querySelector(".total-price-single");
const walletTag = document.querySelector(".wallet-tag");
const balanceInWallet = document.querySelector(".balance-wallet");
// console.log(balanceInWallet.innerText);
const couponTag = document.querySelector(".coupon-tag");

//coupon

const couponBtn = document.getElementById("coupon-btn");
couponBtn.addEventListener("click", async () => {
  const couponCode = document.querySelector(".coupon-code").value.trim();
  if(couponCode === ''){
    return Swal.fire('Please Enter The Coupon Code')
  }
  const productId = document.querySelector(".form-product-id")
    ? document.querySelector(".form-product-id").value.trim()
    : false;
  try {
    const response = await fetch(`/applyCoupon/${userDetails}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        code: couponCode,
        product: productId ? productId : false,
       
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.log("something went wrong");
    } else if(data === 'productError'){
      Swal.fire({
        icon: "error",
        text: "Coupon is not valid for this Product",
      });
    }else if(data === 'errorCode'){
      Swal.fire({
        icon: "error",
        title: "Something Went Wrong",
        text: "No Coupon Found or Coupon Expired",
      });
    }else{
      if(productId){
        if (walletAmount) {
          couponDiscount = data.totalDiscount;
          const subamount = parseFloat(walletAmount) + parseFloat(couponDiscount);
          const totalAmount = Number(singlePrice) - subamount;
          if(totalAmount <= 0){
           return Swal.fire({
              icon: "error",
              title: "Cannot apply coupon !",
              text: "Total Amount Cannot be Zero ",
            });
          }
          couponTag.textContent = "₹" + couponDiscount;
          totalPriceSingle.innerHTML = "₹" + totalAmount.toFixed(2);
          walletTag.textContent = "₹" + walletAmount;
        } else {
          couponDiscount = data.totalDiscount;
          couponTag.textContent = "₹" + couponDiscount;
          const totalAmount = singlePrice - couponDiscount;
          totalPriceSingle.innerHTML = "₹" + totalAmount.toFixed(2);
        }
      }else{
        if(walletAmount){
          couponDiscount = data.totalDiscount;
            const subamount = parseFloat(walletAmount) + parseFloat(couponDiscount);
          const totalAmount = Number(cartTotal) - subamount;
          if(totalAmount <= 0){
            return Swal.fire({
               icon: "error",
               title: "Cannot apply coupon !",
               text: "Total Amount Cannot be Zero ",
             });
           }
          couponTag.textContent = "₹" + couponDiscount;
          totalPriceCart.innerHTML = "₹" + totalAmount.toFixed(2);
          walletTag.textContent = "₹" + walletAmount;
        }else{
          couponDiscount = data.totalDiscount;
          couponTag.textContent = "₹" + couponDiscount;
          const totalAmount = cartTotal - couponDiscount;
          totalPriceCart.innerHTML = "₹" + totalAmount.toFixed(2);
        }
      }
      
    }
  } catch (error) {
    console.log(error);
  }
});

//wallet
const walletInput = document.getElementById("wallet-check");
walletInput.addEventListener("click", async () => {
  if (walletInput.checked) {
    const { value: amount } = await Swal.fire({
      title: "Please Enter the Amount",
      input: "number",
      inputLabel: "Amount must be",
      inputPlaceholder: "Enter your amount",
    });
    if(amount === ''){
      walletInput.checked = false;
    }else if (amount <= Number(balanceInWallet.innerText)) {
      if (totalPriceCart) {
        if(couponDiscount){
          const subamount = cartTotal - couponDiscount;
          const cartTotalValid = (subamount * 0.8).toFixed(2);
          if (amount >= Number(cartTotalValid)) {
              walletInput.checked = false;
              return Swal.fire({
                icon: "error",
                title: "Error",
                text: `You can only use wallet for 80% (${cartTotalValid})`,
              });
            }else{
              walletAmount = amount
              const subamount = parseFloat(walletAmount) + parseFloat(couponDiscount);
              const totalAmount = Number(cartTotal) - subamount;
              totalPriceCart.innerHTML = "₹" + totalAmount.toFixed(2);
              couponTag.textContent = "₹" + couponDiscount;
              walletTag.textContent = "₹" + walletAmount;
            }
        }else{
          const cartTotalValid = (cartTotal * 0.8).toFixed(2);
          if (amount >= Number(cartTotalValid)) {
            walletInput.checked = false;
               return Swal.fire({
                 icon: "error",
                 title: "Error",
                 text: `You can only use wallet for 80% (${cartTotalValid})`,
               });
          }else{
              walletAmount = amount;
              const totalPayableAmount = (cartTotal - walletAmount).toFixed(2);
              totalPriceCart.innerHTML = "₹" + totalPayableAmount;
              walletTag.textContent = "₹ " + walletAmount;
          }
        }
        
        //single product
      } else {
        if(couponDiscount){
          const subamount = singlePrice - couponDiscount;
          const singlePriceValid  = (subamount * 0.8).toFixed(2);
          if(amount >= Number(singlePriceValid)){
            walletInput.checked = false;
            return Swal.fire({
              icon: "error",
              title: "Error",
              text: `You can only use wallet for 80% (${singlePriceValid})`,
            });
          }else{
            walletAmount = amount;
            const subamount = parseFloat(walletAmount) + parseFloat(couponDiscount);
            const totalAmount = Number(singlePrice) - subamount;
            totalPriceSingle.innerHTML = "₹" + (totalAmount).toFixed(2);
            couponTag.textContent = "₹" + couponDiscount;
            walletTag.textContent = "₹" + walletAmount;
          }
        }else{
          const singlePriceValid = (singlePrice * 0.8).toFixed(2);
          if (amount >= Number(singlePriceValid)) {
            walletInput.checked = false;
            return Swal.fire({
              icon: "error",
              title: "Error",
              text: `You can only use wallet for 80% (${singlePriceValid})`,
            });
        }else{
          walletAmount = amount
          const totalAmount = singlePrice - walletAmount;
          totalPriceSingle.innerHTML = "₹" + totalAmount.toFixed(2);
          walletTag.textContent = "₹" + walletAmount;
        }
        }  
      }
    } else {
      walletInput.checked = false;
      return Swal.fire({
        icon: "error",
        title: "Error",
        text: `Not enough Balance !`,
      });
    }
  }else{
    if (totalPriceCart) {
      if (couponDiscount) {
        const total = cartTotal - couponDiscount;
        totalPriceCart.innerHTML = "₹" + Number(total).toFixed(2);
        walletTag.textContent = "₹-/";
      } else {
        
        totalPriceCart.textContent = "₹" + Number(cartTotal).toFixed(2);
        walletTag.textContent = "₹-/";
        walletAmount = false;
      }
    } else {
      if (couponDiscount) {
        const total = singlePrice - couponDiscount;
        totalPriceSingle.innerHTML = "₹" + Number(total).toFixed(2);
        walletTag.textContent = "₹-/";
      } else {
        walletAmount = false;
        totalPriceSingle.innerHTML = "₹" + Number(singlePrice).toFixed(2);
        walletTag.textContent = "₹-/";
      }
    }
  }
});

function validatePayment(data, rzpId, walletAmount, couponDiscount) {
  const productIdElement = document.querySelector(".form-product-id");
  const productSizeElement = document.querySelector(".form-product-size");
  const productPriceElement = document.querySelector(".form-product-price");

  // Check if the elements exist before accessing their values
  const productId = productIdElement ? productIdElement.value : "";
  const productSize = productSizeElement ? productSizeElement.value : "";
  const productPrice = productPriceElement ? productPriceElement.value : "";

  
  // console.log(productId,productPrice,productSize,userDetails);

  const amount = data.amount / 100;
  var options = {
    key: rzpId,
    amount: amount,
    currency: "INR",
    name: "StopShoppers",
    description: "Test Transaction",
    image: "authPic.jpg",
    order_id: data.id,
    handler: async function (response) {
      try {
       await Swal.fire(
          "Payment successful! Payment ID: " + response.razorpay_payment_id
        );
        console.log(userDetails);
        const responseFetch = await fetch(`/verifyOrderRzp/${userDetails}`, {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            productId: productId ? productId : false,
            productSize: productSize ? productSize : false,
            productPrice: productSize ? productPrice : false,
            rzpOrderId: response.razorpay_order_id,
            rzpPaymentId: response.razorpay_payment_id,
            rzpSignature: response.razorpay_signature,
            walletAmount: walletAmount ? walletAmount : false,
            couponDiscount: couponDiscount ? couponDiscount : false,
          }),
        });

        if (!responseFetch.ok) {
          Swal.fire("Something Went wrong");
        } else {
          const data = await responseFetch.json();
          const result = data.message;
          console.log(result);
          window.location.href = `/confirmOrder/${result}`;
        }
      } catch (error) {
        console.log(error);
      }
    },
    prefill: {
      name: "something",
      email: "something@getMaxListeners.com",
    },
    theme: {
      color: "#b04fff",
    },
    
  };

  var rzp = new Razorpay(options);
  rzp.open();

  rzp.on('payment.failed',async function(response){
   await Swal.fire(
      "Payment Failed !"
    );
    createOrderInFailure(walletAmount,couponDiscount);
  })

}

razorpayBtn.addEventListener("click", async () => {
  try {
    let totalAmount;
    console.log(cartTotal);
    console.log(singlePrice);
    if (cartTotal !== "false") {
      if (walletAmount && !couponDiscount) {
        totalAmount = cartTotal - walletAmount;
      } else if (walletAmount && couponDiscount) {
        const subamount = parseFloat(walletAmount) + parseFloat(couponDiscount);
        totalAmount = cartTotal - subamount;
      } else if (!walletAmount && couponDiscount) {
        totalAmount = cartTotal - couponDiscount;
      } else {
        totalAmount = cartTotal;
      }
    } else {
      if (!couponDiscount && walletAmount) {
        totalAmount = singlePrice - walletAmount;
      } else if (walletAmount && couponDiscount) {
        const subamount = parseFloat(walletAmount) + parseFloat(couponDiscount);
        totalAmount = singlePrice - subamount;
      } else if (!walletAmount && couponDiscount) {
        totalAmount = singlePrice - couponDiscount;
      } else {
        totalAmount = singlePrice;
      }
    }

    // if(totalAmount >= Number(totalPriceCart.innerContent) || totalAmount >= Number(totalPriceSingle.innerContent) ){
    //   return Swal.fire({
    //     icon: "error",
    //     title: "Error",
    //     text: `Cannot Perform Operation`,
    //   });
    // }

    const response = await fetch(`/createOrderRzp`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        totalAmount,
      }),
    });
    if (!response.ok) {
      console.log("error occured");
    } else {
      const result = await response.json();
      const { data, rzpId } = result;
      // razorpayPayment(orderId,amount,key_id)
      // console.log(data);
      validatePayment(data, rzpId, walletAmount, couponDiscount);
    }
  } catch (error) {
    console.log(error);
  }
});

//coupon
async function createOrderInFailure(walletAmount,couponDiscount){
  try{
    const productIdElement = document.querySelector(".form-product-id");
  const productSizeElement = document.querySelector(".form-product-size");
  const productPriceElement = document.querySelector(".form-product-price");

  // Check if the elements exist before accessing their values
  const productId = productIdElement ? productIdElement.value : "";
  const productSize = productSizeElement ? productSizeElement.value : "";
  const productPrice = productPriceElement ? productPriceElement.value : "";


    const response = await fetch(`/createOrderInFailure/${userDetails}`,{
      method : "POST",
      headers: {
        'content-type' : 'application/json'
      },
      body : JSON.stringify({
        productId: productId ? productId : false,
        productSize: productSize ? productSize : false,
        productPrice: productSize ? productPrice : false,
        walletAmount: walletAmount ? walletAmount : false,
        couponDiscount: couponDiscount ? couponDiscount : false,
      })

    });
    if(!response.ok){
      console.log('something went wrong');
    }else{
      const message = await response.json();
      const result = message.message
      window.location.href = `/confirmOrder/${result}`
    }
  }catch(error){
    console.log(error);
  }
  

}