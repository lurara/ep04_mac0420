/**
 * Esqueleto de programa para o EP04 de MAC0420/MAC5744.
 * 
 * Mostra como usar a biblioteca objetos e criar uma cena
 * usando o objeto Cena no arquivo cena.js.
 * 
 * Bibliotecas utilizadas
 * objetos.js
 * macWebglUtils.js
 * MVnew.js do livro -- Interactive Computer Graphics
 * 
 */

"use strict";

// ==================================================================
// constantes globais


// ==================================================================
// variáveis globais
// as strings com os código dos shaders também são globais, estão 
// no final do arquivo.

var gl;        // webgl2
var gCanvas;   // canvas

var gCena = new Cena();
//var corFragmento = 
//var corNevoa = vec4(1.0, 0.0, 0.0, 1.0);
gCena.init();  // cria objetos e buffers

function Camera() {

    this.init = function(pos, theta, vTrans) {
        this.pos = pos;
        this.theta = theta;
        // atualiza a orientação
        let m = mat4();
        m = mult( rotateX( this.theta[0]), m);
        m = mult( rotateY( this.theta[1]), m);
        m = mult( rotateZ( this.theta[2]), m);
        this.mat = m;
        this.right = vec3( m[0][0], m[0][1], m[0][2]); // x
        this.up    = vec3( m[1][0], m[1][1], m[1][2]); // y
        this.dir   = vec3(-m[2][0],-m[2][1],-m[2][2]); 
    };
};

var gCamera = new Camera();
gCamera.init(SUBS[0].pos, (SUBS[0].theta));

// guarda coisas do shader
var gShader = {
    program : null,
};

// guarda coisas da interface e contexto do programa
var gCtx = {
    view : mat4(),     // view matrix, inicialmente identidade
    perspective : mat4(), // projection matrix
};

// ==================================================================
// chama a main quando terminar de carregar a janela
window.onload = main;

/**
 * programa principal.
 */
function main()
{
    // ambiente
    gCanvas = document.getElementById("glcanvas");
    gl = gCanvas.getContext('webgl2');
    if (!gl) alert( "Vixe! Não achei WebGL 2.0 aqui :-(" );

    console.log("Canvas: ", gCanvas.width, gCanvas.height);

    // Inicializações feitas apenas 1 vez
    gl.viewport(0, 0, gCanvas.width, gCanvas.height);
    gl.clearColor(COR_CLEAR[0], COR_CLEAR[1], COR_CLEAR[2], COR_CLEAR[3]);
    gl.enable(gl.DEPTH_TEST);

    // shaders
    crieShaders();

    // finalmente...
    render();
};

// ==================================================================

function crieInterface() {
    document.addEventListener('keydown', onKeyDownHandler);

    gInt.bPasso = document.getElementById('Passo');
    gInt.bPasso.onclick = callbackOnClickPasso;
    
    gInt.bJogar = document.getElementById('Jogar')
    gInt.bJogar.onclick = callbackOnClickJogar;
};

function onKeyDownHandler( e ) {
};

// ==================================================================
/**
 * cria e configura os shaders
 */
function crieShaders() {
    //  cria o programa
    gShader.program = makeProgram(gl, gVertexShaderSrc, gFragmentShaderSrc);
    gl.useProgram(gShader.program);
    
    // buffer das normais
    var bufNormais = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufNormais );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(gCena.bNorm), gl.STATIC_DRAW);

    var aNormal = gl.getAttribLocation(gShader.program, "aNormal");
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNormal);

    // buffer dos vértices
    var bufVertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufVertices);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(gCena.bPos), gl.STATIC_DRAW);

    var aPosition = gl.getAttribLocation(gShader.program, "aPosition");
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition); 

    // buffer das cores
    var bufCores = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufCores);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(gCena.bCor), gl.STATIC_DRAW);

    var aCor = gl.getAttribLocation(gShader.program, "aCor");
    gl.vertexAttribPointer(aCor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aCor); 
    
    // resolve os uniforms
    gShader.uModel   = gl.getUniformLocation(gShader.program, "uModel");
    gShader.uView   = gl.getUniformLocation(gShader.program, "uView");
    gShader.uPerspective = gl.getUniformLocation(gShader.program, "uPerspective");
    gShader.uInverseTranspose = gl.getUniformLocation(gShader.program, "uInverseTranspose");

    // calcula a matriz de transformação perpectiva (fovy, aspect, near, far)
    // que é feita apenas 1 vez
    gCtx.perspective = perspective( CAM.fovy, CAM.aspect, CAM.near, CAM.far);
    gl.uniformMatrix4fv(gShader.uPerspective, false, flatten(gCtx.perspective));
    
    // parametros para iluminação
    gShader.uLuzPos = gl.getUniformLocation(gShader.program, "uLuzPos");
    gl.uniform4fv( gShader.uLuzPos, LUZ.pos);

    // fragment shader
    gShader.uLuzAmb = gl.getUniformLocation(gShader.program, "uLuzAmbiente");
    gShader.uLuzDif = gl.getUniformLocation(gShader.program, "uLuzDifusao");
    gShader.uLuzEsp = gl.getUniformLocation(gShader.program, "uLuzEspecular");
    gShader.uAlfa   = gl.getUniformLocation(gShader.program, "uAlfaEspecular");

    // nevoa
    gShader.uCorNevoa = gl.getUniformLocation(gShader.program, "uCorNevoa");
    gShader.uNevoaNear = gl.getUniformLocation(gShader.program, "uNevoaNear");
    gShader.uNevoaFar = gl.getUniformLocation(gShader.program, "uNevoaFar");

    gl.uniform4fv( gShader.uCorNevoa, NEVOA.cor );
    gl.uniform1f( gShader.uNevoaNear, NEVOA.near );
    gl.uniform1f( gShader.uNevoaFar, NEVOA.far );

    gl.uniform4fv( gShader.uLuzAmb, LUZ.amb );
    gl.uniform4fv( gShader.uLuzDif, LUZ.dif );
    gl.uniform4fv( gShader.uLuzEsp, LUZ.esp );

};

