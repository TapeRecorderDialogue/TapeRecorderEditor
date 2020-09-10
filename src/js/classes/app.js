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

    //the current conversation being viewed
    this.visibleConversation = ko.observable()

    //the current node being edited
    this.editingNode = null


    //<test code>

    let testSet = new ConversationSet("Set2")
    let l = new Line("Person", "Hello world")
    let l2 = new Line("Person2", "asdf")
    let c = new Conversation("Conv 1", [l, l2])
    testSet.addConversation(c)
    self.sets.push(testSet)
    console.log("in app, " + testSet.conversations[0].lines[1].sayer)

    let n = new Node('conv-set')
    n.setDataFromConversationSet(this.sets[0])

    self.allNodes().push(n)

    //</>

    this.run = function(){

        data.app = self
        data.app.allNodes = self.allNodes
        data.app.sets = self.sets
        data.doSetup()

        //double click: allow editing of name of node
        //single click: set current conversation    
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
        })
        $(document).on('click', '.conversation-node', function(){
            console.log(ko.dataFor(this).id())
            self.visibleConversation(ko.dataFor(this))
            // self.visibleConversation = ko.dataFor(this)
        })


        $('#app').show()
        ko.applyBindings(self, $('#app')[0])

        let event = new CustomEvent('tapeReady')
        event.app = self
        window.parent.dispatchEvent(event)
    }

    
}