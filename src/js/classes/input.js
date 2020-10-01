export const Input = function(app){
    const self = this

    // this.keyCodeFor = function(letter){
    //     return letter.toLowerCase().charCodeAt(1) - 96 + 64
    // }

    this.keyboardEvents = function(){
        $(document).on('keydown', function(e){
            //ctrl commands
            if(e.ctrlKey){
                // undo
                if(e.key === 'z'){
                    app.undo()
                    return
                }

                // redo
                if(e.key == 'y'){
                    app.redo()
                    return
                }

                // save
                if(e.key == 's'){
                    e.preventDefault()
                    app.data.saveFile()
                }
            }
        })
    }


}