// ==================================================================
/**
 * Usa o shader para desenhar.
 * Assume que os dados já foram carregados e são estáticos.
 */
function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gCtx.view = lookAt( gCamera.pos, add(gCamera.pos, gCamera.dir), gCamera.up);        

    gl.uniformMatrix4fv(gShader.uView, false, flatten(gCtx.view));

    for (let obj of gCena.objs ) {
        var model = mat4();  // identidade
        // escala os eixos
        model[0][0] *= obj.escala[0];
        model[1][1] *= obj.escala[1];
        model[2][2] *= obj.escala[2];
        // rotação
        let rx = rotateX(obj.theta[0]);
        model = mult(rx, model);
        let ry = rotateY(obj.theta[1]);
        model = mult(ry, model);
        let rz = rotateZ(obj.theta[2]);
        model = mult(rz, model);
        // translação
        model[0][3] = obj.pos[0];
        model[1][3] = obj.pos[1];
        model[2][3] = obj.pos[2];

        let modelView = mult(gCtx.view, model);
        let modelViewInv = inverse(modelView);
        let modelViewInvTrans = transpose(modelViewInv);
    
        gl.uniformMatrix4fv(gShader.uModel, false, flatten(model));
        gl.uniformMatrix4fv(gShader.uInverseTranspose, false, flatten(modelViewInvTrans));
   
        gl.uniform1f(gShader.uAlfa, obj.alfa);
        gl.drawArrays(gl.TRIANGLES, obj.bufPos, obj.np);
        
    
    };

};


// ========================================================
// Código fonte dos shaders em GLSL
// a primeira linha deve conter "#version 300 es"
// para WebGL 2.0

var gVertexShaderSrc = `#version 300 es

in vec3 aPosition;
in vec3 aNormal;
in vec4 aCor;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uPerspective;
uniform mat4 uInverseTranspose;

uniform vec4 uLuzPos;

out vec3 vNormal;
out vec3 vLight;
out vec3 vView;
out vec4 vCor;

// nevoa
out float vProfundidadeNevoa;

void main() {
    vec4 aPos4 = vec4(aPosition, 1);
    mat4 modelView = uView * uModel;
    gl_Position = uPerspective * modelView * aPos4;

    // orienta as normais como vistas pela câmera
    vNormal = mat3(uInverseTranspose) * aNormal;
    vec4 pos = modelView * aPos4;

    vLight = (uView * uLuzPos - pos).xyz;
    vView = -(pos.xyz);

    vCor = aCor;

    vProfundidadeNevoa = -(pos.z);
}
`;

var gFragmentShaderSrc = `#version 300 es

precision highp float;

in vec3 vNormal;
in vec3 vLight;
in vec3 vView;
in vec4 vCor;
out vec4 corSaida;

// nevoa
//in vec4 vCorFragmento;
//uniform float uPesoNevoa;
in float vProfundidadeNevoa;
uniform vec4 uCorNevoa;
uniform float uNevoaNear;
uniform float uNevoaFar;

// cor = produto luz * material
uniform vec4 uLuzAmbiente;
uniform vec4 uLuzDifusao;
uniform vec4 uLuzEspecular;
uniform float uAlfaEspecular;

void main() {
    vec3 normalV = normalize(vNormal);
    vec3 lightV = normalize(vLight);
    vec3 viewV = normalize(vView);
    vec3 halfV = normalize(lightV + viewV);
  
    // ambiente
    vec4 ambiente = uLuzAmbiente * vCor;

    // difusao
    float kd = max(0.0, dot(normalV, lightV) );
    vec4 difusao = kd * uLuzDifusao * vCor;

    // especular
    float ks = pow( max(0.0, dot(normalV, halfV)), uAlfaEspecular);
    vec4 especular = vec4(0, 0, 0, 1); // parte não iluminada
    if (kd > 0.0) {  // parte iluminada
        especular = ks * uLuzEspecular;
    }

    vec4 auxSaida = difusao + especular + ambiente; 
    auxSaida.a = 1.0;

    //corSaida = difusao + especular + ambiente; 
    //corSaida.a = 1.0;

    float pesoNevoa = 0.0;

    if( vProfundidadeNevoa >= uNevoaFar ) {
        pesoNevoa = 1.0;
    }
    else if ( vProfundidadeNevoa > uNevoaNear ) {
        pesoNevoa = (vProfundidadeNevoa-uNevoaNear)/(uNevoaFar-uNevoaNear);
    }

    corSaida = mix(auxSaida, uCorNevoa, pesoNevoa);
}
`;

