import type { CfdApi, CfdConfigInput } from "./resolve-config";

declare global {
	interface Window {
		CFD_CONFIG?: CfdConfigInput;
		CFD?: CfdApi;
	}
}
