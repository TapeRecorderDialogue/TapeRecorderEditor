// stack with limited size
export var LimitedStack = function(size){
    const self = this

    this.array = []
    this.size = size
    this.currentIndex = -1
    this.maxIndex = -1

    this.length = size

    this.push = function(object){
        self.currentIndex++
        // if reached end, shift
        if(self.currentIndex >= size){
            self.array.shift()
            self.currentIndex--
        }
        self.array[self.currentIndex] = object
    }

    this.pushAndClearFuture = function(object){
        self.currentIndex++
        // if reached end, shift
        if(self.currentIndex >= size){
            self.array.shift()
            self.currentIndex--
        }
        self.array[self.currentIndex] = object
        for(var i = self.currentIndex + 1; i < self.array.length; i++){
            self.array[i] = undefined
        }
    }

    this.pop = function(){
        if(self.currentIndex < 0) throw "Cannot pop at negative index"
        // remove at current index
        let ret = self.array.splice(self.currentIndex, 1)[0]
        self.currentIndex--
        return ret
    }

    // pop without throw
    this.popSafe = function(){
        if(self.currentIndex < 0) return undefined
        let ret = self.array.splice(self.currentIndex, 1)[0]
        self.currentIndex--
        return ret
    }

    this.peek = function(){
        return self.array[self.currentIndex]
    }

    // get at index
    this.get = function(index){
        if(index >= self.size) throw `Index ${index} is out of bounds`
        return self.array[index]
    }

    // change currentIndex by offset and return the value at new currentIndex
    this.cycle = function(offset){
        if(self.currentIndex + offset < 0 || self.currentIndex + offset >= self.size) throw "Cannot cycle to out of bounds index"
        self.currentIndex += offset    
        return self.array[self.currentIndex]
    }

    this.cycleSafe = function(offset){
        if(self.currentIndex + offset < 0 || self.currentIndex + offset >= self.size) return undefined
        self.currentIndex += offset    
        console.log(`returning ${self.currentIndex} of stack`)
        return self.array[self.currentIndex]
    }

    this.clear = function(){
        self.array.splice(0, self.array.length)
        self.currentIndex = -1
    }
}

// stack that loops, has limited size
export var CyclingStack = function(size){
    const self = this

    this.array = []
    this.size = size
    this.currentIndex = -1

    this.push = function(object){
        self.currentIndex = mod(self.currentIndex + 1, self.size)
        self.array[self.currentIndex] = object
    }

    this.pop = function(){
        // remove at current index
        let ret = self.array.splice(self.currentIndex, 1)[0]
        self.currentIndex = mod(self.currentIndex - 1, self.size)
        return ret
    }

    // get at index
    this.get = function(index){
        if(index >= self.size) throw `Index ${index} is out of bounds`
        return self.array[mod(self.currentIndex + index, self.size)]
    }

    // pop, but don't remove
    this.cycle = function(){
        let ret = self.array[self.currentIndex]
        self.currentIndex = mod(self.currentIndex - 1, self.size)
        return ret
    }

    this.clear = function(){
        self.array.splice(0, self.array.length)
    }
}


function mod(x, m){
    return (x % m + m) % m
}