export interface NashDistortionPayload {
	ipRp: number;
	oopRp: number;
	aggression: number;
}

export function decodeNashDistortionPayload(
	payload: Float64Array,
): NashDistortionPayload | null {
	const [ipRpFraction, oopRpFraction, aggression] = payload;
	if (ipRpFraction === undefined || oopRpFraction === undefined || aggression === undefined) {
		return null;
	}

	return {
		ipRp: ipRpFraction * 100,
		oopRp: oopRpFraction * 100,
		aggression,
	};
}
