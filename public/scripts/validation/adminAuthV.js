const form = document.querySelector('form')
const email = document.getElementById('email');
const password = document.getElementById('password');

form.addEventListener('submit', e =>{

  e.preventDefault();

 if(validateForm ()){
  form.submit();
 }
});


const doError = (element,message) =>{
  const inputControl = element.parentElement;
  const errorDisplay = inputControl.querySelector('.warn');
  errorDisplay.innerText = message;

}

const validateForm = () => {

  const emailValue = email.value.trim();
  const passwordValue = password.value.trim();


  let isError = false;
  
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

  if( !isError  ){
    console.log("Validation passed");
    return true;
  }
}

