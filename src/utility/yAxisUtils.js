function getLeftDate(date){
    return date.slice(0,10);
} 

function getRightDate(date){
    return date.slice(11,21);
}

export function buildSegmentTree(data){
    const segmentTree = [];
    const datesToIndex = {};
    const array = Object.values(data);
    let n = array.length;
    for(let i = 0 ; i < n ; i++){
        const ele = array[i];
        const d = {};
        const date = `${ele.Date}:${ele.Date}`
        d[`${date}`] = {
            'Low': ele.Low,
            'High': ele.High
        }
        datesToIndex[`${ele.Date}`] = i;
        segmentTree[n+i] = d;
    }
    for(let i = n - 1; i > 0; i--){
        const leftEleKey = Object.keys(segmentTree[2*i])[0];
        const leftEleVal = Object.values(segmentTree[2*i])[0];
        const rightEleKey = Object.keys(segmentTree[2*i + 1])[0];
        const rightEleVal = Object.values(segmentTree[2*i + 1])[0];
        const d = {};
        const date = `${getLeftDate(leftEleKey)}:${getRightDate(rightEleKey)}`
        d[`${date}`] = {
            'Low': Math.min(leftEleVal.Low, rightEleVal.Low),
            'High': Math.max(leftEleVal.High, rightEleVal.High)
        }
        segmentTree[i] = d;
    }
    return {segmentTree, datesToIndex};  
}

export function getMinMaxPrices(segmentTree, datesToIndex, left, right, n){
    let l = datesToIndex[`${left}`] + n;
    let r = datesToIndex[`${right}`] + n + 1;
    let minPrice = Number.MAX_SAFE_INTEGER;
    let maxPrice = Number.MIN_SAFE_INTEGER;
    for (l, r ; l < r; l >>= 1, r >>= 1) 
    { 
        if (l&1){
            let ele = segmentTree[l];
            ele = Object.values(ele);
            minPrice = Math.min(minPrice, ele[0].Low);
            maxPrice = Math.max(maxPrice, ele[0].High);
            l = l+1;
        }  
      
        if (r&1){
            r = r - 1;
            let ele = segmentTree[r];
            ele = Object.values(ele);
            minPrice = Math.min(minPrice, ele[0].Low);
            maxPrice = Math.max(maxPrice, ele[0].High);
        }
    }
    if(maxPrice != Number.MIN_SAFE_INTEGER && minPrice != Number.MAX_SAFE_INTEGER){
        const priceDiff = (maxPrice - minPrice)/12;
        minPrice = minPrice -priceDiff;
        maxPrice = maxPrice + priceDiff;
    }
    return {minPrice,maxPrice};
}

export const getYCoordinate = (price, minPrice, maxPrice, height, margin) => {
    return height - margin - ((height - margin)/(maxPrice - minPrice))*(price - minPrice);
}
export const drawCandleStick = (data, minPrice, maxPrice, height, margin, x, context, width) => {
    let fillColor, borderColor = "black";
    if(data["Close"] > data["Open"]){
        fillColor = "green";
    } else{
        fillColor = "red";
    }
    const open = getYCoordinate(data["Open"], minPrice, maxPrice, height, margin);
    const close = getYCoordinate(data["Close"], minPrice, maxPrice, height, margin);
    const high = getYCoordinate(data["High"], minPrice, maxPrice, height, margin);
    const low = getYCoordinate(data["Low"], minPrice, maxPrice, height, margin);
    const bodyHeight = Math.abs(open - close);
    const bodyY = Math.min(open, close);

    // Draw candlestick body
    context.fillStyle = fillColor;
    context.fillRect(x - width/2 , bodyY, width, bodyHeight);

    // Draw candlestick wicks
    context.strokeStyle = borderColor;
    context.lineWidth = width/5;
    context.beginPath();
    context.moveTo(x, high);
    context.lineTo(x, Math.min(open, close));
    context.moveTo(x, low);
    context.lineTo(x, Math.max(open, close));
    context.stroke();
}