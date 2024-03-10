

const form = document.getElementById('form');
  const firstname = document.getElementById('firstname');
  const lastname = document.getElementById('lastname');
  const address = document.getElementById('address');
  const state = document.getElementById('state');
  const district = document.getElementById('district');
  const city = document.getElementById('city');
  const locality = document.getElementById('locality');
  const postalCode = document.getElementById('postalCode');
  const phone = document.getElementById('phone');


  form.addEventListener('submit',async(e)=>{
    e.preventDefault();
    const userId = form.dataset.userid;
    console.log(userId);
    if(!validateForm()){
      setNewAddress(userId);
    };
  })

function setError(element,message){
  const inputDiv = element.parentElement;
  const displayMessage = inputDiv.querySelector('.warn');
  displayMessage.innerText = message; 
}



function validateForm (){
  const firstnameVal = firstname.value.trim();
  console.log(firstnameVal);
  const lastnameVal = lastname.value.trim()
  const addressVal = address.value.trim();
  const stateVal = state.value.trim();
  const districtVal = district.value.trim();
  const cityVal = city.value.trim();
  const localityVal = locality.value.trim();
  const postalCodeVal = postalCode.value.trim();
  const phoneVal = phone.value.trim();
let isError = false;
let lettersOnlyRegex = /^[A-Za-z\s]*$/;

  if(firstnameVal === ''){
    isError = true ;
    setError(firstname,'This Field Cannot be Empty');
  }else if(!lettersOnlyRegex.test(firstnameVal)){
    isError=true;
    setError(firstname,'Invalid Entry');
  }else{
    setError(firstname,'');
  }

  if(lastnameVal === ''){
    isError=true;
    setError(lastname,'This Field Cannot be Empty')
  }else if(!lettersOnlyRegex.test(lastnameVal)){
    isError=true;
    setError(lastname,'Invalid Entry');
  }else{
    setError(lastname,'');
  }

  if(addressVal === ''){
    isError = true;
    setError(address,'This Field Cannot Be Empty')
  }else{
    setError(address,'')
  }

  if(stateVal === ''){
    isError = true;
    setError(state,'This Field Cannot Be Empty')
  }else if(!lettersOnlyRegex.test(stateVal)){
    isError = true;
    setError(state,'Invalid Entry');
  }else{
    setError(state,'');
  }

  if(districtVal === ''){
    isError =true;
    setError(district,'This Field Cannot Be Empty')
  }else if(!lettersOnlyRegex.test(districtVal)){
    isError = true;
    setError(district,'Invalid Entry');
  }else{
    setError(district,'');
  }

  if(cityVal === ''){
    isError =true;
    setError(city,'This Field Cannot Be Empty')
  }else if(!lettersOnlyRegex.test(cityVal)){
    isError = true;
    setError(city,'Invalid Entry');
  }else{
    setError(city,'');
  }

  if(localityVal === ''){
    isError =true;
    setError(locality,'This Field Cannot Be Empty')
  }else{
    setError(locality,'');
  }
  const numbersOnlyRegex = /^[0-9]/ ;
  if(postalCodeVal === ''){
    isError =true;
    setError(postalCode,'This Field Cannot Be Empty')
  }else if(!numbersOnlyRegex.test(postalCodeVal)){
    isError = true;
    setError(postalCode,'Invalid Entry');
  }else{
    setError(postalCode,'');
  }

  let mobileRegex = /^\d{10}$/;
  if(phoneVal === ''){
    isError =true;
    setError(phone,'This Field Cannot Be Empty')
  }else if(!mobileRegex.test(phoneVal)){
    isError = true;
    setError(phone,'Invalid Number');
  }else{
    setError(phone,'');
  }


return isError;
}


async function setNewAddress (userId){
  try{
    const response = await fetch(`/addAddressCheckout/${userId}`,{
      method:'POST',
      headers : {
        'content-type' : 'application/json'
      },
      body : JSON.stringify({
        firstname : firstname.value.trim(),
        lastname : lastname.value.trim(),
        address : address.value.trim(),
        state : state.value.trim(),
        district : district.value.trim(),
        city : city.value.trim(),
        locality : locality.value.trim(),
        postalCode : postalCode.value.trim(),
        phone : phone.value.trim()
      })
    });

    if(!response.ok){
      console.log('Failed Task');
    }else{
      window.location.reload();
    }
    
    
  }catch(error){
    console.log(error);
  }
}