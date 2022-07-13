const COR_CLEAR = [0.0, 0.0, 0.6, 1.0];

const CAM = {
    eye    : vec3(0, -250, 150),
    at     : vec3(0, 0, 0),
    up     : vec3(0, 1, 0),
    fovy   : 45.0,
    aspect : 1.0,
    near   : 1,
    far    : 2000,    
};

// Propriedades da fonte de luz
const LUZ = {
    pos : vec4(0.0, 0.0, 500.0, 1.0), // posição
    amb : vec4(0.2, 0.2, 0.2, 1.0), // ambiente
    dif : vec4(0.8, 0.8, 0.8, 1.0), // difusão
    esp : vec4(0.0, 0.7, 0.7, 1.0), // especular
};

// objetos

const SUBS = [
    {
        pos : vec3(-50, 40, 250),
        theta : vec3(-10, 0, 0), // -90, 0, 0
        vTrans : 0,
        vTheta : vec3(0, 0, 0),
        escala : vec3(0, 5, 2),
        //escala : vec3(5, 5, 25),
        cor : vec4(1.0, 0.0, 0.0, 1.0),
        alfa : 250.0,
        ndivs : 0,
        },
    {
        pos : vec3(-50, 40, 150),
        theta : vec3(0, 0, 0), // -90, 0, 0
        vTrans : 0,
        vTheta : vec3(0, 0.5, 0),
        escala : vec3(5, 5, 5),
        //escala : vec3(5, 5, 25),
        cor : vec4(1.0, 0.0, 0.0, 1.0),
        alfa : 250.0,
        ndivs : 0,
        },
    // {
    //     pos : vec3(-50, 40, 150),
    //     theta : vec3(0, 0, 0), // -90, 0, 0
    //     vTrans : 0,
    //     vTheta : vec3(0, 0, 0),
    //     escala : vec3(5, 5, 25),
    //     //escala : vec3(5, 5, 25),
    //     cor : vec4(1.0, 0.0, 0.0, 1.0),
    //     alfa : 250.0,
    //     ndivs : 0,
    //     },
    // {
    //     pos : vec3(60, 75, 50),
    //     theta : vec3(-0, 45, 45),
    //     vTrans : 0,
    //     vTheta : vec3(0, 0, 0),
    //     escala : vec3(10, 10, 50),
    //     cor : vec4(1.0, 0.0, 1.0, 1.0),
    //     alfa : 200,
    //     ndivs : 1
    //     },
    // {
    //     pos : vec3(-50, -450, 65),
    //     theta : vec3(-80, 0, 0),
    //     vTrans : 0,
    //     vTheta : vec3(0.05, 0, 0),
    //     escala : vec3(10, 10, 50),
    //     cor : vec4(0.0, 1.0, 0.0, 1.0),
    //     alfa : 150,
    //     ndivs : 1
    //     },
    // {
    //     pos : vec3(-150, 450, 75),
    //     theta : vec3(-95, -150, 0),
    //     vTrans : 0,
    //     vTheta : vec3(0, 0.05, 0),
    //     escala : vec3(10, 10, 50),
    //     cor : vec4(0.0, 1.0, 1.0, 1.0),
    //     alfa : 100,
    //     },
    // {
    //     pos : vec3(330, 450, 100),
    //     theta : vec3(-85, 175, 0),
    //     vTrans : 0,
    //     vTheta : vec3(0, 0, 0.05),
    //     escala : vec3(10, 10, 50),
    //     cor : vec4(1.0, 1.0, 0.0, 1.0),
    //     alfa : 50,
    //     },
    ];

const FUNDO = {
    escala : vec3(500, 500, 20),
    theta  : vec3(0, 0, 0),
    pos    : vec3(0, 0, 0),
    cor    : vec4(0, 0.5, 1.0, 1),
    alfa   : 50.0,
    ndivs  : 9,
    solido : true, 
};

const NEVOA = {
    peso : 0.3,
    cor : vec4(1.0, 0.0, 0.0, 1.0),
    near: 50.0,
    far:  400.0
};

const BOLAS = [
    {
        escala : vec3(40, 40, 40),
        theta  : vec3(0, 0, 0),
        pos    : vec3(0, 0, 80),
        alfa   : 150.0,
        ndivs  : 1, //4
        solido : false,
    },
    {
        escala : vec3(75, 40, 120),
        theta  : vec3(0, 0, 0),
        pos    : vec3(-120, 285, 0),
        alfa   : 50.0,
        ndivs  : 1, //3
        solido : false,
    },
    {
        escala : vec3(65, 140, 40),
        theta  : vec3(0, 0, 0),
        pos    : vec3(250, 85, 10),
        alfa   : 50.0,
        ndivs  : 1, //2
        solido : false,
    },
    {
        escala : vec3(135, 140, 70),
        theta  : vec3(0, 0, 0),
        pos    : vec3(-250, -15, 30),
        alfa   : 10.0,
        ndivs  : 1,
        solido : false,
    },
    {
        escala : vec3(85, 40, 170),
        theta  : vec3(0, 0, 0),
        pos    : vec3(320, -350, 90),
        alfa   : 10.0,
        ndivs  : 1,
        solido : false,
    },
];

