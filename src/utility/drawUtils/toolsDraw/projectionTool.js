import { getCoordsArray } from "../../toolsUtils";
import { drawPoint, drawTrendLineUsingPoints } from "./lineTool";

export const drawProjection = (
    state,
    i,
    lineSelected = false,
    fromDrawChart = false
) => {
    const { projectionData, ChartRef } = state;
    const canvas = ChartRef.current[0];
    const canvas1 = ChartRef.current[1];
    const ctx1 = canvas1.getContext("2d");
    const projection = projectionData.peek()[i];
    switch (projection.toolItemNo) {
        case 0:
            drawLongPositionUsingPoints(
                state,
                canvas,
                projection.points,
                lineSelected,
                fromDrawChart,
                ctx1
            );
            break;
    }
};

export const drawLongPositionUsingPoints = (
    state,
    canvas,
    points,
    lineSelected = false,
    fromDrawChart = false,
    ctx1 = null
) => {
    if(!fromDrawChart) return;
    const [midLeft, topLeft, bottomLeft, midRight] = getCoordsArray(state, points);
    if(lineSelected){
        drawPoint(ctx1, midLeft.x, midLeft.y);
        drawPoint(ctx1, topLeft.x, topLeft.y);
        drawPoint(ctx1, bottomLeft.x, bottomLeft.y);
        drawPoint(ctx1, midRight.x, midRight.y);
    } else {
        const ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0,255,0,0.5)'
        ctx.rect(topLeft.x, topLeft.y, Math.abs(midLeft.x - midRight.x), Math.abs(topLeft.y - midLeft.y));
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255,0,0,0.5)'
        ctx.rect(midLeft.x, midLeft.y, Math.abs(midLeft.x - midRight.x), Math.abs(bottomLeft.y - midLeft.y));
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.strokeStyle="black"
        ctx.moveTo(midLeft.x,midLeft.y);
        ctx.lineTo(midRight.x,midRight.y);
        ctx.stroke();
        ctx.closePath();
    }
}


export const drawProjections = (state, fromDrawChart = false) => {
    const { projectionData } = state;
    projectionData.peek().forEach((lineData, i) => {
        drawProjection(state, i, false, fromDrawChart);
    });
};
