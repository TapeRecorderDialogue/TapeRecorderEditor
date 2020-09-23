//a node is either a conv, line, or conv-set. it can only hold that type and children.

import { toJS } from "knockout"

// Contains conversation, conversationset, and line objects
// conv-set: id (string), conversations (conv[])
// conv: id (string), lines (line[])
// line: lineValues (custom vars)


export var Node = function(type = null, id = null){
    const self = this

    //type, default to line
    this.type = ko.observable((type === 'conv-set') ? 'conv-set' : ((type === 'conv') ? 'conv' : 'line'))
    this.id = ko.observable(id)

    //for conv-set only
    this.conversations = ko.observableArray([]),
    //for conv only
    this.lines = ko.observableArray([]),
    //for line only
    this.lineValues = {
        // sayer: ko.observable(),
        // words: ko.observable(),
    }
    
    // id can be edited? (for conv/conv-set only)
    this.editable = ko.observable(false)
    
    // show children? (conv/conv-set only)
    this.expanded = ko.observable(true)

    // highlight in red because there is an issue (duplicate names)
    this.hasError = ko.observable(false)

    this.expandOrCollapseOnClick = ko.pureComputed(function(){
        return this.expanded() ? 'collapse' : 'expand'
    }, self)

    // this.setDataFromConversationSet = function(set){
    //     if(self.type() !== 'conv-set') throw 'Node is of type ' + self.type() + ', not conv-set'

    //     self.id(set.id)
    //     var convs = set.conversations.slice()

    //     //for every conversation in conversationset
    //     for(var i = 0; i < convs.length; i++){
    //         var convNode = new Node('conv', convs[i].id)
    //         var lines = convs[i].lines.slice()
            
    //         //for every line in conversation
    //         for(var j = 0; j < lines.length; j++){
    //             var lineNode = new Node('line')
    //             lineNode.values.sayer(lines[j].sayer)
    //             lineNode.values.words(lines[j].words)
    //             convNode.values.lines()[j] = lineNode
    //         }
    //         // self.values.conversations().push(convNode)
    //         self.values.conversations()[i] = convNode
    //     }      

    // }

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

// create Node tree from deserialized json, including metadata
export var nodeArrayFromJsonObject = function(obj){
    var tree = []

    for(var i = 0; i < obj.nodes.length; i++){
        var set = obj.nodes[i]
        var setNode = new Node('conv-set', set.id)

        for(var j = 0; j < set.conversations.length; j++){
            var conv = set.conversations[j]
            var convNode = new Node('conv', conv.id)

            for(var k = 0; k < conv.lines.length; k++){
                var line = conv.lines[k]
                var lineNode = new Node('line')
    
                for(const [key, value] of Object.entries(line.lineValues)){
                    if(obj.meta.lineValues[key] == null) throw "Line value of name " + key + " does not exist. Check the meta.lineValues in your json file"
                    if(obj.meta.lineValues[key] != typeof(value)) console.warn("Line value of name " + key + " is of type " + typeof(value) + ", supposed to be of type " + obj.meta.lineValues[key])
                    lineNode.lineValues[key] = ko.observable(value)
                }

                convNode.lines.push(lineNode)
            }

            setNode.conversations.push(convNode)
        }

        tree.push(setNode)
    }

    return tree
}