console.log('mathbiol.js loaded ...');

//mathbiol=(function(){
var mathbiol={}
// root URI for https://health.data.ny.gov/resource/s8d9-z734.json etc 
// mathbiol.uri = 'health.data.ny.gov'
// mathbiol.yrs = [2009,2010,2011,2012,2013,2014]

// data resources
/*mathbiol.res={}
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

mathbiol.dt.url2009="https://health.data.ny.gov/resource/s8d9-z734.json"
mathbiol.dt.url2010="https://health.data.ny.gov/resource/dpew-wqcg.json"
mathbiol.dt.url2011="https://health.data.ny.gov/resource/n5y9-zanf.json"
mathbiol.dt.url2012="https://health.data.ny.gov/resource/rv8x-4fm3.json"
mathbiol.dt.url2013="https://health.data.ny.gov/resource/tdf6-7fpk.json"
mathbiol.dt.url2014="https://health.data.ny.gov/resource/pzzw-8zdv.json"


// SODA readers

//mathbiol.sodaRead= new soda.Consumer(mathbiol.uri)

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

*/

mathbiol.sys={}
mathbiol.sys.log={}
mathbiol.msg=function(h,clr){
    clr=clr||'blue'
    if(typeof(h)=='object'||typeof(h)=='function'){
        h='<pre>'+mathbiol.stringify(h,null,3)+'</pre>'
    }
    cmdMsg.innerHTML=h
    cmdMsg.style.color='green'
    setTimeout(function(){
        cmdMsg.style.color=clr
    },500)
    return h
}
mathbiol.side=function(h){
    cmdSide.innerHTML=h    
}


