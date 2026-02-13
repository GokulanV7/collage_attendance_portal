import themeData from "./theme.json";

type ColorRamp = Record<string, string>;

export type AppTheme = {
	brand: ColorRamp;
	status: ColorRamp;
	neutral: ColorRamp;
	pastel: ColorRamp;
	utility: ColorRamp;
};

export const appTheme: AppTheme = themeData;

export const brandColors = appTheme.brand;
export const statusColors = appTheme.status;
export const neutralColors = appTheme.neutral;
export const pastelColors = appTheme.pastel;
export const utilityColors = appTheme.utility;
