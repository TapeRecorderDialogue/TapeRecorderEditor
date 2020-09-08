const path = require('path')
const saveAs = require('file-saver')

import {Conversation, Line, ConversationSet} from './objects'
import { Node } from './node'

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
            data.saveToJson()
        })
        
    },

    //path to the current json file being edited
    editingPath: undefined,

    //save as, create save file dialog
    saveJsonToFile: function(jsonStr){
        let blob = new Blob([jsonStr], { type: 'text/plain;charset=utf-8' })
        saveAs.saveAs(blob, 'testFile.json')
    },

    saveObservableToFile: function(obj){
        this.saveJsonToFile(ko.toJSON(obj))
    },

    //save work, no dialog
    saveToJson: function(){
        this.applyChangesFromAllNodes()

        //if the file has not been saved, create new file
        if(this.editingPath === undefined){
            // console.log(data.app.sets[0].id)
            this.saveObservableToFile(data.app.sets)
            return
        }

        //otherwise write to the existing file
        data.app.fs.writeFile(this.editingPath, this.getSaveData(), { encoding: 'utf-8' }, function(err){
            if(err) alert('Could not save data to ' + editingPath)
        })
    },

    getSaveData: function(){
        return JSON.stringify(data.app.sets)
    },

    //move required data from app.allNodes to app.sets
    applyChangesFromAllNodes: function(){
        this.makeSetsFromNodes(data.app.allNodes(), data.app.sets)
    },

    makeSetsFromNodes: function(nodes, out = []){
        var contents = []
        let allNodes = nodes

        for(var i = 0; i < allNodes.length; i++){
            let convSetNode = allNodes[i]
            let convSet = new ConversationSet(convSetNode.id())

            var convs = convSetNode.values.conversations()

            for(var j = 0; j < convs.length; j++){
                let convNode = convs[j]
                let conv = new Conversation(convNode.id())

                var lines = convNode.values.lines()

                for(var k = 0; k < lines.length; k++){
                    let lineNode = lines[k]
                    let line = new Line(lineNode.values.sayer(), lineNode.values.words())
                    conv.addLine(line)
                }

                convSet.addConversation(conv)
            }

            contents.push(convSet)
            // convSet.setConversations(convSetNode.values.conversations())
        }

        //clear array
        out.splice(0, out.length)

        for(var i = 0; i < contents.length; i++){
            out.push(contents[i])
        }
        if(out[0] === null) out.shift()
    },


    loadFile: function(){
        var file = $('#file-input')[0].files[0]
        // var file = document.getElementById('file-input').files[0]
        if(!file) return
        var reader = new FileReader()
        reader.onload = e =>{
            // this.loadNodeFromJson(e.target.result)
            let j = JSON.parse(e.target.result)
            for(var i = 0; i < j.length; i++){
                this.loadedSets.push(j[i])
            }
            
            //fill app.sets
            this.loadSetsFromLoaded(data.app.sets)

            //fill app.allNodes from sets
            this.makeNodesFromSets()

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

    makeNodesFromSets: function(){
        //clear allNodes
        data.app.allNodes.removeAll()
        //push
        // data.app.sets.forEach(set => function(){
        //     var n = new Node('conv-set')
        //     n.setDataFromConversationSet(set)
        //     data.app.allNodes().push(n)
        // })
        let temp = []
        for(var i = 0; i < data.app.sets.length; i++){
            var n = new Node('conv-set')
            n.setDataFromConversationSet(data.app.sets[i])
            temp.push(n)
        }
        data.app.allNodes(temp)
    }
}