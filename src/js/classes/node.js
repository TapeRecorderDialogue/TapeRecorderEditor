//a node is either a conv, line, or conv-set. it can only hold that type and children.

import { toJS } from "knockout"

// Contains conversation, conversationset, and line objects
// conv-set: id (string), conversations (conv[])
// conv: id (string), lines (line[])
// line: words (string), sayer (string)

export var Node = function(type = null, id = null){
    const self = this

    //type, default to line
    this.type = ko.observable((type === 'conv-set') ? 'conv-set' : ((type === 'conv') ? 'conv' : 'line'))
    this.id = ko.observable(id)
    this.values = {
        //for conv-set only
        conversations: ko.observableArray([]),
        //for conv only
        lines: ko.observableArray([]),
        //for line only TODO: Put these in child nodes of line as the id
        sayer: ko.observable(),
        words: ko.observable()

    }
    this.editable = ko.observable(false)

    this.setDataFromConversationSet = function(set){
        if(self.type() !== 'conv-set') throw 'Node is of type ' + self.type() + ', not conv-set'

        self.id(set.id)
        var convs = set.conversations.slice()

        //for every conversation in conversationset
        for(var i = 0; i < convs.length; i++){
            var convNode = new Node('conv', convs[i].id)
            var lines = convs[i].lines.slice()
            
            //for every line in conversation
            for(var j = 0; j < lines.length; j++){
                var lineNode = new Node('line')
                lineNode.values.sayer(lines[j].sayer)
                lineNode.values.words(lines[j].words)
                // convNode.values.lines().push(lineNode)
                convNode.values.lines()[j] = lineNode
                // console.log(j + `: ${lines[j].sayer} says ${lines[j].words}`)
            }
            // self.values.conversations().push(convNode)
            self.values.conversations()[i] = convNode
        }      

    }

    // this.children = ko.observableArray([])
    // this.editable = ko.observable(false)
    
    // //values only for line type
    // this.sayer = ko.observable('')
    // this.words = ko.observable('')

    // this.setNodeValue = function(valueName, newValue){
    //     if(self.valueOfNameExists(valueName)){
    //         // self.values[valueName] = newValue
    //         self[valueName] = newValue
    //         return
    //     }
    //     throw (valueName + 'does not exist for node of type ' + self.type)
    // }

    // this.setID = function(newID){
    //     self.id = newID
    // }

    // //add a conv to the children in a node of type conv-set
    // this.addConversationToSet = function(conv){
    //     //if the node is not of type conv-set, error
    //     // if(!self.isType('conv-set')) throw 'cannot add conversation to node of type ' + self.type

    //     //make the conversations array if it does not exist
    //     // if(!('conversations' in self.values)) self.values.conversations = []

    //     // self.values.conversations.push(conv)

    //     // let newNode = new Node('conv', )
    //     if(!self.isType('conv-set')) throw 'cannot add conversation to node of type ' + self.type
    //     self.addChild(conv)
    //     return self
    // }

    // this.addLineToConversation = function(line){
    //     //if the node is not of type conv-set, error
    //     // if(!isType('conv')) throw 'cannot add line to node of type ' + self.type

    //     //make the conversations array if it does not exist
    //     // if(!('lines' in self.values)) self.values.conversations = []
        
    //     // self.values.lines.push(line)
    //     if(!self.isType('conv')) throw 'cannot add line to node of type ' + self.type
    //     self.addChild(line)
    //     return self
    // }

    // this.addEmptyChild = function(id = 'unnamed node'){
    //     let cT = self.childType(self.type)
    //     if(cT === null) throw 'cannot add child to node of type line'

    //     let n = new Node(cT, id)
    //     self.children.push(n)
    //     return n
    // }

    // this.addChild = function(node){
    //     if(self.type === 'line') throw 'cannot add child to node of type line'
    //     self.children.push(node)
    //     return node
    // }

    // this.setLine = function(sayer, words){
    //     self.type = 'line'
    //     self.sayer = sayer
    //     self.words = words
    // }

    // this.isType = function(type){ return self.type === type }

    // this.childType = function(type){
    //     if(type === 'conv-set') return 'conv'
    //     if(type === 'conv') return 'line'
    //     return null
    // }

    // this.valueOfNameExists = function(valueName) {
    //     return valueName === 'id' 
    //         // || (valueName === 'conversations' && self.isType('conv-set'))
    //         // || (valueName === 'lines' && self.isType('conv'))
    //         || ((valueName === 'words' || valueName === 'sayer') && self.isType('line'))
    // }
}