//// command line interpreter///
mathbiol.sys.eval=function(cm,fun){
    cm = cm || ''
    fun = fun || mathbiol.sys.exe
    console.log(cm)
    // clean new lines
    cm=cm.replace(/\n/g,';')
    cm=cm.replace(/([>=]);/,'$1') // in case first break is mid-defenition
    // remove prompt
    cm = cm.replace(/^\s*>\s*/,'') 
    console.log(cm)
    // reroute variables as attributes of mathbiol
    var cm2 = cm.replace(/([A-Za-z]\w*)/g,'mathbiol.$1')
    cm2 = cm2.replace(/(["'])([^"']*)mathbiol\.([^"']*)(["'])/g,'$1$2$3$4')
    while(cm2!==cm){
        cm=cm2
        cm2 = cm2.replace(/(["'])([^"']*)mathbiol\.([^"']*)(["'])/g,'$1$2$3$4')
    }
    // spacial patterns
    cm2=cm2.replace(/\.mathbiol\./g,'.') // last chance to remove excessive attribute replacement
    // fun x -> fun("x")
    if(cm2.match(/^\s*[\w\.]+\s+[\w\.]+$/)){  
        let [z,f,x]= cm2.match(/\s*([\w\.]+)\s+([\w\.]+)/)
        if((!eval(x))||(f==="mathbiol.help")){ // note call to help function treated differently
            x=x.replace('mathbiol.','')
            x='"'+x+'"'
        }
        cm2=f+'('+x+')'
    }
    // fun=(a)=>...
    if(cm2.match(/^\s*[\w.]+\s*=\s*\(.+/)){
        let mm = cm2.match(/^\s*([\w.]+\s*=\s*\()(.+)/)
        cm2=mm[1]+mm[2].replace(/mathbiol\./g,'')
    }
    cm2=cm2.replace(/^\s+/,'');cm2=cm2.replace(/\s+$/,'') // deblank
    if(cm2.match(/^mathbiol.\w+$/)){ // sole command
        let c = cm2.match(/^mathbiol.(\w+)$/)[1]
        if(typeof(window.mathbiol[c])==="function"){
            cm2+='()'
        }
    }
    // Final clean up
    cm2=cm2.replace(/\.mathbiol\./g,'.') // last chance to remove excessive attribute replacement
    cm2=cm2.replace(/,;/g,',')
    cm2=cm2.replace(/{;/g,'{')
    cm2=cm2.replace(/;}/g,'}')
    if(cm2.match(/[\w\.=]+[\{\[].+[\}\]]/)){ // in case it is sloppy JSON
        let [a,b,c]=cm2.match(/([\w\.=]+)([\{\[].+[\}\]])/)
        c=c.replace(/mathbiol\./g,'')
        cm2=b+c.replace(/(\w+)\:/g,'"$1":')
    }
    console.log(cm2)
    if(cm2.match(/\S/)){ // eval it only if it is not empty
        try{
           mathbiol.ans=eval(cm2)
           if((!mathbiol.ans)&&(cm2.match(/\(\)$/))){ // if this is a function called with no arguments and no response
               mathbiol.ans = eval(cm2.match(/(.+)\(\)$/)[1]) // return code
           }
        }
        catch(err){
           mathbiol.ans=err
           console.log(err)
        }
    }
        

    mathbiol.msg(mathbiol.ans)

    fun()

}

mathbiol.sys.exe = function(){
    mathbiol.sys.log.old = mathbiol.sys.log.old || [' > '] // start log if it doesn't exist

    // compare entries and start evaluating them from last change
    var i = mathbiol.sys.exe_i
    mathbiol.sys.exe_i++
    if(i<mathbiol.sys.log.old.length){
        console.log(i+') at '+Date())
        if(mathbiol.sys.log.old[i]!==mathbiol.sys.log.new[i]){
            mathbiol.sys.exe_eval=true
        }
        if(mathbiol.sys.exe_eval){
            
            console.log('EVAL '+i+mathbiol.sys.log.new[i])
            mathbiol.sys.eval(mathbiol.sys.log.new[i])
            
        }else{
            mathbiol.sys.exe()
        }
        
    }else{
        if(mathbiol.sys.log.new.slice(-1)[0]==" >  > "){ // middle insertion
            mathbiol.sys.log.new.slice(-1)[0]=" > "
            sys.value=sys.value.slice(0,-3)
        }
        mathbiol.sys.log.old=mathbiol.sys.log.new
    }
}

mathbiol.sys.cmdEval=function(){
    mathbiol.sys.log.new=cmd.value.split('\n >')
    mathbiol.sys.exe_i=0
    mathbiol.sys.exe_eval=false
    mathbiol.sys.exe()
}
mathbiol.sys.cmd=function(c){
    cmd.value+=c+'\n > '
    mathbiol.sys.cmdEval()
    cmd.scrollTop=cmd.scrollHeight
}
mathbiol.sys.cmdSlow=function(c,t){
    cmd.scrollTop=cmd.scrollHeight
    var t = t || 50
    c.split('').forEach(function(ci,i){
        setTimeout(function(){
            cmd.scrollTop=cmd.scrollHeight
            cmd.value+=ci
            if(i==(c.length-1)){
                console.log('done')
                cmd.value+='\n > '
                mathbiol.sys.cmdEval()
            }
        },t*(i+1))
    })   
}
mathbiol.sys.getScript=function(url,fun){ // add script to the head
    var sr = document.createElement('script')
    sr.src=url
    if(fun){sr.onload=function(){fun()}}
    document.head.appendChild(sr)
}
mathbiol.sys.getJSON=function(url,fun){ // cached get
    fun = fun || function(x){console.log(x)}
    localforage.getItem(url)
     .then(function(x){
         fun(x)
    })
     .catch($.getJSON(url,function(x){
         localforage.setItem(url,x)
         fun(x)
     }))
}

// Command event

cmd.onkeyup=function(ev){
    if((ev.keyCode==13)&&(!ev.shiftKey)){ // enter was pressed without shift
        if(this.value.slice(-3)!==" > "){this.value+=' > '}
        // remove empty lines
        this.value=this.value.replace('\n\n','\n')
        mathbiol.sys.cmdEval()
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

// -------------------------------
//          Native commands
// -------------------------------

mathbiol.tic=function(){
    var d = new Date()
    this.tic.t0=d
    return 'tic started at '+d
}

mathbiol.toc=function(){
    var t = new Date()
    this.tic.t0 = this.tic.t0 || t // in case tic was not set 
    this.toc.log = this.toc.log || [] // in case toc was not used before
    var dt = t - this.tic.t0
    this.toc.log.push(dt) // note we're tracking tocs here
    return dt
}

mathbiol.length=function(x){
    var ans
    if(Array.isArray(x)){
        ans = x.length
    }else if(typeof(x)==='object'){
        ans = Object.getOwnPropertyNames(x).length
    }else{
        ans = 'not an object or an array'
    }
    return ans
}

mathbiol.stringify=function(x){
    var y = ''
    if(typeof(x)=='function'){
        if(x['about']){
            y=x['about']
        }else{
            y = x.toString(x)
        }
    }else{
        // look for // comments
        y = JSON.stringify(x)        
    }
    if(y.length>100){y=y.slice(0,100)+'...'}
    return y
}

mathbiol.help=function(cm){
    y=''
    if(!cm){
        var h = '<h4 style="color:navy">help</h4>'
        h +='<p style="color:green">You can get back to this page at any time by typing "help" in the command line.<p>'
        h +='<p>You can write your own commands <a href="#"><i class="fa fa-youtube-play" aria-hidden="true" style="color:maroon"></i></a>,'
        h +=' or by loading an existing package. Try "load" for a list of registered packages.</p>'
        mathbiol.side(h)
    }else{
        if(mathbiol[cm]){
            if(mathbiol[cm].help){
                mathbiol.side('<h4 style="color:navy">'+cm+'</h4>'+mathbiol[cm].help)
            }else{
                if(Array.isArray(mathbiol[cm])){
                    y=cm+' is an Array length '+mathbiol[cm].length
                }else{
                    let tp = typeof(eval(mathbiol[cm])) /// find type
                    y=cm+' is a '+tp
                    if((tp==='function')&&(mathbiol[cm].about)){
                        y=tp.about
                    }                  
                }          
            }
        }else{
            y='"'+cm+'" not found'
        }
    }
    return y
}
mathbiol.help.about='help &lt;command&gt; for detail on command use'
mathbiol.help.help='for help on help just type help once'

mathbiol.load=function(md){
    if(!mathbiol.sys.load){
        $.getJSON('load.json').then(function(x){
            mathbiol.sys.load=x
            mathbiol.load(md)
        })
    }else{
        if(!mathbiol.sys.load[md]){
            var msg = '<span style="color:red">module "'+md+'" not found</span>'
            //mathbiol.msg(msg,'red') // <-- would be late in teh assynchrony
            return msg
        }else{
            mathbiol.sys.getScript(mathbiol.sys.load[md],function(){
                mathbiol.msg('module "'+md+'" loaded')
            })
        }
    }
        
    console.log('loading')
}
mathbiol.load.about='load &lt;module&gt; to load a module specified in load.json'
mathbiol.load.help='This command will load <a href="load.json" target="_blank">registered modules</a> by name and can also load unregistered modules by url'

// --- INI ---

if(document.getElementById('cmdSide')){
    mathbiol.help()
}
if(document.getElementById('cmdSide')){
    mathbiol.msg('you type help any time')
}
if(location.hash.length>1){
    mathbiol.sys.cmdSlow(location.hash.slice(1))
    4
}
