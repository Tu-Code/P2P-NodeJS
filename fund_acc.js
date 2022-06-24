const paymentForm = document.getElementById('paymentForm');

console.log("Working")
paymentForm.addEventListener("submit", payWithPaystack, true);

function payWithPaystack() {

  // e.preventDefault();
  let handler = PaystackPop.setup({
    key: 'pk_test_f1bdf35e9e5ab3f840a73caaeefe6b6de5ed387d', // Replace with your public key
    email: document.getElementById("email").value,
    amount: document.getElementById("amount").value * 100,
    ref: ''+Math.floor((Math.random() * 1000000000) + 1), // generates a pseudo-unique reference. Please replace with a reference you generated. Or remove the line entirely so our API will generate one for you
    // label: "Optional string that replaces customer email"
      onClose: function(){
      alert('Window closed.');
    },

    callback: function(response){

      $.ajax({
        type: "POST",
        url: '/fund_account',
        data: {amount:amount , reference: response.reference},
        success: function(response){
          let message = 'Payment complete! Reference: ' + response.reference;
          alert(message);
          console.log('check from JS')
        } 
      });
      
    }
    
  });
  
  handler.openIframe();
}