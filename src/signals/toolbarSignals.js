import { signal } from "@preact/signals-react";

export const cursorConfig = ["crosshair", "default"];
export const colorSwatches = ['rgba(46, 46, 46, 1)', 'rgba(134, 142, 150, 1)', '#fa5252', '#e64980', '#be4bdb', '#7950f2', '#4c6ef5', '#228be6', '#15aabf', '#12b886', '#40c057', '#82c91e', '#fab005', '#fd7e14']

export const selectedCursor = signal(0);
export const selectedLine = signal(-1);
export const drawLinesData = signal([]);
export const prevLineData = signal(null);
export const prevToolItemNo = signal(null);
export const prevSelectedCanvas = signal(null);
