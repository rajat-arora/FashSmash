export function filterHandler(filterType, ctx, canvas){
    // console.log(filterType)
    switch (filterType) {
        case "toaster":
            toasterGradient(ctx,canvas)
            break;
        case "retro":
            retro(ctx,canvas)
            break;
        default:
            break;
    }
}

var retro = (ctx,canvas)=>{
    var ctxData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (var i = 0, size = ctxData.data.length; i < size; i += 4) {
        var grayscale = ctxData.data[i] * .3 + ctxData.data[i+1] * .59 + ctxData.data[i+2] * .11;
        // red
        ctxData.data[i+0] = grayscale;

        // green
        ctxData.data[i+1] = grayscale;
        // blue
        ctxData.data[i+2] = grayscale;
    }
    ctx.putImageData(ctxData, 0, 0);

}

var toasterGradient = (ctx,canvas)=>{
    var texture = document.createElement('canvas');
    var ctxText= texture.getContext('2d');
    texture.width = canvas.width;
    texture.height = canvas.height;
    var gradient = ctxText.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width  / 2, canvas.height / 2, canvas.width   * 0.6);
    gradient.addColorStop(0, "#804e0f");
    gradient.addColorStop(1, "#3b003b");
    ctxText.fillStyle = gradient;
    ctxText.fillRect(0, 0, canvas.width  , canvas.height );
    blend(ctx,canvas,ctxText)
}

var blend = (ctx,canvas,ctxText) =>{
    var bottom = ctxText.getImageData(0, 0, canvas.width, canvas.height);
    var top    = ctx.getImageData(0, 0, canvas.width, canvas.height);

    for (var i = 0, size = top.data.length; i < size; i += 4) {
        // red
        top.data[i+0] = 255 - (255 - top.data[i+0]) * (255 - bottom.data[i+0]) / 255;

        // green
        top.data[i+1] = 255 - (255 - top.data[i+1]) * (255 - bottom.data[i+1]) / 255;
        // blue
        top.data[i+2] = 255 - (255 - top.data[i+2]) * (255 - bottom.data[i+2]) / 255;
        // the fourth slot is alpha. We don't need that (so skip by 4)
    }
    ctx.putImageData(top, 0, 0);

}