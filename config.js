 // textura
 var vTextura = [
    vec2(0.5, 0.5),
    vec2(0.5, 0.75),
    vec2(1.0, 0.75),
    vec2(1.0, 0.5)
 ];
    
 const URL = "https://upload.wikimedia.org/wikipedia/commons/1/10/Scale_Common_Roach.JPG"; 

 function cenaSubs() {
    this.subs = [];
    this.bPos  = [];
    this.bNorm = [];
    this.bCor  = [];
    this.bTex = [];

    this.init = function () {
        // prepara e insere subs
        let i;
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
            this.bTex = this.bTex.concat( b.bTex );
            this.subs.push(b);
        }

        this.np = this.bPos.length;
        console.log(this.subs);
        console.log("Cena Subs vertices: ", this.np);
    }
 }

/**
 * código retirado das notas de aula
 * recebe a URL de imagem e configura a textura
 * @param {URL} url 
 */
 function configureTexturaDaURL(url) {
    // cria a textura
    var texture = gl.createTexture();
    // seleciona a unidade TEXTURE0
    gl.activeTexture(gl.TEXTURE0);
    // ativa a textura
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Carrega uma textura de um pixel 1x1 vermelho, temporariamente
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([255, 0, 0, 255]));
  
    // Carraga a imagem da URL: 
    // veja https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image
    var img = new Image(); // cria um bitmap
    img.src = url;
    img.crossOrigin = "anonymous";
    // espera carregar = evento "load"
    img.addEventListener('load', function () {
      console.log("Carregou imagem", img.width, img.height);
      // depois de carregar, copiar para a textura
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, img.width, img.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      
    }
    );
    return img;
  };


 // ========================================================
 // Código fonte dos shaders em GLSL
 // a primeira linha deve conter "#version 300 es"
 // para WebGL 2.0
 
 var gVertexShaderSub = `#version 300 es
 
 in vec3 aPosition;
 in vec3 aNormal;
 
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

 // textura
 in vec2 aTexCoord;
 out vec2 vTexCoord;

 
 void main() {
     vec4 aPos4 = vec4(aPosition, 1);
     mat4 modelView = uView * uModel;
     gl_Position = uPerspective * modelView * aPos4;
 
     // orienta as normais como vistas pela câmera
     vNormal = mat3(uInverseTranspose) * aNormal;
     vec4 pos = modelView * aPos4;
 
     vLight = (uView * uLuzPos - pos).xyz;
     vView = -(pos.xyz);
 
     //vCor = aCor;
     vTexCoord = aTexCoord; 
 
     vProfundidadeNevoa = -(pos.z);
 }
 `;
 
 var gFragmentShaderSub = `#version 300 es
 
 precision highp float;
 
 in vec3 vNormal;
 in vec3 vLight;
 in vec3 vView;
 //in vec4 vCor;
 out vec4 corSaida;
 
 // nevoa
 in float vProfundidadeNevoa;
 uniform vec4 uCorNevoa;
 uniform float uNevoaNear;
 uniform float uNevoaFar;

 // textura
 in vec2 vTexCoord;
 uniform sampler2D uTextureMap;
 
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
     //vec4 ambiente = uLuzAmbiente * vCor;
     vec4 ambiente = uLuzAmbiente * texture(uTextureMap, vTexCoord);
 
     // difusao
     float kd = max(0.0, dot(normalV, lightV) );
     vec4 difusao = kd * uLuzDifusao * texture(uTextureMap, vTexCoord);
     // vec4 difusao = kd * uLuzDifusao * vCor;
 
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
 