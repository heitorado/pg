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

    console.log(currentTool);
    
    if(currentTool == "tool-add"){
        curveBuff.push([x, y]);
    } else if(touchedAnyControlPoint({x: x, y: y})){
        if(currentTool == "tool-erase-point"){
            findCurveAndRemovePoint({x: x, y: y});
        }

        if(currentTool == "tool-erase-curve"){
            findCurveAndDestroy({x: x, y: y});
        }
    }

    draw();
});

// Event listener do canvas para ferramenta de arrastar pontos
canvas.addEventListener("mousedown", (evt) => {
    var rect = canvas.getBoundingClientRect();
    var x = evt.clientX - rect.left
    var y = evt.clientY - rect.top

    if(touchedAnyControlPoint({x: x, y: y})){
        dragging = true;
    }
    
    draw();
});

canvas.addEventListener("mouseup", (evt) => {
    dragging = false;
    draw();
});

// Event listener do canvas para arrastar pontos pelo canvas.
//  Também serve para mostrar coordenadas do mouse abaixo do canvas
canvas.addEventListener("mousemove", (evt) => {
    var rect = canvas.getBoundingClientRect();
    var x = evt.clientX - rect.left
    var y = evt.clientY - rect.top

    // Controla arraste do ponto de controle
    if (dragging && currentTool == "tool-move-point") {
        allBezierCurves[moveIndexI][moveIndexJ][0] = x;
        allBezierCurves[moveIndexI][moveIndexJ][1] = y;
        draw();
    }

    // Exibe coordenadas no HTML abaixo do canvas
    document.getElementById("mouse-x").innerHTML = x;
    document.getElementById("mouse-y").innerHTML = y;

    // if(touchedAnyControlPoint({
    //     x: x,
    //     y: y
    // })){
    //     console.log("tocou na porcaria do ponto");
    // } 
});

// Event listener de teclas
document.addEventListener("keydown", keyPush);
function keyPush(evt) {
    switch(evt.keyCode) {
        // ESC para usuario parar de desenhar uma curva.
        case 27:
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

// Event listener para o botão de limpar
var btnClean = document.getElementById('delete-all');
btnClean.addEventListener(("click"), (evt) => {
    allBezierCurves = [];
    curveBuff = [];
    draw();
});

// Event listener para o input do número de avaliações das curvas
var evalConfig = document.getElementById('input-evaluations-number');
evalConfig.addEventListener("change", (e) => {
    configurableEvaluation = evalConfig.value;
    draw();
});

// Inicializa vetor de Curvas, que contém os vetores de pontos de cada poligono de controle que forma uma curva de Bézier.
var allBezierCurves = []

// Inicializa buffer de pontos para criar uma nova curva arbitraria quando clicar no canvas
var curveBuff = []

// Inicializa número configurável de avaliações para as curvas
var configurableEvaluation = 100;

// Inicializa valor do raio que cada ponto de controle terá
var pointRadius = 5;

// Inicializa variável para guardar a ferramenta de edição sendo usada
// Tipos de ferramenta:
// tool-add
// tool-move-point
// tool-erase-point
// tool-erase-curve
// tool-add-to
var currentTool = "tool-add";

// Inicializa variável que controla o arraste dos pontos de controle
// e as variáveis de coordenada
var dragging = false;
var moveIndexI = 0;
var moveIndexJ = 0;

// Event listeners para botões de tools.
var btnToolAdd = document.getElementById("tool-add");
btnToolAdd.addEventListener(("click"), (evt) => {
    currentTool = "tool-add";
});

var btnToolMovePoint = document.getElementById('tool-move-point');
btnToolMovePoint.addEventListener(("click"), (evt) => {
    currentTool = "tool-move-point"
});

var btnToolErasePoint = document.getElementById('tool-erase-point');
btnToolErasePoint.addEventListener(("click"), (evt) => {
    currentTool = "tool-erase-point"
});

var btnToolEraseCurve = document.getElementById('tool-erase-curve');
btnToolEraseCurve.addEventListener(("click"), (evt) => {
    currentTool = "tool-erase-curve"
});

var btnToolAddTo = document.getElementById('tool-add-to');
btnToolAddTo.addEventListener(("click"), (evt) => {
    currentTool = "tool-add-to"
});

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
        ctx.arc(points[i][x], points[i][y], pointRadius , 0, 2*Math.PI);
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

// Funções de ferramentas
function findCurveAndRemovePoint(pointClicked){
    for (var i = 0; i < allBezierCurves.length; i++) {
        for(var j=0;j < allBezierCurves[i].length;j++){

            const element = allBezierCurves[i][j];
            if (insidePointRadius(element, pointClicked)){
                allBezierCurves[i].splice(j,1);
                draw();
                return;
            }
        }
    }
}

function findCurveAndDestroy(pointClicked){
    for (var i = 0; i < allBezierCurves.length; i++) {
        for(var j=0;j < allBezierCurves[i].length;j++){
            const element = allBezierCurves[i][j];
            if (insidePointRadius(element, pointClicked)){
                allBezierCurves.splice(i,1);
                draw();
                return;
            }
        }
    }
}

// Funções Auxiliares as de draw

function insidePointRadius(el, clk){
    var v = {
        x: el[0] - clk.x,
        y: el[1] - clk.y
    };
    return (Math.sqrt(v.x * v.x + v.y * v.y) <= pointRadius);
}

function touchedAnyControlPoint(click){
    var touched = false;

    for (var i = 0; i < allBezierCurves.length; i++) {
        for(var j=0;j < allBezierCurves[i].length;j++){

            const element = allBezierCurves[i][j];
            if (insidePointRadius(element, click)){
                moveIndexI = i;
                moveIndexJ = j;
                touched = true;
            }
        }
    }
    return touched;
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

    var validBezierCurves = allBezierCurves.filter( (elem) => {
        return elem.length > 0;
    });

    for(var i = 0; i < validBezierCurves.length; ++i){
        if(showCtrlPoints.checked){
            drawPoints(validBezierCurves[i]);
        }
    
        if(showCtrlPoli.checked){
            drawControlPolygons(validBezierCurves[i], "gray", 0.5);
        }
    
        if(showCurves.checked){
            drawBezier(validBezierCurves[i], configurableEvaluation);
        }
    }
}

