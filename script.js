(function(window, undefined) {
    class calculator {
        constructor(calculatorElem, options) {
            this.totals  = 0;
            this.screen = ''; 
            this.arrScreen = [];
            this.operators = {
                '+': {type: 'operator', display: '+', do: this.add.bind(this)}, 
                '-': {type: 'operator', display: '-', do: this.subtract.bind(this)}, 
                '*': {type: 'operator', display: '*', do: this.multiply.bind(this)}, 
                '/': {type: 'operator', display: '/', do: this.divide.bind(this)},
                '=': {type: 'operator', display: '=', do: this.equals.bind(this)}
            };

            this.options = {
                
                operators: this.operators, 

                handleNumPad : (function(e) {
                    const buttonType = e.target.getAttribute('data-type'); 
                    const value = e.target.textContent.trim(); 

                    this.updateScreen({type: buttonType, display: value}); 
                    
                    return false; 
                }).bind(this),

                handleControlPad: (function(e) {

                    if (e.target.getAttribute('data-type') === 'operator') {
                        this.updateScreen(this.operators[e.target.textContent.trim()]);   
                    }

                    return false; 
                }).bind(this), 

                handleKeyboardDown: (function(e) {
                        if (this.operators[e.key]) {
                            this.updateScreen(this.operators[e.key]);
                        } else if(e.key === '.') { 
                            this.updateScreen({type: 'decimal', display: '.'});
                        } else if (e.key === 'Backspace') {
                            this.updateScreen({type: 'clear', display: ''});
                        } else if (!isNaN(parseInt(e.key))) {
                            this.updateScreen({type: 'numeral', display: e.key});
                        }
                }).bind(this), 
                ...options
            };

            this.calc = document.querySelector(calculatorElem || '#calculator'); 
            this.controlPad = this.calc.querySelector(this.options?.controlPad || '#control_pad'); 
            this.numPad = this.calc.querySelector(this.options?.numPad || '#num_pad');
            this.screenElem = this.calc.querySelector(this.options?.screenSelector || '#screen');
            this.screenError = this.calc.querySelector(this.options?.errorSelector || '#error');


            this.controlPad.addEventListener('click', this.options?.handleControlPad);
            this.numPad.addEventListener('click', this.options?.handleNumPad);
            document.addEventListener('keydown', his.options?.handleKeyboardDown);  
            this.resetAll(); 
            
        }

        //helpers
        
        removeLast(noReset=false) {
            this.arrScreen.pop(); 
            if (this.arrScreen.length === 0 && !noReset) {
                this.resetAll(); 
                return true;   
            }

            this.updateScreenFromArr(this.arrScreen);  
            
        }

        resetAll() { 
            this.arrScreen = []; 
            this.screen = '';
            this.logError = ''; 
            this.updateScreen({type: 'numeral', display:'0', initial:true});  
        }

        logError(msg) { 
            this.screenError.textContent = msg; 
        }

        evaluate(arrScreen) { 
            const opIndx = arrScreen.findIndex((op, i) => op.type === 'operator');
            const num1Arr = arrScreen.slice(0, opIndx); 
            const num2Arr = arrScreen.slice(opIndx + 1);
            
            const op = arrScreen[opIndx]; 
            const num1Char = num1Arr.map((n) => n.display).join(''); 
            const num2Char = num2Arr.map((n)=> n.display).join(''); 

            const num1 = isNaN(parseFloat(num1Char)) ? 0 : parseFloat(num1Char); 
            const num2 = isNaN(parseFloat(num2Char)) ? 0 : parseFloat(num2Char);

            const result = op.do(num1, num2);

            this.resetAll(arrScreen); 
            this.updateScreen({type: 'numeral', display:result, istotal:true});
            
        }

        hasOperator(arrScreen) { 
            return arrScreen.filter((item)=> item.type === 'operator').length === 1; 
        }

        updateScreenFromArr(arrScreen) {
            const value = arrScreen.map((t) => {
                if (t.type === 'operator') {
                    return ` ${t.display} `; 
                } else {
                    return t.display; 
                }
            }).join(''); 

            this.screen = value; 
            
        }

        updateScreen(value) {
            console.log(value); 

            switch (value.type) { 
                case 'operator': 
                    this.updateOperator(value); 
                    break; 

                case 'numeral': 
                    if (this.arrScreen.length === 1 && this.arrScreen[0]?.initial) {
                        this.removeLast(true); 
                    }

                    this.updateNumeral(value);
                    
                    break; 

                case 'decimal':
                    this.updateDecimal(); 
                    break; 

                case 'allclear': 
                    this.allClear();
                    break; 

                case 'clear': 
                    this.clear(); 
                    break; 

                default: 
                break; 

            }

            this.screenElem.textContent = this.screen; 
        }
        
        //operations

        add(a,b) { 
            return a + b;
        }

        subtract(a,b) {
            return a - b;
        }

        multiply(a,b) {
            return a * b; 
        }

        divide(a,b) {
            if (b === 0) {
                alert("Dude! It's totally undefined. Seriously!"); 
                this.allClear();

                this.logError('Error-Division by zero (0)');
                return 'Error';
            }

            return a / b;
        }

        equals() { 
            this.evaluate(this.arrScreen); 
        }

        clear() {
            this.removeLast(); 
        }

        allClear() {
            this.resetAll(); 
        }

        updateNumeral(numeral) { 
            if (this.arrScreen.length === 1 && this.arrScreen[0]?.istotal) {
                this.allClear(); 
            }

            if (this.arrScreen.length === 0 && numeral.display === '0') {
                numeral.initial = true; 
            }

            this.arrScreen.push(numeral);
            this.screen += `${numeral.display}`; 
        }

        updateOperator(operator) { 
            const secOp = operator; 

            if (operator.display === '=') {
                operator.do(); 
                return true; 
            }

            if (this.hasOperator(this.arrScreen) && this.arrScreen[this.arrScreen.length-1]?.type === 'operator') {
                this.arrScreen.pop();
                this.updateScreenFromArr(this.arrScreen);  
            } else if (this.hasOperator(this.arrScreen)) {
                this.equals();
            }


            this.arrScreen.push(operator);
            this.screen += ` ${operator.display}`;
        }

        updateDecimal() { 
            this.arrScreen.push({type: 'period', display:'.'}); 
            this.screen += '.'; 
        }


    }

    window.calculator = calculator; 
})(window)

 