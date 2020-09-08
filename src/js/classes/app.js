import { data } from './data'
import {Conversation, Line, ConversationSet} from './objects'
import { Node } from './node'

export var App = function(name, version){
    const self = this

    this.name = ko.observable(name)
    this.data = data

    //all nodes, which contains conv-set/conv/line and other values. Used for knockout/display. Is created from sets when a json file is loaded, is where changes are stored until save.
    //data from allNodes is stored into app.sets, with information that isn't important removed
    this.allNodes = ko.observableArray([])
    //all the conversation sets. This is what is saved/loaded
    this.sets = []

    this.getAllNodes = function(){ return self.allNodes() }

    // var testSet = new ConversationSet("helloSet", [new Conversation("conv1", [new Line("words 1234!?<>{}()", "me"), new Line("asdf", "jkl")])])
    // var testSet = new Node('conv-set', {id: 'set', conversations: new Node('conv', {id: 'conv', lines: new Node('line', {sayer: 'me', words: 'hello world'})})})
    // let testSet = new Node('conv-set', 'Set2') 
    // let conv = new Node('conv', 'Greetings2')
    // let l = new Node()
    
    // l.setLine('Person B', 'world Hello')
    // console.log(l.values.sayer)
    // conv.addLineToConversation(l)
    // testSet.addConversationToSet(conv)

    let testSet = new ConversationSet("Set2")
    let l = new Line("Person", "Hello world")
    let c = new Conversation("Conv 1", [l])
    testSet.addConversation(c)
    self.sets.push(testSet)

    let n = new Node('conv-set')
    n.setDataFromConversationSet(this.sets[0])

    self.allNodes().push(n)

    this.run = function(){

        data.app = self
        data.app.allNodes = self.allNodes
        data.app.sets = self.sets
        data.doSetup()

        //on double click, make editable. when click away, make not editable
        // $('.node-element').each(function(){
        //     this.addEventListener('dblclick', function(){
        //         console.log("dblclick")
        //     })
        //     this.addEventListener('blur', function(){
        //         console.log("blur")
        //     })
        // }) 
        console.log("events")
        // $('.node-element').on('click', function(){
        // $('.node-element').click(function(){
        //     console.log("clicked")
        //     ko.dataFor(this).editable = true
        //     // ko.contextFor(this).$parent.allNodes()
        // })
        // $('.node-element').on('blur', function(){
        //     ko.dataFor(this).editable = false
        // })


        // bindings for making content editable
        // ko.bindingHandlers.htmlLazy = {
        //     update: function (element, valueAccessor) {
        //         var value = ko.unwrap(valueAccessor());
                
        //         if (!element.isContentEditable) {
        //             element.innerHTML = value;
        //             console.log('lazy done')
        //         }
        //     }
        // };
        // ko.bindingHandlers.contentEditable = {
        //     init: function (element, valueAccessor, allBindingsAccessor) {
        //         var value = ko.unwrap(valueAccessor()),
        //             htmlLazy = allBindingsAccessor().htmlLazy;
                
        //         $(element).on("input", function () {
        //             if (this.isContentEditable && ko.isWriteableObservable(htmlLazy)) {
        //                 htmlLazy(this.innerHTML);
        //             }
        //         });
        //     },
        //     update: function (element, valueAccessor) {
        //         var value = ko.unwrap(valueAccessor());
                
        //         element.contentEditable = value;
                
        //         if (!element.isContentEditable) {
        //             $(element).trigger("input");

                    
        //             console.log("ok done")
        //         }
        //     }
        // };      

        $(document).on('dblclick', '.node-id', function(){
            console.log("clicked")
            // console.log("edit? " + self.sets()[0].editable())
            // $(".node-element").blur()
            ko.dataFor(this).editable(true)
            // ko.contextFor(this).contentEditable = true
        })
        $(document).on('blur', '.node-id', function(){
            console.log("left")
            ko.dataFor(this).editable(false)
            // ko.contextFor(this).contentEditable = false
        })

        $('#app').show()
        ko.applyBindings(self, $('#app')[0])

        let event = new CustomEvent('tapeReady')
        event.app = self
        window.parent.dispatchEvent(event)

        console.log(self.sets[0].get(0).id)
        console.log(self.allNodes()[0].id())
    }

    
}