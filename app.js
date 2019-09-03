// BUDGET CONTROLLER
var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var data = {
        allItems: {
            exp: [],
            inc: []

        },
        total: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.total[type] = sum;
    };

    return {
        addItem: function (type, des, val) {
            var newItem, ID;
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.total.inc - data.total.exp;
            if (data.total.inc > 0) {
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.total.inc);
            });
        },

        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function () {
            return {
                bgt: data.budget,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                pcentage: data.percentage
            };
        }
    };

})();


// UI CONTROLLER
var UIController = (function () {
    var DOMStrings = {
        inputDescription: '.add__description',
        inputType: '.add__type',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeController: '.income__list',
        expenseController: '.expenses__list',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        budgetlabel: '.budget__value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expPerLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function (num, type) {
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        dec = numSplit[1];

        if (int.length > 3)
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);

        return (type === 'inc' ? '+ ' : '- ') + int + '.' + dec;

    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
                type: document.querySelector(DOMStrings.inputType).value
            };
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;

            if (type === 'inc') {
                element = DOMStrings.incomeController;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expenseController;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearfields: function () {
            var fields, fieldArray;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            fieldArray = Array.prototype.slice.call(fields);

            fieldArray.forEach(function (current, index, array) {
                current.value = "";
            });
            fieldArray[0].focus();
        },

        displayBudget: function (obj) {
            var type;
            obj.bgt >= 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMStrings.budgetlabel).textContent = formatNumber(obj.bgt, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if (obj.pcentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.pcentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }

        },

        displayPerCentages: function (percentages) {
            var fields = document.querySelectorAll(DOMStrings.expPerLabel);

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayDate: function () {
            var now, month, year, months;

            now = new Date();

            months = ['Jnauary', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function () {
            var fields = document.querySelectorAll(DOMStrings.inputType + ',' + DOMStrings.inputDescription + ',' + DOMStrings.inputValue);

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },

        getDOMStrings: function () {
            return DOMStrings;
        }

    };

})();

//GLOBAL CONTROLLER
var appController = (function (bgtCtrl, UICtrl) {

    var DOM = UICtrl.getDOMStrings();
    var setupEventListener = function () {
        document.querySelector(DOM.inputBtn).addEventListener('click', controlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                controlAddItem();
            }

        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function () {
        bgtCtrl.calculateBudget();

        var budget = bgtCtrl.getBudget();

        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function () {

        bgtCtrl.calculatePercentages();

        var percentages = bgtCtrl.getPercentages();

        UICtrl.displayPerCentages(percentages);
    };

    var controlAddItem = function () {
        var input, newItem;

        input = UICtrl.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            newItem = bgtCtrl.addItem(input.type, input.description, input.value);

            UICtrl.addListItem(newItem, input.type);

            UICtrl.clearfields();

            updateBudget();

            updatePercentages();
        }

    };

    var ctrlDeleteItem = function (event) {
        var itemId, splitId, type, ID;

        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemId) {
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);

            bgtCtrl.deleteItem(type, ID);

            UICtrl.deleteListItem(itemId);

            updateBudget();

            updatePercentages();
        }

    };

    return {
        init: function () {
            console.log('Application is started');
            UICtrl.displayBudget({
                bgt: 0,
                totalInc: 0,
                totalExp: 0,
                pcentage: -1
            });
            setupEventListener();
            UICtrl.displayDate();
        }
    }
})(budgetController, UIController);

appController.init();
