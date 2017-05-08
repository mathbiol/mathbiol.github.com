console.log('mathbiol.js loaded ...');

//mathbiol=(function(){
var mathbiol={}
// root URI for https://health.data.ny.gov/resource/s8d9-z734.json etc 
mathbiol.uri = 'health.data.ny.gov'
mathbiol.yrs = [2009,2010,2011,2012,2013,2014]

// data resources
mathbiol.res={}
mathbiol.res[2009]="s8d9-z734"
mathbiol.res[2010]="dpew-wqcg"
mathbiol.res[2011]="n5y9-zanf"
mathbiol.res[2012]="rv8x-4fm3"
mathbiol.res[2013]="tdf6-7fpk"
mathbiol.res[2014]="pzzw-8zdv"


// data sources
mathbiol.dtSrc={}
mathbiol.yrs.forEach(function(yr){
    mathbiol.dtSrc['url'+yr]='https://'+mathbiol.uri+'/resource/'+mathbiol.res[yr]+'.json'
})
/*
mathbiol.dt.url2009="https://health.data.ny.gov/resource/s8d9-z734.json"
mathbiol.dt.url2010="https://health.data.ny.gov/resource/dpew-wqcg.json"
mathbiol.dt.url2011="https://health.data.ny.gov/resource/n5y9-zanf.json"
mathbiol.dt.url2012="https://health.data.ny.gov/resource/rv8x-4fm3.json"
mathbiol.dt.url2013="https://health.data.ny.gov/resource/tdf6-7fpk.json"
mathbiol.dt.url2014="https://health.data.ny.gov/resource/pzzw-8zdv.json"
*/

// SODA readers

mathbiol.sodaRead= new soda.Consumer(mathbiol.uri)

4

// get 
mathbiol.get=function(q,yr){
    if(!yr){
        yr=Object.getOwnPropertyNames(mathbiol.dtSrc)
    }
    if(!Array.isArray(yr)){
        yr=[yr]
    }
    // handle year provided as number
    yr=yr.map(function(yi){
        if(typeof(yi)=="number"){yi="url"+yi}
        return yi
    })
}

mathbiol.count=function(yrs,fun){
    yrs = yrs || mathbiol.yrs
    if(typeof(yrs)=="number"){yrs=[yrs]} // making sure it is an Array
    var count={}
    console.log('number of entries for years ',yrs)
    yrs.forEach(function(yr){
        $.getJSON(mathbiol.dtSrc['url'+yr]+'?$query=SELECT%20COUNT(*)')
         .then(function(c){
             c[0].COUNT=parseInt(c[0].COUNT)
                 console.log(yr,c[0].COUNT)
             count[yr]=c[0].COUNT
             // have some fun if done
             if(Object.getOwnPropertyNames(count).length==yrs.length){
                 console.log('done:')
                 fun = fun || function(){console.log(count)}
                 fun()
             }
         })
    })
    return count
    //https://health.data.ny.gov/resource/s8d9-z734.json?$query=SELECT%20COUNT(*)

}

mathbiol.cmd={}
mathbiol.log={}
mathbiol.msg=function(h){
    cmdMsg.innerHTML=h
    cmdMsg.style.color='green'
    setTimeout(function(){
        cmdMsg.style.color='blue'
    },500)
}
mathbiol.side=function(h){
    cmdSide.innerHTML=h
    
}


//// command line interpreter///
mathbiol.eval=function(cm,fun){
    cm = cm || ''
    fun = fun || mathbiol.exe
    console.log(cm)
    // clean new lines
    cm=cm.replace(/\n/g,';')
    cm=cm.replace(/([>=]);/,'$1') // in case first break is mid-defenition
    // remove prompt
    cm = cm.replace(/^\s*>\s*/,'') 
    console.log(cm)
    // reroute variables as attributes of mathbiol.cmd
    var cm2 = cm.replace(/([A-Za-z]\w*)/g,'mathbiol.cmd.$1')
    cm2 = cm2.replace(/(["'])([^"']*)mathbiol\.cmd\.([^"']*)(["'])/g,'$1$2$3$4')
    while(cm2!==cm){
        cm=cm2
        cm2 = cm2.replace(/(["'])([^"']*)mathbiol\.cmd\.([^"']*)(["'])/g,'$1$2$3$4')
    }
    // spacial patterns
    // fun x -> fun("x")
    if(cm2.match(/^\s*[\w\.]+\s+[\w\.]+$/)){  
        let [z,f,x]= cm2.match(/\s*([\w\.]+)\s+([\w\.]+)/)
        if(eval(x)){
            x=x.replace('mathbiol.cmd.','')
            x='"'+x+'"'
        }
        cm2=f+'('+x+')'
    }
    // fun=(a)=>...
    if(cm2.match(/^\s*[\w.]+\s*=\s*\(.+/)){
        let mm = cm2.match(/^\s*([\w.]+\s*=\s*\()(.+)/)
        cm2=mm[1]+mm[2].replace(/mathbiol\.cmd\./g,'')
    }
    cm2=cm2.replace('.mathbiol.cmd.','.') // last chance to remove excessive attribute replacement
    console.log(cm2)
    if(cm2.match(/\S/)){ // eval it only if it is not empty
        try{
           mathbiol.cmd.ans=eval(cm2)
        }
        catch(err){
           mathbiol.cmd.ans=err
           console.log(err)
        }
    }
        

    mathbiol.msg(mathbiol.cmd.ans)

    fun()

}

mathbiol.exe = function(){
    mathbiol.log.old = mathbiol.log.old || [' > '] // start log if it doesn't exist

    // compare entries and start evaluating them from last change
    var i = mathbiol.exe_i
    mathbiol.exe_i++
    if(i<mathbiol.log.old.length){
        console.log(i+') at '+Date())
        if(mathbiol.log.old[i]!==mathbiol.log.new[i]){
            mathbiol.exe_eval=true
        }
        if(mathbiol.exe_eval){
            
            console.log('EVAL '+i+mathbiol.log.new[i])
            mathbiol.eval(mathbiol.log.new[i])
            
        }else{
            mathbiol.exe()
        }
        
    }else{
        if(mathbiol.log.new.slice(-1)[0]==" >  > "){ // middle insertion
            mathbiol.log.new.slice(-1)[0]=" > "
            cmd.value=cmd.value.slice(0,-3)
        }
        mathbiol.log.old=mathbiol.log.new
    }
}

// Command event

cmd.onkeyup=function(ev){
    if((ev.keyCode==13)&&(!ev.shiftKey)){ // enter was pressed without shift
        if(this.value.slice(-3)!==" > "){this.value+=' > '}
        // remove empty lines
        this.value=this.value.replace('\n\n','\n')
        mathbiol.log.new=this.value.split('\n >')
        mathbiol.exe_i=0 // reset interpretation before starting it
        mathbiol.exe_eval=false
        mathbiol.exe() // evaluate command
    }
}


// CSS
if(document.getElementById('infoMore')){

    infoMore.onmouseover=function(){
        this.style.cursor="pointer"
    }

    infoMore.onclick=function(){
        //if(this.className=="fa fa-info-circle"){
        if(this.style.color=="green"){
            this.style.color="silver"
            infoShowHide.hidden=true
        }else{
            this.style.color="green"
            infoShowHide.hidden=false
        }
    }
} 
//