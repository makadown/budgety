// BUDGET CONTROLLER
var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round( (this.value / totalIncome) * 100);
        } else { this.percentage = -1; }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
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
            } else { ID = 0; }

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

        deleteItem: function(type, id) {
           // console.log('Deleting ' + type + ' id ' + id);
            var ids, index;

            // id = 6
            // data.allItems[type][id];
            // ids = [1 2 4 6 8]
            // index = 3

             ids = data.allItems[type].map( function(current) {
                 return current.id; 
             });

             index = ids.indexOf(id);
             if (index !== -1 ) {
                data.allItems[type].splice(index, 1);
             }
        },

        calculateBudget: function() {

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {

            /* a=20, b=10, c=40 con income = 100, mostrar a=20/100; b=10/100 y c=40/100 */
            data.allItems.exp.forEach( function(cur) {
                cur.calcPercentage(data.totals.inc); 
            });

        },

        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPercentages;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        }
    };

})();

// UI CONTROLLER
var UIController = (function() {

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel : '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function (num, type) {
        var numSplit, myInt, myDec, sign;
        /* Reglas de interfaz:
            + o - antes del numero 
            exactamente  2 puntos decimales
            coma separando los miles.

            ej.
            2310.4567 -> 2,310.46
            2000 -> 2,000.00
         */
        num = Math.abs(num);
        num = num.toFixed(2);
        
        numSplit = num.split('.');
        myInt = numSplit[0];
        if (myInt.length>3) {
            var pos = myInt.length-3;
            myInt = myInt.substr(0, pos) + ', ' + myInt.substr(pos, 3) ;
        }
        myDec = numSplit[1];
        sign = ( type === 'exp'? '-' : '+');
        return sign + ' ' + myInt + '.' + myDec;
    };

    var nodeListForEach = function(list, callback){

        for (var i=0; i< list.length; i++) {
            callback(list[i], i); // IMPORTANTE estudiar aquí el uso del callback.
        }
    };

    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {

            /* el obj puede ser tipo Expense o Income */
            var html, element;

            // create html string with placeholder texts
            if (type === 'inc') {
                element = this.getDOMStrings().incomeContainer;
                html =
                    '<div class="item clearfix" id="inc-%id%">' +
                    '<div class="item__description">%description%</div>' +
                    '<div class="right clearfix">' +
                    '<div class="item__value"> %value%</div>' +
                    '<div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
            } else if (type === 'exp') {
                element = this.getDOMStrings().expensesContainer;
                html =
                    '<div class="item clearfix" id="exp-%id%">' +
                    '<div class="item__description">%description%</div>' +
                    '<div class="right clearfix">' +
                    '<div class="item__value"> %value%</div>' +
                    '<div class="item__percentage">21%</div>' +
                    '<div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
            }

            // replace the placeholder texts with data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // insert html into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function(selectorId) {

            var el = document.getElementById(selectorId);

            /* To remove child.
                check this reference: https://blog.garstasio.com/you-dont-need-jquery/dom-manipulation/ */
            el.parentNode.removeChild(el);

        },

        clearFields: function() {

            var fields, fieldsArray;

            fields = document.querySelectorAll(this.getDOMStrings().inputDescription + ',' +
                this.getDOMStrings().inputValue);

            fieldsArray = Array.prototype.slice.call(fields);

            /* Es mejor usar Arrays que listas porque las primeras tienen funcionalidades que nos
            facilitan la vida , por eso usamos el prototipo del Array en lugar de fields.slice() */
            fieldsArray.forEach((currentElement, index, fullArray) => {
                currentElement.value = '';
            });

            fieldsArray[0].focus();
        },

        displayBudget: function(obj) {
            var type = obj.budget > 0 ? type = 'inc' : 'exp';
            document.querySelector(this.getDOMStrings().budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(this.getDOMStrings().incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(this.getDOMStrings().expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(this.getDOMStrings().percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(this.getDOMStrings().percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index){

                if (percentages[index]>0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.context = '---';
                }

            });

        },

        displayMonth: function() {
            // One line solution:
            document.querySelector(DOMStrings.dateLabel).textContent = 
                new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); 

           /* // Custom solution, if you want to add a comma before the year...
           var now, month, year;
           now = new Date();
           months = ['Jan', 'Feb', 'Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
           month = now.getMonth();
           year = now.getFullYear();
           document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ', ' + year;
           */
        },

        changedType: function() {
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' + 
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
            );

            nodeListForEach( fields, function(cur){
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMStrings.inputButton).classList.toggle('red');
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

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UIctrl.changedType);
    };

    var updateBudget = function() {
        // 1. Calcular presupuesto.
        budgetController.calculateBudget();
        // 2. Regresar presupuesto.
        var budget = budgetController.getBudget();
        // 3. Mostrar presupuesto en IU.
        UIController.displayBudget(budget);
    };

    var updatePercentages = function() {
        // 1. Calcular porcentajes
        budgetController.calculatePercentages();
        // 2. Leer porcentajes del controlador de presupuesto.
        var percentages = budgetController.getPercentages();
        // 3. Actualizar el UI con los nuevos porcentajes.
        UIctrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function() {
        var input, newItem;
        // 1. Get the field input data
        input = UIController.getInput();

        if (!isNaN(input.value) && input.description !== "" && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value);

            // 3. Add the new item to the UI
            UIController.addListItem(newItem, input.type);

            // 4. Clear the fields
            UIctrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calcular y actualizar porcentajes.
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitId,type,id;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            // inc-1
            splitId = itemID.split('-');
            type = splitId[0];
            id = parseInt( splitId[1]);
            
            // 1. delete item from data structure.
            budgetCtrl.deleteItem(type,id);

            // 2. delete item from user interface
            UIController.deleteListItem(itemID);

            // 3. update and show new budget
            updateBudget();

            // 4. Calcular y actualizar porcentajes.
            updatePercentages();
        }
    };

    return {
        init: function() {
            console.log('Application has started.');
            UIctrl.displayMonth();
            UIctrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });            
            setupEventListeners();
        }
    };

})(budgetController, UIController);


controller.init();