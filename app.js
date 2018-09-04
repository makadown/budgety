// BUDGET CONTROLLER
var budgetController = (function() {

    // Some code

})();

// UI CONTROLLER
var UIController = (function() {
    // some code
})();


// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UIctrl) {

    var ctrlAddItem = function() {
        // 1. Get the field input data

        // 2. Add the item to the budget controller

        // 3. Add the new item to the UI

        // 4. Calculate de budget

        // 5. Display the budget on the UI
        console.log('It works!');
    };

    document.querySelector('.add__btn').addEventListener('click', ctrlAddItem);

    // al hacer click en cualquier parte del documento
    document.addEventListener('keypress', function(event) {

        if (event.keyCode === 13 || event.which === 13) {
            ctrlAddItem();
        }

    });

})(budgetController, UIController);