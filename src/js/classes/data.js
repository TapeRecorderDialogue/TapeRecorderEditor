const path = require('path')
const saveAs = require('file-saver')

import { nodeArrayFromJsonObject, Node } from './node'

// var blob = new Blob(["Hello, world!"], {type: "text/plain;charset=utf-8"});
// saveAs(blob, "asdfasdf.txt")
export const data = {

    // loadFileButton: $('load-file-button'),
    // fileInput: $()

    //app object that holds this data object
    app: undefined,

    didSetup: false,
    doSetup: function(){
        if(this.didSetup) return
        this.didSetup = true

        $('#load-file-button').on('click', function(){
            $('#file-input').trigger('click')
        })
        $('#file-input').on('change', function(){
            console.log("loading")
            data.loadFile()
        })
        $("#save-file-button").on('click', function(){
            data.saveNodeArrayToJson(data.app.allNodes())

            // display warn if there are repeating ids
            if(!data.checkNoRepeatingIDs()){
                alert("You have IDs that are repeating. Anything highlighted in red is invalid. Your file was still saved.")
            }
        })
        
    },

    //path to the current json file being edited
    editingPath: undefined,

    // check if all conv-set names are different, and if all conv names in a set are different
    // if there are repeats highlight the nodes that are repeated
    checkNoRepeatingIDs: function(){
        let allNodes = this.app.allNodes()
        let setChecks = []
        let setFirstOf = {}
        let checkNode = function(node, checks, firstOf){
            if(checks.includes(node.id())){
                node.hasError(true)
                firstOf[node.id()].hasError(true)
            }
            else{
                checks.push(node.id())
                firstOf[node.id()] = node
                node.hasError(false)
            }
        }

        allNodes.forEach(node => {
            checkNode(node, setChecks, setFirstOf)
            let childChecks = []
            let childFirstOf = {}
            node.conversations().forEach(child => checkNode(child, childChecks, childFirstOf)) 
        })


        return allNodes.length == setChecks.length
    },

    // removeDuplicates: function(arr){
    //     return arr.filter((v, i) => arr.indexOf(v) == i)
    // },

    //save as, create save file dialog
    saveJsonToFile: function(jsonStr){
        let blob = new Blob([jsonStr], { type: 'text/plain;charset=utf-8' })
        saveAs.saveAs(blob, 'testFile.json')
    },

    saveObservableToFile: function(obj){
        this.saveJsonToFile(ko.toJSON(obj))
    },

    saveWithMeta: function(obj){
        let s = {
            meta: data.app.meta,
            nodes: obj
        }
        this.saveJsonToFile(JSON.stringify(s))
    },

    //JSON.stringify and save, except without the unneeded data.
    //ex: conv-set Nodes do not need lineValues
    saveNodeArrayToJson: function(arr){
        var nodes = []

        for(var i = 0; i < arr.length; i++){
            var set = arr[i]
            var setNode = {}
            setNode.id = set.id()
            setNode.conversations = []

            var setConvs = set.conversations()
            for(var j = 0; j < setConvs.length; j++){
                var conv = setConvs[j]
                var convNode = {}
                convNode.id = conv.id()
                convNode.lines = []
                
                var convLines = conv.lines()
                for(var k = 0; k < convLines.length; k++){
                    var line = convLines[k]
                    var lineNode = {}
                    lineNode.lineValues = {}
        
                    for(const [key, value] of Object.entries(line.lineValues)){
                        if(data.app.meta.lineValues[key] == null) throw `Key ${key} is invalid. Check that metadata contains it.`
                        lineNode.lineValues[key] = ko.unwrap(value)
                    }
    
                    convNode.lines.push(lineNode)
                }
    
                setNode.conversations.push(convNode)
            }
    
            nodes.push(setNode)
        }

        this.saveWithMeta(nodes)
    },

    // //save work, no dialog
    // saveToJson: function(){
    //     this.applyChangesFromAllNodes()

    //     this.saveWithMeta(data.app.sets)

    //     //if the file has not been saved, create new file
    //     // if(this.editingPath === undefined){
    //     //     this.saveObservableToFile(data.app.sets)
    //     //     return
    //     // }

    //     // //otherwise write to the existing file
    //     // data.app.fs.writeFile(this.editingPath, this.getSaveData(), { encoding: 'utf-8' }, function(err){
    //     //     if(err) alert('Could not save data to ' + editingPath)
    //     // })
    // },

    // getSaveData: function(){
    //     return JSON.stringify(data.app.sets)
    // },

    // //move required data from app.allNodes to app.sets
    // applyChangesFromAllNodes: function(){
    //     this.makeSetsFromNodes(data.app.allNodes(), data.app.sets)
    // },

    // makeSetsFromNodes: function(nodes, out = []){
    //     var contents = []
    //     let allNodes = nodes

    //     for(var i = 0; i < allNodes.length; i++){
    //         let convSetNode = allNodes[i]
    //         let convSet = new ConversationSet(convSetNode.id())

    //         var convs = convSetNode.values.conversations()

    //         for(var j = 0; j < convs.length; j++){
    //             let convNode = convs[j]
    //             let conv = new Conversation(convNode.id())

    //             var lines = convNode.values.lines()

    //             for(var k = 0; k < lines.length; k++){
    //                 let lineNode = lines[k]
    //                 let line = new Line(lineNode.values.sayer(), lineNode.values.words())
    //                 conv.addLine(line)
    //             }

    //             convSet.addConversation(conv)
    //         }

    //         contents.push(convSet)
    //         // convSet.setConversations(convSetNode.values.conversations())
    //     }

    //     //clear array
    //     out.splice(0, out.length)

    //     for(var i = 0; i < contents.length; i++){
    //         out.push(contents[i])
    //     }
    //     if(out[0] === null) out.shift()
    // },


    loadFile: function(){
        var file = $('#file-input')[0].files[0]
        // var file = document.getElementById('file-input').files[0]
        if(!file) return
        var reader = new FileReader()
        reader.onload = e =>{
            // this.loadNodeFromJson(e.target.result)
            var json = JSON.parse(e.target.result)

            var arr = nodeArrayFromJsonObject(json)

            //load meta
            data.app.meta = json.meta

            //clear and load nodes
            data.app.allNodes.removeAll()
            for(var i = 0; i < arr.length; i++){
                data.app.allNodes.push(arr[i])
            }

            // for(var i = 0; i < json.nodes.length; i++){
            //     this.loadedSets.push(j[i])
            // }
            
            // //fill app.sets
            // this.loadSetsFromLoaded(data.app.sets)

            // //fill app.allNodes from sets
            // this.makeNodesFromSets()

            //clear visibleConversation 
            this.app.visibleConversation(null)

        }
        reader.readAsText(file, 'UTF-8')
        this.editingPath = file.path
    },

    loadedSets: [],

    loadSetsFromLoaded: function(out){
        out.splice(0, out.length)
        for(var i = 0; i < this.loadedSets.length; i++){
            out.push(this.loadedSets[i])
        }
        if(out[0] === null) out.shift()
    },

    // makeNodesFromSets: function(){
    //     //clear allNodes
    //     data.app.allNodes.removeAll()
    //     //push
    //     // data.app.sets.forEach(set => function(){
    //     //     var n = new Node('conv-set')
    //     //     n.setDataFromConversationSet(set)
    //     //     data.app.allNodes().push(n)
    //     // })
    //     let temp = []
    //     for(var i = 0; i < data.app.sets.length; i++){
    //         var n = new Node('conv-set')
    //         n.setDataFromConversationSet(data.app.sets[i])
    //         temp.push(n)
    //     }
    //     data.app.allNodes(temp)
    // }

    // called in app.addLineValue. Add an empty value to all line nodes
    addLineValuesToAllNodes: function(key){
        this.app.allNodes().forEach(convSet => {
            convSet.conversations().forEach(conv => {
                conv.lines().forEach(line => {
                    line.lineValues[key] = ko.observable()
                })
            })
        })
    }
}