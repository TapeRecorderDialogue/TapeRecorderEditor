import { data } from './data'
import { Node } from './node'
import { LimitedStack } from './objects'
import { Input } from './input'

export var App = function(name, version){
    const self = this

    // not the file name
    this.name = ko.observable(name)
    this.data = data

    // file name, which is a node for convenience
    this.fileName = ko.observable(new Node(" ", "Untitled"))

    this.input = new Input(this)

    //Array of all nodes (conv-sets/convs/lines)
    this.allNodes = ko.observableArray([])

    // metadata
    this.meta = {
        // the variables that a line stores, defaults to (speaker + words)
        // key: name
        // value: typeof, "string/bool/number"
        lineValues: {speaker: "string", words: "string"},

        // order that linevalues are displayed
        // lineValuesOrder: ["speaker", "words"],
        lineValuesOrder: ko.observableArray(["speaker", "words"]),

        // whether or not lineValues can be changed (add/remove a value)
        // make false to lock in the lineValues as to not accidently change them
        lineValuesChangeable: true
    }

    //the current conversation being viewed
    this.visibleConversation = ko.observable()

    //the current node being edited
    this.editingNode = null

    // history of changes
    this.history = new LimitedStack(16)


    //<test code>

    // let n1 = new Node('conv-set', 'Set1')
    // n1.conversations.push(new Node('conv', 'Conv 1'))
    // let l1 = new Node('line')
    // l1.lineValues.speaker = ko.observable("Person")
    // l1.lineValues.words = ko.observable("Hello")
    // n1.conversations()[0].lines.push(l1)

    // self.allNodes.push(n1)

    //</>


    this.run = function(){

        data.app = self
        data.app.allNodes = self.allNodes
        data.doSetup()
        
        self.input.keyboardEvents()

        self.jquerySetup()

        $('#app').show()
        ko.applyBindings(self, $('#app')[0])

        let event = new CustomEvent('tapeReady')
        event.app = self
        window.parent.dispatchEvent(event)
    }

    // this.koBindingsAndComputedSetup = function(){

    // }

    this.jquerySetup = function(){
        // Restricts input for each element in the set of matched elements to the given inputFilter.
        (function($) {
            $.fn.inputFilter = function(inputFilter, selector) {
            // return $(document).on("input keydown keyup mousedown mouseup select contextmenu drop", this, function() {
            return $(document).on("input keydown keyup mousedown mouseup select contextmenu drop", selector, function() {
                if (inputFilter(this)) {
                this.oldValue = this.value;
                this.oldSelectionStart = this.selectionStart;
                this.oldSelectionEnd = this.selectionEnd;
                } else if (this.hasOwnProperty("oldValue")) {
                this.value = this.oldValue;
                this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
                } else {
                this.value = "";
                }
            });
            };
        }($));

        // double click: allow editing of name of node
        // single click: set current conversation    
        $(document).on('dblclick', '.editable-node-display', function(){
            $('.editable-node-input').trigger('blur')
            self.editingNode = $(this).parents('.editable-node')[0]
            ko.dataFor(this).editable(true)
            setTimeout(function(){$(self.editingNode).find('.editable-node-input').trigger('focus')})
        })
        $(document).on('blur', '.editable-node-input', function(){
            if(self.editingNode === $(this).parents('editable-node')[0]){
                self.editingNode = null
            }
            ko.dataFor(this).editable(false)
            data.checkNoRepeatingIDs()

            self.madeChange()
        })
        $(document).on('click', '.conversation-node', function(){
            self.visibleConversation(ko.dataFor(this))
            // self.visibleConversation = ko.dataFor(this)
        })

        // expand/collapse
        $(document).on('click','.expand-collapse', function(){
            let ex = ko.dataFor(this).expanded
            ex(!ex())
        })

        // + button (add node)
        $(document).on('click', '.add-node', function(){
            if($(this).hasClass('conv-set')){
                self.addNodeTo(self.allNodes, 'conv-set')
            }
            else if($(this).hasClass('conv')){         
                self.addNodeTo(ko.contextFor(this).$data.conversations, 'conv')
            }
            else if($(this).hasClass('line')){
                self.addNodeTo(self.visibleConversation().lines, 'line')
            }
            data.checkNoRepeatingIDs()
            self.madeChange()
        })

        // x button (delete node)
        $(document).on('click', '.delete-node', function(){
            let ctx = ko.contextFor(this)
            ctx.$parentContext.$rawData.splice(ctx.$index(), 1)
            data.checkNoRepeatingIDs()
            self.madeChange()
        })

        // adding line values
        $(document).on('click', '#add-line-string', function(){
            self.createAddLineValuePopup('string')
        })
        $(document).on('click', '#add-line-number', function(){
            self.createAddLineValuePopup('number')
        })
        $(document).on('click', '#add-line-boolean', function(){
            // self.createAddLineValuePopup('boolean')
        })

        // deleting line values
        $(document).on('click', '.delete-line-value', function(){
            let lineValueName = self.meta.lineValuesOrder()[ko.contextFor(this).$index()]
            console.log("remove " + lineValueName)
            self.createDeleteLineValuePopup(lineValueName)
        })

        // check that input in line values matches the type
        $('.line-input').inputFilter(function(element){
            let value = element.value
            let type = self.meta.lineValues[ko.contextFor(element).$data]

            // is float/int?
            if(type === "number" && /^-?\d*[.]?\d*$/.test(value)) return true
            if(type === "string") return true

            return false
        }, '.line-input')
    }


    this.addNodeTo = function(array, type){
        console.log(`adding ${type}`)
        array.push(new Node(type, 'new'))
    }
    this.insertNodeAt = function(array, index, type){
        array.splice(index, 0, new Node(type))
    }

    // clear undo/redo history and make snapshot
    this.onFileFirstLoaded = function(){
        self.madeChange()
    }

    // creates a popup window
    // title: title of window
    // content: body content, text only
    // appends: array, where each element is ['jquerySelector', 'htmlContent']
    // otherAdditions: function to be run at end
    this.createPopup = function(title = "Title", content = "Body", appends = undefined, otherAdditions = undefined){
        // show window
        $('.center-popup').toggleClass('show')

        // title
        $('#center-popup-title').text(title)

        // remove body content
        $('#center-popup-content').empty()

        $('#center-popup-content').text(content)

        if(appends != undefined){
            appends.forEach(append => {
                $(append[0]).append(append[1])
            })
        }

        if(otherAdditions != undefined){
            otherAdditions()
        }
    }

    // popup in center that asks for input
    this.createAddLineValuePopup = function(type){
        if(!self.meta.lineValuesChangeable){
            alert("Adding and removing line values is disabled on this file. To enable, go into your .json file and change meta.lineValuesChangeable to True")
            return
        }
        // remove listeners on these buttons
        $(document).off('click', '#add-line-value-ok')
        $(document).off('click', '#add-line-value-cancel')

        this.createPopup(`Adding a ${type} line value`, null, 
        [
            ['#center-popup-content', '<div>Name of new value: <input id="add-line-value-input" type="text"></input></div>'], 
            ['#center-popup-content', '<button id="add-line-value-ok">Ok</button>'], 
            ['#center-popup-content', '<button id="add-line-value-cancel">Cancel</button>']
        ], 
        function(){
            $(document).on('click', '#add-line-value-ok', function(){
                if(self.addLineValue(type, $("#add-line-value-input").val())){
                    $('.center-popup').toggleClass('show', false)
                }
            })
            $(document).on('click', '#add-line-value-cancel', function(){
                $('.center-popup').toggleClass('show', false)
            })
        })
    }

    // popup with confirm/cancel button
    this.createDeleteLineValuePopup = function(name){
        if(!self.meta.lineValuesChangeable){
            alert("Adding and removing line values is disabled on this file. To enable, go into your .json file and change meta.lineValuesChangeable to True")
            return
        }
        // remove listeners on these buttons
        $(document).off('click', '#add-line-value-ok')
        $(document).off('click', '#add-line-value-cancel')

        this.createPopup(`Delete ${name} from all conversations?`, 'Are you absolutely sure?',         
        [ 
            // using add-line-value buttons just to avoid writing more css
            ['#center-popup-content', '<button id="add-line-value-ok">Ok</button>'], 
            ['#center-popup-content', '<button id="add-line-value-cancel">Cancel</button>']
        ], 
        function(){
            $(document).on('click', '#add-line-value-ok', function(){
                self.removeLineValue(name)
                $('.center-popup').toggleClass('show', false)
            })
            $(document).on('click', '#add-line-value-cancel', function(){
                $('.center-popup').toggleClass('show', false)
            })
        })
    }

    this.addLineValue = function(type, name){
        // invalid if has whitespace
        let invalid = /\s/

        // if a line value of this name already exists, don't set
        if(self.meta.lineValues[name] != null){
            $('#center-popup-toast').text(`Line Value of name ${name} already exists.`)
            return false
        }
        // if invalid characters
        if(invalid.test(name)){
            $('#center-popup-toast').text(`Invalid name, do not use whitespace`)
            return false
        }

        self.meta.lineValues[name] = type
        self.meta.lineValuesOrder.push(name)
        self.data.addLineValuesToAllNodes(name)
        
        self.madeChange()

        return true

    }

    this.removeLineValue = function(name){
        // remove from metadata
        // self.meta.lineValues[name] = undefined
        delete self.meta.lineValues[name]
        self.meta.lineValuesOrder.remove(name)
        // remove from all nodes
        self.data.removeLineValuesFromAllNodes(name)
 
        self.madeChange()
    }

    this.madeChange = function(){    
        // self.history.push(self.snapshot())
        self.history.pushAndClearFuture(self.snapshot())
    }

    // deep copy all sets
    this.snapshot = function(){
        let s = []
        self.allNodes().forEach(set => {
            s.push(set.deepCopy())
        })
        return s
    }

    this.undo = function(){
        let state = self.history.cycleSafe(-1)
        if(state != undefined){
            self.allNodes(state)
        }
    }

    this.redo = function(){
        let state = self.history.cycleSafe(1)
        if(state != undefined){
            self.allNodes(state)
        }
    }
    
}