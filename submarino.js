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
 
 var ultimoT = Date.now(); // delta
 var incrementa = false;
 var decrementa = false;
 var mudou = false;
 var eixo = -1;
      
 var gCena = new Cena();
 gCena.init();  // cria objetos e buffers

 var gCSubs = new cenaSubs();
 gCSubs.init(); // cria subs
 
 function Camera() {
 
     this.init = function(pos, theta, vTrans) {
         this.pos = pos;
         this.theta = theta;
         this.vTrans = vTrans;
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
 gCamera.init(SUBS[0].pos, (SUBS[0].theta), 0);
 var indCurSub = 0; // indice do SUB atual
 var gSub = SUBS[indCurSub]; // SUB atual
 
 // guarda coisas do shader
 var gShader = {
     program : null,
 };

 // shader de submarinos
 var gShaderSub = {
    program : null,
    vao: null,
 };
 
 // guarda coisas da interface e contexto do programa
 var gCtx = {
     view : mat4(),     // view matrix, inicialmente identidade
     perspective : mat4(), // projection matrix
     rodando : true
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
     gl.clearColor(NEVOA.cor[0], NEVOA.cor[1], NEVOA.cor[2], NEVOA.cor[3]);
     gl.enable(gl.DEPTH_TEST);
 
     // shaders
     crieShaders (true, gCena);
     crieShaders (false, gCSubs );
 
     // interface
     crieInterface();
 
     // finalmente...
     render();
 };
 
 // ==================================================================
 
 function crieInterface() {
     document.addEventListener('keydown', onKeyDownHandler);
 
     gCtx.passo = document.getElementById('Passo');
     gCtx.passo.disabled = gCtx.rodando;
     gCtx.passo.onclick = callbackOnClickPasso;
     
     gCtx.jogar = document.getElementById('Jogar')
     gCtx.jogar.onclick = callbackOnClickJogar;
 };
 
 function callbackOnClickPasso() {
     if(!gCtx.rodando) {
         console.log("passo");
         gCtx.passo = true;
         render();
     }
 };
 
 function callbackOnClickJogar() {
     gCtx.rodando = !gCtx.rodando;
     document.getElementById("Passo").disabled = gCtx.rodando;
 };
 
 function onKeyDownHandler( e ) {
     const keyName = e.key.toUpperCase();
     console.log(keyName);
 
     switch (keyName) {
         case 'K':
             console.log('Pause Sub');
             gSub.vTrans = 0;
             break;
         case 'L':
             console.log('incrementa velocidade');
             gSub.vTrans++;
             break;
         case 'J':
             console.log('decrementa velocidade');
             gSub.vTrans--;
             break;
         case 'W':
             console.log('decrementa pitch');
             decrementa =  true;
             eixo = 0;
             break;
         case 'X':
             console.log('incrementa pitch');
             incrementa = true;
             eixo = 0;
             break;
         case 'A':
             console.log('decrementa yaw');
             decrementa =  true;
             eixo = 1;
             break;
         case 'D':
             console.log('incrementa yaw');
             incrementa = true;
             eixo = 1;
             break;
         case 'Z':
             console.log('incrementa row');
             incrementa =  true;
             eixo = 2;
             break;
         case 'C':
             console.log('decrementa row');
             decrementa = true;
             eixo = 2;
             break;
         case 'M':
             console.log('proximo sub');
             
             if (indCurSub < SUBS.length - 1) indCurSub++;
             else indCurSub = 0;
 
             mudou = true;
 
             break;
         case 'N':
             console.log('anterior sub');
             if (indCurSub > 0) indCurSub--;
             else indCurSub = SUBS.length - 1;
 
             mudou = true;
             break;
         case 'S':
             console.log('zera rotação');
             gSub.vTheta = vec3(0, 0, 0);
 
             mudou = true;
             break;
     }
 };
 
 // ==================================================================
 /**
  * cria e configura os shaders
  */
 function crieShaders(color_not_texture=true, cena) {
     //  cria o programa
     var shader_atual;
     var v_name, f_name;
     
     if (color_not_texture) {
        shader_atual = gShader;
        v_name = gVertexShaderSrc;
        f_name = gFragmentShaderSrc;
     }
     else {
        shader_atual = gShaderSub;
        v_name = gVertexShaderSub;
        f_name = gFragmentShaderSub;
     }

     if(!shader_atual.program)
        shader_atual.program = makeProgram(gl, v_name, f_name);
     gl.useProgram(shader_atual.program);

     shader_atual.vao = gl.createVertexArray();
     gl.bindVertexArray(shader_atual.vao);
     
     // buffer das normais
     var bufNormais = gl.createBuffer();
     gl.bindBuffer(gl.ARRAY_BUFFER, bufNormais );
     gl.bufferData(gl.ARRAY_BUFFER, flatten(cena.bNorm), gl.STATIC_DRAW);
 
     var aNormal = gl.getAttribLocation(shader_atual.program, "aNormal");
     gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
     gl.enableVertexAttribArray(aNormal);
 
     // buffer dos vértices
     var bufVertices = gl.createBuffer();
     gl.bindBuffer(gl.ARRAY_BUFFER, bufVertices);
     gl.bufferData(gl.ARRAY_BUFFER, flatten(cena.bPos), gl.STATIC_DRAW);
 
     var aPosition = gl.getAttribLocation(shader_atual.program, "aPosition");
     gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
     gl.enableVertexAttribArray(aPosition); 

     if (color_not_texture) {
        // buffer das cores
        var bufCores = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufCores);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(cena.bCor), gl.STATIC_DRAW);
    
        var aCor = gl.getAttribLocation(shader_atual.program, "aCor");
        gl.vertexAttribPointer(aCor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aCor); 
     }
     else {
        // textura
        var bufTextura = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufTextura);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(cena.bTex), gl.STATIC_DRAW);
        var aTexCoord = gl.getAttribLocation(shader_atual.program, "aTexCoord");
        gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aTexCoord);
        configureTexturaDaURL(URL);

        gl.uniform1i(gl.getUniformLocation(shader_atual.program, "uTextureMap"), 0);
     }
 
     // resolve os uniforms
    shader_atual.uModel   = gl.getUniformLocation(shader_atual.program, "uModel");
    shader_atual.uView   = gl.getUniformLocation(shader_atual.program, "uView");
    shader_atual.uPerspective = gl.getUniformLocation(shader_atual.program, "uPerspective");
    shader_atual.uInverseTranspose = gl.getUniformLocation(shader_atual.program, "uInverseTranspose");
 
     // calcula a matriz de transformação perpectiva (fovy, aspect, near, far)
     // que é feita apenas 1 vez
     gCtx.perspective = perspective( CAM.fovy, CAM.aspect, CAM.near, CAM.far);;
     gl.uniformMatrix4fv(shader_atual.uPerspective, false, flatten(gCtx.perspective));
     
     // parametros para iluminação
     shader_atual.uLuzPos = gl.getUniformLocation(shader_atual.program, "uLuzPos");
     gl.uniform4fv( shader_atual.uLuzPos, LUZ.pos);
 
     // fragment shader
    shader_atual.uLuzAmb = gl.getUniformLocation(shader_atual.program, "uLuzAmbiente");
    shader_atual.uLuzDif = gl.getUniformLocation(shader_atual.program, "uLuzDifusao");
    shader_atual.uLuzEsp = gl.getUniformLocation(shader_atual.program, "uLuzEspecular");
    shader_atual.uAlfa   = gl.getUniformLocation(shader_atual.program, "uAlfaEspecular");
 
     // nevoa
     shader_atual.uCorNevoa = gl.getUniformLocation(shader_atual.program, "uCorNevoa");
     shader_atual.uNevoaNear = gl.getUniformLocation(shader_atual.program, "uNevoaNear");
     shader_atual.uNevoaFar = gl.getUniformLocation(shader_atual.program, "uNevoaFar");

    gl.uniform4fv( shader_atual.uCorNevoa, NEVOA.cor );
    gl.uniform1f( shader_atual.uNevoaNear, NEVOA.near );
    gl.uniform1f( shader_atual.uNevoaFar, NEVOA.far );
 
    gl.uniform4fv( shader_atual.uLuzAmb, LUZ.amb );
    gl.uniform4fv( shader_atual.uLuzDif, LUZ.dif );
    gl.uniform4fv( shader_atual.uLuzEsp, LUZ.esp );
 
 };
 
 // ==================================================================
 /**
  * Usa o shader para desenhar.
  * Assume que os dados já foram carregados e são estáticos.
  */

 function deslocaNariz(gSub) {

    let m = mat4();
    m = mult( rotateX( gSub.theta[0]), m);
    m = mult( rotateY( gSub.theta[1]), m);
    m = mult( rotateZ( gSub.theta[2]), m);
    
    let dir = vec3(-m[2][0],-m[2][1],-m[2][2]); // -z

    return add(gSub.pos, mult(gSub.escala[2]*2, normalize(dir)));

 }

 function render() {
     gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
     
     let now = Date.now();    
     let delta = (now - ultimoT)/1000;
 
     // Mudou submarino
     if (mudou) {
         gSub = SUBS[indCurSub];
         gCamera.init(gSub.pos, gSub.theta, gSub.vTrans);
         mudou = false;
     }
 
     if(gCtx.rodando || gCtx.passo) { 
 
         // muda rotação
         if (gSub.vTheta != 0)
             gSub.theta = add(gSub.theta, gSub.vTheta);
         
         // aumenta rotação
         if(incrementa) {
             console.log('antigo theta: ', gSub.theta);
             gSub.theta[eixo]++;
             incrementa = false;
             console.log('* novo theta: ', gSub.theta);
         }
         else if(decrementa) {
             console.log('antigo theta: ', gSub.theta);
             gSub.theta[eixo]--;
             decrementa = false;
             console.log('* novo theta: ', gSub.theta);
         }
 
         gCamera.theta = gSub.theta;
          
         gCamera.mat = mat4();
         
         let crx = rotateX(gCamera.theta[0]);
         gCamera.mat = mult(crx, gCamera.mat);
         let cry = rotateY(gCamera.theta[1]);
         gCamera.mat = mult(cry, gCamera.mat);
         let crz = rotateZ(gCamera.theta[2]);
         gCamera.mat = mult(crz, gCamera.mat);
 
         // mudança de velocidade
         if (gSub.vTrans != 0) {
             gSub.pos = add(gSub.pos, mult(gSub.vTrans*delta, gCamera.dir));
             gCamera.pos = gSub.pos;
         }
         
         gCamera.pos = deslocaNariz(gSub);
 
         // atualiza view
         gCamera.right = vec3( gCamera.mat[0][0], gCamera.mat[0][1], gCamera.mat[0][2]); 
         gCamera.up    = vec3( gCamera.mat[1][0], gCamera.mat[1][1], gCamera.mat[1][2]); 
         gCamera.dir   = vec3(-gCamera.mat[2][0],-gCamera.mat[2][1],-gCamera.mat[2][2]); 

         if(gCtx.passo) {
            console.log('theta:', gSub.theta);
            console.log('dir:', gCamera.dir);
         }

         gCtx.view = lookAt(gCamera.pos, add(gCamera.pos, gCamera.dir), gCamera.up);  
         //gCtx.view = mult(gCamera.mat, gCtx.view);
         
         // atualiza SUBS
         atualizaSubs(gCSubs.subs, gSub, indCurSub, delta);
         
         if(gCtx.passo) {
             gCtx.passo = false;
         }
     }

     // carrega objetos não-submarinos
     gl.useProgram(gShader.program);
     gl.bindVertexArray(gShader.vao);
     gl.uniformMatrix4fv(gShader.uView, false, flatten(gCtx.view));
     loadObjects(gCena.objs, false);

    // libera os buffers. O WebGL agora vai pintar no gCanvas.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

     // carrega submarinos
     gl.useProgram(gShaderSub.program);
     gl.bindVertexArray(gShaderSub.vao);
     gl.uniformMatrix4fv(gShaderSub.uView, false, flatten(gCtx.view));
     loadObjects(gCSubs.subs, true);
 
     ultimoT = now;

     window.requestAnimationFrame(render);
 };
 
 function atualizaSubs(subsList, gSub, ind, delta) {
     // atualiza atual...
     var auxAlfa = subsList[ind].alfa;
     var auxNP = subsList[ind].np;
 
 
     subsList[ind] = gSub;
     subsList[ind].alfa = auxAlfa;
     subsList[ind].np = auxNP;
 
     var i;
     for (i = 0; i < subsList.length; i++) {
         let subAtual = subsList[i];
         let m = mat4();
 
         if( i != ind ) {
 
             if (subAtual.vTheta) 
                 subAtual.theta = add(subAtual.theta, subAtual.vTheta);
 
             if ( subAtual.vTrans ) { 
                 // mudança de velocidade
                 let crx = rotateX(subAtual.theta[0]);
                 m = mult(crx, m);
                 let cry = rotateY(subAtual.theta[1]);
                 m = mult(cry, m);
                 let crz = rotateZ(subAtual.theta[2]);
                 m = mult(crz, m);
     
                 subAtual.pos = add(subAtual.pos, mult(subAtual.vTrans*delta,  vec3(-m[2][0],-m[2][1],-m[2][2])));
             }
         }
     }
 };
 
 function loadObjects(objList, submarino=true) {
     for (let obj of objList ) {
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

         if(submarino) {
            gl.uniformMatrix4fv(gShaderSub.uModel, false, flatten(model));
            gl.uniformMatrix4fv(gShaderSub.uInverseTranspose, false, flatten(modelViewInvTrans));
       
            gl.uniform1f(gShaderSub.uAlfa, obj.alfa);
         }
         else {    
            gl.uniformMatrix4fv(gShader.uModel, false, flatten(model));
            gl.uniformMatrix4fv(gShader.uInverseTranspose, false, flatten(modelViewInvTrans));
       
            gl.uniform1f(gShader.uAlfa, obj.alfa);
         }

         gl.drawArrays(gl.TRIANGLES, obj.bufPos, obj.np);
     
     }
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
     //vTexCoord = aTexCoord; 
 
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
 
 