const CUBOS = [
    // criado 
    {
        escala : vec3(20, 20, 20),
        pos : vec3(-20, 500, 250),
        theta  : vec3(0, 0, 0),
        alfa   : 30.0,
        solido : false,
    }, 
    {
        escala : vec3(20, 20, 20),
        pos : vec3(-15, 700, 300),
        theta  : vec3(0, 0, 0),
        alfa   : 30.0,
        solido : false,
    }, 
    {
        escala : vec3(20, 20, 20),
        pos : vec3(60, 600, 400),
        theta  : vec3(0, 0, 0),
        alfa   : 30.0,
        solido : false,
    }, 
    {
        escala : vec3(20, 20, 20),
        pos : vec3(100, 400, 100),
        theta  : vec3(0, 0, 0),
        alfa   : 30.0,
        solido : false,
    }, 
    // {
    //     escala : vec3(20, 20, 20),
    //     pos : vec3(75, 450, 100),
    //     theta  : vec3(0, 0, 0),
    //     alfa   : 30.0,
    //     solido : false,
    // },
    // fim criados
    {
        escala : vec3(20, 50, 70),
        theta  : vec3(0, 0, 0),
        pos    : vec3(-40, -250, 35),
        alfa   : 30.0,
        solido : false,
    },
    {
        escala : vec3(20, 50, 70),
        theta  : vec3(0, 0, 0),
        pos    : vec3(120, -250, 35),
        alfa   : 30.0,
        solido : false,
    },
    {
        escala : vec3(180, 20, 20),
        theta  : vec3(45, 0, 0),
        pos    : vec3(40, -250, 70),
        alfa   : 70.0,
        solido : false,
    },
    {
        escala : vec3(300, 20, 20),
        theta  : vec3(90, 45, 40),
        pos    : vec3(320, 350, 70),
        alfa   : 10.0,
        solido : false,
    },
];

function Cena() {
    // buffers da cena combinam os buffers dos objetos
    this.bPos  = [];
    this.bNorm = [];
    this.bCor  = [];

    this.objs = [];
    this.subs = [];
    this.fundo = new FundoDoMar(FUNDO.cor, FUNDO.alfa);
    this.cubo = new Cubo();

    this.init = function () {
        // prepara e insere o fundo
        let f = this.fundo;
        f.init(FUNDO.ndivs, FUNDO.solido);  // no config.js
        f.escala = FUNDO.escala;
        f.bufPos = this.bPos.length;  // no começo é zero
        this.bPos = this.bPos.concat( f.bPos );
        this.bNorm = this.bNorm.concat( f.bNorm );
        this.bCor = this.bCor.concat( f.bCor );
        this.objs.push(f);

        // prepara e insere bolas
        let i;
        for (i=0; i<BOLAS.length; i++) {
            let b = new Esfera(BOLAS[i].cor, BOLAS[i].alfa);
            b.init(BOLAS[i].ndivs, BOLAS[i].solido);
            b.escala = BOLAS[i].escala;
            b.pos    = BOLAS[i].pos;
            b.theta  = BOLAS[i].theta;
            b.bufPos = this.bPos.length;  // posição no buffer
            this.bPos = this.bPos.concat( b.bPos );
            this.bNorm = this.bNorm.concat( b.bNorm );
            this.bCor = this.bCor.concat( b.bCor );
            this.objs.push(b);    
        }
        
        // prepara e insere cubos
        for (i=0; i<CUBOS.length; i++) {
            let c = CUBOS[i]
            let b = new Cubo(c.cor, c.alfa);
            b.init(c.solido);
            b.escala = c.escala;
            b.pos = c.pos;
            b.theta = c.theta;
            b.bufPos = this.bPos.length; // pos no buffer
            this.bPos = this.bPos.concat( b.bPos );
            this.bNorm = this.bNorm.concat( b.bNorm);
            this.bCor = this.bCor.concat( b.bCor );
            this.objs.push(b);    
        };

        // prepara e insere subs
        for (i=0; i< SUBS.length; i++) {
            let b = new Esfera(SUBS[i].cor, SUBS[i].alfa);
            b.init(SUBS[i].ndivs, SUBS[i].solido);
            b.escala = SUBS[i].escala; 
            b.pos    = SUBS[i].pos;
            b.theta  = SUBS[i].theta; 
            b.vTrans = SUBS[i].vTrans; // added
            b.vTheta = SUBS[i].vTheta; // added
            b.bufPos = this.bPos.length; 
            this.bPos = this.bPos.concat( b.bPos );
            this.bNorm = this.bNorm.concat( b.bNorm );
            this.bCor = this.bCor.concat( b.bCor );
            this.subs.push(b);
        }

        this.np = this.bPos.length;
        console.log(this.subs);
        console.log("Cena vertices: ", this.np);
    };    
};

