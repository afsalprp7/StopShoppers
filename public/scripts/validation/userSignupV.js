
const firstname = document.getElementById('firstname');
const lastname = document.getElementById('lastname');
const email = document.getElementById('email');
const password= document.getElementById('password');
const password2 = document.getElementById('password2');
const phone = document.getElementById('phone');
const form = document.getElementById('form');

form.addEventListener('submit',  e =>{
  e.preventDefault();

  if(!validateInputs()){
    form.submit();
  }
 

});

const doError = (element,message) =>{
  const inputControl = element.parentElement;
  const errorDisplay = inputControl.querySelector('.warn');
  errorDisplay.innerText = message;

}



const validateInputs = () =>{
  const firstnameValue = firstname.value.trim();
  const lastnameValue = lastname.value.trim();
  const emailValue = email.value.trim();
  const passwordValue = password.value.trim();
  const password2Value = password2.value.trim();
  const phoneValue = phone.value.trim();

  let isError = false;

  let lettersOnlyRegex = /^[A-Za-z\s]*$/;
  if(firstnameValue === ''){
    doError(firstname,'This field cannot be empty');
    isError = true;
  }else if(!lettersOnlyRegex.test(firstnameValue)){

    doError(firstname,'Only characters are allowded');
    isError = true;
  }else{
    doError(firstname,'');
  }

  if(lastnameValue === ''){
    doError(lastname,'This field cannot be empty');
    isError = true;
  }else if(!lettersOnlyRegex.test(lastnameValue)){
    doError(lastname,'Only characters are allowded');
    isError = true;
  }
  else{
    doError(lastname,'');
  }

  let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(emailValue === ''){
    doError(email,'This field cannot be empty');
    isError = true;
  }else if(!emailRegex.test(emailValue)){
    doError(email,'invalid email address');
    isError = true;
  }else{
    doError(email,'');
  }

  let passwordUppercase = /^(?=.*?[A-Z])/;
  let passwordLower = /^(?=.*?[a-z])/;
  let passwordDigit = /^(?=.*?[0-9])/;
  let passwordSpecial = /^(?=.*?[#?!@$%^&*-])/;

  if(passwordValue === ''){
    doError(password,'This field cannot be empty');
    isError = true;
  }else if(passwordValue.length < 4){
    doError(password,'Password need at least 4 characters');
    isError = true;
  }else if(!passwordUppercase.test(passwordValue)){
    doError(password,'Password need atleast one Uppercase');
    isError = true;
  }else if(!passwordLower.test(passwordValue)){
    doError(password,'Password need atleast one Lowercase');
    isError = true;
  }else if(!passwordDigit.test(passwordValue)){
    doError(password,'Password need atleast one Uppercase');
    isError = true;
  }else if(!passwordSpecial.test(passwordValue)){
    doError(password,'Password need atleast one special character');
    isError = true;
  }else{
    doError(password,'');
  }

  if(password2Value === ''){
    doError(password2,'This field cannot be empty');
    isError = true;
  }else if(password2Value !== passwordValue){
    doError(password2,`Password Doesn't Match`);
    isError = true;
  }else{
    doError(password2,'');
  }

  //mobile validation
  let mobileRegex = /^\d{10}$/;
  if(phoneValue === ''){
    doError(phone,'This field cannot be empty');
    isError = true;
  }else if(!mobileRegex.test(phoneValue)){
    doError(phone, 'Enter valid phone number');
    isError = true;
  }else{
    doError(phone,'');
  }

  return isError;
  
}