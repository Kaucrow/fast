const fs = require('fs');
// process.argv.forEach((val, index) => {
//     console.log(`${index}: ${val}`);
// });

let j = JSON.parse(fs.readFileSync("configComponent.json"));
let name = j.pathComponent+j.name+'.js';
let css = j.pathCss+j.name+'.css';
let html = j.pathHTML+j.name+'.html';

let dataFile =`
export const ${j.name} = class extends Fast{
    constructor(props){
        super();  
        this.name = "${j.name}";
        this.props = props;
        this._sts = false;
        this.built = ()=>{}; 
        this.attachShadow({mode:'open'});
        this._isBuilt = false;
    }

    #getTemplate(){ return \`
            <div class='${j.name}'></div>
        \`    
    }

    async #getCss(){ 
        return await fast.getCssFile("${j.name}");
    }

    #render(){
        return new Promise(async (resolve, reject) => {
            try {
                let sheet = new CSSStyleSheet();
                let css = await this.#getCss();
                sheet.replaceSync(css);
                this.shadowRoot.adoptedStyleSheets = [sheet];
                this.template = document.createElement('template');
                this.template.innerHTML = this.#getTemplate();
                let tpc = this.template.content.cloneNode(true);  
                this.mainElement = tpc.firstChild.nextSibling;
                this.shadowRoot.appendChild(this.mainElement);
                resolve(this);        
            } 
            catch (error) {
                reject(error);
            }
        })
    }

    #checkAttributes(){
        return new Promise(async (resolve, reject) => {
            try {
                for(let attr of this.getAttributeNames()){          
                    if(attr.substring(0,2)!="on"){
                        this[attr] = this.getAttribute(attr);
                        this.mainElement.setAttribute(attr, this[attr]);
                    }
                    else{
                        let f = this[attr];
                        this[attr] = ()=>{ if(!this._disabled) f() };
                    }
                    switch(attr){
                        case 'id' : 
                            await fast.createInstance('${j.name}', {'id': this[attr]});
                            break;
                    }
                }
                resolve(this);        
            } catch (error) {
                reject(error);
            }
        })   
    }

    #checkProps(){
        return new Promise(async (resolve, reject) => {
            try {
                if(this.props){
                    for(let attr in this.props){
                        switch(attr){
                            case 'style' :
                                for(let attrcss in this.props.style) this.mainElement.style[attrcss] = this.props.style[attrcss];
                                break;
                            case 'events' : 
                                for(let attrevent in this.props.events){
                                    this.mainElement.addEventListener(attrevent, ()=>{
                                        if(!this._disabled)this.props.events[attrevent]()})}
                                break;
                            default : 
                                this.setAttribute(attr, this.props[attr]);
                                this[attr] = this.props[attr];
                                if(attr==='id'){
                                    this.id = this[attr];
                                    await fast.createInstance('${j.name}', {'id': this[attr]})
                                };
                        }
                    }
                }
                resolve(this);        
            } catch (error) {
                reject(error);
            }
        })   
    }
    
    async connectedCallback(){
        await this.#render();
        await this.#checkAttributes();
        await this.#checkProps();      
        this._isBuilt = true;  
        this.built();
    }

    addToBody(){document.body.appendChild(this);}
}

if (!customElements.get ('${j.xTab}')) {
    customElements.define ('${j.xTab}', ${j.name});
}
`;

let defaultCss = `
.${j.name}{
    display : flex;
    position : absolute;
    left : 0px;
    top : 0px;
    background-color : rgb(8, 143, 136);
    color : white;
    align-items : center;
    justify-content : center;
    border : 0px;
    transition: 0.1s box-shadow;
    width: 25%;
    height:25%;
}

.${j.name}:hover {
    transition: all 0.2s ease-in-out;
    box-shadow: 3px 2px 22px 1px rgba(0, 0, 0, 0.24);
    color : orange;
    cursor:pointer;
}
` 
let defaultHTML = `
<html>
    <head>
        <script type="module" src="../js/com/Fast.js"></script>
        <link rel="icon" href="../images/icons/favicon.png" sizes="32x32" type="image/png">
    </head>
    <body>
        <script>
            let fastInit = async () => {
                let comp = await fast.createInstance("${j.name}", {
                    'id':'My${j.name}JS',
                    'style' : {'width' : '20%', 'height' : '20%'} ,
                });
                comp.built = ()=>{
                    console.log('Componente construido...');
                }
                comp.addToBody();
            };
        </script>
        <${j.xTab} id="My${j.name}HTML" style="position:absolute; left:10px; top:100px; width: 100px; height:100px"></${j.xTab}>
    </body>
</html> 
`

let menu = ()=>{
    console.log('----------------------------------------------------------');
    console.log('1: crear el archivo de componente, si existe se reescribe..!');
    console.log('2: crear el archivo de css, si existe se reescribe..!');
    console.log('3: crear el archivo HTML, si existe se reescribe..!');
    console.log('4: crear todos los archivos, si existen se reescriben..!');
    console.log('0: salir');
    console.log('----------------------------------------------------------');
}

let msg = (m)=>{
    console.log('');
    console.log(m);
}

try{
    // if(j.createJsFile) fs.writeFileSync(name);
    if(fs.readFileSync(name)) {
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.openStdin();
        menu();
        process.stdin.on("data", (resp) => {
            switch(resp.toLowerCase().trim()){
                case '1' : {
                    fs.writeFileSync(name, dataFile);
                    msg('INFO: Archivo de componente creado...');
                    menu();
                    break;
                }
                case '2': {
                        fs.writeFileSync(css, defaultCss);
                        msg('INFO: Archivo CSS creado...');
                        menu();
                        break;                
                }
                case '3': {
                    fs.writeFileSync(html, defaultHTML);
                    msg('INFO: Archivo HTML creado...');
                    menu();
                    break;                
                }
                case '4' : {
                    fs.writeFileSync(name, dataFile);
                    msg('INFO: Archivo de componente creado...');
                    fs.writeFileSync(css, defaultCss);
                    msg('INFO: Archivo CSS creado...');
                    fs.writeFileSync(html, defaultHTML);
                    msg('INFO: Archivo HTML creado...');
                    menu();
                    break;
                }
                case '0' : {
                    console.log("Adios..!")
                    process.exit();
                }
                default : menu();
            }         
        })
    }
} 
catch (e) {
    console.log("ERROR: "+ e);
}