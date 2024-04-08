let salesData;
let basis ;

function initialsale(sales){
  salesData = sales;
  basis = 'all orders'
  const ctx = document.getElementById('myChart');
  myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sales.map(item => item._id),
        datasets: [{
          label: 'Orders',
          data: sales.map(item => item.total),
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
}

const buttons = document.querySelectorAll('.salesReport-btn');
const dateContainer = document.querySelector('.date-container');
const yearContainer = document.querySelector('.year-container');
buttons.forEach((btn)=>{
  btn.addEventListener('click',()=>{
    let value = btn.innerText;
    value = value.toLowerCase();
    console.log(value);
    if(value === 'daily'){
      submitButton(value);
      if(dateContainer.style.display === 'block'){
        dateContainer.style.display = 'none'
        if(yearContainer.style.display === 'block'){
          yearContainer.style.display = 'none';
        }
        

      }else{
        dateContainer.style.display = 'block'
        if(yearContainer.style.display === 'block'){
          yearContainer.style.display = 'none'
        }
      }  
    }else if(value === 'weekly'){
      submitButton(value)
      if(dateContainer.style.display === 'block'){
        dateContainer.style.display = 'none'
        if(yearContainer.style.display === 'block'){
          yearContainer.style.display = 'none'
        }
      }else{
        dateContainer.style.display = 'block'
        if(yearContainer.style.display === 'block'){
          yearContainer.style.display = 'none'
        }
      }  
    }else if(value === 'monthly'){
      submitButton(value)
      if(dateContainer.style.display === 'block'){
        dateContainer.style.display = 'none'
        if(yearContainer.style.display === 'block'){
          yearContainer.style.display = 'none'
        }
      }else{
        dateContainer.style.display = 'block'
        if(yearContainer.style.display === 'block'){
          yearContainer.style.display = 'none'
        }
      }
    }else{
      yearlyBasis(value)
      if(yearContainer.style.display === 'none'){
        yearContainer.style.display = 'block'
        
        if(dateContainer.style.display === 'block'){
          dateContainer.style.display = 'none'
        }
      }else{
        yearContainer.style.display = 'none'

      }
    }
    
  })
})

function submitButton(value){
  const buttonSubmit = document.querySelector('.btn-submit-sales');
  const dateFrom = document.querySelector('.date-from');
  const dateTo = document.querySelector('.date-to');

  console.log(value);
  // console.log(dateFrom);

  buttonSubmit.addEventListener('click',()=>{
    // console.log(dateFrom.value);
    const startDate = new Date(dateFrom.value);
    const endDate = new Date(dateTo.value)
    if(startDate === '' || endDate === ''){
      Swal.fire({
      icon: "error",
      text: "Please select the dates",
});
    }else if(startDate > Date.now()){
      Swal.fire({
      icon: "error",
      text: "Starting Date is greater than Current date",
});
    }else if(endDate < startDate){
      Swal.fire({
      icon: "error",
      text: `End Date is less than starting date`,
    });
    }else if(startDate.getTime() === endDate.getTime()){
        Swal.fire({
          icon: "error",
          text: "Start date and End date cannot be the same",
        });
      }else{

      chart(value,dateFrom.value,dateTo.value)
    }
  })
}









async function chart(value, dateFrom, dateTo) {
  try {


    // console.log(dateFrom);
    const response = await fetch('/createChart', {
      method: "POST",
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        salesValue: value,
        startDate: dateFrom,
        endDate: dateTo
      })
    });

    if (!response.ok) {
      console.log('error occurred');
      return;
    } else {
      const result = await response.json();
      // console.log('dsfsdfs',result);
      salesData = result;
      basis = value
    }
    if(salesData.length === 0){
      return Swal.fire({
          icon: "error",
          text: "No Sales Found",
        });
    }
    const ctx = document.getElementById('myChart');

    if (myChart) {
      myChart.destroy();  
    }

    myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: salesData.map(item => item._id),
        datasets: [{
          label: 'Total Sales',
          data: salesData.map(item => item.total),
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
   
  } catch (error) {
    console.log(error);
  }
}

function yearlyBasis(value){
  const yearFrom = document.querySelector('.select-year-from');
  const yearTo = document.querySelector('.select-year-to');
  const btn = document.querySelector('.submit-btn-yearly');
  // console.log('akdhf');
  
  
  btn.addEventListener('click',()=>{
    const startYear = Number(yearFrom.value);
    const endYear = Number(yearTo.value);
    // console.log(startYear);
    if (isNaN(startYear) || isNaN(endYear)) {
        Swal.fire({
          icon: "error",
          text: "Please Select the Years Properly",
        });  
    } else if(startYear > endYear){
      Swal.fire({
          icon: "error",
          text: "Starting year greater than Ending year",
        });  
    }else{
      chart(value,startYear,endYear);
    }
  })

}

const pdfBtn = document.querySelector('.pdf-content');
const excelBtn = document.querySelector('.excel-content');

pdfBtn.addEventListener('click',async()=>{
  try{
  // console.log(salesData);
    const response = await fetch('/downloadAsPdf',{
      method : "POST",
      headers :{
        'content-type' : 'application/json'
      },
      body :JSON.stringify({
        salesData,
        basis
      })
    });
    const result = await response.blob();
    const url = window.URL.createObjectURL(result);
    const a= document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `sales-report-${basis} Basis.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  }catch(error){
    console.log(error);
  }

})



excelBtn.addEventListener('click', async () => {
  try {
      const response = await fetch('/downloadAsExcel', {
          method: "POST",
          headers: {
              'content-type': 'application/json'
          },
          body: JSON.stringify({
              salesData,
              basis
          })
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `sales-report-${basis}Basis.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
  } catch (error) {
      console.log(error);
  }
});