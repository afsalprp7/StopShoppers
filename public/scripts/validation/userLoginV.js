
const form = document.getElementById('form');
const email = document.getElementById('email');
const password = document.getElementById('password');

form.addEventListener('submit' , e =>{

  e.preventDefault();
  if(!validateForm()){
    form.submit();
  };

});

const setError =  (element,message)=>{

  const inputControl = element.parentElement;
  const errorDisplay = inputControl.querySelector('.warn');
  errorDisplay.innerText = message;

}


const validateForm = () =>{
  const emailValue = email.value.trim();
  const passwordValue = password.value.trim(); 

  let isError = false;

  let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

console.log(passwordValue)
  if(emailValue === ''){
    setError(email,'This field cannot be empty');
    isError = true;
  }else if(!emailRegex.test(emailValue)){
    setError(email,'Invalid email address');
    isError = true;
  }else{
    setError(email,'');
  }


  let passwordUppercase = /^(?=.*?[A-Z])/;
  let passwordLower = /^(?=.*?[a-z])/;
  let passwordDigit = /^(?=.*?[0-9])/;
  let passwordSpecial = /^(?=.*?[#?!@$%^&*-])/;

  if(passwordValue === ''){
    setError(password,'This field cannot be empty');
    isError = true;
  }else if(passwordValue.length < 4){
    setError(password,'Password need at least 4 characters');
    isError = true;
  }else if(!passwordUppercase.test(passwordValue)){
    setError(password,'Password need atleast one Uppercase');
    isError = true;
  }else if(!passwordLower.test(passwordValue)){
    setError(password,'Password need atleast one Lowercase');
    isError = true;
  }else if(!passwordDigit.test(passwordValue)){
    setError(password,'Password need atleast one Uppercase');
    isError = true;
  }else if(!passwordSpecial.test(passwordValue)){
    setError(password,'Password need atleast one special character');
    isError = true;
  }else{
    setError(password,'');
  }

  return isError;
}