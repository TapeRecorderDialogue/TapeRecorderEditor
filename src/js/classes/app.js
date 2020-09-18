import { data } from './data'
import { Node } from './node'

export var App = function(name, version){
    const self = this

    this.name = ko.observable(name)
    this.data = data

    //Array of all nodes (conv-sets/convs/lines)
    this.allNodes = ko.observableArray([])

    // metadata
    this.meta = {
        // the variables that a line stores, defaults to (sayer + words)
        // key: name
        // value: "string/bool/number"
        lineValues: {sayer: "string", words: "string"},

        // order that linevalues are displayed
        lineValuesOrder: ["sayer", "words"],

        // whether or not lineValues can be changed (add/remove a value)
        // make false to lock in the lineValues as to not accidently change them
        lineValuesChangeable: true
    }

    //the current conversation being viewed
    this.visibleConversation = ko.observable()

    //the current node being edited
    this.editingNode = null


    //<test code>

    let n1 = new Node('conv-set', 'Set1')
    n1.conversations.push(new Node('conv', 'Conv 1'))
    let l1 = new Node('line')
    l1.lineValues.sayer = ko.observable("Person")
    l1.lineValues.words = ko.observable("Hello")
    n1.conversations()[0].lines.push(l1)

    self.allNodes.push(n1)

    //</>



    this.setupCustomBindingHandlers = function(){
        // ko.bindingHandlers.lineNode = {
        //     init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        //         var value = valueAccessor()
        //         var unwrappedValue = ko.unwrap(value)

        //         allBindings.bind("with", "$data")
                
        //         alert('init')

        //         for(const key of Object.keys(self.meta.lineValues)){
        //             //make a new table entry
        //             var $new = document.createElement("td")
        //             $new.className = "editable-node-input"
        //             console.log(unwrappedValue)
        //             console.log(bindingContext.$data)
        //             $(element).append($new)
        //             $new.setAttribute("data-bind", `textInput: $data.lineValues.${key}`)
        //             ko.applyBindings(self, $($new)[0]);
        //         }
                
        //     },
        //     update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        //         // var value = valueAccessor()
        //         // var unwrappedValue = ko.unwrap(value)
        //         // alert('update')
        //         // for(const key of Object.keys(self.meta.lineValues)){
        //         //     //make a new table entry
        //         //     var $new = document.createElement("td")
        //         //     $new.className = "editable-node-input"
        //         //     $new.setAttribute("data-bind", "textInput: $data().lineValues." + key)
        //         //     $(element).append($new)
        //         // }

        //     }
        // }
        // console.log("added bindings " )
    }

    this.run = function(){

        data.app = self
        data.app.allNodes = self.allNodes
        data.doSetup()

        self.setupCustomBindingHandlers()


        //double click: allow editing of name of node
        //single click: set current conversation    
        $(document).on('dblclick', '.editable-node-display', function(){
            $('.editable-node-input').trigger('blur')
            self.editingNode = $(this).parents('.editable-node')[0]
            ko.dataFor(this).editable(true)
            setTimeout(function(){$(self.editingNode).find('.editable-node-input').trigger('focus')})
        })
        $(document).on('blur', '.editable-node-input', function(){
            console.log('blur')
            if(self.editingNode === $(this).parents('editable-node')[0]){
                self.editingNode = null
            }
            ko.dataFor(this).editable(false)
            data.checkNoRepeatingIDs()
        })
        $(document).on('click', '.conversation-node', function(){
            self.visibleConversation(ko.dataFor(this))
            // self.visibleConversation = ko.dataFor(this)
        })

        //expand/collapse
        $(document).on('click','.expand-collapse', function(){
            let ex = ko.dataFor(this).expanded
            $(this).removeClass(ex() ? 'collapse' : 'expand')
            $(this).addClass(ex() ? 'expand' : 'collapse')
            ex(!ex())
        })
        $('.expand-collapse').addClass('collapse')

        //+ button (add node)
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
        })


        $('#app').show()
        ko.applyBindings(self, $('#app')[0])

        let event = new CustomEvent('tapeReady')
        event.app = self
        window.parent.dispatchEvent(event)
    }

    this.addNodeTo = function(array, type){
        array.push(new Node(type, 'new'))
    }
    this.insertNodeAt = function(array, index, type){
        array.splice(index, 0, new Node(type))
    }

    
}