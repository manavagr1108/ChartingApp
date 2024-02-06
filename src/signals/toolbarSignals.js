import { signal } from "@preact/signals-react";

export const cursorConfig = ["crosshair", "default"];

export const selectedCursor = signal(0);
export const selectedLine = signal(-1);
export const drawLinesData = signal([]);
export const prevLineData = signal(null);
export const prevToolItemNo = signal(null);
export const prevSelectedCanvas = signal(null);
