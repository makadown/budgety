// BUDGET CONTROLLER
var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            // [1, 2, 3, 4], next ID = 6
            // [1, 2, 4, 6, 8], next ID = 9
            // ID = last ID + 1

            // Create new id
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else { ID = 1; }
            // create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push it to ouw new data structure
            data.allItems[type].push(newItem);

            // return new element
            return newItem;
        },
        testing: function() {
            console.log(data);
        }
    };

})();

// UI CONTROLLER
var UIController = (function() {

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn'
    };
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: document.querySelector(DOMStrings.inputValue).value
            };
        },
        getDOMStrings: function() {
            return DOMStrings;
        }
    };
})();


// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UIctrl) {

    var setupEventListeners = function() {

        var DOM = UIctrl.getDOMStrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
        // al hacer click en cualquier parte del documento
        document.addEventListener('keypress', function(event) {

            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }

        });
    };

    var ctrlAddItem = function() {
        var input, newItem;
        // 1. Get the field input data
        input = UIController.getInput();

        // 2. Add the item to the budget controller
        newItem = budgetController.addItem(input.type, input.description, input.value);

        // 3. Add the new item to the UI

        // 4. Calculate de budget

        // 5. Display the budget on the UI
    };

    return {
        init: function() {
            console.log('Application has started.');
            setupEventListeners();
        }
    };

})(budgetController, UIController);


controller.init();