declare module "react-chartjs-2" {
  import type { ForwardRefExoticComponent, RefAttributes } from "react";
  import type { ChartData, ChartOptions, ChartType } from "chart.js";

  export type ChartProps<T extends ChartType = ChartType> = {
    type?: T;
    data: ChartData<T>;
    options?: ChartOptions<T>;
    plugins?: any[];
    redraw?: boolean;
    updateMode?: "resize" | "reset" | "none" | "hide" | "show" | "normal" | "active";
    datasetIdKey?: string;
    width?: number;
    height?: number;
    fallbackContent?: React.ReactNode;
  };

  export type ChartComponentRef = any;

  export const Chart: ForwardRefExoticComponent<ChartProps & RefAttributes<ChartComponentRef>>;
  export const Line: ForwardRefExoticComponent<ChartProps<"line"> & RefAttributes<ChartComponentRef>>;
  export const Bar: ForwardRefExoticComponent<ChartProps<"bar"> & RefAttributes<ChartComponentRef>>;
  export const Radar: ForwardRefExoticComponent<ChartProps<"radar"> & RefAttributes<ChartComponentRef>>;
  export const Doughnut: ForwardRefExoticComponent<ChartProps<"doughnut"> & RefAttributes<ChartComponentRef>>;
  export const PolarArea: ForwardRefExoticComponent<ChartProps<"polarArea"> & RefAttributes<ChartComponentRef>>;
  export const Bubble: ForwardRefExoticComponent<ChartProps<"bubble"> & RefAttributes<ChartComponentRef>>;
  export const Pie: ForwardRefExoticComponent<ChartProps<"pie"> & RefAttributes<ChartComponentRef>>;
  export const Scatter: ForwardRefExoticComponent<ChartProps<"scatter"> & RefAttributes<ChartComponentRef>>;

  export function getDatasetAtEvent(chart: any, event: React.MouseEvent): any[];
  export function getElementAtEvent(chart: any, event: React.MouseEvent): any[];
  export function getElementsAtEvent(chart: any, event: React.MouseEvent): any[];
}
