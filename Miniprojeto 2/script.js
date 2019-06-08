// Inicializa Canvas e configura altura e largura
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 400;

// Event listener para adicionar pontos quando usuário clica.
// salva em buffer para ser adicionado no array completo de curvas de Bezier.
canvas.addEventListener("click", (evt) => {
    var rect = canvas.getBoundingClientRect();
    var x = evt.clientX - rect.left
    var y = evt.clientY - rect.top
    console.log(x);
    console.log(y);
    curveBuff.push([x, y]);

    draw();
});

// Event listener de teclas
document.addEventListener("keydown", keyPush);
function keyPush(evt) {
    switch(evt.keyCode) {
        // ESC para usuario parar de desenhar uma curva.
        case 27:
            console.log("esc pressionado");
            if(curveBuff.length > 1){
                allBezierCurves.pop();
                allBezierCurves.push(curveBuff);
                curveBuff = [];
                allBezierCurves.push(curveBuff);
            }
            break;
    }
}


// Inicializa e configura checkboxes de visualização
var showCtrlPoints = document.getElementById('show-ctrl-pts');
showCtrlPoints.addEventListener(("change"), (evt) => {
    draw();
});

var showCtrlPoli = document.getElementById('show-ctrl-poli');
showCtrlPoli.addEventListener(("change"), (evt) => {
    draw();
});

var showCurves = document.getElementById('show-curve');
showCurves.addEventListener(("change"), (evt) => {
    draw();
});

// Inicializa vetor de Curvas, que contém os vetores de pontos de cada curva de Bézier.
allBezierCurves = []

// Inicializa buffer de pontos para criar uma nova curva arbitraria quando clicar no canvas
curveBuff = []


// Algoritmo deCasteljau
// points -> array de pontos q formam o poligono de controle ex: [[100,440],[200,500],[300,100]]
// t -> parametro que fará a variação da distância do ponto e irá traçar a curva ao ser variado.
// O retorno do algoritmo é o ponto único resultante quando não podem ser feitas mais interpolações.
// chamando a função várias vezes variando t em valores arbitrários, teremos os pontos posições necessárias
// para traçar a curva de bezier.
function deCasteljau(points, t) {
    if(points.length == 1){
        return points[0];
    } else {
        var nextpoints = []
        for(var i = 0; i < points.length-1; ++i){
            var px = (1-t)*points[i][0] + t*points[i+1][0];
            var py = (1-t)*points[i][1] + t*points[i+1][1];
            nextpoints.push([px,py]);
        }
        return deCasteljau(nextpoints, t);
    }
}

// Desenha os pontos do array de pontos fornecido. Ex: [[100,440],[200,500],[300,100]]
function drawPoints(points){
    var x = 0;
    var y = 1;
    for(var i = 0; i < points.length; ++i){
        ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.arc(points[i][x], points[i][y], 3.5 , 0, 2*Math.PI);
        ctx.fill();
    }
}

function drawControlPolygons(points, color, width){
    var x = 0;
    var y = 1;
    for(var i = 0; i < points.length-1; ++i){
        auxDrawLine(points[i], points[i+1], color, width)
    }
}

// Draw Bezier Curve
// Points is the array of points of a given curve, such as: [[100,440],[200,500],[300,100]]
// Iter is the number of iterations that will be made on the parameter t. The more iterations, the smoother the curve will be
function drawBezier(points, iter){
    var t = 0;
    var step = 1.0/iter;
    var curvePoints = []

    for(var i = 0; i <= iter; ++i){
        curvePoints.push(deCasteljau(points, t));
        t += step;
    }

    for(var i = 0; i < curvePoints.length-1; ++i){
        auxDrawLine(curvePoints[i], curvePoints[i+1], "red", 1.0)
    }
}

// Função auxiliar para desenhar uma linha
// Recebe um ponto origem no formato [100,244] por exemplo
// Recebe um ponto destino no formato [12,244] por exemplo
// Recebe uma cor para desenhar a linha
// Recebe a grossura da linha
function auxDrawLine(orig, dest, color, width){
    var x = 0;
    var y = 1;
    
    ctx.beginPath();
    ctx.moveTo(orig[x], orig[y]);
    ctx.lineTo(dest[x], dest[y]);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}

// Auto explicativo.
function clearCanvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updateCurvesArray(){
    //var c1 = [[100,440],[200,500],[300,100], [450,550]];
    //var c2 = [[110,450],[210,510],[310,110], [460,560]];
    //var c3 = [[120,460],[220,520],[320,120], [470,570]];

    //allBezierCurves = [c1,c2,c3];
    
    if(curveBuff.length > 0){
        allBezierCurves.pop();
        allBezierCurves.push(curveBuff);
    }
}


// "main" function - Iniciada sempre que a janela carrega.
window.onload = draw();

function draw(){
    clearCanvas();
    updateCurvesArray();

    for(var i = 0; i < allBezierCurves.length; ++i){
        if(showCtrlPoints.checked){
            drawPoints(allBezierCurves[i]);
        }
    
        if(showCtrlPoli.checked){
            drawControlPolygons(allBezierCurves[i], "gray", 0.5);
        }
    
        if(showCurves.checked){
            drawBezier(allBezierCurves[i], 1000);
        }
    }
}

