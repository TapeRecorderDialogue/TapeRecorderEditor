// Contains conversation, conversationset, and line objects
// conversation: conversationID (string), lines (line[])
// line: words (string), sayer (string)

export var Conversation = function(id = null, lines = []){
    const self = this

    // this.id = ko.observable(id)
    // this.lines = ko.observableArray(lines)
    this.id = id
    this.lines = lines


    this.setID = function(id){
        // self.id(id)
        self.id = id
    }
    
    this.setLines = function(lines = []){
        self.lines = lines.slice()
        // self.lines.removeAll()
        // lines.forEach(l => self.lines().push(l))
    }

    this.insertLineAt = function(line, index){
        self.lines.splice(index, 0, line)
    }

    this.addLine = function(line){
        self.lines.push(line)
    }

    // this.getType() = function() {return 'conv'}
}

export var Line = function(sayer = null, words = null){
    const self = this

    // this.sayer = ko.observable(sayer)
    // this.words = ko.observable(words)
    this.sayer = sayer
    this.words = words

    // this.getType() = function() {return 'line'}
}

export var ConversationSet = function(id = null, conversations = []){
    const self = this

    // this.id = ko.observable(id)
    // this.conversations = ko.observableArray(conversations)
    this.id = id
    this.conversations = conversations

    this.get = function(index){
        // return self.conversations()[index]
        return self.conversations[index]
    }

    this.setConversations = function(conversations = []){
        self.conversations = conversations.slice()
        // self.conversations.removeAll()
        // conversations.forEach(c => self.conversations().push(c))
    }

    this.setConversationSetID = function(id){
        // self.id(id)
        self.id = id
    }

    this.addConversationOf = function(id, lines){
        self.addConversation(new Conversation(id, lines))
    }

    this.addConversation = function(conv){
        // self.conversations().push(conv)
        self.conversations.push(conv)
    }

    // this.getType() = function() {return 'conv-set'}
}