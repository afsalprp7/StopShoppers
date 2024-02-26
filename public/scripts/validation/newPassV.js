const form = document.getElementById('form');
const password = document.getElementById('password');
const password2 = document.getElementById('password2')

form.addEventListener('submit', e =>{

  e.preventDefault();

  if(!validatePass()){
    form.submit()
  }

});

const setError =  (element,message)=>{

  const inputControl = element.parentElement;
  const errorDisplay = inputControl.querySelector('.warn');
  errorDisplay.innerText = message;

}



const validatePass = () => {

  const passwordValue = password.value.trim();
  const password2Value = password2.value.trim();

  let isError = false ;

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
  
  if(password2Value === ''){
    setError(password2,'This field cannot be empty');
    isError = true;
  }else if(password2Value !== passwordValue){
    setError(password2,`Password Doesn't Match`);
    isError = true;
  }else{
    setError(password2,'');
  }
  return isError;
}
